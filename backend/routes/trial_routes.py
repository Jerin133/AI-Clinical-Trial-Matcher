from fastapi import APIRouter, Depends
from models.trial_model import Trial
from database import trials_collection, patients_collection, applications_collection
from services.matcher_service import batch_calculate_similarities, patient_to_text, trial_to_text, check_age_eligibility
from bson import ObjectId
from utils.auth_utils import get_current_user

from pydantic import BaseModel
import csv
import os
import json

class ApplyRequest(BaseModel):
    patient_id: str

class ApplicationStatusRequest(BaseModel):
    status: str

router = APIRouter()

# Add new clinical trial
@router.post("/create-trial")
def create_trial(trial: Trial, current_user: str = Depends(get_current_user)):

    trial_dict = trial.dict()
    trial_dict["recruiter_email"] = current_user
    
    # Pre-generate a MongoDB Object ID to create the custom CT- trial_id
    new_doc_id = ObjectId()
    t_id = str(new_doc_id)
    new_id = f"CT-{t_id[-5:]}"
    
    # Save the custom ID to the database document
    trial_dict["_id"] = new_doc_id
    trial_dict["trial_id"] = new_id
    
    result = trials_collection.insert_one(trial_dict)

    csv_file = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "clinical_trials_dataset.csv")
    csv_file = os.path.abspath(csv_file)
    
    try:
        with open(csv_file, mode='a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                new_id, 
                trial_dict["trial_name"], 
                trial_dict["min_age"], 
                trial_dict["max_age"], 
                trial_dict["condition"], 
                trial_dict["required_marker"], 
                trial_dict["description"]
            ])
    except Exception as e:
        print(f"Error appending to clinical trials CSV: {e}")

    return {"message": "Trial added successfully", "id": t_id}

@router.get("/recruiter/trials")
def get_recruiter_trials(current_user: str = Depends(get_current_user)):
    trials = list(trials_collection.find({"recruiter_email": current_user}))
    for t in trials:
        t["_id"] = str(t["_id"])
    return trials

@router.get("/recruiter/applicants")
def get_recruiter_applicants(current_user: str = Depends(get_current_user)):
    trials = list(trials_collection.find({"recruiter_email": current_user}))
    if not trials:
        return []
        
    patients = list(patients_collection.find())
    if not patients:
        return []

    all_matches = []
    seen_patients = set()
    
    for trial in trials:
        valid_patients = [p for p in patients if check_age_eligibility(p, trial)]
        if not valid_patients:
            continue

        trial_text = trial_to_text(trial)
        t_id = str(trial["_id"])
        
        patient_texts = [patient_to_text(p) for p in valid_patients]
        patient_ids = [str(p["_id"]) for p in valid_patients]

        scores = batch_calculate_similarities(
            trial_text, 
            patient_texts, 
            patient_id=t_id, 
            trial_ids=patient_ids
        )
        
        for i, score in enumerate(scores):
            # Only consider it a strong AI match if score is above 60%
            if score > 0.60:
                p_id = patient_ids[i]
                
                # We'll only show the best match per patient if they match multiple trials
                if p_id not in seen_patients:
                    matched_patient = valid_patients[i]
                    
                    application = applications_collection.find_one({"trial_id": t_id, "patient_id": p_id})
                    status = application.get("status", "applied") if application else "pending"
                    
                    all_matches.append({
                        "id": f"P-{p_id[-5:]}",
                        "rawId": p_id,
                        "trialId": t_id,
                        "name": matched_patient.get("name", "Unknown"),
                        "age": matched_patient.get("age", 25),
                        "gender": matched_patient.get("gender", "Unknown"),
                        "bloodGroup": matched_patient.get("blood_group", "Unknown"),
                        "condition": matched_patient.get("disease", "Unknown"),
                        "matchScore": round(score * 100, 1),
                        "date": "Just now", # Default display 
                        "status": status,
                        "trialName": trial.get("trial_name", "Clinical Trial")
                    })
                    seen_patients.add(p_id)
                    
    # Sort top matches first
    all_matches.sort(key=lambda x: x["matchScore"], reverse=True)
    return all_matches


@router.get("/recruiter/applied-patients")
def get_applied_patients(current_user: str = Depends(get_current_user)):
    # 1. Get all trials owned by this recruiter
    trials = list(trials_collection.find({"recruiter_email": current_user}))
    if not trials:
        return []
        
    trial_dict = {str(t["_id"]): t for t in trials}
    trial_ids = list(trial_dict.keys())
    
    # 2. Get applications for these trials
    applications = list(applications_collection.find({"trial_id": {"$in": trial_ids}}))
    if not applications:
        return []
        
    # 3. Collect patient details for these applications
    applied_patients = []
    for app in applications:
        p_id = app["patient_id"]
        t_id = app["trial_id"]
        
        patient = patients_collection.find_one({"_id": ObjectId(p_id)})
        trial = trial_dict.get(t_id)
        
        if patient and trial:
            applied_patients.append({
                "id": f"P-{p_id[-5:]}",
                "rawId": p_id,
                "trialId": t_id,
                "name": patient.get("name", "Unknown"),
                "age": patient.get("age", 25),
                "gender": patient.get("gender", "Unknown"),
                "bloodGroup": patient.get("blood_group", "Unknown"),
                "condition": patient.get("disease", "Unknown"),
                "status": app.get("status", "applied"),
                "date": "Recently", # In a real app we'd have a timestamp in applications_collection
                "trialName": trial.get("trial_name", "Clinical Trial")
            })
            
    return applied_patients

