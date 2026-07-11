from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import your ML pipeline functions
from main import train_baseline_model
from train_dp import train_secure_model
from attack import run_privacy_attack

# Initialize the API
app = FastAPI(
    title="AI Privacy Auditing Engine",
    description="API for training models and executing Membership Inference Attacks.",
    version="1.0.0"
)

# Enable CORS so your future React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "Privacy Engine is online and ready."}

@app.post("/api/train/baseline")
def api_train_baseline():
    """Trains the standard, unsecured neural network."""
    metrics = train_baseline_model()
    return {"status": "success", "data": metrics}

@app.post("/api/train/secure")
def api_train_secure():
    """Trains the Differentially Private (DP) neural network."""
    metrics = train_secure_model()
    return {"status": "success", "data": metrics}

@app.post("/api/audit/attack")
def api_run_attack():
    """Executes the Membership Inference Attack against the saved models."""
    metrics = run_privacy_attack()
    return {"status": "success", "data": metrics}