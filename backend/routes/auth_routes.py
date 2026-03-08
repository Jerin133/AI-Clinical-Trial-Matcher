from fastapi import APIRouter, HTTPException, status
from models.user_model import User
from database import users_collection
from passlib.context import CryptContext

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password):
    return pwd_context.hash(password)


@router.post("/register")
def register(user: User):
    existing_user = users_collection.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_pwd = hash_password(user.password)
    
    user_dict = user.dict()
    user_dict["password"] = hashed_pwd
    
    users_collection.insert_one(user_dict)

    return {"message": "User registered successfully"}

from utils.auth_utils import create_access_token
from pydantic import BaseModel

class LoginData(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(data: LoginData):

    user = users_collection.find_one({"email": data.email})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user["email"]})
    
    patient_id = None
    if user["role"] == "patient":
        from database import patients_collection
        # Look by specific user_email link first (new way), fallback to generic email (old way)
        patient_doc = patients_collection.find_one({"user_email": data.email})
        if not patient_doc:
            patient_doc = patients_collection.find_one({"email": data.email})
        if patient_doc:
            patient_id = str(patient_doc["_id"])

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Login successful",
        "role": user["role"],
        "patient_id": patient_id
    }