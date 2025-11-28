#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// -----------------------------------------------
// CONFIGURACIÓN WIFI
// -----------------------------------------------
const char* ssid = "Fernando";
const char* password = "RoBorregos2025";

// -----------------------------------------------
// SENSORES ULTRASÓNICOS (CONFIGURABLES)
// Define aquí los pines TRIG/ECHO para cada sensor.
// Ajusta los pines según tu placa NodeMCU/ESP8266.
// Ejemplo: TRIG1 = D1 (GPIO5) -> usar 5; ECHO1 = D2 (GPIO4) -> usar 4
// Los valores por defecto abajo pueden necesitar ajuste según tu hardware.
#define TRIG1 15
#define ECHO1 13
#define TRIG2 4
#define ECHO2 5

// LEDs indicativos por slot (ajusta pines según tu placa)
#define LED1 14
#define LED2 12
// -----------------------------------------------
// CONFIGURACIÓN API
// -----------------------------------------------
// Cambia la IP/puerto por donde corre tu API localmente
const char* serverURL = "http://10.22.231.123:3000/iot/api/updateParkingSlot";

// Asocia cada sensor con el id del slot que tu API usa (entero)
const int SLOT_ID_1 = 1; // ajustar según tu BD
const int SLOT_ID_2 = 2; // ajustar según tu BD

// Umbral en cm para considerar ocupado/libre
const float OCCUPIED_THRESHOLD = 10.0; // debajo de esto -> ocupado

// Número de lecturas consecutivas necesarias para confirmar un cambio
const int STABLE_READINGS = 3;

// Tiempo mínimo entre actualizaciones al servidor por slot (ms)
const unsigned long MIN_SEND_INTERVAL = 3000;

void setup() {
Serial.begin(115200);

pinMode(TRIG1, OUTPUT);
pinMode(ECHO1, INPUT);
pinMode(TRIG2, OUTPUT);
pinMode(ECHO2, INPUT);

pinMode(LED1, OUTPUT);
pinMode(LED2, OUTPUT);
digitalWrite(LED1, LOW);
digitalWrite(LED2, LOW);
Serial.print("setup...");
conectarWiFi();
}

// ---------------------------------------------------
// FUNCIÓN PARA CONECTAR AL WIFI
// ---------------------------------------------------
void conectarWiFi() {
Serial.println("Conectando al WiFi...");
WiFi.begin(ssid, password);

int intentos = 0;
while (WiFi.status() != WL_CONNECTED) {
delay(500);
Serial.print(".");
intentos++;
if(intentos > 30){ // reintento por 15s
Serial.println("\nNo se pudo conectar. Reiniciando...");
// ESP.restart();
}
}

Serial.println("\nConectado al WiFi!");
Serial.print("IP del ESP: ");
Serial.println(WiFi.localIP());
}

// ---------------------------------------------------
// FUNCIÓN PARA MEDIR DISTANCIA
// ---------------------------------------------------
float medirDistancia() {
 // Generic helper removed; use medirDistanciaPins for each sensor
 return 0;
}

// Measure distance for specific trig/echo pins
float medirDistanciaPins(int trigPin, int echoPin){
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duracion = pulseIn(echoPin, HIGH, 30000); // timeout 30ms
  if(duracion == 0) return -1; // no echo
  float distancia = duracion * 0.034 / 2;  // conversión a cm
  return distancia;
}

// ---------------------------------------------------
// FUNCIÓN PARA ENVIAR DATOS A LA API
// ---------------------------------------------------
// Send availability update to API for a specific slot id
bool sendAvailability(int slotId, bool available){
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado. Reconectando...");
    conectarWiFi();
    if (WiFi.status() != WL_CONNECTED) return false;
  }

  WiFiClient client;
  HTTPClient http;
  http.begin(client, serverURL);
  http.addHeader("Content-Type", "application/json");

  String json = "{";
  json += "\"id\":" + String(slotId) + ",";
  json += "\"available\":" + String(available ? "true" : "false");
  json += "}";

  int httpResponseCode = http.PUT((uint8_t*)json.c_str(), json.length());
  Serial.print("PUT response: ");
  Serial.println(httpResponseCode);
  if (httpResponseCode > 0) {
    Serial.println(http.getString());
  } else {
    Serial.print("HTTP error: ");
    Serial.println(httpResponseCode);
  }

  http.end();
  return (httpResponseCode >= 200 && httpResponseCode < 300);
}


// ---------------------------------------------------
// LOOP PRINCIPAL: lee 2 sensores, detecta cambios y notifica a la API
// ---------------------------------------------------
int stableCount1 = 0;
int stableCount2 = 0;
int state1 = -1; // -1 unknown, 0 free, 1 occupied
int state2 = -1;
unsigned long lastSend1 = 0;
unsigned long lastSend2 = 0;

void loop() {
  float d1 = medirDistanciaPins(TRIG1, ECHO1);
  float d2 = medirDistanciaPins(TRIG2, ECHO2);

  Serial.print("D1: ");
  if (d1 < 0) Serial.print("no_echo"); else Serial.print(d1);
  Serial.print(" cm | D2: ");
  if (d2 < 0) Serial.print("no_echo"); else Serial.print(d2);
  Serial.println(" cm");

  // Procesar sensor 1
  if (d1 >= 0) {
    int newState1 = (d1 <= OCCUPIED_THRESHOLD) ? 1 : 0;
    if (newState1 == state1) {
      stableCount1 = 0; // already in that state
    } else {
      stableCount1++;
      if (stableCount1 >= STABLE_READINGS) {
        state1 = newState1;
        stableCount1 = 0;
        bool available = (state1 == 0);
        // Actualiza LED indicando disponibilidad: ON = disponible
        digitalWrite(LED1, available ? HIGH : LOW);
        unsigned long now = millis();
        if (now - lastSend1 >= MIN_SEND_INTERVAL) {
          Serial.printf("Slot %d -> available: %s\n", SLOT_ID_1, available ? "true" : "false");
          if (sendAvailability(SLOT_ID_1, available)) lastSend1 = now;
        }
      }
    }
  }

  // Procesar sensor 2
  if (d2 >= 0) {
    int newState2 = (d2 <= OCCUPIED_THRESHOLD) ? 1 : 0;
    if (newState2 == state2) {
      stableCount2 = 0;
    } else {
      stableCount2++;
      if (stableCount2 >= STABLE_READINGS) {
        state2 = newState2;
        stableCount2 = 0;
        bool available = (state2 == 0);
        // Actualiza LED indicando disponibilidad: ON = disponible
        digitalWrite(LED2, available ? HIGH : LOW);
        unsigned long now = millis();
        if (now - lastSend2 >= MIN_SEND_INTERVAL) {
          Serial.printf("Slot %d -> available: %s\n", SLOT_ID_2, available ? "true" : "false");
          if (sendAvailability(SLOT_ID_2, available)) lastSend2 = now;
        }
      }
    }
  }

  delay(80);
}