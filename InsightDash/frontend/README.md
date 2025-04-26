# InsightDash Frontend

Modern React application for the InsightDash real-time data analytics dashboard.

## Tech Stack

- **React 18** - Modern React with hooks
- **TailwindCSS** - Utility-first CSS framework
- **D3.js & Recharts** - Data visualization
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Features

- ✅ Real-time data visualization
- ✅ Interactive dashboards
- ✅ Predictive analytics charts
- ✅ Role-based authentication
- ✅ Responsive design
- ✅ WebSocket integration
- ✅ Modern UI/UX

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update environment variables:
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000/api/v1/ws/live-data
```

4. Start development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard widgets
│   ├── datasets/       # Dataset management
│   └── analytics/      # Analytics components
├── hooks/              # Custom React hooks
├── services/           # API and WebSocket services
├── stores/             # Zustand state stores
├── utils/              # Utility functions
└── App.jsx             # Main application component
```

## Key Components

### Dashboard
- Real-time data visualization
- Predictive analytics charts
- Activity feed
- Statistics cards

### Datasets
- Dataset management
- Data source configuration
- Schema visualization

### Analytics
- Forecast generation
- Model selection
- Performance metrics

## API Integration

The frontend integrates with the FastAPI backend through:

- REST API endpoints for CRUD operations
- WebSocket connection for real-time updates
- JWT authentication
- Automatic token refresh

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |
| `REACT_APP_WS_URL` | WebSocket URL | `ws://localhost:8000/api/v1/ws/live-data` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
