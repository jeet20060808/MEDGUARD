import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

def seed_database():
    # Path to your firebase service account key
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print("Please provide a valid FIREBASE_SERVICE_ACCOUNT path in backend/.env")
        return

    db = firestore.client()
    
    # Sample Medications
    medications = [
        {
            "name": "Metformin",
            "dosage": "500mg",
            "time": "08:00",
            "status": "pending",
            "icon": "💊",
            "frequency": "Once daily",
            "purpose": "Diabetes",
            "refill": 30
        },
        {
            "name": "Amlodipine",
            "dosage": "5mg",
            "time": "20:00",
            "status": "pending",
            "icon": "💊",
            "frequency": "Once daily",
            "purpose": "Hypertension",
            "refill": 15
        },
        {
            "name": "Atorvastatin",
            "dosage": "20mg",
            "time": "21:00",
            "status": "pending",
            "icon": "💊",
            "frequency": "Once daily",
            "purpose": "Cholesterol",
            "refill": 45
        }
    ]
    
    try:
        meds_ref = db.collection("medications")
        # Firestore doesn't have a simple 'delete all' like MongoDB, 
        # but for seeding we can just add them.
        for med in medications:
            meds_ref.add(med)
        print(f"Successfully seeded {len(medications)} medications to Firebase.")
    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_database()
