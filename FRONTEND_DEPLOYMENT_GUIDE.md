# Frontend Deployment Guide for Render.com

## Prerequisites
- Backend is deployed and running at: `https://insightdash-backend.onrender.com`
- All analytics endpoints are working:
  - ✅ `/api/v1/datasets`
  - ✅ `/api/v1/analytics/summary`
  - ✅ `/api/v1/analytics/forecasts/recent`
  - ✅ `/api/v1/analytics/models/compare`

## Step 1: Create New Static Site on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository: `jellyfishing2346/InsightDash`

## Step 2: Configure Build Settings

### Repository Settings:
- **Root Directory**: `InsightDash/frontend`
- **Branch**: `main`

### Build Settings:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

### Environment Variables:
Add the following environment variable:
- **Key**: `REACT_APP_API_URL`
- **Value**: `https://insightdash-backend.onrender.com`

## Step 3: Deploy

1. Click **"Create Static Site"**
2. Render will automatically:
   - Install dependencies (`npm install`)
   - Build the React app (`npm run build`)
   - Deploy the static files from the `build` directory

## Step 4: Verify Deployment

Once deployed, your frontend URL will be something like:
`https://insightdash-frontend-xyz.onrender.com`

### Test the Following:
1. **Home Page**: Should load without errors
2. **Analytics Dashboard**: Navigate to `/analytics` route
3. **Data Loading**: Charts and analytics should populate with data from the backend
4. **API Connectivity**: Check browser console for any CORS or API errors

## Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Ensure backend allows frontend domain in CORS settings
   - The mock server should already have `Access-Control-Allow-Origin: *`

2. **API Connection Errors**:
   - Verify `REACT_APP_API_URL` is set correctly
   - Check that backend is running and accessible

3. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure build script runs locally first

4. **Routing Issues**:
   - Render static sites support client-side routing automatically
   - React Router should work out of the box

## Expected Result

After successful deployment, you should have:
- ✅ Frontend deployed at: `https://your-frontend-url.onrender.com`
- ✅ Backend running at: `https://insightdash-backend.onrender.com`
- ✅ Full analytics dashboard working with live data
- ✅ Charts and visualizations displaying correctly

## Next Steps

1. Test the complete analytics workflow
2. Verify all components are loading data correctly
3. Check performance and loading times
4. Consider setting up custom domain if needed

## Support

If you encounter any issues:
1. Check Render build logs for error details
2. Verify environment variables are set correctly
3. Test API endpoints directly in browser
4. Check browser console for JavaScript errors
