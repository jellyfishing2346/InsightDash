# Render.com Frontend Deployment Instructions

## After Backend is Deployed:

1. **Go back to Render Dashboard**
2. **Click "New +" → "Static Site"**
3. **Connect same repository**: ashytheslashy/insightdash

## Frontend Configuration:

**Name:** `insightdash-frontend`

**Branch:** `main`

**Root Directory:** `InsightDash/frontend`

**Build Command:**
```bash
npm install && npm run build
```

**Publish Directory:**
```
build
```

**Environment Variables:**
| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://YOUR-BACKEND-URL.onrender.com` |

Replace `YOUR-BACKEND-URL` with the actual URL from your backend deployment.

## Final Result:
- Backend: `https://insightdash-backend.onrender.com`
- Frontend: `https://insightdash-frontend.onrender.com`

Your analytics dashboard will be live! 🎉
