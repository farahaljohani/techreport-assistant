from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.chatgpt_service import ChatGPTService
from app.services.unit_converter import UnitConverter
from app.services.pdf_parser import PDFParser
from app.models.report import (
    SummaryRequest, HighlightRequest, QuestionRequest, 
    UnitConversionRequest, EquationRequest
)

router = APIRouter()

# Define request model for ask-question
class AskQuestionRequest(BaseModel):
    question: str
    report_text: str = ""

@router.post("/ask-question")
async def ask_question(request: AskQuestionRequest):
    """Ask a question about the report with full document context."""
    try:
        question = request.question
        report_text = request.report_text
        
        if not question or len(question.strip()) == 0:
            raise ValueError("Question is required")
        
        print(f"❓ Answering question: {question[:100]}")
        print(f"📄 Using {len(report_text)} characters of report context")
        
        answer = await ChatGPTService.ask_question(
            question,
            report_text
        )
        
        print(f"✅ Question answered successfully")
        return {"answer": answer}
    except Exception as e:
        print(f"❌ Ask question error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize")
async def summarize(request: SummaryRequest):
    """Summarize report text using ChatGPT."""
    try:
        print(f"Summarize request: text length = {len(request.text) if request.text else 0}")
        
        if not request.text or len(request.text.strip()) == 0:
            raise ValueError("Text is required for summarization")
        
        summary = await ChatGPTService.summarize(
            request.text,
            request.max_length or 200
        )
        print(f"Summary result: {summary[:100]}")
        return {"summary": summary}
    except Exception as e:
        print(f"Summarize error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

@router.post("/explain")
async def explain(request: HighlightRequest):
    """Explain highlighted text using ChatGPT."""
    try:
        print(f"Explain request: text = {request.highlighted_text[:100] if request.highlighted_text else 'None'}")
        
        if not request.highlighted_text or len(request.highlighted_text.strip()) == 0:
            raise ValueError("Highlighted text is required")
        
        explanation = await ChatGPTService.explain(
            request.highlighted_text,
            request.context or ""
        )
        print(f"Explanation result: {explanation[:100]}")
        return {"explanation": explanation}
    except Exception as e:
        print(f"Explain error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Explanation failed: {str(e)}")

@router.post("/explain-equation")
async def explain_equation(request: EquationRequest):
    """Explain an equation."""
    try:
        if not request.equation:
            raise ValueError("Equation is required")
        
        explanation = await ChatGPTService.explain_equation(
            request.equation,
            request.context or ""
        )
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/extract-definitions")
async def extract_definitions(request: dict):
    """Extract definitions from text."""
    try:
        text = request.get("text", "")
        
        if not text or len(text.strip()) == 0:
            raise ValueError("Text is required for definition extraction")
        
        print(f"Extract definitions request: text length = {len(text)}")
        
        result = await ChatGPTService.extract_definitions(text)
        print(f"Definitions result: {result}")
        
        return result
    except Exception as e:
        print(f"Extract definitions error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Definition extraction failed: {str(e)}")

@router.post("/convert-units")
async def convert_units(request: UnitConversionRequest):
    """Convert between units."""
    try:
        result = UnitConverter.convert(
            request.value,
            request.from_unit,
            request.to_unit
        )
        if result is None:
            raise ValueError("Conversion not available")
        
        return {
            "value": request.value,
            "from_unit": request.from_unit,
            "to_unit": request.to_unit,
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversions")
async def get_conversions():
    """Get available unit conversions."""
    return UnitConverter.get_available_conversions()

@router.post("/detect-equations")
async def detect_equations(request: dict):
    """Detect equations from text using improved pattern matching."""
    try:
        text = request.get("text", "")
        
        if not text or len(text.strip()) == 0:
            raise ValueError("Text is required for equation detection")
        
        print(f"🔍 Detecting equations from text ({len(text)} chars)...")
        
        equations = PDFParser.detect_equations(text)
        
        print(f"✅ Found {len(equations)} equations")
        
        return {
            "equations": equations,
            "count": len(equations)
        }
    except Exception as e:
        print(f"❌ Equation detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Equation detection failed: {str(e)}")
