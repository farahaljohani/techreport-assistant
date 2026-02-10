# Tech Report Assistant

A web platform that helps engineering students read, understand, and verify technical reports using AI and interactive tools.

## Features

- **PDF upload and display** — Clean interface for technical reports
- **AI summarization** — Concise summaries via ChatGPT
- **Highlight-to-explain** — Highlight text for instant AI explanations
- **Key definitions** — Extract and understand technical terms
- **Equation analysis** — Step-by-step breakdown of math with ChatGPT
- **Unit conversion** — Convert between 40+ engineering units
- **Search** — Find content with highlighting
- **Responsive design** — Desktop and tablet

## Tech Stack

- **Backend:** FastAPI, OpenAI GPT-3.5-Turbo, PyPDF2, Pydantic, Uvicorn
- **Frontend:** React 18, TypeScript, Axios, CSS3
- **Infrastructure:** Docker, Docker Compose, Nginx, Gunicorn

## Prerequisites

- Docker and Docker Compose
- [OpenAI API key](https://platform.openai.com/api-keys)
- Git

## Quick Start

**1. Clone and enter the project**

```bash
git clone https://github.com/farahaljohani/techreport-assistant.git
cd techreport-assistant
```

**2. Set up environment and API key**

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` and set your OpenAI API key:

```
OPENAI_API_KEY=sk-proj-your-actual-key-here
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

Get a key at https://platform.openai.com/api-keys (Create new secret key, then paste it in `backend/.env`).

**3. Start the app**

```bash
docker compose up --build
```

Wait 1–2 minutes, then open:

- **App:** http://localhost:3000
- **API docs:** http://localhost:8000/docs

**4. Stop**

```bash
docker compose down
```

## Docker Commands

```bash
docker compose up              # Start
docker compose up -d            # Start in background
docker compose down             # Stop
docker compose up --build       # Rebuild and start
docker compose logs -f backend  # View backend logs
docker compose exec backend bash   # Shell into backend
docker compose exec frontend sh     # Shell into frontend
```

## Manual Setup (no Docker)

**Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Add OPENAI_API_KEY
uvicorn app.main:app --reload
```

Runs at http://localhost:8000

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Runs at http://localhost:3000

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/upload` | Upload PDF |
| GET | `/api/report/{id}` | Get report by ID |
| POST | `/api/summarize` | Summarize text |
| POST | `/api/explain` | Explain highlighted text |
| POST | `/api/ask-question` | Ask about report |
| POST | `/api/explain-equation` | Explain equations |
| POST | `/api/extract-definitions` | Extract key terms |
| POST | `/api/convert-units` | Convert units |
| GET | `/api/conversions` | List conversions |
| GET | `/docs` | Interactive API docs |

## Usage

1. Upload a PDF (max 50MB) from the landing page.
2. Use the search bar to find text; matches are highlighted.
3. Select text and use "Explain" in the AI Tools panel for an explanation.
4. Use the Summary, Equations, and Units tabs for summaries, equation analysis, and unit conversion.

## Project Structure

```
techreport-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── Dockerfile
├── nginx/
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

## Production

```bash
docker compose -f docker-compose.prod.yml up -d
```

For HTTPS, put certificates in a `certs/` directory and point Nginx to them. Use your platform’s env vars for `OPENAI_API_KEY` in production.

## Security

- Do not commit `.env` or put your OpenAI API key in code. Use env vars only.
- If a key is exposed, revoke it at https://platform.openai.com/api-keys and create a new one.

## Troubleshooting

- **Port in use:** Stop the process using the port or change ports in `docker-compose.yml`.
- **Frontend can’t reach backend:** Ensure `frontend/.env` has `REACT_APP_API_URL=http://localhost:8000/api` and backend is running.
- **Invalid API key:** Check `backend/.env` has `OPENAI_API_KEY=sk-proj-...` with no extra spaces, then restart: `docker compose restart backend`.
- **Build/start issues:** Run `docker compose down -v` then `docker compose up --build`.

## License

MIT. See LICENSE file.

## Author

Farah AlJohani — [@farahaljohani](https://github.com/farahaljohani)
