#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "DHT.h"

LiquidCrystal_I2C lcd(0x27, 16, 2);

const char* ssid = "Fernando";
const char* password = "RoBorregos2025";
const char* host = "10.22.231.123";
const int port = 3000;
String serverUrl = "";
const int intervaloEnvio = 5000;

unsigned long ultimoEnvio = millis();

#define DHTTYPE DHT11
#define PIN_DHT D5
DHT dht(PIN_DHT, DHTTYPE);

void setup(void) {
  Serial.begin(9600);

  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Inicializando...");
  delay(1500);

  WiFi.begin(ssid, password);
  lcd.clear();
  lcd.print("Conectando WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi conectado");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());

  lcd.clear();
  lcd.print("WiFi OK");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP().toString());

  dht.begin();
  delay(1500);

  serverUrl = String("http://") + String(host) + ":" + String(port) + "/iot/api/sensor";
  Serial.print("Endpoint: ");
  Serial.println(serverUrl);
}

void loop() {
  float humedad = dht.readHumidity();
  float temperatura = dht.readTemperature();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(temperatura);
  lcd.print(" C");

  lcd.setCursor(0, 1);
  lcd.print("Hum:  ");
  lcd.print(humedad);
  lcd.print("%");

  Serial.print("Humedad = ");
  Serial.print(humedad);
  Serial.print("%  ");
  Serial.print("Temperatura = ");
  Serial.print(temperatura);
  Serial.println("C");

  unsigned long tiempoActual = millis();
  if (tiempoActual - ultimoEnvio > intervaloEnvio) {
    ultimoEnvio = tiempoActual;

    HTTPClient http;
    WiFiClient client;

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    String payloadTemp = "{\"type\":\"temperature\",\"reading\":\"" + String(temperatura) + "\"}";
    Serial.println("POST: " + payloadTemp);
    int codigo = http.POST(payloadTemp);
    if (codigo > 0 && codigo < 300) {
      Serial.println("Temperatura enviada OK: " + String(codigo));
    } else {
      Serial.println("Error al enviar temperatura: " + String(codigo));
    }
    http.end();

    delay(200);

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    String payloadHum = "{\"type\":\"humidity\",\"reading\":\"" + String(humedad) + "\"}";
    Serial.println("POST: " + payloadHum);
    codigo = http.POST(payloadHum);
    if (codigo > 0 && codigo < 300) {
      Serial.println("Humedad enviada OK: " + String(codigo));
    } else {
      Serial.println("Error al enviar humedad: " + String(codigo));
    }
    http.end();
  }

  delay(2000);
}