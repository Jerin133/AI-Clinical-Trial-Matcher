from fastapi import APIRouter
from models.feedback_model import Feedback
from database import feedback_collection
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/feedback")
def submit_feedback(data: Feedback):

    data_dict = data.dict()
    data_dict["timestamp"] = datetime.utcnow()

    # Create or update feedback using upsert, segregated by role
    feedback_collection.update_one(
        {"patient_id": data.patient_id, "trial_id": data.trial_id, "role": data.role},
        {"$set": data_dict},
        upsert=True
    )

    return {"message": "Feedback recorded/updated successfully"}

@router.get("/feedback/{patient_id}")
def get_feedback(patient_id: str):
    # Only fetch patient feedback for the patient UI
    feedbacks = list(feedback_collection.find({"patient_id": patient_id, "role": "patient"}))
    
    # Format into a simple dictionary for the frontend { trial_id: "up" | "down" }
    results = {}
    for f in feedbacks:
        fb_type = f.get("feedback", "").lower()
        if fb_type == "positive":
            results[f["trial_id"]] = "up"
        elif fb_type == "negative":
            results[f["trial_id"]] = "down"

    return results

@router.get("/feedback/recruiter/{trial_id}")
def get_recruiter_feedback(trial_id: str):
    # Only fetch recruiter feedback for this specific trial, returns mapping of { patient_id: "up"|"down" }
    feedbacks = list(feedback_collection.find({"trial_id": trial_id, "role": "recruiter"}))
    
    results = {}
    for f in feedbacks:
        fb_type = f.get("feedback", "").lower()
        if fb_type == "positive":
            results[f["patient_id"]] = "up"
        elif fb_type == "negative":
            results[f["patient_id"]] = "down"

    return results