import pytest
from fastapi.testclient import TestClient
from main import app
from database import users_collection, patients_collection, trials_collection, feedback_collection
from bson import ObjectId
import json
import os

client = TestClient(app)

# --- Teardown & Setup ---
@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup: clean specific test collections if needed or use mock
    users_collection.delete_many({"email": "test@example.com"})
    users_collection.delete_many({"email": "test_auth@example.com"})
    patients_collection.delete_many({"name": "Test Patient"})
    trials_collection.delete_many({"trial_name": "Test Trial"})
    feedback_collection.delete_many({"patient_id": "test_pid", "trial_id": "test_tid"})
    yield
    # Teardown
    users_collection.delete_many({"email": "test@example.com"})
    users_collection.delete_many({"email": "test_auth@example.com"})
    patients_collection.delete_many({"name": "Test Patient"})
    trials_collection.delete_many({"trial_name": "Test Trial"})
    feedback_collection.delete_many({"patient_id": "test_pid", "trial_id": "test_tid"})

# --- Helper to get headers ---
def get_auth_headers():
    client.post("/register", json={
        "name": "Auth User", "email": "test_auth@example.com", "password": "password123", "role": "admin"
    })
    response = client.post("/login", json={"email": "test_auth@example.com", "password": "password123"})
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

# --- Tests ---

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Clinical Trial Matcher Backend Running"}

def test_register_and_login():
    # Register
    res_reg = client.post("/register", json={
        "name": "Test User", "email": "test@example.com", "password": "password123", "role": "patient"
    })
    assert res_reg.status_code == 200
    assert "successfully" in res_reg.json()["message"]

    # Login
    res_login = client.post("/login", json={
        "email": "test@example.com", "password": "password123"
    })
    assert res_login.status_code == 200
    assert "access_token" in res_login.json()
    assert res_login.json()["token_type"] == "bearer"

def test_patient_crud():
    headers = get_auth_headers()
    
    # 1. Add Patient
    patient_data = {
        "name": "Test Patient",
        "age": 45,
        "gender": "Female",
        "disease": "Diabetes",
        "lab_results": {"HbA1c": 7.2},
        "genetic_info": "None"
    }
    res_add = client.post("/add-patient", json=patient_data, headers=headers)
    assert res_add.status_code == 200

    # Get patient ID
    patient_in_db = patients_collection.find_one({"name": "Test Patient"})
    pid = str(patient_in_db["_id"])

    # 2. Get Patient
    res_get = client.get(f"/patient/{pid}", headers=headers)
    assert res_get.status_code == 200
    assert res_get.json()["name"] == "Test Patient"

def test_trial_crud():
    headers = get_auth_headers()
    
    # 1. Add Trial
    trial_data = {
        "trial_name": "Test Trial",
        "min_age": 18,
        "max_age": 60,
        "condition": "Diabetes",
        "required_marker": "None",
        "description": "A new diabetes study."
    }
    res_add = client.post("/create-trial", json=trial_data, headers=headers)
    assert res_add.status_code == 200

    trial_in_db = trials_collection.find_one({"trial_name": "Test Trial"})
    tid = str(trial_in_db["_id"])

    # 2. Get Trial (Public endpoint but let's test it)
    res_get = client.get(f"/trial/{tid}")
    assert res_get.status_code == 200

def test_matcher_service_lab_results():
    from services.matcher_service import patient_to_text
    patient = {
        "age": 30, "gender": "Male", "disease": "Cancer", "genetic_info": "BRCA1", 
        "lab_results": {"WBC": 5.0, "Hemoglobin": 14.2}
    }
    text = patient_to_text(patient)
    assert "WBC: 5.0" in text
    assert "Hemoglobin: 14.2" in text

def test_feedback_loop():
    from services.matcher_service import calculate_similarity
    feedback_collection.insert_one({"patient_id": "test_pid", "trial_id": "test_tid", "feedback": "positive"})
    
    # We test the score adjustment
    text_p = "Cancer test text."
    text_t = "Cancer trial text."
    
    score_normal = calculate_similarity(text_p, text_t)
    score_boosted = calculate_similarity(text_p, text_t, patient_id="test_pid", trial_id="test_tid")
    
    assert score_boosted > score_normal
