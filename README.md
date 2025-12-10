# Your Thoughts App

> **A multimodal task capture PWA** — Say it, type it, or snap it. I'll turn it into tasks and calendar reminders.

[![CI/CD](https://github.com/tetsurugan/your-thoughts-app/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/tetsurugan/your-thoughts-app/actions)

---

## 🎯 What is This?

Your Thoughts is a mobile-first web app for capturing and managing tasks through natural language. Designed with a **Legal Mode** for people managing probation, court dates, and appointments — but works for anyone.

### Key Features

| Feature | Description |
|---------|-------------|
| 🎤 **Voice Capture** | Speak your tasks naturally |
| 📷 **Photo OCR** | Photograph documents, extract tasks |
| 🤖 **AI Categorization** | Auto-classify and extract due dates |
| 🔄 **Recurring Tasks** | Daily, weekly, monthly, yearly |
| 📅 **Calendar Sync** | Push tasks to Google Calendar |
| 📴 **Offline Mode** | Works without internet |
| 📄 **Export PDF** | Download formatted task list |

---

## 🏗️ Project Structure

```
your-thoughts-app/
├── frontend/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── routes/           # Page components  
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Auth, Theme providers
│   │   ├── services/         # Offline storage
│   │   └── utils/            # Helpers, messages
│   ├── vercel.json           # Vercel config
│   └── package.json
│
├── backend/                  # Node.js API (Express)
│   ├── src/
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Auth middleware
│   │   ├── services/         # Business logic
│   │   ├── config/           # Category presets
│   │   ├── parsers/          # AI intent parsing
│   │   └── routes/           # API routes
│   ├── prisma/               # Database schema
│   ├── Dockerfile            # Production container
│   └── package.json
│
├── docs/                     # Documentation
│   ├── DEPLOYMENT.md         # Deploy guide
│   └── PHASE2_BACKLOG.md     # Phase 2 epics
│
├── .github/workflows/        # CI/CD
│   └── ci-cd.yml
│
├── docker-compose.yml        # Local dev with PostgreSQL
├── render.yaml               # Render blueprint
├── ARCHITECTURE.md           # Technical decisions
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ or 22.12+
- npm 10+

### Local Development

```bash
# 1. Clone
git clone https://github.com/tetsurugan/your-thoughts-app.git
cd your-thoughts-app

# 2. Backend setup
cd backend
npm install
cp .env.example .env          # Add your GEMINI_API_KEY
npx prisma migrate dev
npm run dev                    # Runs on :3001

# 3. Frontend setup (new terminal)
cd frontend
npm install
npm run dev                    # Runs on :5173

# 4. Open http://localhost:5173
```

### With Docker

```bash
# Start everything (PostgreSQL + Backend + Frontend)
docker-compose up
```

---

## 🔧 Environment Variables

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL/SQLite connection |
| `JWT_SECRET` | ✅ | Secret for JWT signing |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `GOOGLE_CLIENT_ID` | ❌ | For Calendar OAuth |
| `GOOGLE_CLIENT_SECRET` | ❌ | For Calendar OAuth |
| `FRONTEND_URL` | ✅ | CORS allowed origin |

### Frontend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | ✅ | Backend API URL |

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical decisions & data model |
| [docs/API.md](./docs/API.md) | API endpoint reference |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Production deployment guide |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Project roadmap & features |
| [docs/PHASE2_BACKLOG.md](./docs/PHASE2_BACKLOG.md) | Phase 2 feature epics |

---

## 🎭 User Personas

| Persona | Account Purpose | Default Tags |
|---------|-----------------|--------------|
| Probationer | `legal` | Court Date, PO Meeting, Program/Class |
| Student | `school` | Homework, Exam, Project, Reading |
| Professional | `work` | Meeting, Deadline, Follow-up |
| General | `custom` | User-defined |

---

## 🧪 Testing

```bash
# Backend type check
cd backend && npx tsc --noEmit

# Frontend build (includes type check)
cd frontend && npm run build
```

---

## 📦 Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for full guide.

**Quick Deploy:**
1. Push to GitHub
2. Connect to [Render](https://render.com) → Uses `render.yaml`
3. Connect to [Vercel](https://vercel.com) → Uses `frontend/vercel.json`

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📄 License

MIT

---

## 🙏 Acknowledgements

- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Prisma](https://prisma.io) for database ORM
- [Vite](https://vitejs.dev) for frontend tooling
