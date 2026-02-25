# import os
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List
# from dotenv import load_dotenv
# import google.generativeai as genai

# load_dotenv()

# app = FastAPI(title="MedGuard AI Backend")

# # CORS setup for React
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Configure Gemini
# api_key = os.getenv("GEMINI_API_KEY")
# if api_key:
#     genai.configure(api_key=api_key)

# # ── Database Setup ──────────────────────────────────────
# from motor.motor_asyncio import AsyncIOMotorClient
# from bson import ObjectId

# # MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
# # client = AsyncIOMotorClient(MONGO_URI)
# # db = client.medguard

# client = AsyncIOMotorClient("mongodb://localhost:27017")
# db = client.medguard

# # ── Models ──────────────────────────────────────────────
# class Medication(BaseModel):
#     id: str = None
#     name: str
#     dosage: str
#     time: str
#     status: str
#     icon: str
#     frequency: str
#     purpose: str
#     refill: int

#     model_config = {
#         "populate_by_name": True,
#         "arbitrary_types_allowed": True,
#     }

# class ChatMessage(BaseModel):
#     role: str
#     content: str

# class ChatRequest(BaseModel):
#     messages: List[ChatMessage]
#     system: str = "You are MedGuard AI, a friendly health assistant. Help with medication info, drug interactions, and symptom guidance. Be warm, concise (under 120 words), use occasional emojis. End medical responses with: 'Please consult your doctor for personalized advice.'"

# # ── Routes ───────────────────────────────────────────────
# @app.get("/")
# def home():
#     return {"message": "MedGuard AI API is running!"}

# @app.get("/medications", response_model=List[Medication])
# async def get_medications():
#     medications = await db["medications"].find().to_list(1000)
#     for med in medications:
#         med["id"] = str(med.pop("_id"))
#     return medications

# @app.post("/medications", response_model=Medication)
# async def create_medication(med: Medication):
#     med_dict = med.model_dump(exclude={"id"})
#     new_med = await db["medications"].insert_one(med_dict)
#     created_med = await db["medications"].find_one({"_id": new_med.inserted_id})
#     created_med["id"] = str(created_med.pop("_id"))
#     return created_med

# @app.post("/api/chat")
# def chat(req: ChatRequest):
#     key = os.getenv("GEMINI_API_KEY")
#     if not key or key == "your_gemini_key_here":
#         raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured. Add it to backend/.env")
#     try:
#         genai.configure(api_key=key)
#         model = genai.GenerativeModel("gemini-2.5-flash")

#         # Build conversation for Gemini
#         prompt = req.system + "\n\n"
#         for m in req.messages:
#             prefix = "User: " if m.role == "user" else "Assistant: "
#             prompt += prefix + m.content + "\n"
#         prompt += "Assistant: "

#         response = model.generate_content(prompt)
#         return {"text": response.text}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="127.0.0.1", port=8001)

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

# ── Database Setup ──────────────────────────────────────
# Connecting to your local MongoDB 'medguard' database seen in Compass
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.medguard

# ── Models ──────────────────────────────────────────────
class UserProfile(BaseModel):
    name: str
    email: str
    role: str
    initials: str
    bloodGroup: Optional[str] = ""
    phone: Optional[str] = ""
    dob: Optional[str] = ""
    conditions: Optional[str] = ""
    allergies: Optional[str] = ""
    streak: Optional[int] = 0

class Patient(BaseModel):
    guardianId: str
    initials: str
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
    if not key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY missing")
    try:
        genai.configure(api_key=key)
        # Using 1.5-flash as 2.5 does not exist yet
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = req.system + "\n\n" + "\n".join([f"{m.role}: {m.content}" for m in req.messages])
        response = model.generate_content(prompt)
        return {"text": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)