# RFID Attendance System (IoT)

This project uses an **ESP8266** (NodeMCU/Wemos D1 Mini) to create a smart attendance system with **RFID scanning**, **OLED status display**, and **Cloud Synchronization (Firebase)**.

It features a robust **Offline Mode**: if WiFi or Internet is lost, attendance logs are saved locally and automatically synced when the connection is restored.

## Features
- **RFID Scanning**: Instantly reads classic 13.56MHz cards/tags.
- **OLED Display**: Shows connection status, scanned UID, and system messages ("Saved Offline", "Syncing", etc.).
- **Cloud Sync**: Uploads attendance logs to Google Firebase Firestore in real-time.
- **Offline Assurance**:
  - Automatically detects connection loss.
  - Saves scans to internal memory (LittleFS) with timestamps.
  - Automatically syncs stored logs upon reconnection.
- **Lazy Connection**: Device boots fast into offline mode if WiFi is unavailable at startup.

## Hardware Requirements
1.  **ESP8266 Board** (NodeMCU v1.0, Wemos D1 Mini, etc.)
2.  **MFRC522 RFID Module** (SPI Interface)
3.  **0.96" OLED Display** (SSD1306 driver, I2C Interface)
4.  Jumper Wires & Breadboard

## Wiring Diagram

### 1. RFID Module (RC522) - SPI
| RC522 Pin | ESP8266 Pin (NodeMCU) | GPIO |
| :--- | :--- | :--- |
| **SDA (SS)** | **D8** | GPIO 15 |
| **SCK** | **D5** | GPIO 14 |
| **MOSI** | **D7** | GPIO 13 |
| **MISO** | **D6** | GPIO 12 |
| **GND** | **GND** | - |
| **RST** | **D3** | GPIO 0 |
| **3.3V** | **3.3V** | - |

*(Note: IRQ is not connected)*

### 2. OLED Display - I2C
| OLED Pin | ESP8266 Pin (NodeMCU) | GPIO |
| :--- | :--- | :--- |
| **SDA** | **D2** | GPIO 4 |
| **SCL** | **D1** | GPIO 5 |
| **VCC** | **3.3V** | - |
| **GND** | **GND** | - |

## Software Setup

### 1. Prerequisites
- Install **Arduino IDE**.
- Install **ESP8266 Board Package** in Board Managers.

### 2. Required Libraries
Install these via `Sketch > Include Library > Manage Libraries`:
1.  **MFRC522** (by GithubCommunity)
2.  **Adafruit SSD1306** (by Adafruit)
3.  **Adafruit GFX Library** (by Adafruit)
4.  **Firebase Arduino Client Library for ESP8266 and ESP32** (by Mobizt)

### 3. Configuration
Open `ReadNUID.ino` and configure your credentials at the top:
```cpp
#define WIFI_SSID "YOUR_WIFI_NAME"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

#define API_KEY "YOUR_FIREBASE_API_KEY"
#define FIREBASE_PROJECT_ID "YOUR_PROJECT_ID"
#define USER_EMAIL "device_auth_email@example.com"
#define USER_PASSWORD "device_auth_password"
```

### 4. Partitions (Important!)
Since we use **LittleFS** for offline storage, you must select a partition scheme that allocates space for the file system.
- In Arduino IDE: `Tools > Flash Size > 4MB (FS: 2MB OTA:~1019KB)` (or similar).
- **Do not** select "No FS".

## Usage
1.  **Power On**:
    - **WiFi Available**: Connects, Syncs previous offline logs, Ready to scan.
    - **WiFi Unavailable**: Waits 10s, then enters "Offline Mode".
2.  **Scan Card**:
    - **Online**: "Sending to FB..." -> Log appears in Firestore `rfid_logs`.
    - **Offline**: "Saved to Memory" -> Log saved to internal storage.
3.  **Reconnection**:
    - If power/WiFi is restored, the device automatically uploads all "Saved Offline" logs in the background.

## Database Structure
Logs are saved to the **`rfid_logs`** collection in Firestore.
- **Document ID**: `Timestamp_RFID`
- **Fields**:
    - `rfidId`: String (UID of the card)
    - `timestamp`: Timestamp (When the card was SCANNED, not uploaded)
    - `status`: "present"
