import os
from openai import OpenAI

# Read your API key from environment variable
_api_key = os.getenv("OPENAI_API_KEY")

if not _api_key:
    # For now we fail loudly if the key is missing.
    # You can change this to return dummy text during development.
    raise RuntimeError(
        "OPENAI_API_KEY environment variable is not set. "
        "Export it before running the backend."
    )

client = OpenAI(api_key=_api_key)


def summarise_text(text: str) -> str:
    """
    Use OpenAI to summarise a piece of text.
    """
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": f"Summarise this clearly and briefly:\n\n{text}"}],
    )
    return response.choices[0].message.content.strip()


def explain_term(term: str) -> str:
    """
    Use OpenAI to explain a technical term in simple language.
    """
    prompt = f"Explain this engineering / technical term in simple language for a 3rd-year student: {term}"
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content.strip()

