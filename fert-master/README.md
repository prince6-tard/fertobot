# FertoBot - Smart Agriculture Monitoring System 🌱

A modern, production-ready dashboard for agricultural IoT sensor monitoring and farm management. Built with React, TypeScript, and Material-UI.

## 📋 Features

### 🏠 Main Dashboard
- **Summary Cards**: Real-time display of key metrics (soil moisture, temperature, humidity, N-P-K levels, pH, water tank level)
- **Live Charts**: Interactive data visualizations with multiple chart types
  - Soil moisture trends with area charts
  - Temperature & humidity line graphs
  - N-P-K trinity graphs for nutrient monitoring
  - pH level trends with optimal range indicators
  - Micro/macro nutrient bar charts
- **Weather Widget**: 5-day forecast, UV index, precipitation probability
- **Connectivity Status**: Device network status, battery levels, WiFi strength
- **Smart Recommendations**: AI-powered insights and action items
- **Alerts Panel**: Real-time notifications for critical events

### 🔧 Probe Management
- **Device Overview**: Visual grid of all connected sensors
- **Group Management**: Organize probes into logical groups (fields, greenhouses)
- **Real-time Status**: Battery, connectivity, and sensor health monitoring
- **Detailed Views**: Individual probe deep-dive with historical data

### 💧 Irrigation Control
- Manual sprinkler controls
- Automated scheduling system
- Water usage tracking and optimization
- Integration with soil moisture data

### 🔐 Security & Monitoring
- Live camera stream integration
- Motion detection alerts
- Security event logging
- Remote monitoring capabilities

### 📱 Device Setup
- Bluetooth Low Energy (BLE) device discovery
- Step-by-step WiFi configuration wizard
- Device registration and pairing

### 📊 Reports & Analytics
- Weekly/monthly farm reports
- Data export (PDF, CSV, Excel)
- Historical trend analysis
- Performance metrics

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State Management**: React Query
- **Build Tool**: Vite
- **Styling**: Emotion + Custom Theme System

## 🎨 Design System

### Color Palette
- **Primary Green**: `#4CAF50` - Agriculture/growth focused
- **Secondary Orange**: `#FF9800` - Action/warning states
- **Sensor Colors**: Custom colors for different sensor types
  - Moisture: Blue (`#2196F3`)
  - Temperature: Red-orange (`#FF5722`)
  - Humidity: Cyan (`#00BCD4`)
  - Nutrients: Purple, Orange, Brown for N-P-K

### Typography
- **Font**: Inter - Modern, readable font family
- **Hierarchy**: Clear heading structure with appropriate weights

### Components
- **Cards**: Rounded corners (16px), subtle shadows, status indicators
- **Charts**: Responsive with custom tooltips and legends
- **Buttons**: Modern flat design with hover animations
- **Status Indicators**: Color-coded chips and progress bars

## 📱 Responsive Design

- **Mobile First**: Optimized for tablets and smartphones
- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 769px - 1024px
  - Desktop: > 1025px
- **Adaptive Layout**: Grid systems that reflow based on screen size
- **Touch Friendly**: Appropriately sized interactive elements

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Dashboard/       # Dashboard-specific components
│   ├── Layout/          # Navigation and app shell
│   └── ProbeManagement/ # Probe management components
├── pages/               # Route-based page components
│   ├── Dashboard/       # Main dashboard page
│   ├── ProbeManagement/ # Probe management page
│   └── ...             # Other pages
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and theme
└── hooks/               # Custom React hooks
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file for API endpoints and configuration:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/ws
```

### Theme Customization
Edit `src/utils/theme.ts` to customize colors, typography, and component styles.

## 📊 Data Integration

The dashboard is designed to work with REST APIs and WebSocket connections for real-time data. Key data types include:

- **Sensor Readings**: Soil moisture, temperature, pH, nutrients
- **Device Status**: Battery, connectivity, location
- **Weather Data**: Current conditions and forecasts
- **Alerts**: System notifications and recommendations

## 🔄 Real-time Updates

- WebSocket integration for live sensor data
- Automatic refresh intervals for critical metrics
- Push notifications for alerts and recommendations

## 🎯 UX Patterns

### Information Hierarchy
1. **Critical Status** - Immediately visible at top
2. **Key Metrics** - Summary cards with trend indicators
3. **Detailed Data** - Charts and tables in expandable sections
4. **Actions** - Context-sensitive controls and recommendations

### Interaction Design
- **Hover Effects**: Subtle animations for better feedback
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: Graceful fallbacks and retry mechanisms
- **Accessibility**: WCAG compliant with keyboard navigation

## 📈 Performance

- **Code Splitting**: Route-based lazy loading
- **Optimized Charts**: Efficient rendering for large datasets
- **Memoization**: React.memo and useMemo for expensive calculations
- **Image Optimization**: Responsive images and lazy loading

## 🔒 Security Considerations

- **Input Validation**: All user inputs sanitized
- **HTTPS Only**: Secure communication protocols
- **Authentication**: JWT-based auth (ready for integration)
- **Data Privacy**: Sensitive information protection

## 🌍 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📞 API Integration

Ready for integration with backend services. Expected endpoints:

```
GET /api/sensors          # List all sensors
GET /api/sensors/:id      # Get sensor details
GET /api/readings         # Get sensor readings
POST /api/irrigation      # Control irrigation
GET /api/weather          # Weather data
GET /api/alerts           # System alerts
```

## 🚀 Production Deployment

### Build Optimization
- Tree shaking for smaller bundle size
- Asset compression and optimization
- Service worker for offline functionality (ready for PWA)

### Monitoring
- Performance monitoring integration ready
- Error tracking and logging
- User analytics capabilities

---

## 🤝 Contributing

This dashboard provides a solid foundation for agricultural IoT applications and can be extended with additional features like:

- Machine learning predictions
- Satellite imagery integration  
- Market data and pricing
- Equipment maintenance tracking
- Multi-farm management

Built with ❤️ for sustainable agriculture and smart farming initiatives.