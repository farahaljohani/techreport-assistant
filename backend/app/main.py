from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.config import settings
from app.routes import upload, ai_tools

app = FastAPI(
    title="Tech Report Assistant API",
    description="API for reading and understanding technical reports with AI assistance",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(ai_tools.router, prefix="/api", tags=["ai"])

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

@app.get("/")
async def root():
    return {
        "message": "Tech Report Assistant API is running",
        "docs": "/docs",
        "endpoints": {
            "upload": "/api/upload",
            "summarize": "/api/summarize",
            "explain": "/api/explain",
            "ask_question": "/api/ask-question",
            "explain_equation": "/api/explain-equation",
            "convert_units": "/api/convert-units"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "tech-report-assistant-backend"}
