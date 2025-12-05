#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "Fernando";
const char* password = "RoBorregos2025";

const char* host = "10.22.231.123";   
const int port = 3000;                  
String serverUrl = "";

const int PIN_PIR = D6;
const int PIN_LED = D7;

bool estadoMovimiento = false;
const unsigned long INTERVALO_ENVIO = 3000;
unsigned long ultimoEnvio = 0;

void conectarWiFi() {
  Serial.print("Conectando a WiFi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }

  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

bool enviarEvento(String lectura) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi no conectado, reintentando...");
    conectarWiFi();
    if (WiFi.status() != WL_CONNECTED) return false;
  }

  HTTPClient http;
  WiFiClient client;

  http.begin(client, serverUrl);
  http.addHeader("Content-Type", "application/json");

  String json = "{\"type\":\"PIR\", \"reading\":\"" + lectura + "\"}";
  Serial.println("POST: " + json);

  int codigoHTTP = http.POST(json);
  Serial.println("Codigo HTTP: " + String(codigoHTTP));
  http.end();

  return (codigoHTTP > 0 && codigoHTTP < 300);
}

void setup() {
  Serial.begin(9600);

  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_LED, OUTPUT);
  digitalWrite(PIN_LED, LOW);

  conectarWiFi();
  serverUrl = String("http://") + String(host) + ":" + String(port) + "/iot/api/sensor";
  Serial.print("Endpoint: ");
  Serial.println(serverUrl);
}

void loop() {
  estadoMovimiento = digitalRead(PIN_PIR) == HIGH;
  digitalWrite(PIN_LED, estadoMovimiento ? HIGH : LOW);

  unsigned long tiempoActual = millis();
  if (tiempoActual - ultimoEnvio >= INTERVALO_ENVIO) {
    ultimoEnvio = tiempoActual;
    String lectura = estadoMovimiento ? "motion" : "noMotion";
    bool ok = enviarEvento(lectura);
    Serial.println(ok ? "Envio OK" : "Envio FALLIDO");
  }

  delay(50);
}