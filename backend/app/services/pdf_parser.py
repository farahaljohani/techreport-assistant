import PyPDF2
import re
from typing import List, Dict

class PDFParser:
    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extract text from PDF file."""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise Exception(f"Error parsing PDF: {str(e)}")

    @staticmethod
    def extract_text_by_page(file_path: str) -> list:
        """Extract text page by page."""
        try:
            pages = []
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for i, page in enumerate(pdf_reader.pages):
                    pages.append({
                        "page_number": i + 1,
                        "text": page.extract_text()
                    })
            return pages
        except Exception as e:
            raise Exception(f"Error parsing PDF: {str(e)}")
    
    @staticmethod
    def detect_equations(text: str) -> List[Dict]:
        """Detect mathematical equations from text with improved patterns."""
        equations = []
        equation_id = 0
        
        # Pattern 1: LaTeX inline math: $...$
        latex_inline = re.finditer(r'\$([^\$]+)\$', text)
        for match in latex_inline:
            eq_text = match.group(1).strip()
            if len(eq_text) > 2:  # Avoid short matches like $x$
                equations.append({
                    'id': equation_id,
                    'equation': eq_text,
                    'format': 'latex',
                    'page': None
                })
                equation_id += 1
        
        # Pattern 2: LaTeX display math: $$...$$
        latex_display = re.finditer(r'\$\$([^\$]+)\$\$', text)
        for match in latex_display:
            eq_text = match.group(1).strip()
            equations.append({
                'id': equation_id,
                'equation': eq_text,
                'format': 'latex',
                'page': None
            })
            equation_id += 1
        
        # Pattern 3: LaTeX brackets: \[...\] or \(...\)
        latex_brackets = re.finditer(r'\\[\[\(]([^\\]+)\\[\]\)]', text)
        for match in latex_brackets:
            eq_text = match.group(1).strip()
            equations.append({
                'id': equation_id,
                'equation': eq_text,
                'format': 'latex',
                'page': None
            })
            equation_id += 1
        
        # Pattern 4: Standard algebraic equations (x = ...)
        # Look for patterns like "variable = expression"
        algebraic = re.finditer(
            r'([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([^.\n!?;:]{3,80})',
            text
        )
        for match in algebraic:
            eq_text = match.group(0).strip()
            # Filter out obvious non-equations
            if not any(word in eq_text.lower() for word in ['http', 'www', 'figure', 'table', 'section']):
                equations.append({
                    'id': equation_id,
                    'equation': eq_text,
                    'format': 'text',
                    'page': None
                })
                equation_id += 1
        
        # Pattern 5: Equations with math symbols
        # Look for lines containing multiple math symbols
        math_symbols = re.finditer(
            r'[^\n]*[∫∑∏√±≈≤≥∞∂∇⊗⊕∈∉∀∃][^\n]{5,100}',
            text
        )
        for match in math_symbols:
            eq_text = match.group(0).strip()
            equations.append({
                'id': equation_id,
                'equation': eq_text,
                'format': 'unicode',
                'page': None
            })
            equation_id += 1
        
        # Pattern 6: Common physics/engineering formulas
        # Detect patterns like F = ma, E = mc^2, etc.
        formula_pattern = re.finditer(
            r'([A-Z][a-z]?)\s*=\s*([^.\n]{3,50})',
            text
        )
        for match in formula_pattern:
            eq_text = match.group(0).strip()
            # Check if it contains numbers or other variables
            if re.search(r'[0-9a-zA-Z]{2,}', eq_text):
                equations.append({
                    'id': equation_id,
                    'equation': eq_text,
                    'format': 'formula',
                    'page': None
                })
                equation_id += 1
        
        # Remove duplicates while preserving order
        seen = set()
        unique_equations = []
        for eq in equations:
            eq_key = eq['equation'].lower().replace(' ', '')
            if eq_key not in seen and len(eq['equation']) > 3:
                seen.add(eq_key)
                eq['id'] = len(unique_equations)  # Reassign IDs
                unique_equations.append(eq)
        
        return unique_equations[:100]  # Limit to 100 equations
