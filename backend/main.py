import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime

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
cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT")
if cred_path and os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
else:
    try:
        firebase_admin.initialize_app()
    except ValueError:
        pass

db = firestore.client()

# ── Models ──────────────────────────────────────────────
class Medication(BaseModel):
    id: Optional[str] = None
    name: str
    dosage: str
    time: str
    status: str = "upcoming"
    frequency: str
    purpose: Optional[str] = None
    refillDate: Optional[str] = None
    notes: Optional[str] = None

class Vital(BaseModel):
    id: Optional[str] = None
    date: str
    bp_sys: Optional[str] = None
    bp_dia: Optional[str] = None
    pulse: Optional[str] = None
    temp: Optional[str] = None
    o2: Optional[str] = None
    weight: Optional[str] = None
    glucose: Optional[str] = None

class Appointment(BaseModel):
    id: Optional[str] = None
    doctor: str
    specialty: Optional[str] = None
    type: str
    date: str
    time: str
    location: Optional[str] = None
    notes: Optional[str] = None

class Vaccine(BaseModel):
    id: Optional[str] = None
    name: str
    date: str
    nextDue: Optional[str] = None
    provider: Optional[str] = None

class UserProfile(BaseModel):
    email: str
    name: str
    initials: str
    allergies: Optional[str] = None
    streak: int = 0

class AdherenceEntry(BaseModel):
    date: str
    percentage: int

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

# ── USER PROFILE ENDPOINTS ──────────────────────────────
@app.get("/api/users/{email}/profile", response_model=UserProfile)
async def get_user_profile(email: str):
    try:
        user_ref = db.collection("users").document(email)
        user_doc = user_ref.get()
        if user_doc.exists:
            return user_doc.to_dict()
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users/{email}/profile", response_model=UserProfile)
async def save_user_profile(email: str, profile: UserProfile):
    try:
        user_ref = db.collection("users").document(email)
        user_ref.set(profile.model_dump())
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── MEDICATIONS ENDPOINTS ──────────────────────────────
@app.get("/api/users/{email}/medications", response_model=List[Medication])
async def get_medications(email: str):
    try:
        meds_ref = db.collection("users").document(email).collection("medications")
        docs = meds_ref.stream()
        medications = []
        for doc in docs:
            med = doc.to_dict()
            med["id"] = doc.id
            medications.append(med)
        return medications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users/{email}/medications", response_model=Medication)
async def add_medication(email: str, med: Medication):
    try:
        med_dict = med.model_dump(exclude={"id"})
        new_doc_ref = db.collection("users").document(email).collection("medications").document()
        new_doc_ref.set(med_dict)
        med_dict["id"] = new_doc_ref.id
        return med_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/users/{email}/medications/{med_id}", response_model=Medication)
async def update_medication(email: str, med_id: str, med: Medication):
    try:
        med_dict = med.model_dump(exclude={"id"})
        db.collection("users").document(email).collection("medications").document(med_id).set(med_dict)
        med_dict["id"] = med_id
        return med_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/users/{email}/medications/{med_id}")
async def delete_medication(email: str, med_id: str):
    try:
        db.collection("users").document(email).collection("medications").document(med_id).delete()
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── VITALS ENDPOINTS ──────────────────────────────────
@app.get("/api/users/{email}/vitals", response_model=List[Vital])
async def get_vitals(email: str):
    try:
        vitals_ref = db.collection("users").document(email).collection("vitals")
        docs = vitals_ref.stream()
        vitals = []
        for doc in docs:
            vital = doc.to_dict()
            vital["id"] = doc.id
            vitals.append(vital)
        return vitals
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users/{email}/vitals", response_model=Vital)
async def add_vital(email: str, vital: Vital):
    try:
        vital_dict = vital.model_dump(exclude={"id"})
        new_doc_ref = db.collection("users").document(email).collection("vitals").document()
        new_doc_ref.set(vital_dict)
        vital_dict["id"] = new_doc_ref.id
        return vital_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── APPOINTMENTS ENDPOINTS ──────────────────────────────
