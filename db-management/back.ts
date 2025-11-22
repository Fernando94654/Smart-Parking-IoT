import 'dotenv/config';
import mqtt from "mqtt";
import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient()

const client = mqtt.connect('mqtt://10.22.231.123:1883');    
const fs = require('fs');

const camEntryTopic = 'camEntry/topic';
const camExitTopic = 'camExit/topic';
const messageTopic = 'message/topic';
const openEntryMessage = 'openEntry';
const openExitMessage = 'openExit';
const ultrasonic1Topic = 'ultrasonic1/topic';
const ultrasonic2Topic = 'ultrasonic2/topic';
const ultrasonic3Topic = 'ultrasonic3/topic';

const ultrasonicMap: Record<string, number> = {
    [ultrasonic1Topic]: 1,
    [ultrasonic2Topic]: 2,
    [ultrasonic3Topic]: 3,
}

// const camMap: Record<string, 

async function updateUltrasonic(topic: string, message: string) {
    const slotId = ultrasonicMap[topic];
    if(!slotId) return;
    const isOccupied = message === 'occupied';
    await prisma.parkingSlot.update({
        where: { id: slotId },
        data: { available: !isOccupied }
    });
}
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

client.on('message', async (topic, message) => {
    console.log('Message received on topic:', topic, 'Message:', message.toString());
    if(topic === camEntryTopic || topic === camExitTopic) {
        console.log('Image data received:', message);
        const base64Data = message.toString();
        const unFlipImageBuffer = Buffer.from(base64Data, 'base64');
        const imageBuffer = await sharp(unFlipImageBuffer).flop().toBuffer();

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
        let user;
        if(result) {
            user = await prisma.user.findFirst({
                where: { plateNumber: result.plate ?? "" },
                select: {
                    name: true,
                    id: true,
                },
            });
        }else {
            user = null;
        }
        const currentParking = await prisma.parking.findFirst({
            where: { name: "Central Park"}
        });
        if(user && currentParking) {
            console.log("User found:", user.name); 
            let message: string | null = null;
            if(topic === camEntryTopic){
                message = openEntryMessage;
                await prisma.stay.create({
                    data: {
                        userId: user.id,
                        startHour: new Date(),
                        parkingId: currentParking?.id,
                    },
                });
            }else if(topic === camExitTopic) {
                message = openExitMessage;
                const stay = await prisma.stay.findFirst({
                    where: {
                        userId: user.id,
                        endHour: null,
                    },
                    orderBy: { startHour: 'desc' },
                });
                if(stay) {
                    await prisma.stay.update({
                        where: { id: stay.id },
                        data: { endHour: new Date() },
                    })
                };
            }
            if(message){
                client.publish(messageTopic, message, { qos: 1 }, (err) => {
                    if(!err) console.log(`Message published to ${messageTopic}:`, message);
                    else console.error("Publish error:", err);
                });
            }
        } else {
            console.log("No user found with plate number:", result.plate);
        }
    }else if(topic in ultrasonicMap) {
        await updateUltrasonic(topic, message.toString());
    }
});

client.on("error", (err) => {
  console.error("Connection error:", err);
});
