import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dbStore } from '../dbStore';
import { marketDataService } from '../services/marketDataService';
import { IFuturesPosition } from '../types';

export const futuresTradingController = {
  async openPosition(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { pair, side, type, quantity, leverage, marginType, takeProfit, stopLoss } = req.body;
      if (!pair || !side || !quantity || !leverage) {
        return res.status(400).json({ success: false, message: 'Missing futures trade parameters' });
      }

      const fut = marketDataService.getFuturesBySymbol(pair);
      if (!fut) {
        return res.status(404).json({ success: false, message: 'Futures market not found' });
      }

      const currentPrice = fut.lastPrice;
      const numLeverage = Math.max(1, Math.min(50, Number(leverage)));
      const numQty = Number(quantity);
      const positionValue = numQty * currentPrice; // in USDT
      const usdtToInrRate = 86.5; // Virtual conversion rate 1 USDT = ₹86.50
      const marginUsdt = positionValue / numLeverage;
      const requiredMarginInr = marginUsdt * usdtToInrRate;

      const wallet = await dbStore.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(404).json({ success: false, message: 'Wallet not found' });
      }

      if (wallet.inrBalance < requiredMarginInr) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance for margin. Required: ₹${requiredMarginInr.toFixed(2)} (${marginUsdt.toFixed(2)} USDT), Available: ₹${wallet.inrBalance.toLocaleString('en-IN')}`,
        });
      }

      // Calculate liquidation price
      // Maintenance margin rate ~0.5% (0.005)
      const mmr = 0.005;
      let liquidationPrice = 0;
      if (side === 'LONG') {
        liquidationPrice = currentPrice * (1 - 1 / numLeverage + mmr);
      } else {
        liquidationPrice = currentPrice * (1 + 1 / numLeverage - mmr);
      }
      liquidationPrice = Math.max(0, Number(liquidationPrice.toFixed(2)));

      // Deduct margin from INR wallet
      wallet.inrBalance -= requiredMarginInr;
      await dbStore.updateWallet(wallet);

      // Create Futures Position
      const position = await dbStore.createFuturesPosition({
        userId,
        pair: fut.symbol,
        side,
        entryPrice: currentPrice,
        currentPrice,
        quantity: numQty,
        leverage: numLeverage,
        margin: Number(marginUsdt.toFixed(2)),
        marginType: marginType || 'ISOLATED',
        liquidationPrice,
        takeProfit: takeProfit ? Number(takeProfit) : undefined,
        stopLoss: stopLoss ? Number(stopLoss) : undefined,
        unrealizedPnl: 0,
        realizedPnl: 0,
        status: 'OPEN',
      });

      // Transaction log
      await dbStore.createTransaction({
        userId,
        type: 'FUTURES_MARGIN',
        amount: requiredMarginInr,
        currency: 'INR',
        fee: 0,
        status: 'COMPLETED',
        metadata: {
          pair: fut.symbol,
          side,
          leverage: numLeverage,
          positionId: position._id,
        },
      });

      // Notification
      await dbStore.addNotification({
        userId,
        title: `Opened ${numLeverage}x ${side} Position on ${fut.symbol}`,
        message: `Entry: $${currentPrice.toLocaleString()} | Margin: $${marginUsdt.toFixed(2)} (₹${requiredMarginInr.toFixed(2)}) | Liq: $${liquidationPrice.toLocaleString()}`,
        type: 'TRADE',
      });

      return res.json({
        success: true,
        message: `Opened ${numLeverage}x ${side} on ${fut.symbol}`,
        position,
        wallet: {
          inrBalance: wallet.inrBalance,
          coinBalances: wallet.coinBalances,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getPositions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const positions = await dbStore.getFuturesPositionsByUserId(userId);
      const usdtToInrRate = 86.5;

      // Dynamically calculate live Unrealized P&L
      const openPositions = positions
        .filter((p) => p.status === 'OPEN')
        .map((p) => {
          const fut = marketDataService.getFuturesBySymbol(p.pair);
          const livePrice = fut?.lastPrice || p.currentPrice;

          let pnlUsdt = 0;
          if (p.side === 'LONG') {
            pnlUsdt = (livePrice - p.entryPrice) * p.quantity;
          } else {
            pnlUsdt = (p.entryPrice - livePrice) * p.quantity;
          }

          const roe = (pnlUsdt / p.margin) * 100;

          return {
            ...p,
            currentPrice: livePrice,
            unrealizedPnl: Number(pnlUsdt.toFixed(2)),
            roe: Number(roe.toFixed(2)),
            unrealizedPnlInr: Number((pnlUsdt * usdtToInrRate).toFixed(2)),
          };
        });

      const closedPositions = positions.filter((p) => p.status === 'CLOSED');

      return res.json({
        success: true,
        data: {
          open: openPositions,
          closed: closedPositions,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async closePosition(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { positionId } = req.body;
      if (!positionId) return res.status(400).json({ success: false, message: 'Position ID is required' });

      const positions = await dbStore.getFuturesPositionsByUserId(userId);
      const pos = positions.find((p) => p._id === positionId && p.status === 'OPEN');
      if (!pos) {
        return res.status(404).json({ success: false, message: 'Open position not found' });
      }

      const fut = marketDataService.getFuturesBySymbol(pos.pair);
      const closePrice = fut?.lastPrice || pos.currentPrice;

      // Calculate realized P&L
      let pnlUsdt = 0;
      if (pos.side === 'LONG') {
        pnlUsdt = (closePrice - pos.entryPrice) * pos.quantity;
      } else {
        pnlUsdt = (pos.entryPrice - closePrice) * pos.quantity;
      }

      const usdtToInrRate = 86.5;
      const initialMarginInr = pos.margin * usdtToInrRate;
      const pnlInr = pnlUsdt * usdtToInrRate;
      const totalRefundInr = Math.max(0, initialMarginInr + pnlInr);

      // Refund margin + P&L to INR wallet
      const wallet = await dbStore.getWalletByUserId(userId);
      if (wallet) {
        wallet.inrBalance += totalRefundInr;
        await dbStore.updateWallet(wallet);
      }

      // Update position status
      pos.status = 'CLOSED';
      pos.closedPrice = closePrice;
      pos.closedAt = new Date();
      pos.realizedPnl = Number(pnlUsdt.toFixed(2));
      pos.unrealizedPnl = 0;
      await dbStore.updateFuturesPosition(pos);

      // Record transaction
      await dbStore.createTransaction({
        userId,
        type: 'FUTURES_PNL',
        amount: Math.abs(pnlInr),
        currency: 'INR',
        fee: 0,
        status: 'COMPLETED',
        metadata: {
          pair: pos.pair,
          side: pos.side,
          realizedPnlUsdt: Number(pnlUsdt.toFixed(2)),
          realizedPnlInr: Number(pnlInr.toFixed(2)),
          closePrice,
        },
      });

      // Notification
      const pnlPrefix = pnlUsdt >= 0 ? '+' : '';
      await dbStore.addNotification({
        userId,
        title: `Closed ${pos.side} Position: ${pos.pair}`,
        message: `Closed at $${closePrice.toLocaleString()} | Realized P&L: ${pnlPrefix}$${pnlUsdt.toFixed(2)} (${pnlPrefix}₹${pnlInr.toFixed(2)})`,
        type: pnlUsdt >= 0 ? 'SUCCESS' : 'WARNING',
      });

      return res.json({
        success: true,
        message: `Position closed with ${pnlPrefix}$${pnlUsdt.toFixed(2)} P&L`,
        position: pos,
        wallet: {
          inrBalance: wallet?.inrBalance,
          coinBalances: wallet?.coinBalances,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateTPSL(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { positionId, takeProfit, stopLoss } = req.body;
      const positions = await dbStore.getFuturesPositionsByUserId(userId);
      const pos = positions.find((p) => p._id === positionId && p.status === 'OPEN');
      if (!pos) {
        return res.status(404).json({ success: false, message: 'Position not found' });
      }

      pos.takeProfit = takeProfit ? Number(takeProfit) : undefined;
      pos.stopLoss = stopLoss ? Number(stopLoss) : undefined;
      await dbStore.updateFuturesPosition(pos);

      return res.json({ success: true, message: 'TP/SL updated successfully', position: pos });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
