import { Router } from 'express';
import { futuresTradingController } from '../controllers/futuresTradingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/position', authenticateToken as any, futuresTradingController.openPosition as any);
router.get('/positions', authenticateToken as any, futuresTradingController.getPositions as any);
router.post('/close', authenticateToken as any, futuresTradingController.closePosition as any);
router.post('/tpsl', authenticateToken as any, futuresTradingController.updateTPSL as any);

export default router;
