import { Request, Response } from 'express';
import axios from 'axios';
import { marketDataService } from '../services/marketDataService';
import { dbStore } from '../dbStore';
import { AuthRequest } from '../middleware/auth';

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || 'http://localhost:8000';

// Mathematical Technical Indicator Calculations
const calculateIndicators = (prices: number[]) => {
  if (prices.length < 14) return { rsi: 50, macd: 0, signal: 0, sma20: 0, sma50: 0, score: 50 };

  // RSI 14
  let gains = 0;
  let losses = 0;
  for (let i = prices.length - 14; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = Number((100 - 100 / (1 + rs)).toFixed(1));

  // Moving Averages
  const sma20 = Number(
    (prices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, prices.length)).toFixed(2)
  );
  const sma50 = Number(
    (prices.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, prices.length)).toFixed(2)
  );

  // EMA12 & EMA26 for MACD
  const k12 = 2 / (12 + 1);
  const k26 = 2 / (26 + 1);
  let ema12 = prices[0];
  let ema26 = prices[0];
  prices.forEach((p) => {
    ema12 = p * k12 + ema12 * (1 - k12);
    ema26 = p * k26 + ema26 * (1 - k26);
  });
  const macd = Number((ema12 - ema26).toFixed(2));
  const signal = Number((macd * 0.85).toFixed(2));

  // Sentiment score (0: Extreme Bearish, 100: Extreme Bullish)
  let score = 50;
  if (rsi > 70) score -= 15; // Overbought
  else if (rsi < 30) score += 20; // Oversold opportunity
  else if (rsi > 50) score += 10;

  if (macd > signal) score += 15;
  else score -= 10;

  const current = prices[prices.length - 1];
  if (current > sma20) score += 10;
  else score -= 10;

  score = Math.max(10, Math.min(95, score));

  return { rsi, macd, signal, sma20, sma50, score };
};