@router.put("/recruiter/applicants/{trial_id}/{patient_id}/status")
def update_applicant_status(trial_id: str, patient_id: str, request: ApplicationStatusRequest, current_user: str = Depends(get_current_user)):
    from fastapi import HTTPException
    trial = trials_collection.find_one({"_id": ObjectId(trial_id), "recruiter_email": current_user})
    if not trial:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    applications_collection.update_one(
        {"trial_id": trial_id, "patient_id": patient_id},
        {"$set": {"status": request.status}},
        upsert=True
    )
    return {"message": "Status updated successfully"}

# Get all trials
@router.get("/trials")
def get_trials():

    trials = list(trials_collection.find())
    for t in trials:
        t["_id"] = str(t["_id"])

    return trials

@router.get("/trial/{trial_id}")
def get_trial(trial_id: str):
    from fastapi import HTTPException
    trial = trials_collection.find_one({"_id": ObjectId(trial_id)})
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")
    trial["_id"] = str(trial["_id"])
    return trial

@router.put("/trial/{trial_id}")
def update_trial(trial_id: str, trial_data: Trial, current_user: str = Depends(get_current_user)):
    from fastapi import HTTPException
    update_result = trials_collection.update_one(
        {"_id": ObjectId(trial_id)},
        {"$set": trial_data.dict()}
    )
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Trial not found")
    return {"message": "Trial updated successfully"}

@router.delete("/trial/{trial_id}")
def delete_trial(trial_id: str, current_user: str = Depends(get_current_user)):
    from fastapi import HTTPException
    delete_result = trials_collection.delete_one({"_id": ObjectId(trial_id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Trial not found")
    return {"message": "Trial deleted successfully"}


# Get matched patients for a trial
@router.post("/trial/{trial_id}/apply")
def apply_trial(trial_id: str, request: ApplyRequest):
    from fastapi import HTTPException
    
    trial = trials_collection.find_one({"_id": ObjectId(trial_id)})
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")
        
    patient = patients_collection.find_one({"_id": ObjectId(request.patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    csv_file = os.path.join(os.path.dirname(__file__), "..", "..", "datasets", "patients_dataset.csv")
    csv_file = os.path.abspath(csv_file)
    
    p_id = f"P-{str(patient['_id'])[-5:]}" 
    name = patient.get("name", "Unknown Patient")
    age = patient.get("age", 0)
    gender = patient.get("gender", "Unknown")
    condition = patient.get("disease", "Unknown")
    
    report_text = "None provided"
    if "report_id" in patient:
        from database import reports_collection
        report_doc = reports_collection.find_one({"_id": ObjectId(patient["report_id"])})
        if report_doc and "raw_text" in report_doc:
            report_text = report_doc["raw_text"]
            
    lab_data = patient.get("lab_results", {})
    lab_data["Report"] = report_text
    lab_results = json.dumps(lab_data)
    
    genetic = patient.get("genetic_info", "None")
    
    try:
        with open(csv_file, mode='a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([p_id, name, age, gender, condition, lab_results, genetic])
    except Exception as e:
        print(f"Error appending to CSV: {e}")
        raise HTTPException(status_code=500, detail="Failed to save application")
        
    applications_collection.insert_one({"trial_id": trial_id, "patient_id": request.patient_id})
        
    return {"message": "Successfully applied and data appended to dataset"}

@router.get("/trial/{trial_id}/check-application/{patient_id}")
def check_application(trial_id: str, patient_id: str):
    is_applied = applications_collection.find_one({"trial_id": trial_id, "patient_id": patient_id}) is not None
    return {"applied": is_applied}


@router.get("/trial/{trial_id}/matched-patients")
def matched_patients(trial_id: str):

    trial = trials_collection.find_one({"_id": ObjectId(trial_id)})

    if not trial:
        return {"error": "Trial not found"}

    patients = list(patients_collection.find())
    patients = [p for p in patients if check_age_eligibility(p, trial)]

    if not patients:
        return []

    trial_text = trial_to_text(trial)

    results = []

    patient_texts = []
    patient_ids = []

    for patient in patients:
        patient_texts.append(patient_to_text(patient))
        patient_ids.append(str(patient["_id"]))

    scores = batch_calculate_similarities(
        trial_text, 
        patient_texts, 
        patient_id=str(trial["_id"]), 
        trial_ids=patient_ids
    )

    results = []
    
    for i, patient in enumerate(patients):
        score = scores[i]
        results.append({
            "patient_name": patient["name"],
            "match_score": round(score * 100, 2)
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)

    return results[:5]