#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Servo.h>  // librería para controlar el servo

// configuracion wifi
const char* ssid = "Fernando";           // red wifi del proyecto
const char* password = "RoBorregos2025"; // contrasena del wifi

// configuracion mqtt
const char* mqtt_server = "10.22.235.163";  // ip del broker mqtt
const int mqtt_port = 1883;
const char* topic = "message/topic";       // topico donde se envian y reciben mensajes

WiFiClient espClient;
PubSubClient client(espClient);

// pines del sensor hc-sr04
#define PIN_TRIG  15
#define PIN_ECHO  13

// pin del servo
#define SERVO_PIN 14

Servo servoMotor;
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

// funcion callback que se ejecuta cuando llega un mensaje mqtt
void callback(char* topic, byte* payload, unsigned int length) {
  String mensaje = "";
  for (unsigned int i = 0; i < length; i++) {
    mensaje += (char)payload[i];
  }

  Serial.print("Mensaje recibido: ");
  Serial.println(mensaje);

  // si el mensaje recibido es "open_entry"
  if (mensaje == "open_entry") {
    Serial.println("Recibido comando OPEN_ENTRY, levantando pluma...");
    servoMotor.write(180);   // levanta el servo a 90 grados
    delay(10000);           // espera 10 segundos
    servoMotor.write(0);    // baja el servo a 0 grados
    Serial.println("Pluma cerrada.");
  }
}

// funcion para reconectar al broker mqtt si se pierde la conexion
void reconnect() {
  while (!client.connected()) {
    Serial.print("Conectando a MQTT...");
    if (client.connect("SensorESP8266")) {
      Serial.println("Conectado al broker MQTT");
      client.subscribe(topic);  // se suscribe al mismo topico
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

  servoMotor.attach(SERVO_PIN);
  servoMotor.write(0);  // inicia con la pluma abajo

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);  // define la funcion callback
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
  if (d < 10.0 && !carro_detectado) {
    Serial.println("Vehiculo detectado, enviando senal de CAPTURE...");
    client.publish(topic, "capture");  // envia mensaje para que la camara capture
    carro_detectado = true;
  }

  // si el carro se aleja, se envia senal de stop
  if (d > 15.0 && carro_detectado) {
    Serial.println("Vehiculo se alejo, enviando senal de STOP...");
    client.publish(topic, "stop");     // envia mensaje para que la camara se detenga
    carro_detectado = false;
  }

  delay(500);  // espera medio segundo antes de medir otra vez
}
