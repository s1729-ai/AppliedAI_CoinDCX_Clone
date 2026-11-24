import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dbStore } from '../dbStore';
import { marketDataService } from '../services/marketDataService';

export const portfolioController = {
  async getPortfolio(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      let wallet = await dbStore.getWalletByUserId(userId);
      if (!wallet) wallet = await dbStore.createWallet(userId);

      const coins = marketDataService.getAllCoins();
      const priceMap = new Map<string, (typeof coins)[0]>();
      coins.forEach((c) => priceMap.set(c.symbol.toUpperCase(), c));

      let totalCryptoValue = 0;
      let totalCostBasis = 0;
      let totalDailyPnl = 0;

      const holdings = wallet.coinBalances
        .filter((b) => b.free > 0 || b.locked > 0)
        .map((b) => {
          const coinData = priceMap.get(b.coin.toUpperCase());
          const currentPrice = coinData?.lastPrice || 0;
          const change24h = coinData?.change24h || 0;
          const totalQty = b.free + b.locked;
          const currentValue = totalQty * currentPrice;
          const costBasis = totalQty * (b.avgBuyPrice || currentPrice);
          const pnl = currentValue - costBasis;
          const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
          const dailyChangeAmount = currentValue * (change24h / 100);

          totalCryptoValue += currentValue;
          totalCostBasis += costBasis;
          totalDailyPnl += dailyChangeAmount;

          return {
            coin: b.coin,
            name: coinData?.name || b.coin,
            logo: coinData?.logo || '',
            quantity: b.free,
            locked: b.locked,
            avgBuyPrice: b.avgBuyPrice || currentPrice,
            currentPrice,
            currentValue: Number(currentValue.toFixed(2)),
            costBasis: Number(costBasis.toFixed(2)),
            pnl: Number(pnl.toFixed(2)),
            pnlPercent: Number(pnlPercent.toFixed(2)),
            change24h,
          };
        });

      const totalPortfolioValue = wallet.inrBalance + totalCryptoValue;
      const initialDeposit = wallet.totalDeposited || 1000000;
      const totalPnl = totalPortfolioValue - initialDeposit;
      const totalPnlPercent = initialDeposit > 0 ? (totalPnl / initialDeposit) * 100 : 0;

      // Asset Allocation
      const allocation = [];
      if (wallet.inrBalance > 0) {
        allocation.push({
          label: 'INR Cash',
          symbol: 'INR',
          value: Number(wallet.inrBalance.toFixed(2)),
          percentage: Number(((wallet.inrBalance / totalPortfolioValue) * 100).toFixed(1)),
          color: '#0052fe',
        });
      }

      const colors = ['#f7931a', '#627eea', '#14f195', '#e6007a', '#375bd2', '#f3ba2f'];
      holdings.forEach((h, idx) => {
        if (h.currentValue > 0) {
          allocation.push({
            label: h.name,
            symbol: h.coin,
            value: h.currentValue,
            percentage: Number(((h.currentValue / totalPortfolioValue) * 100).toFixed(1)),
            color: colors[idx % colors.length],
          });
        }
      });

      // Simulated 7-day performance history
      const performanceHistory = [];
      const days = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];
      for (let i = 0; i < 7; i++) {
        const drift = 1 - (6 - i) * 0.006 + (Math.sin(i) * 0.008);
        performanceHistory.push({
          date: days[i],
          value: Number((totalPortfolioValue * drift).toFixed(2)),
        });
      }

      return res.json({
        success: true,
        data: {
          totalPortfolioValue: Number(totalPortfolioValue.toFixed(2)),
          totalInvestment: initialDeposit,
          inrBalance: Number(wallet.inrBalance.toFixed(2)),
          cryptoValue: Number(totalCryptoValue.toFixed(2)),
          totalPnl: Number(totalPnl.toFixed(2)),
          totalPnlPercent: Number(totalPnlPercent.toFixed(2)),
          dailyPnl: Number(totalDailyPnl.toFixed(2)),
          dailyPnlPercent: totalPortfolioValue > 0 ? Number(((totalDailyPnl / totalPortfolioValue) * 100).toFixed(2)) : 0,
          holdings,
          allocation,
          performanceHistory,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
