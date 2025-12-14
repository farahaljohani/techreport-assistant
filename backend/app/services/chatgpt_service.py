from openai import OpenAI
from app.config import settings

# Initialize OpenAI client
try:
    if not settings.OPENAI_API_KEY:  # ← HERE! Gets API key from settings
        raise ValueError("OPENAI_API_KEY environment variable not set")
    
    client = OpenAI(api_key=settings.OPENAI_API_KEY)  # ← HERE! Uses the API key
    print(f"✅ OpenAI initialized with model: {settings.OPENAI_MODEL}")
except Exception as e:
    print(f"❌ OpenAI initialization error: {e}")
    client = None

class ChatGPTService:
    MODEL = settings.OPENAI_MODEL
    
    @staticmethod
    async def summarize(text: str, max_length: int = 200) -> str:
        """Summarize technical text into plain language."""
        try:
            if not settings.OPENAI_API_KEY:
                raise Exception("OpenAI API key not set")
            
            if not text or len(text.strip()) == 0:
                raise Exception("Text cannot be empty")
            
            print(f"📝 Summarizing {len(text)} characters with {ChatGPTService.MODEL}...")
            
            response = client.chat.completions.create(
                model=ChatGPTService.MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at summarizing technical engineering reports. Provide clear, concise summaries suitable for engineering students."
                    },
                    {
                        "role": "user",
                        "content": f"Summarize this in {max_length} words or less:\n\n{text}"
                    }
                ],
                temperature=settings.OPENAI_TEMPERATURE,
                max_tokens=300
            )
            
            result = response.choices[0].message.content
            print(f"✅ Summary generated: {len(result)} characters")
            return result
        except Exception as e:
            print(f"❌ ChatGPT summarization error: {str(e)}")
            raise Exception(f"Summarization failed: {str(e)}")

    @staticmethod
    async def explain(highlighted_text: str, context: str = "") -> str:
        """Explain highlighted text in the context of the report."""
        try:
            if not settings.OPENAI_API_KEY:
                raise Exception("OpenAI API key not set")
            
            if not highlighted_text or len(highlighted_text.strip()) == 0:
                raise Exception("Text cannot be empty")
            
            print(f"💡 Explaining text with {ChatGPTService.MODEL}...")
            
            response = client.chat.completions.create(
                model=ChatGPTService.MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert engineering tutor. Explain technical concepts clearly and simply, breaking down complex ideas into understandable parts."
                    },
                    {
                        "role": "user",
                        "content": f"Explain this highlighted text from a technical report in simple terms:\n\n'{highlighted_text}'\n\nContext: {context}"
                    }
                ],
                temperature=settings.OPENAI_TEMPERATURE,
                max_tokens=settings.OPENAI_MAX_TOKENS
            )
            
            result = response.choices[0].message.content
            print(f"✅ Explanation generated: {len(result)} characters")
            return result
        except Exception as e:
            print(f"❌ ChatGPT explanation error: {str(e)}")
            raise Exception(f"Explanation failed: {str(e)}")

    @staticmethod
    async def ask_question(question: str, report_text: str) -> str:
        """Answer questions about the report."""
        try:
            if not settings.OPENAI_API_KEY:
                raise Exception("OpenAI API key not set")
            
            print(f"❓ Answering question with {ChatGPTService.MODEL}...")
            
            response = client.chat.completions.create(
                model=ChatGPTService.MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert engineering analyst. Answer questions based on the provided report context."
                    },
                    {
                        "role": "user",
                        "content": f"Based on this report:\n\n{report_text[:2000]}\n\nQuestion: {question}"
                    }
                ],
                temperature=settings.OPENAI_TEMPERATURE,
                max_tokens=settings.OPENAI_MAX_TOKENS
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"❌ ChatGPT question error: {str(e)}")
            raise Exception(f"Question answering failed: {str(e)}")

    @staticmethod
    async def explain_equation(equation: str, context: str = "") -> str:
        """Explain mathematical equations step-by-step."""
        try:
            if not settings.OPENAI_API_KEY:
                raise Exception("OpenAI API key not set")
            
            print(f"📐 Explaining equation with {ChatGPTService.MODEL}...")
            
            response = client.chat.completions.create(
                model=ChatGPTService.MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a math and engineering expert. Explain equations step-by-step clearly. Define variables, explain what each term means, and describe the physical meaning."
                    },
                    {
                        "role": "user",
                        "content": f"Explain this equation step-by-step:\n\n{equation}\n\nContext: {context}"
                    }
                ],
                temperature=settings.OPENAI_TEMPERATURE,
                max_tokens=settings.OPENAI_MAX_TOKENS
            )
            
            return response.choices[0].message.content
        except Exception as e:
            print(f"❌ ChatGPT equation error: {str(e)}")
            raise Exception(f"Equation explanation failed: {str(e)}")

    @staticmethod
    async def extract_definitions(text: str) -> dict:
        """Extract key terms and definitions from text."""
        try:
            if not settings.OPENAI_API_KEY:
                raise Exception("OpenAI API key not set")
            
            if not text or len(text.strip()) == 0:
                raise Exception("Text cannot be empty")
            
            print(f"📚 Extracting definitions with {ChatGPTService.MODEL}...")
            
            response = client.chat.completions.create(
                model=ChatGPTService.MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at identifying technical terms. Extract key terms and provide clear definitions. Format as: TERM: definition"
                    },
                    {
                        "role": "user",
                        "content": f"Extract 5-10 key technical terms and their definitions from this text:\n\n{text}"
                    }
                ],
                temperature=0.5,
                max_tokens=settings.OPENAI_MAX_TOKENS
            )
            
            definitions = response.choices[0].message.content
            print(f"✅ Definitions extracted: {len(definitions)} characters")
            return {"definitions": definitions}
        except Exception as e:
            print(f"❌ ChatGPT definition error: {str(e)}")
            raise Exception(f"Definition extraction failed: {str(e)}")
