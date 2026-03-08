import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import patient_routes, trial_routes, match_routes, feedback_routes, auth_routes, report_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patient_routes.router)
app.include_router(trial_routes.router)
app.include_router(match_routes.router)
app.include_router(feedback_routes.router)
app.include_router(auth_routes.router)
app.include_router(report_routes.router)

@app.get("/")
def root():
    return {"message": "Clinical Trial Matcher Backend Running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)