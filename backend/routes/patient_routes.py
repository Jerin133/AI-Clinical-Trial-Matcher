from fastapi import APIRouter, Depends, HTTPException
from models.patient_model import Patient
from database import patients_collection
from bson import ObjectId
from utils.auth_utils import get_current_user

router = APIRouter()

@router.post("/add-patient")
def add_patient(patient: Patient, current_user: str = Depends(get_current_user)):
    patient_dict = patient.dict()
    patient_dict["user_email"] = current_user
    insert_result = patients_collection.insert_one(patient_dict)

    return {
        "message": "Patient added successfully",
        "patient_id": str(insert_result.inserted_id)
    }

@router.get("/patient/{patient_id}")
def get_patient(patient_id: str, current_user: str = Depends(get_current_user)):
    patient = patients_collection.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient["_id"] = str(patient["_id"])
    return patient

@router.put("/patient/{patient_id}")
def update_patient(patient_id: str, patient_data: Patient, current_user: str = Depends(get_current_user)):
    update_result = patients_collection.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": patient_data.dict()}
    )
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient updated successfully"}

@router.delete("/patient/{patient_id}")
def delete_patient(patient_id: str, current_user: str = Depends(get_current_user)):
    delete_result = patients_collection.delete_one({"_id": ObjectId(patient_id)})
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": "Patient deleted successfully"}