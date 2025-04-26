# InsightDash Analytics Platform

[![Status](https://img.shields.io/badge/Status-LIVE%20DEPLOYED-brightgreen.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-blue.svg)](https://insightdash-frontend.onrender.com)
[![Backend](https://img.shields.io/badge/Backend-Python%20Mock%20Server-green.svg)](https://insightdash-backend.onrender.com)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-orange.svg)](https://insightdash-frontend.onrender.com)

A comprehensive analytics and forecasting platform with advanced features for data-driven insights, real-time monitoring, and predictive analytics.

## 🌐 **LIVE DEPLOYMENT**

### 🚀 **Access the Live Platform**
- **🎯 Frontend (React App)**: [https://insightdash-frontend.onrender.com](https://insightdash-frontend.onrender.com)
- **⚡ Backend API**: [https://insightdash-backend.onrender.com](https://insightdash-backend.onrender.com)

### 🎮 **Quick Demo Access**
1. **Visit**: [https://insightdash-frontend.onrender.com](https://insightdash-frontend.onrender.com)
2. **Register**: Create a new account (any email/username works)
3. **Login**: Use your created credentials
4. **Explore**: Navigate to analytics dashboard, data management, and forecasting features

## ✨ **Platform Status: FULLY FUNCTIONAL**

✅ **Complete full-stack deployment on Render.com**  
✅ **User registration and authentication working**  
✅ **Analytics dashboard with live data**  
✅ **Real-time API connectivity**  
✅ **Interactive data visualizations**  
✅ **Model comparison and forecasting**  
✅ **Dataset management and export**  
✅ **Responsive design for all devices**

## 🎯 **Core Features & Capabilities**

### 📊 **Analytics Dashboard**
- **📈 Real-time Metrics**: Live data visualization with interactive charts
- **📋 Summary Cards**: Total datasets, forecasts, accuracy metrics
- **🔄 Auto-refresh**: Dynamic data updates every 30 seconds
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 🔮 **Predictive Analytics & Forecasting**
- **🤖 Multiple Models**: Linear Regression, ARIMA, Moving Averages
- **📊 Model Comparison**: Side-by-side accuracy and performance metrics
- **🎯 Forecasting Engine**: Generate predictions with confidence intervals
- **📉 Trend Analysis**: Pattern detection and statistical insights

### 💾 **Dataset Management**
- **📁 Multi-format Support**: CSV, JSON, Excel file handling
- **👀 Data Preview**: Paginated exploration with filtering
- **📤 Export Features**: Download in multiple formats
- **🔍 Analytics Per Dataset**: Individual dataset insights and stats

### 👤 **User Management & Authentication**
- **🔐 Secure Registration**: JWT-based authentication system
- **🚪 Login/Logout**: Persistent session management
- **👥 User Profiles**: Account management and preferences
- **🛡️ Protected Routes**: Secure access to dashboard features

## 🛠️ **Technology Stack**

### **Frontend Technologies**
React 18, TypeScript, Tailwind CSS, React Router, React Query, Zustand, Chart.js, Recharts

### **Backend Technologies**
Python 3.10+, HTTP Server, JSON Data Handling, CORS Support, RESTful Architecture

### **Deployment & DevOps**
Render.com, Docker, GitHub, Environment Variables

## 🚀 **Getting Started Locally**

### **Quick Setup**
```bash
# Clone the repository
git clone https://github.com/jellyfishing2346/InsightDash.git
cd InsightDash

# Setup Frontend
cd InsightDash/frontend
npm install
npm start  # Runs on http://localhost:3000

# Setup Backend (in new terminal)
cd ../backend
python3 mock_server.py  # Runs on http://localhost:8000
```

## 📊 **API Endpoints**

### **Authentication**
- POST /api/v1/auth/register    # User registration
- POST /api/v1/auth/login       # User login
- GET  /api/v1/auth/me          # Current user info

### **Analytics**
- GET /api/v1/analytics/summary           # Analytics overview
- GET /api/v1/analytics/forecasts/recent  # Recent forecasts
- GET /api/v1/analytics/models/stats      # Model statistics
- GET /api/v1/analytics/models/compare    # Model comparison

### **Datasets**
- GET    /api/v1/datasets                 # List all datasets
- GET    /api/v1/datasets/{id}            # Get specific dataset
- GET    /api/v1/datasets/{id}/preview    # Preview dataset data
- GET    /api/v1/datasets/{id}/analytics  # Dataset analytics
- GET    /api/v1/datasets/{id}/export     # Export dataset

## 🌟 **Live Demo Usage**

### **Step-by-Step Guide**
1. **🌐 Visit**: [https://insightdash-frontend.onrender.com](https://insightdash-frontend.onrender.com)
2. **👤 Register**: Click "Sign Up" and fill in any username, email, and password
3. **🚪 Login**: Use your created credentials
4. **📊 Explore Dashboard**: View analytics summary cards, forecasts, model performance
5. **💾 Browse Datasets**: Navigate to "Datasets", preview sample data
6. **🔮 Analytics Features**: Go to "Analytics" section, view model comparisons

## 🏆 **Deployment Achievement**

This project demonstrates a complete **full-stack deployment** including:

- ✅ **Frontend Deployment**: React app with TypeScript and modern tooling
- ✅ **Backend Deployment**: Python mock server with comprehensive API
- ✅ **Environment Configuration**: Production-ready settings and variables  
- ✅ **CORS Resolution**: Proper cross-origin request handling
- ✅ **Authentication Flow**: Complete user registration and login system
- ✅ **API Integration**: Seamless frontend-backend communication
- ✅ **Error Handling**: Robust error management and user feedback
- ✅ **Performance Optimization**: Fast loading and responsive design

---

**⭐ Star this repository if you found it helpful!**

**🔗 Live Links:**
- **Frontend**: [https://insightdash-frontend.onrender.com](https://insightdash-frontend.onrender.com)  
- **Backend**: [https://insightdash-backend.onrender.com](https://insightdash-backend.onrender.com)
