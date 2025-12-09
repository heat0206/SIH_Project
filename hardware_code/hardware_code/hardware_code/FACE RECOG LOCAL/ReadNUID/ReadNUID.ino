#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <SPI.h>
#include <MFRC522.h>
#include <LittleFS.h>
#include <SoftwareSerial.h>
#include <addons/TokenHelper.h>
#include <time.h> 

// ==========================================
// 1. CONFIGURATION
// ==========================================
#define WIFI_SSID "Stormblessed"
#define WIFI_PASSWORD "bhIy0@15"

#define API_KEY "AIzaSyDR7bfhgkafcOsBbj2OpkMNfbIkbTQfKRo"
#define FIREBASE_PROJECT_ID "digital-hazri-strategiq"
#define USER_EMAIL "hemil.shah2020@gmail.com"
#define USER_PASSWORD "123456"

// Pins
#define SS_PIN D8
#define RST_PIN D0
#define CAM_RX D3
#define CAM_TX D4

MFRC522 mfrc522(SS_PIN, RST_PIN);
Adafruit_SSD1306 display(128, 64, &Wire, -1);
SoftwareSerial camSerial(CAM_RX, CAM_TX); 

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool firebaseReady = false;
unsigned long lastConnectionAttempt = 0;
const unsigned long RECONNECT_INTERVAL = 5000; // Check WiFi every 5 sec

// NEW: Timer to prevent infinite sync loops
unsigned long lastOfflineSync = 0;
const unsigned long OFFLINE_SYNC_INTERVAL = 30000; // Try syncing offline logs only every 30s

// Helper Declarations
void displayMessage(String t, String m1, String m2="");
bool sendToFirestore(String uid);
void logOffline(String uid);
void processOfflineLogs();
void checkOnlineStatus(); 
String getTimestampString(); // New helper

void setup() {
  Serial.begin(115200);
  camSerial.begin(4800); 
  
  if(!LittleFS.begin()){
    Serial.println("LittleFS Mount Failed. Formatting...");
    LittleFS.format();
    LittleFS.begin();
  }

  Wire.begin(); 
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextColor(WHITE);
  displayMessage("Booting...", "Init System");

  SPI.begin();
  mfrc522.PCD_Init();

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  Serial.println("System Booted.");
  
  checkOnlineStatus();
}

void loop() {
  // ------------------------------------------------
  // 1. AUTO-RECONNECT CHECK (Every 5 Sec)
  // ------------------------------------------------
  if (millis() - lastConnectionAttempt > RECONNECT_INTERVAL) {
    lastConnectionAttempt = millis();
    checkOnlineStatus(); 
  }

  // ------------------------------------------------
  // 2. AUTO-SYNC (Throttled to every 30 Sec)
  // ------------------------------------------------
  if (firebaseReady && WiFi.status() == WL_CONNECTED && Firebase.ready()) {
      // FIX: Only check periodically to prevent infinite loop
      if (millis() - lastOfflineSync > OFFLINE_SYNC_INTERVAL) {
          if(LittleFS.exists("/offline.txt")) {
              processOfflineLogs();
          }
          lastOfflineSync = millis();
      }
  }

  // ------------------------------------------------
  // 3. MAIN RFID SCAN LOOP
  // ------------------------------------------------
  if (!mfrc522.PICC_IsNewCardPresent()) return;
  if (!mfrc522.PICC_ReadCardSerial()) return;

  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    uid += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();

  Serial.println("Scan: " + uid);
  displayMessage("Verifying...", uid);

  while(camSerial.available()) camSerial.read(); 
  camSerial.println(uid); 

  // Wait for Result (4s Timeout)
  String result = "error";
  unsigned long wait = millis();
  while(millis() - wait < 4000) {
    if(camSerial.available()) {
      result = camSerial.readStringUntil('\n');
      result.trim();
      if(result.length() > 0) break;
    }
    yield();
  }

  Serial.println("Result: " + result);

  if (result == "true") {
     displayMessage("ACCESS GRANTED", "Welcome");
     
     bool uploaded = false;
     
     if(firebaseReady && WiFi.status() == WL_CONNECTED) {
         uploaded = sendToFirestore(uid);
     } else {
         Serial.println("Offline/Not Ready -> Skipping upload");
     }
     
     if(!uploaded) {
         logOffline(uid);
         if(firebaseReady) displayMessage("Saved", "Offline Mode");
     }
     
  } else if (result == "false") {
     displayMessage("ACCESS DENIED", "Mismatch");
  } else {
     displayMessage("Error", "Cam Timeout");
  }

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  delay(2000); 
  
  if(firebaseReady && WiFi.status() == WL_CONNECTED) displayMessage("Online", "Ready");
  else displayMessage("Offline", "Ready");
}

