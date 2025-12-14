# Tech Report Assistant 🚀

A powerful web platform that helps engineering students read, understand, and verify technical reports using AI-powered assistance and interactive tools.

## 🎯 Features

- 📄 **PDF Upload & Display** - Clean, readable interface for technical reports
- 🤖 **AI Summarization** - Get concise summaries using ChatGPT
- 💡 **Highlight-to-Explain** - Highlight text for instant AI explanations
- 📚 **Key Definitions** - Extract and understand technical terminology
- 📐 **Equation Analysis** - Break down math equations step-by-step with ChatGPT
- 🔄 **Unit Conversion** - Convert between 40+ engineering units
- 🔍 **Smart Search** - Find content instantly with highlighting
- 📱 **Responsive Design** - Works on desktop and tablet

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **OpenAI GPT-3.5-Turbo** - AI-powered text analysis
- **PyPDF2** - PDF parsing and extraction
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Axios** - HTTP client
- **CSS3** - Modern styling

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy & load balancing
- **Gunicorn** - Production WSGI server

## 📋 Prerequisites

- Docker & Docker Compose
- OpenAI API Key (get from https://platform.openai.com/api-keys)
- Git

## 🚀 Quick Start (For New Users)

**Want to clone and run this project? Follow these simple steps:**

### Step 1: Install Prerequisites

Make sure you have these installed:
- ✅ **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
- ✅ **Git** - [Download here](https://git-scm.com/downloads)
- ✅ **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys) (free trial available)

### Step 2: Clone the Repository

Open your terminal and run:

```bash
# Clone the project from GitHub
git clone https://github.com/farahaljohani/techreport-assistant.git

# Navigate into the project folder
cd techreport-assistant
```

### Step 3: Setup Your API Key (REQUIRED)

**⚠️ IMPORTANT:** The AI features need an OpenAI API key to work.

```bash
# Copy the environment template files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Edit `backend/.env` and add your OpenAI API key:**

```bash
# On Mac/Linux:
nano backend/.env

# On Windows:
notepad backend/.env
```

**Add this to the file:**
```bash
OPENAI_API_KEY=sk-proj-your-actual-key-here
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

💡 **How to get an API key:**
1. Visit https://platform.openai.com/api-keys
2. Sign up or log in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-`)
5. Paste it in your `backend/.env` file (replace `your-actual-key-here`)

### Step 4: Start the Application

```bash
# Build and start all services with Docker
docker compose up --build
```

**Wait for services to start** (1-2 minutes). You'll see messages like:
```
✓ Backend running on http://0.0.0.0:8000
✓ Frontend compiled successfully!
```

### Step 5: Open in Browser

Once started, open your browser and visit:
- 🌐 **Main Application:** http://localhost:3000
- 📚 **API Documentation:** http://localhost:8000/docs
- 🔧 **Backend API:** http://localhost:8000

### Step 6: Test It Out! 🎉

1. Click **"Upload PDF"** on the landing page
2. Select a PDF file (technical report, research paper, etc.)
3. Wait for processing (a few seconds)
4. Try the AI-powered tools:
   - 💬 **Ask questions** about your document
   - 📐 **Analyze equations** step-by-step
   - 🔍 **Get explanations** for highlighted text
   - 📚 **Extract definitions** automatically
   - 🔄 **Convert units** between systems

### 🛑 Stopping the Application

When you're done:

```bash
# Stop all services (press Ctrl+C in the running terminal)
# Or in a new terminal:
docker compose down
```

---

## 📦 Docker Commands Reference

```bash
# Start all containers
docker compose up

# Start in background (detached mode)
docker compose up -d

# Stop all containers
docker compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Rebuild images
docker-compose up --build

# Remove volumes (CAUTION: deletes data)
docker-compose down -v

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 🔧 Manual Setup (Without Docker)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your OpenAI API key
uvicorn app.main:app --reload
```
Backend runs on: http://localhost:8000

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm start
```
Frontend runs on: http://localhost:3000

## 📚 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/upload` | Upload PDF report |
| GET | `/api/report/{id}` | Get report by ID |
| POST | `/api/summarize` | Summarize text |
| POST | `/api/explain` | Explain highlighted text |
| POST | `/api/ask-question` | Ask questions about report |
| POST | `/api/explain-equation` | Explain mathematical equations |
| POST | `/api/extract-definitions` | Extract key terms |
| POST | `/api/convert-units` | Convert units |
| GET | `/api/conversions` | Get available conversions |
| GET | `/docs` | Interactive API documentation |

## 🎓 Usage

1. **Upload Report**
   - Click "Upload Report" button
   - Select PDF file (max 50MB)
   - Wait for extraction

2. **Read & Search**
   - Use search bar to find content
   - Matching text is highlighted

3. **Highlight & Understand**
   - Select text in the report
   - Click "Explain" in AI Tools panel
   - Get instant ChatGPT explanation

4. **Use AI Tools**
   - **Summary Tab**: Get summaries, definitions
   - **Equations Tab**: Analyze formulas step-by-step
   - **Units Tab**: Convert between units

## 🏗 Project Structure

```
techreport-assistant/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py          # Entry point
│   │   ├── config.py        # Configuration
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   └── utils/           # Utilities
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API client
│   │   ├── styles/          # Global styles
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── Dockerfile.prod
│
├── nginx/                    # Reverse proxy
│   ├── nginx.conf
│   └── Dockerfile
│
├── docs/                     # Documentation
├── docker-compose.yml        # Development orchestration
├── docker-compose.prod.yml   # Production orchestration
├── README.md
└── .env.example
```

## 🌐 Production Deployment

### Using Production Compose File
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Configure SSL/HTTPS
```bash
# Create certs directory
mkdir -p certs

# Generate self-signed certificate (for testing)
openssl req -x509 -newkey rsa:4096 -keyout certs/private.key -out certs/cert.pem -days 365 -nodes

# Or use Let's Encrypt with Certbot
certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem certs/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem certs/private.key
```

### Deploy to Cloud
- **DigitalOcean App Platform**: Push to GitHub → Connect repo → Deploy
- **AWS ECS**: Build images → Push to ECR → Create task definition
- **Heroku**: Use Docker buildpack
- **Render**: Connect GitHub → Deploy

## � Security & API Keys

### ⚠️ IMPORTANT: Protecting Your OpenAI API Key

**Your OpenAI API key is sensitive and must NEVER be committed to Git!**

### ✅ What's Already Protected

This project uses environment variables to keep your API key safe:

1. **`.env` files are in `.gitignore`** - Won't be committed
2. **Code uses `os.getenv()`** - No hardcoded credentials
3. **Only `.env.example` is in repo** - Templates only

### 🚀 Initial Setup

**For new team members or deployment:**

```bash
# 1. Copy the environment template
cp backend/.env.example backend/.env

# 2. Get your OpenAI API key from:
# https://platform.openai.com/api-keys

# 3. Edit backend/.env and add your key
nano backend/.env

# Add this line with your actual key:
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 🚨 If You Accidentally Commit Your API Key

**IMMEDIATELY do these steps:**

1. **Revoke the exposed key** at https://platform.openai.com/api-keys
2. **Generate a new API key**
3. **Update your local `.env` file** with the new key
4. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

### 🔒 Security Best Practices

- ✅ **DO**: Use environment variables (`.env` files)
- ✅ **DO**: Add `.env` to `.gitignore`
- ✅ **DO**: Share `.env.example` templates (without real keys)
- ✅ **DO**: Rotate API keys periodically
- ✅ **DO**: Use different keys for dev/staging/production
- ❌ **DON'T**: Hardcode API keys in code
- ❌ **DON'T**: Commit `.env` files to Git
- ❌ **DON'T**: Share API keys in chat/email
- ❌ **DON'T**: Push keys to public repositories

### 🔍 Verify Your Setup is Secure

```bash
# Check if .env is ignored
git status | grep ".env"
# Should return nothing (file is ignored)

# Verify no keys in git history
git log --all --full-history --source --oneline -- "**/.env"
# Should return nothing

# Check last commit for keys
git show HEAD | grep -i "sk-proj"
# Should return nothing
```

### 📋 Environment Variables Reference

#### Backend (`.env`)
```bash
# Required - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your-key-here

# Optional - Defaults work for local development
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
OPENAI_MODEL=gpt-3.5-turbo
```

#### Frontend (`.env`)
```bash
# Backend API endpoint
REACT_APP_API_URL=http://localhost:8000/api
```

### 🌐 Production Deployment Security

For production environments:

```bash
# Use environment variables from your hosting platform
# Examples:

# Heroku
heroku config:set OPENAI_API_KEY=sk-proj-your-key

# AWS
aws ssm put-parameter --name OPENAI_API_KEY --value "sk-proj-your-key" --type SecureString

# Docker Swarm/Kubernetes
kubectl create secret generic openai-key --from-literal=OPENAI_API_KEY=sk-proj-your-key

# DigitalOcean App Platform
# Add via dashboard: Settings → Environment Variables
```

### 💰 OpenAI API Usage & Costs

- **Monitor usage**: https://platform.openai.com/usage
- **Set spending limits**: https://platform.openai.com/account/billing/limits
- **Model costs** (as of Dec 2024):
  - GPT-3.5-Turbo: $0.0015 per 1K input tokens, $0.002 per 1K output tokens
  - GPT-4: Higher cost, more accurate responses

**Tip**: Start with GPT-3.5-Turbo for development, upgrade to GPT-4 if needed.

## 🐛 Troubleshooting (Common Issues)

### ❌ "Port Already in Use" Error

**Problem:** Docker can't start because ports 3000, 8000, or 80 are already being used.

**Solution:**
```bash
# Find what's using the ports
lsof -i :3000
lsof -i :8000
lsof -i :80

# Kill the process (replace <PID> with the actual process ID)
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### ❌ "Cannot find module 'katex'" Error

**Problem:** Frontend dependencies not installed properly.

**Solution:**
```bash
# Rebuild the containers from scratch
docker compose down
docker compose up --build
```

### ❌ API Connection Errors / "Network Error"

**Problem:** Frontend can't connect to backend.

**Solution:**
```bash
# 1. Check if backend is running
docker compose logs backend

# 2. Verify backend URL in frontend/.env
cat frontend/.env
# Should have: REACT_APP_API_URL=http://localhost:8000/api

# 3. Restart all services
docker compose restart
```

### ❌ "OpenAI API Key Invalid" Error

**Problem:** Your API key is missing or incorrect.

**Solution:**
```bash
# 1. Check your backend/.env file
cat backend/.env

# 2. Make sure it starts with sk-proj-
# 3. No spaces or quotes around the key
OPENAI_API_KEY=sk-proj-your-key-here

# 4. Restart backend
docker compose restart backend
```

### ❌ Docker Issues / Container Won't Start

**Problem:** Docker containers fail to build or start.

**Solution:**
```bash
# Stop everything
docker compose down

# Remove all containers, networks, and volumes
docker compose down -v

# Clear Docker cache
docker system prune -a

# Rebuild from scratch
docker compose up --build
```

### ❌ "Out of Memory" Error

**Problem:** Docker doesn't have enough memory allocated.

**Solution:**
1. Open **Docker Desktop**
2. Go to **Settings** → **Resources**
3. Increase **Memory** to at least 4 GB
4. Click **Apply & Restart**
5. Run `docker compose up --build` again

### ❌ Frontend Shows "Blank Page"

**Problem:** React app didn't compile correctly.

**Solution:**
```bash
# Check frontend logs
docker compose logs frontend

# Look for compilation errors
# If you see errors, rebuild:
docker compose down
docker compose up --build
```

### ❌ "Connection Refused" on http://localhost:3000

**Problem:** Frontend container not running or not ready yet.

**Solution:**
```bash
# 1. Wait 1-2 minutes for frontend to compile
# 2. Check if container is running
docker compose ps

# 3. View frontend logs
docker compose logs -f frontend

# 4. Wait for "Compiled successfully!" message
```

### ❌ PDF Upload Fails

**Problem:** File too large or backend not processing.

**Solution:**
```bash
# 1. Check file size (max 50MB)
# 2. Check backend logs
docker compose logs backend

# 3. Make sure uploads directory exists
docker compose exec backend mkdir -p /app/uploads

# 4. Restart backend
docker compose restart backend
```

### 🆘 Still Having Issues?

1. **Check the logs:**
   ```bash
   docker compose logs -f
   ```

2. **Restart everything:**
   ```bash
   docker compose down
   docker compose up --build
   ```

3. **Open an issue on GitHub:**
   https://github.com/farahaljohani/techreport-assistant/issues

---

## 📈 Performance Tips

1. **Use Production Build**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Enable Caching**
   - Frontend caching via nginx
   - API response caching

3. **Monitor Logs**
   ```bash
   docker-compose logs -f
   ```

4. **Scale Services**
   - Multiple backend workers (Gunicorn)
   - Load balancing with Nginx

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - See LICENSE file

## 👨‍💻 Author

Farah AlJohani  
[@farahaljohani](https://github.com/farahaljohani)

## 🙏 Acknowledgments

- OpenAI for GPT-3.5-Turbo API
- FastAPI for excellent web framework
- React team for UI library
- Open source community

## 📞 Support

- 📧 Email: support@techreport.com
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📖 Documentation: See `/docs` folder

## 🚀 Roadmap

- [ ] User authentication & profiles
- [ ] Document annotations & comments
- [ ] Multi-language support
- [ ] Advanced equation solver
- [ ] Research paper database integration
- [ ] Collaborative features
- [ ] Mobile app
- [ ] Advanced citation tracking
- [ ] PDF annotation tools
- [ ] Justification Markup support

---

**Happy learning! 🎓**
