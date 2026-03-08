import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import threading
import hashlib

model = None
_model_lock = threading.Lock()

def get_model():
    global model
    if model is None:
        with _model_lock:
            if model is None:
                print("Loading SentenceTransformer model...")
                model = SentenceTransformer('all-MiniLM-L6-v2')
    return model

from database import feedback_collection, embeddings_collection

def get_embeddings(texts):
    # A fast, intelligent embedding fetcher with persistent MongoDB cache
    embeddings = []
    texts_to_encode = []
    indices_to_encode = []

    # Pre-calculate all hashes
    text_hashes = [hashlib.sha256(text.encode('utf-8')).hexdigest() for text in texts]
    
    # Batch query MongoDB for existing embeddings
    cached_docs = list(embeddings_collection.find({"_id": {"$in": text_hashes}}))
    hash_to_embedding = {doc["_id"]: np.array(doc["embedding"]) for doc in cached_docs}

    for i, text_hash in enumerate(text_hashes):
        if text_hash in hash_to_embedding:
            embeddings.append(hash_to_embedding[text_hash])
        else:
            embeddings.append(None)
            texts_to_encode.append(texts[i])
            indices_to_encode.append((i, text_hash))
            
    # If we found texts that haven't been encoded yet, run the heavy AI model
    if texts_to_encode:
        with _model_lock:
            current_model = get_model()
            new_embeddings = current_model.encode(texts_to_encode).astype(np.float32)
            
        # Save the new embeddings to the permanent MongoDB cache
        docs_to_insert = []
        for (idx, text_hash), emb in zip(indices_to_encode, new_embeddings):
            embeddings[idx] = emb
            docs_to_insert.append({
                "_id": text_hash,
                "embedding": emb.tolist() # Convert numpy array to list for MongoDB
            })
            
        if docs_to_insert:
            try:
                # Use unordered insert to ignore any race-condition duplicate keys silently
                embeddings_collection.insert_many(docs_to_insert, ordered=False)
            except Exception:
                pass # Duplicates already exist in DB from another thread

    return np.array(embeddings)

def batch_calculate_similarities(patient_text, trial_texts, patient_id=None, trial_ids=None):
    patient_embedding = get_embeddings([patient_text])
    trial_embeddings = get_embeddings(trial_texts)

    similarities = cosine_similarity(patient_embedding, trial_embeddings)[0]

    # Fetch all feedback across roles to cumulatively learn
    feedback_signals = {}
    if patient_id and trial_ids:
        all_feedback = list(feedback_collection.find({
            "$or": [
                {"patient_id": str(patient_id), "trial_id": {"$in": [str(t) for t in trial_ids]}},
                {"trial_id": str(patient_id), "patient_id": {"$in": [str(t) for t in trial_ids]}}
            ]
        }))
        for doc in all_feedback:
            p_id = doc.get("patient_id")
            t_id = doc.get("trial_id")
            val = doc.get("feedback", "").lower()
            
            # Identify the trial ID in this relationship
            target_t_id = None
            if p_id == str(patient_id):
                target_t_id = t_id
            elif t_id == str(patient_id):
                target_t_id = p_id
                
            if target_t_id:
                if target_t_id not in feedback_signals:
                    feedback_signals[target_t_id] = 0
                if val == "positive":
                    feedback_signals[target_t_id] += 1
                elif val == "negative":
                    feedback_signals[target_t_id] -= 1

    final_scores = []
    for i, score in enumerate(similarities):
        if patient_id and trial_ids and i < len(trial_ids):
            trial_id = str(trial_ids[i])
            net_signal = feedback_signals.get(trial_id, 0)
            
            # Apply cumulative learning: +5% per positive vote, -5% per negative vote
            score += (net_signal * 0.05)
            
            # Clamp score between 0 and 1
            score = max(0.0, min(1.0, score))
        final_scores.append(float(score))

    return final_scores

def patient_to_text(patient):

    lab_info = " ".join([f"{k}: {v}" for k, v in patient.get("lab_results", {}).items()])
    
    # Check if the patient has an uploaded medical report and extract its text for AI analysis
    report_text = ""
    if "report_id" in patient:
        from database import reports_collection
        from bson import ObjectId
        report_doc = reports_collection.find_one({"_id": ObjectId(patient["report_id"])})
        if report_doc and "raw_text" in report_doc:
            report_text = f"Medical Report Findings: {report_doc['raw_text']}"

    text = f"""
    Age {patient['age']} 
    Gender {patient['gender']}
    Disease {patient['disease']}
    Genetic Marker {patient['genetic_info']}
    Lab Results: {lab_info}
    {report_text}
    """

    return text


def trial_to_text(trial):

    text = f"""
    Trial for {trial['condition']}
    Age between {trial['min_age']} and {trial['max_age']}
    Genetic marker {trial['required_marker']}
    Description {trial['description']}
    """

    return text

def check_age_eligibility(patient, trial):

    try:
        p_age = int(patient.get("age", 0))
        t_min = int(trial.get("min_age", 0))    
        t_max = int(trial.get("max_age", 150))
    except (ValueError, TypeError):
        return True # Default to eligible if data is unparseable

    if p_age < t_min:
        return False

    if p_age > t_max:
        return False

    return True

def check_disease_eligibility(patient, trial):

    p_disease = patient["disease"].lower()
    t_condition = trial["condition"].lower()

    if p_disease in t_condition or t_condition in p_disease:
        return True

    return False