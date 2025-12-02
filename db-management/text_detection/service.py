# API endpoint for text detection using Plate Recognizer
from fastapi import FastAPI, File, UploadFile, HTTPException
import aiohttp
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()
PLATE_RECOGNIZER_TOKEN = os.getenv("PR_TOKEN")

@app.post("/text-detection")
async def process(file: UploadFile = File(...)):
    content = await file.read()
    url = "https://api.platerecognizer.com/v1/plate-reader/"
    data = aiohttp.FormData()
    data.add_field("upload", content, filename=file.filename, content_type=file.content_type)
    data.add_field("regions", "mx") 

    headers = {
        "Authorization": f"Token {PLATE_RECOGNIZER_TOKEN}"
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, data=data, headers=headers) as resp:
            if resp.status != 201:
                text = await resp.text()
                raise HTTPException(status_code=resp.status, detail=f"Plate API error: {text}")
            result_json = await resp.json()
            result = result_json.get("results", [])
            if not result:
                print("No plate detected")
                return {"result": ""}
            plate = result[0].get("plate")

            print("Response received from Plate Recognizer API")
            print(f"Detected plate: {plate}")
            return {"plate": plate}
