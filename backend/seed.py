import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["clinical_trial_db"]

patients_collection = db["patients"]
trials_collection = db["trials"]

print("Clearing old dummy data...")
patients_collection.delete_many({})
trials_collection.delete_many({})

realistic_patients = [
    {
        "name": "Sarah Jenkins",
        "age": 42,
        "gender": "Female",
        "disease": "Asthma",
        "lab_results": {"FEV1": 65, "IgE": 120},
        "genetic_info": "Normal"
    },
    {
        "name": "Michael Chen",
        "age": 55,
        "gender": "Male",
        "disease": "Type 2 Diabetes",
        "lab_results": {"HbA1c": 8.4, "FastingGlucose": 145},
        "genetic_info": "Normal"
    },
    {
        "name": "Elena Rodriguez",
        "age": 63,
        "gender": "Female",
        "disease": "Non-small cell lung cancer",
        "lab_results": {"WBC": 4.5},
        "genetic_info": "EGFR Positive"
    },
    {
        "name": "Marcus Johnson",
        "age": 31,
        "gender": "Male",
        "disease": "Crohn's Disease",
        "lab_results": {"CRP": 15.2, "ESR": 28},
        "genetic_info": "NOD2 Variant"
    },
    {
        "name": "Robert Smith",
        "age": 71,
        "gender": "Male",
        "disease": "Heart Failure",
        "lab_results": {"BNP": 450, "Creatinine": 1.4},
        "genetic_info": "Normal"
    }
]

realistic_trials = [
    {
        "trial_name": "Targeted Therapy for EGFR+ NSCLC",
        "min_age": 18,
        "max_age": 75,
        "condition": "Non-small cell lung cancer",
        "required_marker": "EGFR Positive",
        "description": "Phase 3 clinical trial evaluating the efficacy of a novel oral ALK/EGFR inhibitor compared to standard chemotherapy protocols."
    },
    {
        "trial_name": "Inhaled Corticosteroid Formulation T-92",
        "min_age": 12,
        "max_age": 65,
        "condition": "Asthma",
        "required_marker": "None",
        "description": "A 24-week study assessing airway inflammation reduction in patients with moderate to severe persistent asthma."
    },
    {
        "trial_name": "GLP-1 Agonist V2 for Glycemic Control",
        "min_age": 25,
        "max_age": 70,
        "condition": "Type 2 Diabetes",
        "required_marker": "None",
        "description": "Longitudinal evaluation of a new once-weekly GLP-1 receptor agonist emphasizing cardiovascular outcomes and metabolic control."
    },
    {
        "trial_name": "Monoclonal Antibody therapy for IBD",
        "min_age": 18,
        "max_age": 60,
        "condition": "Crohn's Disease",
        "required_marker": "NOD2 Variant",
        "description": "Phase 2 trial testing an intravenous monoclonal antibody prioritizing mucosal healing for patients unresponsive to conventional therapies."
    },
    {
        "trial_name": "Beta-blocker Matrix Patch trial",
        "min_age": 50,
        "max_age": 85,
        "condition": "Heart Failure",
        "required_marker": "None",
        "description": "Investigating a transdermal extended-release patch designed to improve patient compliance and stabilize ejection fractions."
    }
]

print("Inserting realistic patients...")
patients_collection.insert_many(realistic_patients)

print("Inserting realistic trials...")
trials_collection.insert_many(realistic_trials)

print("Database seeding successfully completed!")
