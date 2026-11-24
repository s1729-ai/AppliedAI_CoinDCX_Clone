import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';
import authRoutes from './routes/authRoutes';
import marketRoutes from './routes/marketRoutes';
import spotRoutes from './routes/spotRoutes';
import futuresRoutes from './routes/futuresRoutes';
import walletRoutes from './routes/walletRoutes';
import portfolioRoutes from './routes/portfolioRoutes';
import aiRoutes from './routes/aiRoutes';
import { syncCoinDCXTickers } from './services/marketDataService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/spot', spotRoutes);
app.use('/api/futures', futuresRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'CoinDCX Demo Backend API',
    version: '1.0.0',
    mode: 'Educational Simulation',
    timestamp: new Date(),
  });
});

const startServer = async () => {
  await connectDB();
  // Initial sync with CoinDCX market ticker
  syncCoinDCXTickers().catch(() => {});

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` CoinDCX Demo API Server running on port ${PORT}`);
    console.log(` URL: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
};

startServer();
