#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Servo.h>

// =========================
//   CONFIGURACION WIFI
// =========================
const char* ssid = "Fernando";
const char* password = "RoBorregos2025";

// =========================
//   CONFIGURACION MQTT
// =========================
const char* mqtt_server = "10.22.231.123";
const int mqtt_port = 1883;
const char* topic = "message/topic";

// ===== MENSAJES MQTT =====
// ---- ENTRADA ----
const char* MSG_CAPTURE_ENTRY = "capture_entry";
const char* MSG_STOP_ENTRY    = "stop_entry";
const char* CMD_OPEN_ENTRY    = "open_entry";

// ---- SALIDA ----
const char* MSG_CAPTURE_EXIT = "capture_exit";
const char* MSG_STOP_EXIT    = "stop_exit";
const char* CMD_OPEN_EXIT    = "open_exit";

// ========================================
WiFiClient espClient;
PubSubClient client(espClient);

// =========================
//   PINES SENSORES
// =========================

// SENSOR DE ENTRADA
#define TRIG_ENTRY 15 
#define ECHO_ENTRY 13 

// SENSOR DE SALIDA
#define TRIG_EXIT 5     
#define ECHO_EXIT 4    

// =========================
//   PINES SERVOS
// =========================
#define SERVO_ENTRY_PIN 14
#define SERVO_EXIT_PIN 12

// =========================
//   SERVOS
// =========================
Servo servoEntrada;
Servo servoSalida;

// =========================
//   VARIABLES
// =========================
bool carroEntradaDetectado = false;
bool carroSalidaDetectado  = false;

long duracion;
float distancia;


// =========================
//   FUNCION WIFI
// =========================
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando a ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi conectado");
  Serial.print("IP asignada: ");
  Serial.println(WiFi.localIP());
}

// =========================
//   FUNCION MEDIR DISTANCIA
// =========================
float medirDistancia(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(4);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duracion = pulseIn(echoPin, HIGH);
  distancia = duracion * 0.0343 / 2;
  return distancia;
}

// =========================
//   CALLBACK MQTT
// =========================
void callback(char* topic, byte* payload, unsigned int length) {
  String mensaje = "";
  for (unsigned int i = 0; i < length; i++) mensaje += (char)payload[i];

  Serial.print("Mensaje recibido: ");
  Serial.println(mensaje);

  // ===== ENTRADA =====
  if (mensaje == CMD_OPEN_ENTRY) {
    Serial.println("ABRIENDO PLUMA DE ENTRADA...");
    servoEntrada.write(180);
    delay(5000);
    servoEntrada.write(0);
    Serial.println("Pluma de entrada cerrada.");
  }

  // ===== SALIDA =====
  if (mensaje == CMD_OPEN_EXIT) {
    Serial.println("ABRIENDO PLUMA DE SALIDA...");
    servoSalida.write(180);
    delay(5000);
    servoSalida.write(0);
    Serial.println("Pluma de salida cerrada.");
  }
}

// =========================
//   RECONEXIÓN MQTT
// =========================
void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando a MQTT...");
    if (client.connect("ESP8266_dual")) {
      Serial.println("Conectado.");
      client.subscribe(topic);
    } else {
      Serial.print("Fallo, rc=");
      Serial.print(client.state());
      Serial.println(" reintentando en 2s...");
      delay(2000);
    }
  }
}

// =========================
//   SETUP
// =========================
void setup() {
  Serial.begin(9600);

  // Pines sensores
  pinMode(TRIG_ENTRY, OUTPUT);
  pinMode(ECHO_ENTRY, INPUT);
  pinMode(TRIG_EXIT, OUTPUT);
  pinMode(ECHO_EXIT, INPUT);

  // Servos
  servoEntrada.attach(SERVO_ENTRY_PIN);
  servoSalida.attach(SERVO_EXIT_PIN);

  servoEntrada.write(0);
  servoSalida.write(0);

  // WiFi + MQTT
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

// =========================
//   LOOP PRINCIPAL
// =========================
void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // =========================
  //   SENSOR DE ENTRADA
  // =========================
  float dEntrada = medirDistancia(TRIG_ENTRY, ECHO_ENTRY);

  Serial.print("Entrada: ");
  Serial.print(dEntrada);
  Serial.println(" cm");

  if (dEntrada < 10.0 && !carroEntradaDetectado) {
    Serial.println("Carro detectado en ENTRADA → CAPTURE_ENTRY");
    client.publish(topic, MSG_CAPTURE_ENTRY);
    carroEntradaDetectado = true;
  }

  if (dEntrada > 15.0 && carroEntradaDetectado) {
    Serial.println("Carro se alejó de ENTRADA → STOP_ENTRY");
    client.publish(topic, MSG_STOP_ENTRY);
    carroEntradaDetectado = false;
  }

  // =========================
  //   SENSOR DE SALIDA
  // =========================
  float dSalida = medirDistancia(TRIG_EXIT, ECHO_EXIT);

  Serial.print("Salida: ");
  Serial.print(dSalida);
  Serial.println(" cm");

  if (dSalida < 10.0 && !carroSalidaDetectado) {
    Serial.println("Carro detectado en SALIDA → CAPTURE_EXIT");
    client.publish(topic, MSG_CAPTURE_EXIT);
    carroSalidaDetectado = true;
  }

  if (dSalida > 15.0 && carroSalidaDetectado) {
    Serial.println("Carro se alejó de SALIDA → STOP_EXIT");
    client.publish(topic, MSG_STOP_EXIT);
    carroSalidaDetectado = false;
  }

  delay(500);
}
