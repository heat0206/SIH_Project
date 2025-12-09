#include "esp_camera.h"
#include "fd_forward.h"
#include "fr_forward.h"
#include "fr_flash.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "Arduino.h"

// ==========================================
// CONFIGURATION
// ==========================================
#define ENROLL_CONFIRM_TIMES 5
#define FACE_ID_SAVE_NUMBER 7
#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

#define RX2 14
#define TX2 13

// ==========================================
// GLOBALS
// ==========================================
static mtmn_config_t mtmn_config = {0};
static face_id_name_list st_face_list = {0};
static dl_matrix3du_t *image_matrix = NULL;
static dl_matrix3du_t *aligned_face = NULL;

void setup() {
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0); 
  
  Serial.begin(115200);
  Serial2.begin(4800, SERIAL_8N1, RX2, TX2); 

  Serial.println("\n--- BOOTING ESP32-CAM (One-Shot Mode) ---");

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  if (psramFound()) {
    config.frame_size = FRAMESIZE_UXGA; 
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
     Serial.println("Cam Fail");
     delay(1000);
     ESP.restart();
  }

  // Force QVGA for processing
  sensor_t * s = esp_camera_sensor_get();
  s->set_framesize(s, FRAMESIZE_QVGA); 
  s->set_lenc(s, 1);       
  s->set_dcw(s, 1);        

  // Init Face Logic
  mtmn_config.type = FAST;
  mtmn_config.min_face = 80;
  mtmn_config.pyramid = 0.707;
  mtmn_config.pyramid_times = 4;
  mtmn_config.p_threshold.score = 0.6;
  mtmn_config.p_threshold.nms = 0.7;
  mtmn_config.p_threshold.candidate_number = 20;
  mtmn_config.r_threshold.score = 0.7;
  mtmn_config.r_threshold.nms = 0.7;
  mtmn_config.r_threshold.candidate_number = 10;
  mtmn_config.o_threshold.score = 0.7;
  mtmn_config.o_threshold.nms = 0.7;
  mtmn_config.o_threshold.candidate_number = 1;

  face_id_name_init(&st_face_list, FACE_ID_SAVE_NUMBER, ENROLL_CONFIRM_TIMES);
  read_face_id_from_flash_with_name(&st_face_list);
  
  // Allocate ONCE. We will NEVER free these.
  image_matrix = dl_matrix3du_alloc(1, 320, 240, 3);
  aligned_face = dl_matrix3du_alloc(1, FACE_WIDTH, FACE_HEIGHT, 3);

  Serial.printf("Faces: %d. Ready.\n", st_face_list.count);
}

void perform_check_and_reset(String target_uid) {
  Serial.println("Checking: " + target_uid);
  const char* target_cstr = target_uid.c_str();
  
  bool matched = false;
  camera_fb_t * fb = NULL;
  
  unsigned long start = millis();
  
  // Try for 4 seconds or until match
  while(millis() - start < 4000) {
      fb = esp_camera_fb_get();
      if (!fb) continue;

      // Convert to RGB
      if (fmt2rgb888(fb->buf, fb->len, fb->format, image_matrix->item)) {
          
          // Detect
          box_array_t *net_boxes = face_detect(image_matrix, &mtmn_config);

          if (net_boxes) {
              // Align
              if (align_face(net_boxes, image_matrix, aligned_face) == ESP_OK) {
                  // Recognize
                  dl_matrix3d_t *face_id = get_face_id(aligned_face);
                  
                  if (st_face_list.count > 0) {
                      face_id_node *f = recognize_face_with_name(&st_face_list, face_id);
                      if (f) {
                          Serial.print("Found: "); Serial.println(f->id_name);
                          if (strcmp(f->id_name, target_cstr) == 0) {
                              matched = true;
                          }
                      }
                  }
                  // WE DO NOT FREE face_id here. It leaks, but we don't care.
              }
              // WE DO NOT FREE net_boxes here. It leaks, but we don't care.
          }
      }
      esp_camera_fb_return(fb);
      
      if (matched) break;
  }

  // --- RESULT & RESET ---
  if (matched) {
      Serial2.println("true");
      Serial.println("Sent: true");
  } else {
      Serial2.println("false");
      Serial.println("Sent: false");
  }

  Serial.println("Cleaning RAM (Rebooting)...");
  delay(100); // Give Serial time to finish sending
  ESP.restart(); // <--- THE MAGIC FIX
}

void loop() {
  if (Serial2.available()) {
      String incomingUID = Serial2.readStringUntil('\n');
      incomingUID.trim();
      
      if (incomingUID.length() > 2) {
          perform_check_and_reset(incomingUID);
      }
  }
}