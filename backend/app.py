from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.request_models import TextRequest
from utils.pdf_reader import extract_text_from_pdf
from utils.ai import summarise_text, explain_term

app = FastAPI(
    title="TechReport Assistant API",
    description="Backend for helping people read and access technical reports.",
    version="0.1.0",
)

# CORS so the React frontend can talk to this API from http://localhost:3000 later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict this later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "TechReport Assistant API running"}


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Accept a PDF file upload, extract text, and return it.
    Frontend will later store/display this.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    pdf_bytes = await file.read()
    try:
        text = extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read PDF: {e}")

    return {"filename": file.filename, "content": text}


@app.post("/summarise")
async def summarise(req: TextRequest):
    """
    Summarise some highlighted text from the frontend.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    summary = summarise_text(req.text)
    return {"summary": summary}


@app.post("/define")
async def define(req: TextRequest):
    """
    Explain a technical term or phrase in simpler language.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    explanation = explain_term(req.text)
    return {"definition": explanation}

