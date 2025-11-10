import 'dotenv/config';
import mqtt from "mqtt";
import axios from "axios";
import FormData from "form-data";
import sharp from "sharp";
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient()
// const client = mqtt.connect('mqtt://10.24.111.223:1883');
const client = mqtt.connect('mqtt:// 192.168.137.1:1883');    
const fs = require('fs');

const entryCamTopic = 'cam/topic';
const exitCamTopic = 'camExit/topic';
const messageTopic = 'message/topic';
const carEntryTopic = "carEntry/topic";
const filledSlotTopic = "filledSlot/topic";
const emptySlotTopic = "emptySlot/topic";

const camRequestMessage = 'capture';
const openEntryMessage = 'open_entry';
const openExitMessage = 'open_exit';


const parkingId = "parking_id";

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

const updateSlotStatus = async (slotId: number, available: boolean) => {
    try {
        await prisma.parkingSlot.update({
            where: { id: slotId },
            data: { available: available },
        });
        console.log(`Slot ${slotId} updated to ${available ? 'available' : 'filled'}`);
    } catch (error) {
        console.error(`Error updating slot ${slotId}:`, error);
    }
}

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe(entryCamTopic, { qos: 1 }, (err) => {
        if(!err) console.log(`Subscribed to ${entryCamTopic}`);
        else console.error("Subscribe error:", err);
    });

    client.subscribe(carEntryTopic, {qos: 1}, (err) => {
        if(!err) console.log(`Subscribed to ${carEntryTopic}`);
        else console.error("Subscribe error:", err);
    });

    const message = 'capture';
    client.publish(messageTopic, message, { qos: 1 }, (err) => {
        if(!err) console.log(`Message published to ${messageTopic}:`, message);
        else console.error("Publish error:", err);
    });
});

client.on('message', async (topic, message) => {
    console.log('Message receive on topic:', topic, 'Message:', message.toString());
    if(topic === entryCamTopic) {
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
                id: true,
                name: true,
            },
        });

        if(user) {
            console.log("User found:", user.name);
            client.publish(messageTopic, openEntryMessage, { qos: 1 }, (err) => {
                if(!err) console.log(`Message published to ${messageTopic}:`, openEntryMessage);
                else console.error("Publish error:", err);
            });
            await prisma.stay.create({
                data: {
                    startHour: new Date(),
                    userId: user.id,
                    parkingId: parkingId,
                }
            });

        } else {
            console.log("No user found with plate number:", result.plate);
        }
    }
    else if(topic === carEntryTopic) {
        const messageStr = message.toString();
        if(messageStr === "detected") {
            console.log("Car entry detected, processing...");
        }
        client.publish(messageTopic, camRequestMessage, { qos: 1 }, (err) => {
            if(!err) console.log(`Message published to ${messageTopic}:`, camRequestMessage);
            else console.error("Publish error:", err);
        });
    }else if(topic === filledSlotTopic) {
        const messageStr = message.toString();
        console.log("Filled slot message received:", messageStr);
        if(messageStr === "1") {
            await updateSlotStatus(1, false);
        }else if(messageStr === "2") {
            await updateSlotStatus(2, false);
        }else if(messageStr === "3") {
            await updateSlotStatus(3, false);
        }
    }else if(topic === emptySlotTopic) {
        const messageStr = message.toString();
        console.log("Empty slot message received:", messageStr);
        if(messageStr === "1") {
            await updateSlotStatus(1, true);
        }else if(messageStr === "2") {
            await updateSlotStatus(2, true);
        }else if(messageStr === "3") {
            await updateSlotStatus(3, true);
        }
    }
});

client.on("error", (err) => {
  console.error("Connection error:", err);
});
