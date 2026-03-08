from pymongo import MongoClient

import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["clinical_trial_db"]

patients_collection = db["patients"]
trials_collection = db["trials"]
feedback_collection = db["feedback"]
users_collection = db["users"]
reports_collection = db["reports"]
applications_collection = db["applications"]
embeddings_collection = db["embeddings"]