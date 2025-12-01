import 'dotenv/config';
import mqtt from "mqtt";
import sharp from "sharp";
import { PrismaClient } from "./generated/prisma/client";
import { getTextFromImage, uploadImage } from './utils/utils';
const fs = require('fs');

const prisma = new PrismaClient()
// MQTT client setup
const client = mqtt.connect('mqtt://10.22.231.123:1883');    

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
        // Save image to local storage for verification
        fs.writeFile('received_image.jpg', imageBuffer, (err: Error) => {
            if(err) {
                console.error('Error saving image:', err);
            } else {
                console.log('Image saved as received_image.jpg');
            }
        });
        // Get text from image using text detection service
        const result = await getTextFromImage(imageBuffer);
        console.log("Text detection result:", result);
        // Get user by plate number
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
        // Process entry or exit
        if(user && currentParking) {
            console.log("User found:", user.name); 
            let message: string | null = null;
            if(topic === camEntryTopic){ // Entry processing
                message = openEntryMessage;
                // Create stay record
                const stay = await prisma.stay.create({
                    data: {
                        userId: user.id,
                        startHour: new Date(),
                        parkingId: currentParking?.id,
                    },
                });
                // Upload entry image to Supabase and update stay record
                const imagePath = `uploads/${stay.id}_entry.jpg`;
                await uploadImage(imageBuffer, imagePath);
                await prisma.stay.update({
                    where: { id: stay.id },
                    data: { entryImageUrl: imagePath },
                });
            }else if(topic === camExitTopic) { // Exit processing
                message = openExitMessage;
                // Find latest stay without endHour
                const stay = await prisma.stay.findFirst({
                    where: {
                        userId: user.id,
                        endHour: null,
                    },
                    orderBy: { startHour: 'desc' },
                });
                if(stay) {
                    const imagePath = `uploads/${stay.id}_exit.jpg`;
                    // Update stay record with exit time and image
                    await prisma.stay.update({
                        where: { id: stay.id },
                        data: { 
                            endHour: new Date(),
                            exitImageUrl: imagePath
                         },
                    })
                    // Upload exit image to Supabase
                    await uploadImage(imageBuffer, imagePath);
                };
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
