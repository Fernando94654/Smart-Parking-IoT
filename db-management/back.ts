import 'dotenv/config';
import mqtt from "mqtt";
import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";
import { PrismaClient } from "./generated/prisma/client";
import { User } from "./generated/prisma/browser";

const prisma = new PrismaClient()
// const client = mqtt.connect('mqtt://10.24.111.223:1883');
const client = mqtt.connect('mqtt://192.168.1.69:1883');
const fs = require('fs');

const camTopic = 'cam/topic';
const messageTopic = 'message/topic';

async function getTextFromImage(buffer: Buffer) {
    const form = new FormData();
    form.append("file", buffer, { filename: "image.jpg", contentType: "image/jpeg" });

    try {
        const response = await axios.post("http://localhost:8001/text-detection", form, {
            headers: form.getHeaders()
        });
        return response.data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error calling text detection service:", err.message);
        }
    }
}

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe(camTopic, { qos: 1 }, (err) => {
        if(!err) console.log(`Subscribed to ${camTopic}`);
        else console.error("Subscribe error:", err);
    });

    const message = 'capture';
    client.publish(messageTopic, message, { qos: 1 }, (err) => {
        if(!err) console.log(`Message published to ${messageTopic}:`, message);
        else console.error("Publish error:", err);
    });
});

client.on('message', async (topic, message) => {
    console.log('Message received on topic:', topic, 'Message:', message.toString());
    if(topic === camTopic) {
        console.log('Image data received:', message);
        const base64Data = message.toString();
        const unFlipImageBuffer = Buffer.from(base64Data, 'base64');
        const imageBuffer = await sharp(unFlipImageBuffer).flip().toBuffer();

        fs.writeFile('received_image.jpg', imageBuffer, (err: Error) => {
            if(err) {
                console.error('Error saving image:', err);
            } else {
                console.log('Image saved as received_image.jpg');
            }
        });
        // Example usage
        const result = await getTextFromImage(imageBuffer);
        console.log("Text detection result:", result);

        const user = await prisma.user.findFirst({
            where: { plateNumber: result.plate ?? "" },  
            select: {
                name: true,
            },
        });

        if(user) {
            console.log("User found:", user.name);
        } else {
            console.log("No user found with plate number:", result.plate);
        }
    }
});

client.on("error", (err) => {
  console.error("Connection error:", err);
});
