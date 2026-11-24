import { Router } from 'express';
import { aiController } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/market-analysis', aiController.getMarketAnalysis);
router.get('/analyze-coin/:symbol', aiController.analyzeCoin);
router.post('/chat', authenticateToken as any, aiController.chatAssistant as any);
router.get('/trade-review', authenticateToken as any, aiController.getTradeReview as any);

export default router;
