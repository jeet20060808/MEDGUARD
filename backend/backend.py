import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import google.generativeai as genai
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

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

# Database Setup
mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(mongo_uri)
db = client.medguard

# ── Models ──────────────────────────────────────────────
class UserProfile(BaseModel):
    name: str
    email: str
    role: str
    initials: Optional[str] = None
    bloodGroup: Optional[str] = ""
    phone: Optional[str] = ""
    dob: Optional[str] = ""
    conditions: Optional[str] = ""
    allergies: Optional[str] = ""
    streak: Optional[int] = 0

class Patient(BaseModel):
    guardianId: str
    initials: Optional[str] = None
    name: str
    rel: str
    age: int
    adherence: int = 100
    conditions: Optional[str] = ""
    allergies: Optional[str] = ""
    medications: Optional[str] = ""
    emergencyContact: Optional[str] = ""

class Medication(BaseModel):
    userId: str
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
    system: str = "You are MedGuard AI assistant."

# ── NEW ROUTES (Fixes the 404 Errors) ───────────────────

@app.get("/api/patients/{guardianId}")
async def get_patients(guardianId: str):
    # Fetch patients for a specific guardian
    cursor = db.patients.find({"guardianId": guardianId})
    patients = await cursor.to_list(length=100)
    for p in patients:
        p["id"] = str(p.pop("_id"))
    return patients

@app.post("/api/patients")
async def add_patient(patient: Patient):
    # This saves the "Add Patient" input to the 'patients' collection
    patient_dict = patient.model_dump()
    result = await db.patients.insert_one(patient_dict)
    return {"status": "success", "id": str(result.inserted_id)}

@app.delete("/api/patients/{patientId}")
async def delete_patient(patientId: str):
    # Delete a patient by ID
    result = await db.patients.delete_one({"_id": ObjectId(patientId)})
    if result.deleted_count == 1:
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Patient not found")

@app.get("/api/users/{email}")
async def get_user(email: str):
    # Fetch user profile by email
    user = await db.users.find_one({"email": email})
    if user:
        user["id"] = str(user.pop("_id"))
        return user
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/api/users")
async def create_user(user: UserProfile):
    # This saves the login/signup data to the 'users' collection in Compass
    user_dict = user.model_dump()
    result = await db.users.insert_one(user_dict)
    return {"status": "success", "id": str(result.inserted_id)}

@app.put("/api/users/{email}")
async def update_user(email: str, data: dict):
    # Update user profile fields (e.g., streak)
    result = await db.users.update_one(
        {"email": email},
        {"$set": data}
    )
    if result.matched_count == 1:
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="User not found")

@app.post("/api/medications")
async def add_medication(med: Medication):
    # This saves the "Add Med" input to the 'medications' collection
    med_dict = med.model_dump()
    result = await db.medications.insert_one(med_dict)
    return {"status": "success", "id": str(result.inserted_id)}

@app.get("/api/medications/{userId}")
async def get_user_medications(userId: str):
    # Fetch medications for a specific user
    cursor = db.medications.find({"userId": userId})
    medications = await cursor.to_list(length=100)
    for med in medications:
        med["id"] = str(med.pop("_id"))
    return medications

@app.put("/api/medications/{medId}")
async def update_medication(medId: str, data: dict):
    # Update medication status or other fields
    result = await db.medications.update_one(
        {"_id": ObjectId(medId)},
        {"$set": data}
    )
    if result.modified_count == 1:
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Medication not found")

@app.post("/api/logs")
async def save_log(request: Request):
    # This saves the Symptom Logger data to the 'health_logs' collection
    data = await request.json()
    result = await db.health_logs.insert_one(data)
    return {"status": "success", "id": str(result.inserted_id)}

# ── Existing Routes ────────────────────────────────────

@app.get("/")
def home():
    return {"message": "MedGuard AI API is running!"}

@app.post("/api/chat")
async def chat(req: ChatRequest):
    key = os.getenv("GEMINI_API_KEY")
    if not key or key.startswith("sk-abc") or key == "your_gemini_key_here":
        # Fallback to OpenAI if Gemini Key is missing but OpenAI is present
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key and not openai_key.startswith("sk-abc"):
            try:
                from openai import OpenAI
                client = OpenAI(api_key=openai_key)
                messages = [{"role": "system", "content": req.system}]
                for m in req.messages:
                    messages.append({"role": m.role, "content": m.content})
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages
                )
                return {"text": response.choices[0].message.content}
            except Exception as oe:
                raise HTTPException(status_code=500, detail=f"OpenAI error: {str(oe)}")
        
        raise HTTPException(status_code=500, detail="API Key not configured. Please add GEMINI_API_KEY to backend/.env")

    try:
        genai.configure(api_key=key)
        # Switching to gemini-2.5-flash to see if it helps with quota / rate limits
        model = genai.GenerativeModel("gemini-2.5-flash")

        # Build conversation for Gemini
        prompt = req.system + "\n\n"
        for m in req.messages:
            prefix = "User: " if m.role == "user" else "Assistant: "
            prompt += prefix + m.content + "\n"
        prompt += "Assistant: "

        response = await model.generate_content_async(prompt)
        return {"text": response.text}
    except Exception as e:
        if "429" in str(e):
            raise HTTPException(status_code=429, detail="Gemini Rate Limit Exceeded. Please try again in a minute or switch to a paid tier.")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)