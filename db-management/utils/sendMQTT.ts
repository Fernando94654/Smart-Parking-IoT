import 'dotenv/config';
import mqtt from 'mqtt';

// MQTT configuration (same as back.ts)
const MQTT_URL = process.env.MQTT_URL ?? 'mqtt://10.22.231.123:1883';

async function publishMessage(topic: string, message: string): Promise<void> {
  const client = mqtt.connect(MQTT_URL);

  return new Promise((resolve, reject) => {
    client.on('connect', () => {
      console.log(`Connected to MQTT broker at ${MQTT_URL}`);

      client.publish(topic, message, { qos: 1 }, (err) => {
        if (err) {
          console.error('Publish error:', err);
          client.end();
          reject(err);
        } else {
          console.log(`Message "${message}" published to topic: ${topic}`);
          client.end();
          resolve();
        }
      });
    });

    client.on('error', (err) => {
      console.error('MQTT connection error:', err);
      reject(err);
    });
  });
}

// Main: get topic and message from command line arguments
async function main() {
  const topic = "message/topic"; 
  const message = "captureEntry";

  if (!topic || !message) {
    console.error('Usage: npx ts-node sendMQTT.ts <topic> <message>');
    console.error('Example: npx ts-node sendMQTT.ts message/topic openEntry');
    process.exit(1);
  }

  try {
    await publishMessage(topic, message);
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to publish message:', err);
    process.exit(1);
  }
}

main();
