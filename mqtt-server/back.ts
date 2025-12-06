import 'dotenv/config';
import mqtt from 'mqtt';
import sharp from 'sharp';
import { Pool } from 'pg';
import { getTextFromImage, uploadImage } from './utils/utils';
import fs from 'fs/promises';
import crypto from 'crypto';

// Database pool using DATABASE_URL from .env (Neon)
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('Missing DATABASE_URL in environment');
const pool = new Pool({ connectionString: DATABASE_URL });

// MQTT client setup
const MQTT_URL = process.env.MQTT_URL ?? 'mqtt://10.22.231.123:1883';
const client = mqtt.connect(MQTT_URL);

const camEntryTopic = 'camEntry/topic';
const camExitTopic = 'camExit/topic';
const messageTopic = 'message/topic';
const openEntryMessage = 'openEntry';
const openExitMessage = 'openExit';
// MQTT subscription to camera topics
client.on('connect', async () => {
    console.log('Connected to MQTT broker');
    client.subscribe(camEntryTopic, { qos: 1 }, (err) => { 
        if(!err) console.log(`Subscribed to ${camEntryTopic}`);
        else console.error("Subscribe error:", err);
    });
    client.subscribe(camExitTopic, { qos: 1 }, (err) => { 
        if(!err) console.log(`Subscribed to ${camExitTopic}`);
        else console.error("Subscribe error:", err);
    });
});
// Handle messages from subscribed topics
client.on('message', async (topic, message) => {
    console.log('Message received on topic:', topic, 'Message:', message.toString());
    if(topic === camEntryTopic || topic === camExitTopic) {
        console.log('Image data received:', message);
        const base64Data = message.toString();
        const unFlipImageBuffer = Buffer.from(base64Data, 'base64');
        const imageBuffer = await sharp(unFlipImageBuffer).flop().toBuffer();
        // Save image to local storage for verification (non-blocking)
        (async () => {
            try {
                await fs.writeFile('received_image.jpg', imageBuffer);
                console.log('Image saved as received_image.jpg');
            } catch (err) {
                console.error('Error saving image:', err);
            }
        })();
        // Get text from image using text detection service
        const result = await getTextFromImage(imageBuffer);
        console.log("Text detection result:", result);
        // Get user by plate number 
        let user = null;
        if (result && result.plate) {
            const plate = result.plate;
            const userRes = await pool.query(
                'SELECT "id", "name" FROM "User" WHERE "plateNumber" = $1 LIMIT 1',
                [plate],
            );
            user = userRes.rows[0] ?? null;
        }

        // Get parking by name
        const parkingRes = await pool.query('SELECT "id" FROM "Parking" WHERE "name" = $1 LIMIT 1', [
            'Central Park',
        ]);
        const currentParking = parkingRes.rows[0] ?? null;
        // Process entry or exit
        if(user && currentParking) {
            console.log("User found:", user.name); 
            let message: string | null = null;
            if(topic === camEntryTopic){ // Entry processing
                message = openEntryMessage;
                // Create stay record (generate id)
                const stayId = crypto.randomUUID();
                const startHour = new Date();
                await pool.query(
                  'INSERT INTO "Stay" ("id", "startHour", "userId", "parkingId") VALUES ($1, $2, $3, $4)',
                  [stayId, startHour, user.id, currentParking.id],
                );
                // Upload entry image to Supabase and update stay record
                const imagePath = `uploads/${stayId}_entry.jpg`;
                await uploadImage(imageBuffer, imagePath);
                await pool.query('UPDATE "Stay" SET "entryImageUrl" = $1 WHERE "id" = $2', [imagePath, stayId]);
            }else if(topic === camExitTopic) { // Exit processing
                message = openExitMessage;
                // Find latest stay without endHour
                const stayRes = await pool.query(
                  'SELECT "id" FROM "Stay" WHERE "userId" = $1 AND "endHour" IS NULL ORDER BY "startHour" DESC LIMIT 1',
                  [user.id],
                );
                const stay = stayRes.rows[0] ?? null;
                if (stay) {
                  const imagePath = `uploads/${stay.id}_exit.jpg`;
                  // Update stay record with exit time and image
                  await pool.query('UPDATE "Stay" SET "endHour" = $1, "exitImageUrl" = $2 WHERE "id" = $3', [
                    new Date(),
                    imagePath,
                    stay.id,
                  ]);
                  // Upload exit image to Supabase
                  await uploadImage(imageBuffer, imagePath);
                }
            }
            // Publish message to open gates
            if(message){
                client.publish(messageTopic, message, { qos: 1 }, (err) => {
                    if(!err) console.log(`Message published to ${messageTopic}:`, message);
                    else console.error("Publish error:", err);
                });
            }
        } else {
            console.log("No user found with plate number:", result.plate);
        }
    }
});

client.on("error", (err) => {
  console.error("Connection error:", err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down...');
    try {
        await pool.end();
        client.end(true);
    } catch (e) {
        console.error('Error during shutdown:', e);
    } finally {
        process.exit(0);
    }
});
