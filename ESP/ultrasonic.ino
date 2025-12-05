#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Servo.h>

const char* ssid = "Fernando";
const char* password = "RoBorregos2025";

const char* mqtt_server = "10.22.231.123";
const int mqtt_port = 1883;
const char* topic = "message/topic";

const char* MSG_CAPTURE_ENTRY = "captureEntry";
const char* MSG_STOP_ENTRY    = "stopEntry";
const char* CMD_OPEN_ENTRY    = "openEntry";

const char* MSG_CAPTURE_EXIT = "captureExit";
const char* MSG_STOP_EXIT    = "stopExit";
const char* CMD_OPEN_EXIT    = "openExit";

WiFiClient espClient;
PubSubClient client(espClient);

#define TRIG_ENTRADA 15 
#define ECHO_ENTRADA 13 

#define TRIG_SALIDA 5     
#define ECHO_SALIDA 4    

#define PIN_SERVO_ENTRADA 14
#define PIN_SERVO_SALIDA 12

Servo servoEntrada;
Servo servoSalida;

bool carroEntradaDetectado = false;
bool carroSalidaDetectado  = false;

int confirmEntrada = 0;
int confirmSalida  = 0;
const int lecturasRequeridas = 2;

long duracion;
float distancia;

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

void callback(char* topic, byte* payload, unsigned int length) {
  String mensaje = "";
  for (unsigned int i = 0; i < length; i++) mensaje += (char)payload[i];

  Serial.print("Mensaje recibido: ");
  Serial.println(mensaje);

  if (mensaje == CMD_OPEN_ENTRY) {
    Serial.println("ABRIENDO PLUMA DE ENTRADA...");
    servoEntrada.write(180);
    delay(5000);
    servoEntrada.write(0);
    Serial.println("Pluma de entrada cerrada.");
  }

  if (mensaje == CMD_OPEN_EXIT) {
    Serial.println("ABRIENDO PLUMA DE SALIDA...");
    servoSalida.write(180);
    delay(5000);
    servoSalida.write(0);
    Serial.println("Pluma de salida cerrada.");
  }
}

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

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_ENTRADA, OUTPUT);
  pinMode(ECHO_ENTRADA, INPUT);
  pinMode(TRIG_SALIDA, OUTPUT);
  pinMode(ECHO_SALIDA, INPUT);

  servoEntrada.attach(PIN_SERVO_ENTRADA);
  servoSalida.attach(PIN_SERVO_SALIDA);

  servoEntrada.write(0);
  servoSalida.write(0);

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  float dEntrada = medirDistancia(TRIG_ENTRADA, ECHO_ENTRADA);

  if (dEntrada < 10.0) {
    confirmEntrada++;
    if (confirmEntrada >= lecturasRequeridas && !carroEntradaDetectado) {
      Serial.println("Carro detectado en ENTRADA");
      client.publish(topic, MSG_CAPTURE_ENTRY);
      carroEntradaDetectado = true;
    }
  } else {
    confirmEntrada = 0;
  }

  if (dEntrada > 15.0 && carroEntradaDetectado) {
    Serial.println("Carro se alejo de ENTRADA");
    carroEntradaDetectado = false;
  }

  float dSalida = medirDistancia(TRIG_SALIDA, ECHO_SALIDA);
  Serial.print("Salida:");
  Serial.print(dSalida);
  Serial.print(" Entrada:");
  Serial.println(dEntrada);

  if (dSalida < 10.0) {
    confirmSalida++;
    if (confirmSalida >= lecturasRequeridas && !carroSalidaDetectado) {
      Serial.println("Carro detectado en SALIDA");
      client.publish(topic, MSG_CAPTURE_EXIT);
      carroSalidaDetectado = true;
    }
  } else {
    confirmSalida = 0;
  }

  if (dSalida > 15.0 && carroSalidaDetectado) {
    Serial.println("Carro se alejo de SALIDA");
    carroSalidaDetectado = false;
  }

  delay(200);
}
