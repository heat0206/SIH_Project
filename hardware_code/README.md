# RFID Attendance System - Hardware Code

This folder contains the Arduino code for the ESP8266 (NodeMCU/Wemos D1 Mini) to scan RFID tags and log attendance to Firebase Firestore.

## Hardware Requirements
- ESP8266 Board (NodeMCU, Wemos D1 Mini, etc.)
- RC522 RFID Module
- Jumper Wires

## Wiring (Default SPI)
| RC522 Pin | ESP8266 Pin (NodeMCU) |
|-----------|-----------------------|
| SDA (SS)  | D8 (GPIO 15)          |
| SCK       | D5 (GPIO 14)          |
| MOSI      | D7 (GPIO 13)          |
| MISO      | D6 (GPIO 12)          |
| IRQ       | Not Connected         |
| GND       | GND                   |
| RST       | D3 (GPIO 0)           |
| 3.3V      | 3.3V                  |

## Software Setup

1. **Install Arduino IDE**
2. **Install ESP8266 Board Support**:
   - Go to File > Preferences.
   - Add `http://arduino.esp8266.com/stable/package_esp8266com_index.json` to Additional Board Manager URLs.
   - Go to Tools > Board > Boards Manager, search for `esp8266` and install.

3. **Install Libraries**:
   - Go to Sketch > Include Library > Manage Libraries.
   - Search for and install:
     - **MFRC522** by GithubCommunity
     - **Firebase Arduino Client Library for ESP8266 and ESP32** by Mobizt (Search for `Firebase ESP Client`)

4. **Configuration**:
   - Open `RFID_Scanner.ino`.
   - Update the following lines with your credentials:
     ```cpp
     #define WIFI_SSID "YOUR_WIFI_SSID"
     #define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
     #define API_KEY "YOUR_FIREBASE_API_KEY"
     #define FIREBASE_PROJECT_ID "YOUR_PROJECT_ID"
     #define USER_EMAIL "device@admin.com"
     #define USER_PASSWORD "device123456"
     ```
   - **Note**: You can find your API Key and Project ID in your project's `.env` file or Firebase Console.
   - **Authentication**: You must create a user in Firebase Authentication (Email/Password provider) with the email and password you set above, so the device can authenticate.

5. **Upload**:
   - Select your board (e.g., NodeMCU 1.0) and Port.
   - Click Upload.

## How it Works
- The device connects to Wi-Fi and Firebase.
- When an RFID tag is scanned, it reads the UID.
- It sends the UID and current timestamp to the `rfid_logs` collection in Firestore.
- The Admin Dashboard on the website will automatically pick up this log, look up the student details associated with the RFID ID, and display the scan.
