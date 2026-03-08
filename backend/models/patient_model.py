from pydantic import BaseModel
from typing import Optional

class Patient(BaseModel):
    name: str
    age: int
    gender: str
    disease: str
    lab_results: dict
    genetic_info: str
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    dob: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    blood_group: Optional[str] = None