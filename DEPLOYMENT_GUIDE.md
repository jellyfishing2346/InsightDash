# 🌐 InsightDash Cloud Deployment Guide

## Option A: Netlify (Frontend) + Railway/Heroku (Backend)

### Frontend Deployment to Netlify
1. **Prepare for deployment:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify:**
   - Visit [netlify.com](https://netlify.com) and sign up
   - Drag & drop the `build` folder to Netlify
   - Or connect your GitHub repo for auto-deployments
   - Set environment variable: `REACT_APP_API_URL=https://your-backend-url.com`

### Backend Deployment to Railway
1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy backend:**
   ```bash
   cd backend
   railway init
   railway up
   ```

## Option B: Vercel (Fastest for Frontend)

### Frontend to Vercel
1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - `REACT_APP_API_URL=https://your-backend-url.com`

## Option C: Full Stack on Single Platform

### Render.com (Recommended)
1. **Connect your GitHub repo to Render**
2. **Create Web Service for Backend:**
   - Build Command: `cd backend && pip install -r requirements.txt` (if you add one)
   - Start Command: `cd backend && python mock_server.py`
   - Environment Variables: `PORT=8000`

3. **Create Static Site for Frontend:**
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`
   - Environment Variables: `REACT_APP_API_URL=https://your-backend-service.onrender.com`

### Docker Deployment
See the Docker files I'll create next for containerized deployment.

## Environment Variables Needed

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_ENV=production
```

### Backend
```
PORT=8000
CORS_ORIGINS=https://your-frontend-domain.com
ENV=production
```

## Domain Setup
1. **Custom Domain:** Point your domain to the hosting service
2. **SSL Certificate:** Most platforms provide free SSL
3. **CDN:** Enable CDN for better performance

## Monitoring & Analytics
- **Error Tracking:** Add Sentry for error monitoring
- **Analytics:** Add Google Analytics or similar
- **Performance:** Monitor Core Web Vitals
