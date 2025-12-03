#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include <SPI.h>
#include <MFRC522.h>
#include <time.h>
#include <vector>

// Provide the token generation process info.
#include <addons/TokenHelper.h>

/* 1. Define the WiFi credentials */
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

/* 2. Define the Firebase config */
#define API_KEY "YOUR_API_KEY_FROM_ENV"
#define FIREBASE_PROJECT_ID "YOUR_PROJECT_ID_FROM_ENV"

/* 3. Define the user Email and password for the device */
#define USER_EMAIL "device@admin.com"
#define USER_PASSWORD "device123456"

// Define Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// RFID Pins (Default for NodeMCU ESP8266)
#define SS_PIN D8  // SDA (SS)
#define RST_PIN D3 // RST
MFRC522 mfrc522(SS_PIN, RST_PIN);

// NTP Server settings for time
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 0; // UTC time
const int   daylightOffset_sec = 0;

// Offline Storage Structure
struct OfflineScan {
  String rfidId;
  String timestamp;
  String date;
};

// Store in RAM (Heap). ESP8266 has ~40KB+ free heap, enough for 1000+ scans.
// Note: Data in RAM is lost if power is cut. For persistent storage, LittleFS is needed.
std::vector<OfflineScan> offlineQueue;

unsigned long lastSyncTime = 0;
const unsigned long syncInterval = 30000; // 30 seconds

void setup() {
  Serial.begin(115200);
  
  // Init SPI and MFRC522
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("\n\nRFID Scanner started");

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    Serial.print(".");
    delay(300);
    retry++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Connected with IP: ");
    Serial.println(WiFi.localIP());
    
    // Init Time only if connected
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  } else {
    Serial.println("\nStarting in OFFLINE mode.");
  }

  // Firebase Config
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // 1. Periodic Sync Check (Every 30 sec)
  if (millis() - lastSyncTime > syncInterval) {
    checkInternetAndSync();
    lastSyncTime = millis();
  }

  // 2. Check for new RFID card
  if ( ! mfrc522.PICC_IsNewCardPresent()) {
    return;
  }

  if ( ! mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // 3. Get the UID
  String rfidId = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    rfidId += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "");
    rfidId += String(mfrc522.uid.uidByte[i], HEX);
  }
  rfidId.toUpperCase();

  Serial.print("Scanned RFID ID: ");
  Serial.println(rfidId);

  // 4. Capture Time
  time_t now;
  time(&now);
  struct tm timeinfo;
  
  // If time hasn't been set yet (booted offline), this will be 1970.
  // We can't do much about that without an RTC module. 
  // But if we connected once, time continues to tick even if wifi lost.
  if(!localtime_r(&now, &timeinfo)){
    Serial.println("Failed to obtain time");
  }
  
  char timeString[30];
  strftime(timeString, sizeof(timeString), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  
  char dateString[15];
  strftime(dateString, sizeof(dateString), "%Y-%m-%d", &timeinfo);

  // 5. Try to Send or Queue
  if (WiFi.status() == WL_CONNECTED && Firebase.ready()) {
    bool success = sendToFirestore(rfidId, String(timeString), String(dateString));
    if (!success) {
      queueScan(rfidId, String(timeString), String(dateString));
    }
  } else {
    Serial.println("Offline/Firebase not ready. Queuing scan.");
    queueScan(rfidId, String(timeString), String(dateString));
  }

  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
  delay(2000);
}

void queueScan(String rfid, String ts, String date) {
  OfflineScan scan = {rfid, ts, date};
  offlineQueue.push_back(scan);
  Serial.print("Scan queued. Total offline: ");
  Serial.println(offlineQueue.size());
}

void checkInternetAndSync() {
  if (offlineQueue.empty()) return;

  Serial.println("Checking connection for sync...");
  
  // Reconnect WiFi if needed (Firebase lib does this too, but good to be explicit)
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
    return; // Wait for next cycle
  }

  if (Firebase.ready()) {
    Serial.print("Syncing ");
    Serial.print(offlineQueue.size());
    Serial.println(" offline scans...");

    // Iterate backwards or use a temp buffer to remove successfully sent items
    // Safest is to try sending head, if success, remove.
    // To avoid blocking loop for too long, we can send max 5 per cycle.
    int processed = 0;
    while (!offlineQueue.empty() && processed < 5) {
      OfflineScan scan = offlineQueue.front();
      
      Serial.print("Syncing: ");
      Serial.print(scan.rfidId);
      
      if (sendToFirestore(scan.rfidId, scan.timestamp, scan.date)) {
        Serial.println(" - Success");
        offlineQueue.erase(offlineQueue.begin()); // Remove from front
        processed++;
      } else {
        Serial.println(" - Failed (will retry)");
        break; // Stop trying if one fails, network might be flaky
      }
    }
  }
}

bool sendToFirestore(String rfidId, String timeString, String dateString) {
  // Use timestamp + RFID as ID
  // Note: If time is 1970 (booted offline), ID collisions might happen if scanned fast.
  // Ideally, use a counter or random string if time is invalid.
  String docId = timeString + "_" + rfidId;
  String documentPath = "rfid_logs/" + docId;

  FirebaseJson content;
  content.set("fields/rfidId/stringValue", rfidId);
  content.set("fields/timestamp/timestampValue", timeString);
  content.set("fields/date/stringValue", dateString);
  content.set("fields/status/stringValue", "present");

  if (Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "" /* databaseId */, documentPath.c_str(), content.raw())) {
    return true;
  } else {
    Serial.print("Firestore Error: ");
    Serial.println(fbdo.errorReason());
    return false;
  }
}