export const aiController = {
  // A. AI Market Analyst
  async getMarketAnalysis(req: Request, res: Response) {
    try {
      // Try Python AI service first
      try {
        const resp = await axios.get(`${PYTHON_AI_URL}/ai/market-analysis`, { timeout: 1500 });
        if (resp.data && resp.data.success) {
          return res.json(resp.data);
        }
      } catch (e) {
        // Fall back to built-in analytics engine
      }

      const coins = marketDataService.getAllCoins();
      const analyses = coins.slice(0, 6).map((coin) => {
        const candles = marketDataService.generateCandlesticks(coin.symbol, '15m', 60);
        const closes = candles.map((c) => c.close);
        const ind = calculateIndicators(closes);

        let signalType: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL' = 'NEUTRAL';
        if (ind.score >= 75) signalType = 'STRONG_BUY';
        else if (ind.score >= 60) signalType = 'BUY';
        else if (ind.score <= 30) signalType = 'STRONG_SELL';
        else if (ind.score <= 45) signalType = 'SELL';

        return {
          symbol: coin.symbol,
          name: coin.name,
          price: coin.lastPrice,
          change24h: coin.change24h,
          rsi: ind.rsi,
          macd: ind.macd,
          signal: ind.signal,
          sma20: ind.sma20,
          sma50: ind.sma50,
          score: ind.score,
          signalType,
          summary: `${coin.name} is currently showing a ${signalType.replace('_', ' ')} outlook. RSI at ${ind.rsi} indicates ${
            ind.rsi > 70 ? 'overbought levels, exercise caution' : ind.rsi < 35 ? 'oversold accumulation levels' : 'healthy momentum'
          }. 20-period SMA stands at ₹${ind.sma20.toLocaleString('en-IN')}.`,
        };
      });

      return res.json({
        success: true,
        marketSentiment: 'Greed (Bullish Sentiment)',
        fearGreedIndex: 68,
        analyzedAt: new Date(),
        data: analyses,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // B. AI Coin Analyzer
  async analyzeCoin(req: Request, res: Response) {
    try {
      const symbol = String(req.params.symbol || 'BTC').toUpperCase();
      const coin = marketDataService.getCoinBySymbol(symbol);
      if (!coin) {
        return res.status(404).json({ success: false, message: 'Coin not found' });
      }

      // Try Python AI service
      try {
        const resp = await axios.post(`${PYTHON_AI_URL}/ai/analyze-coin`, { symbol }, { timeout: 1500 });
        if (resp.data && resp.data.success) {
          return res.json(resp.data);
        }
      } catch (e) {
        // Fall back to built-in engine
      }

      const candles = marketDataService.generateCandlesticks(symbol, '15m', 80);
      const closes = candles.map((c) => c.close);
      const ind = calculateIndicators(closes);

      // Support & Resistance
      const sortedCloses = [...closes].sort((a, b) => a - b);
      const support = sortedCloses[Math.floor(sortedCloses.length * 0.15)];
      const resistance = sortedCloses[Math.floor(sortedCloses.length * 0.85)];

      // Volatility calculation (Standard Deviation)
      const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
      const variance = closes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / closes.length;
      const stdDev = Math.sqrt(variance);
      const volatilityPercent = Number(((stdDev / mean) * 100).toFixed(2));

      let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH' = 'MODERATE';
      if (volatilityPercent > 5) riskLevel = 'VERY_HIGH';
      else if (volatilityPercent > 3) riskLevel = 'HIGH';
      else if (volatilityPercent < 1.5) riskLevel = 'LOW';

      return res.json({
        success: true,
        data: {
          symbol: coin.symbol,
          name: coin.name,
          logo: coin.logo,
          price: coin.lastPrice,
          change24h: coin.change24h,
          technicalIndicators: {
            rsi: ind.rsi,
            macd: ind.macd,
            signalLine: ind.signal,
            sma20: ind.sma20,
            sma50: ind.sma50,
            support: Number(support.toFixed(2)),
            resistance: Number(resistance.toFixed(2)),
          },
          metrics: {
            sentimentScore: ind.score,
            volatility: volatilityPercent,
            riskLevel,
            trendDirection: coin.change24h >= 0 ? 'BULLISH' : 'BEARISH',
          },
          aiSummary: `${coin.name} (${coin.symbol}) shows ${coin.change24h >= 0 ? 'upward' : 'downward'} pressure with 24h change of ${coin.change24h}%. Technical indicators reveal RSI at ${ind.rsi} with key immediate resistance at ₹${resistance.toLocaleString('en-IN')} and foundational support at ₹${support.toLocaleString('en-IN')}. Volatility is rated ${riskLevel} (${volatilityPercent}%).`,
          recommendation: ind.score > 60 ? 'Accumulate on dips near support levels with a tight stop-loss.' : 'Wait for confirmation of breakout above resistance before opening new long positions.',
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // C. AI Trading Assistant Chatbot
  async chatAssistant(req: AuthRequest, res: Response) {
    try {
      const { message, history } = req.body;
      const userId = req.user?.id;
      if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

      // Check if user is asking about their portfolio or history
      let userContext = '';
      if (userId) {
        const wallet = await dbStore.getWalletByUserId(userId);
        const orders = await dbStore.getOrdersByUserId(userId);
        const positions = await dbStore.getFuturesPositionsByUserId(userId);
        userContext = `User INR balance: ₹${wallet?.inrBalance?.toLocaleString('en-IN') || 0}. Holdings: ${
          wallet?.coinBalances?.filter((b) => b.free > 0).map((b) => `${b.free} ${b.coin}`).join(', ') || 'None'
        }. Total orders placed: ${orders.length}. Open futures positions: ${
          positions.filter((p) => p.status === 'OPEN').length
        }.`;
      }

      // Try Python AI service
      try {
        const resp = await axios.post(
          `${PYTHON_AI_URL}/ai/chat`,
          { message, history, context: userContext },
          { timeout: 3500 }
        );
        if (resp.data && resp.data.reply) {
          return res.json({ success: true, reply: resp.data.reply });
        }
      } catch (e) {
        // Fall back to comprehensive intelligent conversational engine
      }

      const lower = message.toLowerCase();
      let reply = '';

      if (lower.includes('what is cryptocurrency') || lower.includes('crypto')) {
        reply = `**Cryptocurrency** is a digital or virtual currency that is secured by cryptography and runs on decentralized peer-to-peer networks known as blockchains (like Bitcoin and Ethereum). Unlike traditional fiat currency issued by central banks (like INR or USD), cryptocurrencies operate without central intermediaries, enabling global, 24/7 transfers, transparency, and programmable smart contracts.`;
      } else if (lower.includes('futures') || lower.includes('what is futures')) {
        reply = `**Futures Trading** is an agreement to buy or sell an asset at a predetermined price at a specified time in the future. In crypto derivatives, you can trade perpetual contracts with **leverage** (up to 50x on CoinDCX Demo), allowing you to profit from both rising markets (**Long**) and falling markets (**Short**) without owning the underlying cryptocurrency. Always monitor liquidation prices when using leverage!`;
      } else if (lower.includes('long') || lower.includes('short')) {
        reply = `**Long vs Short Trading:**\n\n• **LONG (Buy):** You expect the asset price to rise. Profit formula: \`(Exit Price - Entry Price) × Quantity\`.\n• **SHORT (Sell):** You expect the asset price to fall. Profit formula: \`(Entry Price - Exit Price) × Quantity\`.\n\nOn CoinDCX Demo, you can test both strategies risk-free using our virtual simulator!`;
      } else if (lower.includes('leverage')) {
        reply = `**Leverage** allows you to trade position sizes larger than your actual account balance. For example, with **10x leverage**, ₹10,000 margin allows you to control a ₹1,00,000 position.\n\n⚠️ **Risk Note:** While leverage multiplies your profits, it equally multiplies your losses. Higher leverage brings your **Liquidation Price** closer to your entry price!`;
      } else if (lower.includes('portfolio') || lower.includes('my balance') || lower.includes('explain my portfolio')) {
        reply = `📊 **Your Portfolio Summary:**\n\n${userContext || 'Please log in to view your real-time portfolio balance and holdings.'}\n\nYou can head over to the **Portfolio** tab to see your asset allocation pie chart, profit/loss breakdown, and historical performance curve.`;
      } else if (lower.includes('rsi') || lower.includes('relative strength index')) {
        reply = `**RSI (Relative Strength Index)** is a momentum oscillator measuring the speed and change of price movements on a scale from 0 to 100:\n\n• **RSI > 70:** Indicates an **Overbought** condition (price may be primed for a pullback or consolidation).\n• **RSI < 30:** Indicates an **Oversold** condition (potential accumulation or bounce zone).\n• **RSI ~ 50:** Neutral momentum.\n\nPro Tip: Check divergence between price and RSI for powerful reversal signals!`;
      } else if (lower.includes('macd')) {
        reply = `**MACD (Moving Average Convergence Divergence)** tracks trend momentum by subtracting the 26-period EMA from the 12-period EMA. A 9-period EMA acts as the "Signal Line":\n\n• **Bullish Cross:** MACD line crosses above Signal line (buying signal).\n• **Bearish Cross:** MACD line crosses below Signal line (selling signal).\n• **Histogram:** Shows the distance between the two lines, highlighting accelerating or decelerating momentum.`;
      } else if (lower.includes('bitcoin') || lower.includes('btc')) {
        const btc = marketDataService.getCoinBySymbol('BTC');
        reply = `**Bitcoin (BTC) Status:**\nCurrent Price: ₹${btc?.lastPrice.toLocaleString('en-IN')} (24h Change: ${btc?.change24h}%).\nBTC remains the market bellwether and gold standard of crypto. On CoinDCX Demo, you can trade BTC/INR in Spot or BTCUSDT with up to 50x leverage in Futures!`;
      } else {
        reply = `Hello! I am your **CoinDCX AI Trading Coach**. You can ask me about:\n\n1. Technical indicators like RSI, MACD, Moving Averages\n2. Futures concepts: Long, Short, Leverage & Liquidation\n3. Your personal portfolio analysis and simulated trade review\n4. Coin analysis on BTC, ETH, SOL, XRP, and more!\n\nWhat would you like to explore today?`;
      }

      return res.json({ success: true, reply });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // D. AI Trade Review
  async getTradeReview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const orders = await dbStore.getOrdersByUserId(userId);
      const positions = await dbStore.getFuturesPositionsByUserId(userId);

      const closedPositions = positions.filter((p) => p.status === 'CLOSED');
      const winningTrades = closedPositions.filter((p) => (p.realizedPnl || 0) > 0);
      const losingTrades = closedPositions.filter((p) => (p.realizedPnl || 0) < 0);

      const totalTrades = orders.length + closedPositions.length;
      const winRate = closedPositions.length > 0 ? Number(((winningTrades.length / closedPositions.length) * 100).toFixed(1)) : 70; // Benchmark demo rate

      const totalWinAmount = winningTrades.reduce((acc, p) => acc + (p.realizedPnl || 0), 0);
      const totalLossAmount = Math.abs(losingTrades.reduce((acc, p) => acc + (p.realizedPnl || 0), 0));
      const profitFactor = totalLossAmount > 0 ? Number((totalWinAmount / totalLossAmount).toFixed(2)) : 2.15;

      const recommendations = [
        'Maintain a risk-reward ratio of at least 1:2 on futures trades.',
        'Always establish pre-set Stop-Loss orders prior to opening leveraged positions.',
        'Diversify your holdings across large-cap (BTC, ETH) and high-growth altcoins (SOL, LINK).',
        'Avoid exceeding 10x leverage during periods of high macroeconomic volatility.',
      ];

      return res.json({
        success: true,
        data: {
          totalTrades,
          spotOrdersCount: orders.length,
          futuresTradesCount: closedPositions.length,
          winRate,
          profitFactor,
          profitableTrades: winningTrades.length,
          losingTrades: losingTrades.length,
          riskExposure: positions.some((p) => p.leverage > 20) ? 'HIGH' : 'CONTROLLED',
          tradingPattern: winRate >= 50 ? 'Disciplined Trend Follower' : 'Aggressive Scalper',
          recommendations,
          summary: `You have executed ${totalTrades} simulated trades across Spot and Futures. Your current win rate stands at ${winRate}%, with a profit factor of ${profitFactor}. Continue practicing strict risk management with our virtual capital!`,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
