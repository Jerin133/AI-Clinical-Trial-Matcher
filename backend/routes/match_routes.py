from fastapi import APIRouter
from database import patients_collection, trials_collection
from services.matcher_service import batch_calculate_similarities, patient_to_text, trial_to_text, check_age_eligibility, check_disease_eligibility
from bson import ObjectId

router = APIRouter()

@router.get("/match-trials/{patient_id}")
def match_trials(patient_id: str):

    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})

    if not patient:
        return {"error": "Patient not found"}

    trials = list(trials_collection.find())

    trials = [trial for trial in trials if check_age_eligibility(patient, trial)]

    if not trials:
        return []

    patient_text = patient_to_text(patient)

    trial_texts = [trial_to_text(trial) for trial in trials]
    trial_ids = [str(trial["_id"]) for trial in trials]

    scores = batch_calculate_similarities(
        patient_text, 
        trial_texts, 
        patient_id=str(patient["_id"]), 
        trial_ids=trial_ids
    )

    results = []
    
    for i, trial in enumerate(trials):
        score = scores[i]
        results.append({
            "_id": str(trial["_id"]),
            "trial_name": trial["trial_name"],
            "description": trial.get("description", ""),
            "location": trial.get("location", "None"),
            "match_score": round(score * 100, 2),
            "status": "High Match" if score > 0.75 else "Possible Match",
            "report_id": patient.get("report_id", ""),
            "report_name": patient.get("report_name", ""),
            "condition": trial.get("condition", ""),
            "min_age": trial.get("min_age", 0),
            "max_age": trial.get("max_age", 100)
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)

    return results[:5]