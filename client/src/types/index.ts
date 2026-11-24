export interface ICoin {
  _id: string;
  symbol: string;
  name: string;
  logo: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  circulatingSupply: number;
  description: string;
  isListed: boolean;
  sparkline?: number[];
  updatedAt: string;
}

export interface IFuturesTicker {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  fundingRate: number;
  openInterest: number;
  indexPrice: number;
  markPrice: number;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isKycVerified: boolean;
  demoNoticeAcknowledged?: boolean;
}

export interface ICoinBalance {
  coin: string;
  free: number;
  locked: number;
  avgBuyPrice: number;
  currentPrice?: number;
  currentValue?: number;
  investedValue?: number;
  pnl?: number;
  pnlPercent?: number;
}

export interface IWalletData {
  inrBalance: number;
  cryptoValueInr: number;
  totalPortfolioValue: number;
  coinBalances: ICoinBalance[];
  totalDeposited: number;
  totalWithdrawn: number;
}

export interface IOrder {
  _id: string;
  userId: string;
  pair: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  price: number;
  quantity: number;
  totalInr: number;
  executedQuantity: number;
  fee: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  createdAt: string;
}

export interface IFuturesPosition {
  _id: string;
  userId: string;
  pair: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  leverage: number;
  margin: number;
  marginType: 'CROSS' | 'ISOLATED';
  liquidationPrice: number;
  takeProfit?: number;
  stopLoss?: number;
  unrealizedPnl: number;
  roe?: number;
  unrealizedPnlInr?: number;
  realizedPnl: number;
  status: 'OPEN' | 'CLOSED';
  closedPrice?: number;
  closedAt?: string;
  createdAt: string;
}

export interface ITransaction {
  _id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'SPOT_BUY' | 'SPOT_SELL' | 'FUTURES_MARGIN' | 'FUTURES_PNL' | 'TRANSFER';
  amount: number;
  currency: string;
  fee: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  txHash: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface IPortfolioHolding {
  coin: string;
  name: string;
  logo: string;
  quantity: number;
  locked: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
  change24h: number;
}

export interface IPortfolioData {
  totalPortfolioValue: number;
  totalInvestment: number;
  inrBalance: number;
  cryptoValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dailyPnl: number;
  dailyPnlPercent: number;
  holdings: IPortfolioHolding[];
  allocation: {
    label: string;
    symbol: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  performanceHistory: {
    date: string;
    value: number;
  }[];
}

export interface IAIMarketAnalysisItem {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  rsi: number;
  macd: number;
  signal: number;
  sma20: number;
  sma50: number;
  score: number;
  signalType: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  summary: string;
}

export interface IAICoinAnalysis {
  symbol: string;
  name: string;
  logo: string;
  price: number;
  change24h: number;
  technicalIndicators: {
    rsi: number;
    macd: number;
    signalLine: number;
    sma20: number;
    sma50: number;
    support: number;
    resistance: number;
  };
  metrics: {
    sentimentScore: number;
    volatility: number;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
    trendDirection: 'BULLISH' | 'BEARISH';
  };
  aiSummary: string;
  recommendation: string;
}

export interface IAITradeReview {
  totalTrades: number;
  spotOrdersCount: number;
  futuresTradesCount: number;
  winRate: number;
  profitFactor: number;
  profitableTrades: number;
  losingTrades: number;
  riskExposure: 'CONTROLLED' | 'MODERATE' | 'HIGH';
  tradingPattern: string;
  recommendations: string[];
  summary: string;
}
