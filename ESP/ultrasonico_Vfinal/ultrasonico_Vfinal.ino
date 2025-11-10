#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// configuracion wifi
const char* ssid = "Fernando";           // red wifi del proyecto
const char* password = "RoBorregos2025"; // contrasena del wifi

// configuracion mqtt
const char* mqtt_server = "10.22.235.163";  // ip del broker mqtt (la misma que usa la camara)
const int mqtt_port = 1883;
const char* topic = "message/topic";       // topico donde la camara escucha

WiFiClient espClient;
PubSubClient client(espClient);

// pines del sensor hc-sr04
#define PIN_TRIG  15
#define PIN_ECHO  13

long duracion;
float distancia;
bool carro_detectado = false;  // bandera para no enviar varias veces el mismo mensaje

// funcion para conectar al wifi
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

  Serial.println();
  Serial.println("WiFi conectado");
  Serial.print("IP asignada: ");
  Serial.println(WiFi.localIP());
}

// funcion para reconectar al broker mqtt si se pierde la conexion
void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando a MQTT...");
    if (client.connect("SensorESP8266")) {
      Serial.println("Conectado al broker MQTT");
    } else {
      Serial.print("Fallo, rc=");
      Serial.print(client.state());
      Serial.println(" intentando en 2 segundos...");
      delay(2000);
    }
  }
}

// mide la distancia con el sensor
float medirDistancia() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(4);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  duracion = pulseIn(PIN_ECHO, HIGH);
  distancia = duracion * 0.0343 / 2; // convierte el tiempo a cm
  return distancia;
}

void setup() {
  Serial.begin(9600);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  float d = medirDistancia();
  Serial.print("Distancia: ");
  Serial.print(d);
  Serial.println(" cm");

  // si hay un carro cerca y aun no se ha detectado antes
  if (d < 5.0 && !carro_detectado) {
    Serial.println("Vehiculo detectado, enviando senal de CAPTURE...");
    client.publish(topic, "capture");  // envia mensaje para que la camara capture
    carro_detectado = true;
  }

  // si el carro se aleja, se envia senal de stop
  if (d > 10.0 && carro_detectado) {
    Serial.println("Vehiculo se alejo, enviando senal de STOP...");
    client.publish(topic, "stop");     // envia mensaje para que la camara se detenga
    carro_detectado = false;
  }

  delay(500);  // espera medio segundo antes de medir otra vez
}
