import 'dotenv/config';
import mqtt from 'mqtt';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

// MQTT configuration (same as back.ts)
const MQTT_URL = process.env.MQTT_URL ?? 'mqtt://192.168.160.1:1883';
const camEntryTopic = 'camEntry/topic';

async function sendImageToEntryCamera(imagePath: string): Promise<void> {
  // Read image file
  const absolutePath = path.resolve(imagePath);
  console.log(`Reading image from: ${absolutePath}`);

  const rawBuffer = await fs.readFile(absolutePath);
  // Flip horizontal before sending
  const flippedBuffer = await sharp(rawBuffer).flop().toBuffer();
  const base64Data = flippedBuffer.toString('base64');

  console.log(`Image size: ${flippedBuffer.length} bytes`);
  console.log(`Base64 length: ${base64Data.length} characters`);

  // Connect to MQTT broker
  const client = mqtt.connect(MQTT_URL);

  return new Promise((resolve, reject) => {
    client.on('connect', () => {
      console.log(`Connected to MQTT broker at ${MQTT_URL}`);

      // Publish image as base64 to entry camera topic
      client.publish(camEntryTopic, base64Data, { qos: 1 }, (err) => {
        if (err) {
          console.error('Publish error:', err);
          client.end();
          reject(err);
        } else {
          console.log(`Image published to topic: ${camEntryTopic}`);
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

// Main: get image path from command line argument
async function main() {
  const imagePath = "img_exit.jpg"; //process.argv[2];

  if (!imagePath) {
    console.error('Usage: npx ts-node sendImg.ts <path-to-image>');
    console.error('Example: npx ts-node sendImg.ts ./images/car.jpg');
    process.exit(1);
  }

  try {
    await sendImageToEntryCamera(imagePath);
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to send image:', err);
    process.exit(1);
  }
}

main();
