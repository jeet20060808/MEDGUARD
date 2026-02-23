from fastapi import FastAPI
from supabase import create_client, Client
from pydantic import BaseModel

# 1. Put your Supabase keys here (Keep the quotes!)
SUPABASE_URL = "https://vmamrwtqfeavmhraimln.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtYW1yd3RxZmVhdm1ocmFpbWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0ODU4NDMsImV4cCI6MjA4NzA2MTg0M30.2ac4YqNWoffxTSVlfPuuQxmmKbuLGYIOrVoIqOLjrD0"

# 2. Connect to the database
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

# 3. Create a rule for what patient data should look like
class Patient(BaseModel):
    name: str
    age: int

@app.get("/")
def read_root():
    return {"Message": "MedGuard AI Database Connected!"}

# 4. The magic command to save a patient to Supabase
@app.post("/add-patient")
def add_patient(patient: Patient):
    # This takes the patient data and inserts it into your 'patients' table
    data = {"name": patient.name, "age": patient.age}
    response = supabase.table("patients").insert(data).execute()
    
    return {"status": "success", "saved_patient": response.data}

    # 5. The command to fetch all patients from Supabase
@app.get("/get-patients")
def get_all_patients():
    # This asks Supabase to select everything ("*") from the patients table
    response = supabase.table("patients").select("*").execute()
    
    return {"status": "success", "patients_list": response.data}

    # Add this right below your Patient class
class Medicine(BaseModel):
    name: str
    dosage: str
    schedule: str
    patient_id: int

# Add this at the very bottom of your file
@app.post("/add-medicine")
def add_medicine(medicine: Medicine):
    # This packages the medicine data and the patient_id together
    data = {
        "name": medicine.name,
        "dosage": medicine.dosage,
        "schedule": medicine.schedule,
        "patient_id": medicine.patient_id
    }
    
    # This inserts it into your new 'medicines' table
    response = supabase.table("medicines").insert(data).execute()
    
    return {"status": "success", "saved_medicine": response.data}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# VERY IMPORTANT (CORS fix)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/hello")
def hello():
    return {"message": "Backend connected successfully 🚀"}