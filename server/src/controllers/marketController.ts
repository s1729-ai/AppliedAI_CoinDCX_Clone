import { Request, Response } from 'express';
import { marketDataService } from '../services/marketDataService';
import { dbStore } from '../dbStore';
import { AuthRequest } from '../middleware/auth';

export const marketController = {
  getCoins(req: Request, res: Response) {
    const coins = marketDataService.getAllCoins();
    return res.json({ success: true, count: coins.length, data: coins });
  },

  getCoin(req: Request, res: Response) {
    const symbol = String(req.params.symbol || '');
    const coin = marketDataService.getCoinBySymbol(symbol);
    if (!coin) {
      return res.status(404).json({ success: false, message: 'Coin not found' });
    }
    return res.json({ success: true, data: coin });
  },

  getFutures(req: Request, res: Response) {
    const futures = marketDataService.getAllFutures();
    return res.json({ success: true, count: futures.length, data: futures });
  },

  getFuturesPair(req: Request, res: Response) {
    const pair = String(req.params.pair || '');
    const fut = marketDataService.getFuturesBySymbol(pair);
    if (!fut) {
      return res.status(404).json({ success: false, message: 'Futures pair not found' });
    }
    return res.json({ success: true, data: fut });
  },

  getCandles(req: Request, res: Response) {
    const symbol = String(req.params.symbol || '');
    const timeframe = (req.query.timeframe as string) || '15m';
    const count = parseInt(req.query.count as string) || 80;
    const candles = marketDataService.generateCandlesticks(symbol, timeframe, count);
    return res.json({ success: true, data: candles });
  },

  getOrderBook(req: Request, res: Response) {
    const symbol = String(req.params.symbol || '');
    const orderBook = marketDataService.generateOrderBook(symbol);
    return res.json({ success: true, data: orderBook });
  },

  getRecentTrades(req: Request, res: Response) {
    const symbol = String(req.params.symbol || '');
    const trades = marketDataService.generateRecentTrades(symbol);
    return res.json({ success: true, data: trades });
  },

  async getWatchlist(req: AuthRequest, res: Response) {
    const userId = req.user?.id || 'demo-user';
    const symbols = await dbStore.getWatchlist(userId);
    return res.json({ success: true, data: symbols });
  },

  async toggleWatchlist(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ success: false, message: 'Symbol is required' });

    const updated = await dbStore.toggleWatchlist(userId, symbol);
    return res.json({ success: true, data: updated });
  },
};
