from pydantic import BaseModel

class Feedback(BaseModel):
    patient_id: str
    trial_id: str
    feedback: str
    role: str = "patient"