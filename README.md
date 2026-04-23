# Read & Access

**Helping People Read and Access Technical Reports.**

A web platform that helps engineering students read, understand, and verify technical reports with a set of smart tools built on top of the OpenAI API.

## Features

- **PDF upload & viewer** — Drop in a PDF (up to 50 MB) and read it side by side with the tools
- **Summary tool** — Summarize the whole report or just a highlighted passage
- **Explanation tool** — Explain or simplify any selected text in plain English
- **Glossary helper** — Define highlighted terms and build a searchable glossary
- **Evidence tracker** — Find where a claim appears in the document and jump to it
- **Equation helper** — Auto-detect equations, browse them, render LaTeX, and get explanations
- **ISA calculator** — International Standard Atmosphere (temperature, pressure, density)
- **Unit converter** — 19 engineering units across length, velocity, pressure, force, and temperature, grouped by category with validation
- **Ask-Anything box** — Ask free-form questions about the loaded report
- **Search** — `Ctrl`/`Cmd + F` floating search with match highlighting
- **Robust uploads** — Client + server validation, upload progress, contextual error messages, 5-minute timeout budget

## Tech Stack

- **Backend:** FastAPI, Uvicorn, Pydantic, PyPDF2, OpenAI Python SDK (model configurable via `OPENAI_MODEL`, default `gpt-3.5-turbo`)
- **Frontend:** React 18, TypeScript, Axios, `react-pdf` / pdf.js, KaTeX, CSS3
- **Infrastructure:** Docker, Docker Compose, Nginx reverse proxy

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
OPENAI_MODEL=gpt-3.5-turbo
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

Get a key at https://platform.openai.com/api-keys (Create new secret key, then paste it in `backend/.env`).

**3. Start the app**

```bash
docker compose up --build
```

Wait 1–2 minutes for the first build, then open:

- **App:** http://localhost:3000
- **API docs:** http://localhost:8000/docs

**4. Stop**

```bash
docker compose down
```

## Docker Commands

```bash
docker compose up                 # Start
docker compose up -d              # Start in background
docker compose down               # Stop
docker compose up --build         # Rebuild and start
docker compose logs -f backend    # View backend logs
docker compose restart nginx      # Apply nginx.conf changes
docker compose exec backend bash  # Shell into backend
docker compose exec frontend sh   # Shell into frontend
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

| Method | Endpoint                     | Purpose                                  |
|--------|------------------------------|------------------------------------------|
| GET    | `/health`                    | Liveness probe                           |
| POST   | `/api/upload`                | Upload a PDF (multipart/form-data)       |
| GET    | `/api/report/{id}`           | Retrieve a parsed report by ID           |
| GET    | `/api/pdf/{file_id}`         | Serve the stored PDF file                |
| POST   | `/api/summarize`             | Summarize a passage                      |
| POST   | `/api/explain`               | Explain highlighted text                 |
| POST   | `/api/extract-definitions`   | Extract key terms / definitions          |
| POST   | `/api/explain-equation`      | Explain an equation                      |
| POST   | `/api/detect-equations`      | Detect equations in a block of text      |
| POST   | `/api/convert-units`         | Convert between units                    |
| GET    | `/api/conversions`           | List supported conversions               |
| POST   | `/api/ask-question`          | Ask a free-form question about a report  |
| GET    | `/docs`                      | Interactive OpenAPI documentation        |

## Usage

1. **Upload a PDF** (max 50 MB) from the landing page. Progress and errors are shown inline.
2. Toggle between **Text View** and **PDF View** in the top bar, or press `Ctrl`/`Cmd + F` to open the floating search.
3. Use the **left sidebar** for document stats, detected equations, and your glossary.
4. Open the **right tools panel** and highlight text, then:
   - **Summary Tool** — summarize the selection or the whole report
   - **Glossary Tool** — define a word/phrase and save it
   - **Explanation Tool** — explain or simplify a selection
   - **Evidence Tracker** — locate and jump to a claim in the document
   - **Equation Helper** — browse detected equations, render LaTeX, and get explanations
   - **ISA Calculator** — compute atmosphere properties at altitude
   - **Unit Converter** — convert between engineering units (same-category only)
   - **Ask-Anything Box** — ask a question about the loaded report

## Project Structure

```
techreport-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/        # upload.py, ai_tools.py
│   │   ├── services/      # chatgpt_service.py, pdf_parser.py, unit_converter.py
│   │   ├── models/
│   │   └── utils/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/    # Layout, TopBar, PDFViewer, tools, …
│   │   ├── services/      # api.ts (Axios client, base URL helpers)
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── docker-compose.prod.yml
└── README.md
```

## Production

```bash
docker compose -f docker-compose.prod.yml up -d
```

For HTTPS, put certificates in a `certs/` directory and point Nginx to them. Use your platform's env vars for `OPENAI_API_KEY` in production — never commit the key.

## Security

- Do not commit `.env` or hard-code your OpenAI API key. Use env vars only.
- If a key is ever exposed, revoke it at https://platform.openai.com/api-keys and create a new one.

## Troubleshooting

- **Port in use:** Stop the process using the port or change ports in `docker-compose.yml`.
- **Frontend can't reach backend:** Ensure `frontend/.env` has `REACT_APP_API_URL=http://localhost:8000/api` and the backend container is healthy (`docker compose ps`).
- **Invalid API key:** Check `backend/.env` has `OPENAI_API_KEY=sk-proj-...` with no extra spaces, then restart: `docker compose restart backend`.
- **Upload fails with timeout:** The upload budget is 5 minutes (client, Nginx, and backend). Very large PDFs or slow network connections can still exceed it — try a smaller or text-based PDF.
- **"File too large" (HTTP 413):** Max upload is 50 MB; Nginx is configured with a 60 MB ceiling.
- **Nginx config changed but not applied:** Run `docker compose restart nginx`.
- **Build/start issues:** Run `docker compose down -v` then `docker compose up --build`.

## License

MIT. See LICENSE file.

## Author

Farah AlJohani — [@farahaljohani](https://github.com/farahaljohani)
