from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="MedGuard AI Backend")

# CORS setup for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Medication(BaseModel):
    name: str
    dosage: str
    time: str
    status: str
    icon: str
    frequency: str
    purpose: str
    refill: int

@app.get("/")
def home():
    return {"message": "MedGuard AI API is running!"}

@app.get("/medications", response_model=List[Medication])
def get_medications():
    return [
        {
            "name": "Metformin",
            "dosage": "500mg",
            "time": "8:00 AM",
            "status": "taken",
            "icon": "💊",
            "frequency": "Twice daily",
            "purpose": "Diabetes management",
            "refill": 5
        },
        {
            "name": "Aspirin",
            "dosage": "100mg",
            "time": "2:00 PM",
            "status": "upcoming",
            "icon": "💊",
            "frequency": "Once daily",
            "purpose": "Blood thinner",
            "refill": 12
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
