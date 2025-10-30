int LED1 = D0; // No motion
int LED2 = D1; // Startup
int LED3 = D2; // Motion detected
int pir_sensor = D6;

void setup() {
  Serial.begin(9600);

  pinMode(pir_sensor, INPUT);
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);

  // Startup indicator
  digitalWrite(LED3, HIGH);
  Serial.println("Starting up...");
  delay(2000);
  digitalWrite(LED3, LOW);
}

void loop() {
  long state = digitalRead(pir_sensor);

  if (state == HIGH) {
    digitalWrite(LED1, HIGH);   // Motion LED ON
    digitalWrite(LED3, LOW); 
    digitalWrite(LED2, LOW);// No motion LED OFF
    Serial.println("Motion detected!");
    delay(10000);               // 10s hold
  } else {
    digitalWrite(LED3, LOW);
    digitalWrite(LED2, HIGH); 
    digitalWrite(LED1, LOW);// Idle LED ON
    Serial.println("No motion detected");
  }
}
