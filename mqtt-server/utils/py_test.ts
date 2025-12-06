import axios from "axios";
import fs from "fs";
import FormData from "form-data";

async function getTextFromImage(imagePath: string) {
    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));

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

// Example usage
getTextFromImage('images/placa_test2.jpg').then(result => {
    console.log("Text detection result:", result);
});