@app.get("/api/users/{email}/appointments", response_model=List[Appointment])
async def get_appointments(email: str):
    try:
        appts_ref = db.collection("users").document(email).collection("appointments")
        docs = appts_ref.stream()
        appointments = []
        for doc in docs:
            appt = doc.to_dict()
            appt["id"] = doc.id
            appointments.append(appt)
        return appointments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users/{email}/appointments", response_model=Appointment)
async def add_appointment(email: str, appt: Appointment):
    try:
        appt_dict = appt.model_dump(exclude={"id"})
        new_doc_ref = db.collection("users").document(email).collection("appointments").document()
        new_doc_ref.set(appt_dict)
        appt_dict["id"] = new_doc_ref.id
        return appt_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/users/{email}/appointments/{appt_id}")
async def delete_appointment(email: str, appt_id: str):
    try:
        db.collection("users").document(email).collection("appointments").document(appt_id).delete()
        return {"status": "deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── VACCINES ENDPOINTS ──────────────────────────────────
@app.get("/api/users/{email}/vaccines", response_model=List[Vaccine])
async def get_vaccines(email: str):
    try:
        vaccines_ref = db.collection("users").document(email).collection("vaccines")
        docs = vaccines_ref.stream()
        vaccines = []
        for doc in docs:
            vaccine = doc.to_dict()
            vaccine["id"] = doc.id
            vaccines.append(vaccine)
        return vaccines
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users/{email}/vaccines", response_model=Vaccine)
async def add_vaccine(email: str, vaccine: Vaccine):
    try:
        vaccine_dict = vaccine.model_dump(exclude={"id"})
        new_doc_ref = db.collection("users").document(email).collection("vaccines").document()
        new_doc_ref.set(vaccine_dict)
        vaccine_dict["id"] = new_doc_ref.id
        return vaccine_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── ADHERENCE HISTORY ENDPOINTS ──────────────────────────
@app.get("/api/users/{email}/adherence")
async def get_adherence_history(email: str):
    try:
        adh_ref = db.collection("users").document(email).collection("adherence")
        docs = adh_ref.stream()
        adherence = {}
        for doc in docs:
            adherence[doc.id] = doc.get("percentage", 0)
        return adherence
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/users/{email}/adherence")
async def save_adherence_entry(email: str, entry: AdherenceEntry):
    try:
        db.collection("users").document(email).collection("adherence").document(entry.date).set({
            "percentage": entry.percentage,
            "timestamp": datetime.now()
        })
        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── AI CHAT ENDPOINT ──────────────────────────────────
@app.post("/api/chat")
async def chat(req: ChatRequest):
    groq_key = os.getenv("GROQ_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if not groq_key and not gemini_key:
        raise HTTPException(status_code=500, detail="No AI keys configured.")

    try:
        # Try Groq first for speed
        if groq_key:
            from groq import Groq
            groq_client = Groq(api_key=groq_key)
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

        # Fallback to Gemini
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = req.system + "\n\n" + "\n".join([f"{m.role}: {m.content}" for m in req.messages]) + "\nAssistant: "
        response = model.generate_content(prompt)
        return {"text": response.text}

    except Exception as e:
        print(f"AI ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Our AI is a bit busy. Please try again in a moment!")

# ── SMS ENDPOINT (Fast2SMS) ──────────────────────────────
import requests

FAST2SMS_KEY = os.getenv("FAST2SMS_API_KEY")

class SMSRequest(BaseModel):
    phone: str
    message: str

@app.post("/send-reminder")
async def send_reminder(req: SMSRequest):
    if not FAST2SMS_KEY:
        raise HTTPException(status_code=500, detail="SMS service is not configured.")

    try:
        url = "https://www.fast2sms.com/dev/bulkV2"
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
