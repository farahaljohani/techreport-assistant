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

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/farahaljohani/techreport-assistant.git
cd techreport-assistant
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key
nano .env
```

### 3. Run with Docker (Development)
```bash
docker-compose up --build
```

### 4. Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Nginx (Reverse Proxy):** http://localhost

## 📦 Docker Commands

```bash
# Start containers
docker-compose up

# Start in background
docker-compose up -d

# Stop containers
docker-compose down

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

## 📊 Environment Variables

### Backend
```
OPENAI_API_KEY=sk-...              # OpenAI API key (required)
BACKEND_URL=http://localhost:8000  # Backend URL
FRONTEND_URL=http://localhost:3000 # Frontend URL
ENVIRONMENT=development            # development/production
```

### Frontend
```
REACT_APP_API_URL=http://localhost:8000/api  # Backend API URL
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :8000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### API Connection Errors
- Check backend is running: `docker-compose logs backend`
- Verify API URL in frontend `.env`
- Check CORS settings in `backend/app/main.py`
- Ensure OpenAI API key is valid

### Docker Issues
```bash
# Clear all Docker data
docker system prune -a

# Rebuild from scratch
docker-compose down -v
docker-compose up --build
```

### Out of Memory
```bash
# Increase Docker memory limit in Docker Desktop settings
# Or use: docker run -m 2g
```

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
