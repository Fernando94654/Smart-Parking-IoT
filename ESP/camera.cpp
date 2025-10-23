#include <WiFi.h>
#include <PubSubClient.h>
#include "esp_camera.h"
#include "Arduino.h"
#include "base64.h"

#define MQTT_MAX_PACKET_SIZE 51200

const char* ssid = "";
const char* password = "";

const char* mqtt_server = "192.168.1.73";

WiFiClient espClient;
PubSubClient client(espClient);

String camaraTopic = "cam/topic";
String request_message = "capture";
String message_topic = "message/topic";

camera_config_t config = {
  .pin_pwdn       = 32,
  .pin_reset      = -1,
  .pin_xclk       = 0,
  .pin_sccb_sda   = 26,
  .pin_sccb_scl   = 27,
  .pin_d7         = 35,
  .pin_d6         = 34,
  .pin_d5         = 39,
  .pin_d4         = 36,
  .pin_d3         = 21,
  .pin_d2         = 19,
  .pin_d1         = 18,
  .pin_d0         = 5,
  .pin_vsync      = 25,
  .pin_href       = 23,
  .pin_pclk       = 22,
  .xclk_freq_hz   = 20000000,
  .pixel_format   = PIXFORMAT_JPEG,
  .frame_size     = FRAMESIZE_QVGA, 
  .jpeg_quality   = 10,
  .fb_count       = 1
};


void setupWifi() {
  delay(10);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void setupCamera(){
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  Serial.println("Camera initialized");
}

void flushCameraBuffer(int times = 1) {
  for (int i = 0; i < times; i++) {
    camera_fb_t *fb = esp_camera_fb_get();
    if (fb) esp_camera_fb_return(fb);
  }
}

void publishImage() {
  flushCameraBuffer(2);
  camera_fb_t * fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return;
  }
  String encoded = base64::encode(fb->buf, fb->len);
  bool sent = client.publish(camaraTopic.c_str(), encoded.c_str());
  if (sent) {
    Serial.println("Image published successfully");
  } else {
    Serial.println("Failed to publish image");
  }

  esp_camera_fb_return(fb);
}

void messageCallback(char* topic, byte* payload, unsigned int lenght){
  String message;
  Serial.print("Message arrived [");;
  Serial.print(topic);
  Serial.print("]: ");
  for (unsigned int i = 0; i < lenght; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  if(message == request_message) {
    Serial.println("Capturing and publishing image...");
    publishImage();
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32CAM_Test")) {
      Serial.println("connected");
      client.subscribe(message_topic.c_str());
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 2s");
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Starting EspCam");

  // Connect to WiFi and MQTT
  setupWifi();
  client.setServer(mqtt_server, 1883);
  client.setBufferSize(100000);
  setupCamera();

  // Subscribe to message/topic
  client.subscribe(message_topic.c_str());
  client.setCallback(messageCallback);

}

void loop() {
  if (!client.connected()) {
    reconnect();

  }
  client.loop();
  delay(10);
}
