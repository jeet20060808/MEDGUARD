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

@app.post("/api/chat")
def chat(req: ChatRequest):
    key = os.getenv("GEMINI_API_KEY")
    if not key or key == "your_gemini_key_here":
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured. Add it to backend/.env")
    try:
        genai.configure(api_key=key)
        # Using gemini-1.5-flash as gemini-2.5-flash does not exist
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Build conversation for Gemini
        prompt = req.system + "\n\n"
        for m in req.messages:
            prefix = "User: " if m.role == "user" else "Assistant: "
            prompt += prefix + m.content + "\n"
        prompt += "Assistant: "

        response = model.generate_content(prompt)
        return {"text": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)