import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Take raw PDF bytes and return all extracted text.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text_chunks = []
    for page in doc:
        text_chunks.append(page.get_text())
    doc.close()
    return "\n".join(text_chunks)

