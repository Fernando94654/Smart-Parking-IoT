import mqtt from "mqtt";

const client = mqtt.connect('mqtt://192.168.1.73:1883');
const fs = require('fs');

const camTopic = 'cam/topic';
const messageTopic = 'message/topic';

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

client.on('message', (topic, message) => {
    console.log('Message received on topic:', topic, 'Message:', message.toString());
    if(topic === camTopic) {
        console.log('Image data received:', message);
        const base64Data = message.toString();
        const imageBuffer = Buffer.from(base64Data, 'base64');

        fs.writeFile('received_image.jpg', imageBuffer, (err: Error) => {
            if(err) {
                console.error('Error saving image:', err);
            } else {
                console.log('Image saved as received_image.jpg');
            }
        });
    }
});

client.on("error", (err) => {
  console.error("Connection error:", err);
});
