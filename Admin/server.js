import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Import Backend modules directly from backend workspace
import { connectDB } from '../backend/src/config/db.js';
import { seedDatabase } from '../backend/src/seed/seed.js';
import { Operator } from '../backend/src/models/Operator.js';

// Routers
import authRoutes from '../backend/src/routes/authRoutes.js';
import operatorRoutes from '../backend/src/routes/operatorRoutes.js';
import routeRoutes from '../backend/src/routes/routeRoutes.js';
import busRoutes from '../backend/src/routes/busRoutes.js';
import scheduleRoutes from '../backend/src/routes/scheduleRoutes.js';
import bookingRoutes from '../backend/src/routes/bookingRoutes.js';
import adminRoutes from '../backend/src/routes/adminRoutes.js';
import walletRoutes from '../backend/src/routes/walletRoutes.js';
import payhereRoutes from '../backend/src/routes/payhereRoutes.js';
import conductorRoutes from '../backend/src/routes/conductorRoutes.js';

// Middleware
import { notFound, errorHandler } from '../backend/src/middleware/errorMiddleware.js';

// Load environment configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envBackendPath = path.join(__dirname, '../backend/.env');
if (fs.existsSync(envBackendPath)) {
  dotenv.config({ path: envBackendPath });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[Admin Server ${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Admin Backend API Status & Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'LankaExpressway Executive Admin Backend API',
    database: 'MongoDB Atlas / Memory Server',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Mount All Backend API Routes
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/conductor', conductorRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payhere', payhereRoutes);

// Static frontend build serving if dist exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Admin Backend Server
const startAdminServer = async () => {
  try {
    await connectDB();

    const opCount = await Operator.countDocuments();
    if (opCount === 0) {
      console.log('🌱 Database empty. Auto-seeding LankaExpressway dataset...');
      await seedDatabase();
    } else {
      console.log(`ℹ️ Database contains ${opCount} transport operators.`);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Executive Admin Backend Server running at http://localhost:${PORT}`);
      console.log(`📊 Admin Panel Frontend accessible at http://localhost:5174`);
    });
  } catch (err) {
    console.error('❌ Admin Server Error:', err.message);
    process.exit(1);
  }
};

startAdminServer();
