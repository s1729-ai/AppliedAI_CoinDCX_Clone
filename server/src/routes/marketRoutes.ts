import { Router } from 'express';
import { marketController } from '../controllers/marketController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/coins', marketController.getCoins);
router.get('/coins/:symbol', marketController.getCoin);
router.get('/futures', marketController.getFutures);
router.get('/futures/:pair', marketController.getFuturesPair);
router.get('/candles/:symbol', marketController.getCandles);
router.get('/orderbook/:symbol', marketController.getOrderBook);
router.get('/trades/:symbol', marketController.getRecentTrades);
router.get('/watchlist', authenticateToken as any, marketController.getWatchlist as any);
router.post('/watchlist/toggle', authenticateToken as any, marketController.toggleWatchlist as any);

export default router;
