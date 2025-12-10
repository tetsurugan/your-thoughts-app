# Deployment Guide

## Overview

Your Thoughts uses the following deployment stack:
- **Frontend**: Vercel (React/Vite SPA)
- **Backend**: Render (Node.js/Express API)
- **Database**: Neon PostgreSQL (or Render PostgreSQL)

---

## Quick Deploy (Recommended)

### 1. Deploy Backend to Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo
4. Select `render.yaml` in the root
5. Render will auto-create:
   - Web service (your-thoughts-api)
   - PostgreSQL database
6. Set these environment variables manually:
   - `GEMINI_API_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `FRONTEND_URL` (your Vercel URL)

### 2. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Set root directory: `frontend`
4. Set environment variables:
   - `VITE_API_BASE_URL` (your Render URL)
   - `VITE_GOOGLE_CLIENT_ID`
5. Deploy!

### 3. Run Database Migrations

Render should auto-run migrations on deploy, but you can also run manually:

```bash
# Connect to Render shell or run locally with prod DATABASE_URL
npx prisma migrate deploy
```

### 4. Verify Deployment

- [ ] Backend health check: `https://your-api.onrender.com/health`
- [ ] Frontend loads: `https://yourthoughts.vercel.app`
- [ ] Create test account
- [ ] Create task (text)
- [ ] Complete task
- [ ] Export PDF

---

## GitHub Actions CI/CD

The `.github/workflows/ci-cd.yml` file automates deployment:

| Branch | Action |
|--------|--------|
| `main` | Deploy to production |
| `staging` | Deploy to staging |
| PR | Run tests only |

### Required Secrets (GitHub Settings → Secrets)

| Secret | Description |
|--------|-------------|
| `RENDER_API_KEY` | Render API key |
| `RENDER_SERVICE_ID_PROD` | Production service ID |
| `RENDER_SERVICE_ID_STAGING` | Staging service ID |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

---

## Local Development with Docker

```bash
# Start all services (PostgreSQL + Backend + Frontend)
docker-compose up

# Or just the database
docker-compose up db

# Then run backend/frontend locally
cd backend && npm run dev
cd frontend && npm run dev
```

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | ✅ | PostgreSQL connection string |
| JWT_SECRET | ✅ | Secret for JWT signing |
| GEMINI_API_KEY | ✅ | Google Gemini API key |
| GOOGLE_CLIENT_ID | ❌ | For Calendar OAuth |
| GOOGLE_CLIENT_SECRET | ❌ | For Calendar OAuth |
| FRONTEND_URL | ✅ | For CORS |
| PORT | ❌ | Default: 3001 |

### Frontend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_API_BASE_URL | ✅ | Backend API URL |
| VITE_GOOGLE_CLIENT_ID | ❌ | For Calendar OAuth |

---

## Production Checklist

### Before Go-Live

- [ ] Set strong JWT_SECRET (32+ chars)
- [ ] Configure CORS for production domain only
- [ ] Enable rate limiting
- [ ] Set up monitoring (Render logs, Vercel Analytics)
- [ ] Test on mobile device
- [ ] Run Lighthouse audit (target: 85+)

### After Go-Live

- [ ] Monitor error rates
- [ ] Check API response times
- [ ] Verify offline mode works
- [ ] Test Calendar OAuth flow
- [ ] Confirm push notifications

---

## Troubleshooting

### Backend won't start
- Check DATABASE_URL is correct
- Run `npx prisma migrate deploy`
- Check Render logs for errors

### Frontend shows blank page
- Check VITE_API_BASE_URL
- Verify API is responding
- Check browser console for CORS errors

### Calendar OAuth fails
- Verify redirect URI matches Google Console
- Check GOOGLE_CLIENT_ID/SECRET match

### Database migrations fail
- Connect with `psql` and check schema
- Ensure Prisma version matches
