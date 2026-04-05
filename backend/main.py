import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

app = FastAPI(title="MedGuard AI Backend")

# CORS setup for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# ── Firebase Setup ──────────────────────────────────────
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
# Path to your firebase service account key
cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT")
if cred_path and os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
else:
    # Fallback/Default initialization (for local dev or if already initialized)
    try:
        firebase_admin.initialize_app()
    except ValueError:
        pass # Already initialized

db = firestore.client()

# ── Models ──────────────────────────────────────────────
class Medication(BaseModel):
    id: str = None
    name: str
    dosage: str
    time: str
    status: str
    icon: str
    frequency: str
    purpose: str
    refill: int

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system: str = "You are MedGuard AI, a friendly health assistant. Help with medication info, drug interactions, and symptom guidance. Be warm, concise (under 120 words), use occasional emojis. End medical responses with: 'Please consult your doctor for personalized advice.'"

# ── Routes ───────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "MedGuard AI API with Firebase is running!"}

@app.get("/medications", response_model=List[Medication])
async def get_medications():
    meds_ref = db.collection("medications")
    docs = meds_ref.stream()
    medications = []
    for doc in docs:
        med = doc.to_dict()
        med["id"] = doc.id
        medications.append(med)
    return medications

@app.post("/medications", response_model=Medication)
async def create_medication(med: Medication):
    med_dict = med.model_dump(exclude={"id"})
    new_doc_ref = db.collection("medications").document()
    new_doc_ref.set(med_dict)
    
    created_med = med_dict
    created_med["id"] = new_doc_ref.id
    return created_med

from groq import Groq

# ── AI Clients ──────────────────────────────────────────
# Try Groq (Instant), Fallback to Gemini
groq_key = os.getenv("GROQ_API_KEY")
gemini_key = os.getenv("GEMINI_API_KEY")

groq_client = Groq(api_key=groq_key) if groq_key else None
if gemini_key:
    genai.configure(api_key=gemini_key)

# ── Models ──────────────────────────────────────────────
# (Medication models remain)

# ── Routes ───────────────────────────────────────────────
# (Home/Medications routes remain)

@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not groq_key and not gemini_key:
        raise HTTPException(status_code=500, detail="No AI keys configured.")

    try:
        # 1. Try Groq for extreme speed
        if groq_client:
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": req.system},
                    *[{"role": m.role, "content": m.content} for m in req.messages]
                ],
                max_tokens=250,
                temperature=0.7,
            )
            return {"text": response.choices[0].message.content}

        # 2. Fallback to Gemini if Groq is not available
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = req.system + "\n\n" + "\n".join([f"{m.role}: {m.content}" for m in req.messages]) + "\nAssistant: "
        response = model.generate_content(prompt)
        return {"text": response.text}

    except Exception as e:
        print(f"AI ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Our AI is a bit busy. Please try again in a moment!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)

import requests

# ── SMS Setup (Fast2SMS) ───────────────────────────────────
FAST2SMS_KEY = os.getenv("FAST2SMS_API_KEY")

class SMSRequest(BaseModel):
    phone: str
    message: str

@app.post("/send-reminder")
async def send_reminder(req: SMSRequest):
    if not FAST2SMS_KEY:
        raise HTTPException(status_code=500, detail="SMS service is not configured.")

    try:
        # Fast2SMS Bulk V2 API
        url = "https://www.fast2sms.com/dev/bulkV2"
        
        # Clean phone number (Fast2SMS expects a comma-separated list of 10-digit numbers)
        # Assuming req.phone might have +91 or other prefixes
        clean_phone = ''.join(filter(str.isdigit, req.phone))
        if clean_phone.startswith('91') and len(clean_phone) > 10:
            clean_phone = clean_phone[2:]
            
        payload = {
            "message": req.message,
            "language": "english",
            "route": "q",
            "numbers": clean_phone
        }
        headers = {
            'authorization': FAST2SMS_KEY,
            'Content-Type': "application/x-www-form-urlencoded",
        }
        
        response = requests.post(url, data=payload, headers=headers)
        res_data = response.json()

        if res_data.get("return"):
            return {"status": "success", "message": "SMS sent successfully", "response": res_data}
        else:
            error_msg = res_data.get("message", ["Unknown error"])[0] if isinstance(res_data.get("message"), list) else res_data.get("message")
            raise Exception(error_msg or "Failed to send SMS via Fast2SMS")
            
    except Exception as e:
        print(f"SMS ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")