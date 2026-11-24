export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  isKycVerified: boolean;
  demoNoticeAcknowledged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoinBalance {
  coin: string;
  free: number;
  locked: number;
  avgBuyPrice: number;
}

export interface IWallet {
  _id: string;
  userId: string;
  inrBalance: number;
  coinBalances: ICoinBalance[];
  totalDeposited: number;
  totalWithdrawn: number;
  createdAt: Date;
  updatedAt: Date;
}

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
  updatedAt: Date;
}

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAW'
  | 'SPOT_BUY'
  | 'SPOT_SELL'
  | 'FUTURES_MARGIN'
  | 'FUTURES_PNL'
  | 'TRANSFER';

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface ITransaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  fee: number;
  status: TransactionStatus;
  txHash: string;
  metadata?: Record<string, any>;
  createdAt: Date;
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
  createdAt: Date;
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
  realizedPnl: number;
  status: 'OPEN' | 'CLOSED';
  closedPrice?: number;
  closedAt?: Date;
  createdAt: Date;
}

export interface IWatchlist {
  _id: string;
  userId: string;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'TRADE' | 'PRICE_ALERT';
  isRead: boolean;
  createdAt: Date;
}

export interface IPriceAlert {
  _id: string;
  userId: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  isActive: boolean;
  createdAt: Date;
}
