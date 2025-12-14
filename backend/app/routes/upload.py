from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_parser import PDFParser
from app.config import settings
import os
from datetime import datetime
import uuid
import shutil

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Store reports in memory (use database in production)
reports_store = {}

@router.post("/upload")
async def upload_report(file: UploadFile = File(...)):
    """Upload a PDF report."""
    try:
        # Validate file
        if file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")
        
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files allowed")
        
        # Save file
        file_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
        
        content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(content)
        
        # Extract text
        text = PDFParser.extract_text(file_path)
        pages = PDFParser.extract_text_by_page(file_path)
        
        # Store report metadata
        report_data = {
            "id": file_id,
            "filename": file.filename,
            "file_size": file.size,
            "upload_date": datetime.now().isoformat(),
            "total_pages": len(pages),
            "text": text,
            "pages": pages,
            "file_path": f"/api/pdf/{file_id}"
        }
        reports_store[file_id] = report_data
        
        print(f"✅ Report uploaded: {file.filename} ({file_id})")
        return report_data
    
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/report/{report_id}")
async def get_report(report_id: str):
    """Get report by ID."""
    if report_id not in reports_store:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return reports_store[report_id]

@router.get("/pdf/{file_id}")
async def get_pdf(file_id: str):
    """Get PDF file for viewing."""
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(file_path, media_type="application/pdf")
