#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

const char* ssid = "Fernando";
const char* password = "RoBorregos2025";

#define TRIG1 15
#define ECHO1 13
#define TRIG2 4
#define ECHO2 5

#define LED1 14
#define LED2 12

const char* serverURL = "http://10.22.231.123:3000/iot/api/updateParkingSlot";

const int SLOT_ID_1 = 1;
const int SLOT_ID_2 = 2;

const float UMBRAL_OCUPADO = 10.0;
const int LECTURAS_ESTABLES = 3;
const unsigned long INTERVALO_MIN_ENVIO = 3000;

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

void conectarWiFi() {
  Serial.println("Conectando al WiFi...");
  WiFi.begin(ssid, password);

  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    intentos++;
    if(intentos > 30){
      Serial.println("\nNo se pudo conectar. Reiniciando...");
    }
  }

  Serial.println("\nConectado al WiFi!");
  Serial.print("IP del ESP: ");
  Serial.println(WiFi.localIP());
}

float medirDistancia(int trigPin, int echoPin){
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duracion = pulseIn(echoPin, HIGH, 30000);
  if(duracion == 0) return -1;
  float distancia = duracion * 0.034 / 2;
  return distancia;
}

bool enviarDisponibilidad(int slotId, bool disponible){
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
  json += "\"available\":" + String(disponible ? "true" : "false");
  json += "}";

  int codigoRespuesta = http.PUT((uint8_t*)json.c_str(), json.length());
  Serial.print("Respuesta PUT: ");
  Serial.println(codigoRespuesta);
  if (codigoRespuesta > 0) {
    Serial.println(http.getString());
  } else {
    Serial.print("Error HTTP: ");
    Serial.println(codigoRespuesta);
  }

  http.end();
  return (codigoRespuesta >= 200 && codigoRespuesta < 300);
}

int contadorEstable1 = 0;
int contadorEstable2 = 0;
int estado1 = -1;
int estado2 = -1;
unsigned long ultimoEnvio1 = 0;
unsigned long ultimoEnvio2 = 0;

void loop() {
  float d1 = medirDistancia(TRIG1, ECHO1);
  float d2 = medirDistancia(TRIG2, ECHO2);

  Serial.print("D1: ");
  if (d1 < 0) Serial.print("sin_eco"); else Serial.print(d1);
  Serial.print(" cm | D2: ");
  if (d2 < 0) Serial.print("sin_eco"); else Serial.print(d2);
  Serial.println(" cm");

  if (d1 >= 0) {
    int nuevoEstado1 = (d1 <= UMBRAL_OCUPADO) ? 1 : 0;
    if (nuevoEstado1 == estado1) {
      contadorEstable1 = 0;
    } else {
      contadorEstable1++;
      if (contadorEstable1 >= LECTURAS_ESTABLES) {
        estado1 = nuevoEstado1;
        contadorEstable1 = 0;
        bool disponible = (estado1 == 0);
        digitalWrite(LED1, disponible ? HIGH : LOW);
        unsigned long ahora = millis();
        if (ahora - ultimoEnvio1 >= INTERVALO_MIN_ENVIO) {
          Serial.printf("Slot %d -> disponible: %s\n", SLOT_ID_1, disponible ? "true" : "false");
          if (enviarDisponibilidad(SLOT_ID_1, disponible)) ultimoEnvio1 = ahora;
        }
      }
    }
  }

  if (d2 >= 0) {
    int nuevoEstado2 = (d2 <= UMBRAL_OCUPADO) ? 1 : 0;
    if (nuevoEstado2 == estado2) {
      contadorEstable2 = 0;
    } else {
      contadorEstable2++;
      if (contadorEstable2 >= LECTURAS_ESTABLES) {
        estado2 = nuevoEstado2;
        contadorEstable2 = 0;
        bool disponible = (estado2 == 0);
        digitalWrite(LED2, disponible ? HIGH : LOW);
        unsigned long ahora = millis();
        if (ahora - ultimoEnvio2 >= INTERVALO_MIN_ENVIO) {
          Serial.printf("Slot %d -> disponible: %s\n", SLOT_ID_2, disponible ? "true" : "false");
          if (enviarDisponibilidad(SLOT_ID_2, disponible)) ultimoEnvio2 = ahora;
        }
      }
    }
  }

  delay(80);
}