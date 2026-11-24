import { Router } from 'express';
import { spotTradingController } from '../controllers/spotTradingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/order', authenticateToken as any, spotTradingController.placeOrder as any);
router.get('/orders', authenticateToken as any, spotTradingController.getOrders as any);

export default router;
