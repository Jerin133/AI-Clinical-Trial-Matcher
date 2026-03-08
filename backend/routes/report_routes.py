from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from fastapi.responses import Response
from database import reports_collection, patients_collection
from bson import ObjectId
from utils.auth_utils import get_current_user
import PyPDF2
import io

router = APIRouter()

@router.post("/upload-report/{patient_id}")
async def upload_report(patient_id: str, file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Read the file bytes
    contents = await file.read()
    
    # Extract text based on file type
    extracted_text = ""
    filename = file.filename
    
    try:
        if filename.lower().endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
            for page in pdf_reader.pages:
                extracted_text += page.extract_text() + "\n"
        elif filename.lower().endswith('.txt'):
            extracted_text = contents.decode('utf-8')
        else:
            # Fallback for images or unsupported - we'll just register the name for now
            # In a full production app, we'd run OCR (like Tesseract) here
            extracted_text = f"[Document uploaded but content not parsed. Filename: {filename}]"
            
    except Exception as e:
        print(f"Error parsing document: {str(e)}")
        extracted_text = f"[Error parsing document. Filename: {filename}]"

    # Store the report in the database
    report_data = {
        "patient_id": patient_id,
        "filename": filename,
        "content_type": file.content_type,
        "raw_text": extracted_text,
        "file_data": contents  # Storing file binary directly in MongoDB for demo purposes
    }
    
    insert_result = reports_collection.insert_one(report_data)
    report_id = str(insert_result.inserted_id)
    
    # Link the report to the patient profile
    patients_collection.update_one(
        {"_id": ObjectId(patient_id)},
        {"$set": {"report_id": report_id, "report_name": filename}}
    )
    
    return {
        "message": "Report uploaded and analyzed successfully",
        "report_id": report_id,
        "filename": filename
    }

@router.get("/report/{report_id}")
async def get_report(report_id: str):
    report = reports_collection.find_one({"_id": ObjectId(report_id)})
    
    if not report or "file_data" not in report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return Response(content=report["file_data"], media_type=report.get("content_type", "application/octet-stream"))
