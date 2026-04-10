import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import sensorRoutes from './routes/sensor.routes';
import probeRoutes from './routes/probe.routes';
import irrigationRoutes from './routes/irrigation.routes';
import weatherRoutes from './routes/weather.routes';
import alertRoutes from './routes/alert.routes';
import reportRoutes from './routes/report.routes';
import cropDataRoutes from './routes/cropData.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import deviceRoutes from './routes/device.routes';

// Import middleware
import errorHandler from './middleware/errorHandler';
import { authenticate } from './middleware/auth';

// Import database connection
import connectDB from './config/database';

// Import logger
import logger from './config/logger';
import { startMqttService, stopMqttService } from './services/mqtt.service';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// ============= SECURITY MIDDLEWARE =============
app.use(helmet());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
});

app.use(limiter);

// ============= LOGGING MIDDLEWARE =============
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  const logDir = process.env.LOG_DIR || './logs';
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

// ============= BODY PARSER MIDDLEWARE =============
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============= CORS MIDDLEWARE =============
app.use(cors({
  origin: true, // reflect request origin — works with credentials on all domains
  credentials: true,
  optionsSuccessStatus: 200
}));

// ============= HEALTH CHECK =============
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV 
  });
});

// ============= PUBLIC ROUTES =============
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/device', deviceRoutes); // ESP32 device endpoint (API key auth)

// ============= PROTECTED ROUTES =============
app.use('/api/sensors', apiLimiter, authenticate, sensorRoutes);
app.use('/api/probes', apiLimiter, authenticate, probeRoutes);
app.use('/api/irrigation', apiLimiter, irrigationRoutes);
app.use('/api/weather', authenticate, weatherRoutes);
app.use('/api/alerts', apiLimiter, authenticate, alertRoutes);
app.use('/api/reports', apiLimiter, authenticate, reportRoutes);
app.use('/api/crop-data', authenticate, cropDataRoutes);
app.use('/api/users', authenticate, userRoutes);

// ============= 404 HANDLER =============
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  });
});

// ============= ERROR HANDLER =============
app.use(errorHandler);

// ============= START SERVER =============
const server = app.listen(PORT, () => {
  logger.info(`🚀 FertoBot API Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API Documentation: http://localhost:${PORT}/api/docs`);
  startMqttService();
});

// ============= GRACEFUL SHUTDOWN =============
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  stopMqttService();
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  stopMqttService();
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;