// ==========================================
// CORE FUNCTIONS
// ==========================================

// NEW HELPER: Generates the exact string format Firestore wants
// Format: 2024-12-08T14:30:00Z
String getTimestampString() {
  time_t now = time(nullptr);
  struct tm* p_tm = gmtime(&now);
  
  char buffer[30];
  sprintf(buffer, "%04d-%02d-%02dT%02d:%02d:%02dZ", 
          p_tm->tm_year + 1900, 
          p_tm->tm_mon + 1, 
          p_tm->tm_mday, 
          p_tm->tm_hour, 
          p_tm->tm_min, 
          p_tm->tm_sec);
          
  return String(buffer);
}

void checkOnlineStatus() {
  if (firebaseReady) {
      if (WiFi.status() != WL_CONNECTED) {
          Serial.println("WiFi Lost! Switching to Offline Mode.");
          firebaseReady = false; 
          displayMessage("Offline", "WiFi Lost");
      }
      return; 
  }

  if (WiFi.status() != WL_CONNECTED) {
      Serial.print("Offline. Waiting for WiFi...");
      return;
  }

  if (time(nullptr) < 100000) {
      Serial.println("WiFi Back. Syncing Time...");
      configTime(0, 0, "pool.ntp.org", "time.nist.gov"); 
      return; 
  }

  Serial.println("Time Synced! Re-Initializing Firebase...");
  
  config.api_key = API_KEY;
  config.service_account.data.client_email = USER_EMAIL;
  config.service_account.data.project_id = FIREBASE_PROJECT_ID;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  
  fbdo.setBSSLBufferSize(2048, 1024); 
  fbdo.setResponseSize(1024);

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  
  firebaseReady = true; 
  Serial.println("SYSTEM RESTORED: ONLINE");
  displayMessage("Online", "Syncing...");
}

bool sendToFirestore(String uid) {
  FirebaseJson content;
  content.set("fields/rfidId/stringValue", uid);
  content.set("fields/status/stringValue", "present");
  
  // FIX: Use the new helper function instead of "SERVER_TIMESTAMP"
  content.set("fields/timestamp/timestampValue", getTimestampString()); 

  Serial.print("Uploading... ");
  
  if (Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "", "rfid_logs", content.raw())) {
    Serial.println("SUCCESS");
    return true;
  } else {
    Serial.print("FAIL. Reason: ");
    Serial.println(fbdo.errorReason()); 
    return false;
  }
}

void logOffline(String uid) {
  File f = LittleFS.open("/offline.txt", "a");
  if(f) {
    f.println(uid);
    f.close();
    Serial.println("Saved Offline");
  }
}

void processOfflineLogs() {
  if(!LittleFS.exists("/offline.txt")) return;

  Serial.println("Found Offline Data. Processing...");
  displayMessage("Syncing", "Offline Data");

  LittleFS.rename("/offline.txt", "/processing.txt");
  
  File f = LittleFS.open("/processing.txt", "r");
  if (!f) return;

  File newOffline = LittleFS.open("/offline.txt", "a");
  bool someFailed = false;

  while(f.available()) {
    String uid = f.readStringUntil('\n');
    uid.trim();
    if(uid.length() > 0) {
       Serial.print("Syncing: "); Serial.println(uid);
       
       if (sendToFirestore(uid)) {
           Serial.println(" -> Synced!");
       } else {
           newOffline.println(uid);
           Serial.println(" -> Fail (Retrying later)");
           someFailed = true;
       }
       delay(100); 
    }
  }
  
  f.close();
  newOffline.close();
  
  LittleFS.remove("/processing.txt");
  
  if (!someFailed) Serial.println("Sync Complete.");
  else Serial.println("Sync Incomplete. Some logs kept offline.");
}

void displayMessage(String t, String m1, String m2) {
  display.clearDisplay();
  display.setCursor(0,0); display.println(t);
  display.setCursor(0,16); display.setTextSize(2); display.println(m1);
  if(m2 != "") { display.setCursor(0,35); display.setTextSize(1); display.println(m2); }
  display.display();
}