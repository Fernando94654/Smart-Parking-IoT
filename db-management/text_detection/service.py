# from fastapi import FastAPI, File, UploadFile
# import numpy as np
# import cv2
# import easyocr


# app = FastAPI()
# reader = easyocr.Reader(['en', 'es'])

# @app.post("/text-detection")

# async def process(file: UploadFile = File(...)):
#     content = await file.read()
#     nparr = np.frombuffer(content, np.uint8)
#     img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#     result = reader.readtext(img)
#     center_text = None
#     center_bbox = None

#     if len(result) == 0:
#         print("No text detected")
#         return {"result": ""}
#     else:
#         img_center_x = img.shape[1] / 2
#         # Find the text with most central position
#         for (bbox, text, prob) in result:
#             print(f"Detected text: {text} with confidence {prob}")
#             (tl, tr, br, bl) = bbox
#             cX = int((tl[0] + br[0]) / 2.0)
#             if center_text is None:
#                 center_text = text
#                 center_bbox = bbox
#             elif abs(img_center_x - cX) < abs(img_center_x - int((center_bbox[0][0] + center_bbox[2][0]) / 2.0)):
#                 center_text = text
#                 center_bbox = bbox
            
#     return {"result": center_text}


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
