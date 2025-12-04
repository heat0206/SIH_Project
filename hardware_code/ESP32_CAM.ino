#include <Arduino.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "esp_camera.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"
#include "libb64/cencode.h" // Built-in ESP32 Base64 library
#include <time.h>

// Provide the token generation process info.
#include <addons/TokenHelper.h>

/* 1. Define the WiFi credentials */
// ⚠️⚠️⚠️ YOU MUST ENTER YOUR WIFI CREDENTIALS HERE ⚠️⚠️⚠️
#define WIFI_SSID "YOUR_WIFI_SSID" 
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

/* 2. Define the Firebase config */
// I have filled these in for you!
#define API_KEY "AIzaSyCJATvhP2FiJ26yvgxZn7ZDUgxqwwLDI0I"
#define FIREBASE_PROJECT_ID "digital-hazri-strategiq"

/* 3. Define the user Email and password for the device */
#define USER_EMAIL "device@admin.com"
#define USER_PASSWORD "device123456"

// Define Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// NTP Server settings for time
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 0; // UTC time
const int   daylightOffset_sec = 0;

// Camera Pins (AI-THINKER Model)
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM     0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM       5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

void setup() {
  // Disable brownout detector
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);

  Serial.begin(115200);
  Serial.println();

  // 1. Init Camera
  camera_config_t configCam;
  configCam.ledc_channel = LEDC_CHANNEL_0;
  configCam.ledc_timer = LEDC_TIMER_0;
  configCam.pin_d0 = Y2_GPIO_NUM;
  configCam.pin_d1 = Y3_GPIO_NUM;
  configCam.pin_d2 = Y4_GPIO_NUM;
  configCam.pin_d3 = Y5_GPIO_NUM;
  configCam.pin_d4 = Y6_GPIO_NUM;
  configCam.pin_d5 = Y7_GPIO_NUM;
  configCam.pin_d6 = Y8_GPIO_NUM;
  configCam.pin_d7 = Y9_GPIO_NUM;
  configCam.pin_xclk = XCLK_GPIO_NUM;
  configCam.pin_pclk = PCLK_GPIO_NUM;
  configCam.pin_vsync = VSYNC_GPIO_NUM;
  configCam.pin_href = HREF_GPIO_NUM;
  configCam.pin_sscb_sda = SIOD_GPIO_NUM;
  configCam.pin_sscb_scl = SIOC_GPIO_NUM;
  configCam.pin_pwdn = PWDN_GPIO_NUM;
  configCam.pin_reset = RESET_GPIO_NUM;
  configCam.xclk_freq_hz = 20000000;
  configCam.pixel_format = PIXFORMAT_JPEG;

  // Use VGA (640x480) or QVGA (320x240) to keep Base64 string size manageable for Firestore (Limit 1MB)
  // VGA is usually ~20-30KB JPG -> ~40KB Base64. Safe.
  if (psramFound()) {
    configCam.frame_size = FRAMESIZE_VGA; 
    configCam.jpeg_quality = 12; 
    configCam.fb_count = 2;
  } else {
    configCam.frame_size = FRAMESIZE_QVGA;
    configCam.jpeg_quality = 12;
    configCam.fb_count = 1;
  }

  esp_err_t err = esp_camera_init(&configCam);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  // 2. Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  // Init Time
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);

  // 3. Firebase Config
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.token_status_callback = tokenStatusCallback;

  // Increase buffer size for large Base64 strings if needed (optional, library handles it usually)
  // fbdo.setResponseSize(2048); 

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // 1. Periodic Capture (Every 10 seconds) - Fallback
  static unsigned long lastCapture = 0;
  if (millis() - lastCapture > 10000 && Firebase.ready()) {
    lastCapture = millis();
    Serial.println("Periodic capture...");
    captureAndUploadBase64();
  }

  // 2. Poll for trigger (Every 1 second)
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck > 1000 && Firebase.ready()) {
    lastCheck = millis();
    checkTriggerAndCapture();
  }
  delay(10);
}

void checkTriggerAndCapture() {
  // Check config/camera document
  FirebaseData fbdo_read;
  
  if (Firebase.Firestore.getDocument(&fbdo_read, FIREBASE_PROJECT_ID, "", "config/camera")) {
    FirebaseJson &payload = fbdo_read.jsonObject();
    FirebaseJsonData jsonData;
    
    // Check if trigger is true
    payload.get(jsonData, "fields/trigger/booleanValue");
    if (jsonData.success && jsonData.boolValue) {
      Serial.println("Trigger received! Capturing...");
      captureAndUploadBase64();
      
      // Reset trigger to false
      resetTrigger();
    }
  } else {
    // Print error only occasionally to avoid spam
    static unsigned long lastError = 0;
    if (millis() - lastError > 5000) {
      lastError = millis();
      Serial.print("Trigger Read Error: ");
      Serial.println(fbdo_read.errorReason());
    }
  }
}

void resetTrigger() {
  FirebaseJson content;
  content.set("fields/trigger/booleanValue", false);
  
  // Use patchDocument (update)
  if (Firebase.Firestore.patchDocument(&fbdo, FIREBASE_PROJECT_ID, "", "config/camera", content.raw(), "trigger")) {
     Serial.println("Trigger reset.");
  } else {
     Serial.print("Trigger Reset Error: ");
     Serial.println(fbdo.errorReason());
  }
}

void captureAndUploadBase64() {
  Serial.println("Capturing image...");
  camera_fb_t * fb = NULL;
  fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }

  Serial.printf("Image captured. Size: %d bytes\n", fb->len);

  // Encode to Base64
  size_t outputLen = 4 * ((fb->len + 2) / 3);
  char* output = (char*)malloc(outputLen + 1); 
  
  if (!output) {
    Serial.println("Memory allocation failed for Base64");
    esp_camera_fb_return(fb);
    return;
  }

  base64_encodestate state;
  base64_init_encodestate(&state);
  int len = base64_encode_block((const char*)fb->buf, fb->len, output, &state);
  len += base64_encode_blockend(output + len, &state);
  output[len] = 0; 
  
  Serial.println("Uploading to Firestore...");
  
  // Get Time
  time_t now;
  time(&now);
  struct tm timeinfo;
  if(!localtime_r(&now, &timeinfo)){
    Serial.println("Failed to obtain time");
  }
  char timeString[30];
  strftime(timeString, sizeof(timeString), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);

  String docPath = "face_logs/" + String(millis()); // Still use millis for unique ID, or use timeString + random
  
  FirebaseJson content;
  String base64Image = "data:image/jpeg;base64,";
  String fullDataUri = base64Image + String(output);
  
  free(output);
  esp_camera_fb_return(fb); 
  
  content.set("fields/imageUrl/stringValue", fullDataUri);
  content.set("fields/timestamp/timestampValue", timeString); // Use REAL time
  content.set("fields/device/stringValue", "ESP32-CAM-01");

  if (Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "", docPath.c_str(), content.raw())) {
    Serial.println("Log created in Firestore (Base64)");
  } else {
    Serial.println("Log failed");
    Serial.println(fbdo.errorReason());
  }
}
