from pydantic import BaseModel
from typing import Optional, List

class ReportMetadata(BaseModel):
    filename: str
    file_size: int
    upload_date: str
    total_pages: Optional[int] = None

class ReportContent(BaseModel):
    id: str
    metadata: ReportMetadata
    text: str
    pages: Optional[List[dict]] = None

class HighlightRequest(BaseModel):
    report_id: str
    highlighted_text: str
    context: Optional[str] = None

class SummaryRequest(BaseModel):
    report_id: str
    text: Optional[str] = None
    max_length: Optional[int] = 200

class QuestionRequest(BaseModel):
    report_id: str
    question: str

class UnitConversionRequest(BaseModel):
    value: float
    from_unit: str
    to_unit: str

class EquationRequest(BaseModel):
    equation: str
    context: Optional[str] = None
