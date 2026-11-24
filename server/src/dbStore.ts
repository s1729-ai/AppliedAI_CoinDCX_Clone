import fs from 'fs';
import path from 'path';
import { isDbConnected } from './db';
import { UserModel } from './models/User';
import { WalletModel } from './models/Wallet';
import { TransactionModel } from './models/Transaction';
import { OrderModel } from './models/Order';
import { FuturesPositionModel } from './models/FuturesPosition';
import { WatchlistModel } from './models/Watchlist';
import { NotificationModel } from './models/Notification';
import { PriceAlertModel } from './models/PriceAlert';
import {
  IUser,
  IWallet,
  ITransaction,
  IOrder,
  IFuturesPosition,
  IWatchlist,
  INotification,
  IPriceAlert,
} from './types';

const STORE_PATH = path.join(__dirname, '../../data/store.json');

interface StoreData {
  users: IUser[];
  wallets: IWallet[];
  transactions: ITransaction[];
  orders: IOrder[];
  futuresPositions: IFuturesPosition[];
  watchlists: IWatchlist[];
  notifications: INotification[];
  priceAlerts: IPriceAlert[];
}

const initialStore: StoreData = {
  users: [],
  wallets: [],
  transactions: [],
  orders: [],
  futuresPositions: [],
  watchlists: [],
  notifications: [],
  priceAlerts: [],
};

const loadStore = (): StoreData => {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading store file:', e);
  }
  return initialStore;
};

const saveStore = (data: StoreData) => {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing store file:', e);
  }
};

let store = loadStore();

// Helper ID generator
const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36);

export const dbStore = {
  // Users
  async findUserByEmail(email: string): Promise<IUser | null> {
    if (isDbConnected()) {
      return (await UserModel.findOne({ email: email.toLowerCase() })) as unknown as IUser;
    }
    return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id: string): Promise<IUser | null> {
    if (isDbConnected()) {
      return (await UserModel.findById(id)) as unknown as IUser;
    }
    return store.users.find((u) => u._id === id) || null;
  },

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    if (isDbConnected()) {
      const user = new UserModel(userData);
      await user.save();
      return user.toObject() as unknown as IUser;
    }
    const newUser: IUser = {
      _id: generateId(),
      name: userData.name || '',
      email: userData.email!.toLowerCase(),
      password: userData.password,
      role: userData.role || 'user',
      isKycVerified: true,
      demoNoticeAcknowledged: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.users.push(newUser);
    saveStore(store);
    return newUser;
  },

  // Wallets
  async getWalletByUserId(userId: string): Promise<IWallet | null> {
    if (isDbConnected()) {
      return (await WalletModel.findOne({ userId })) as unknown as IWallet;
    }
    return store.wallets.find((w) => w.userId === userId) || null;
  },

  async createWallet(userId: string): Promise<IWallet> {
    if (isDbConnected()) {
      const wallet = new WalletModel({
        userId,
        inrBalance: 1000000,
        coinBalances: [],
        totalDeposited: 1000000,
        totalWithdrawn: 0,
      });
      await wallet.save();
      return wallet.toObject() as unknown as IWallet;
    }
    const newWallet: IWallet = {
      _id: generateId(),
      userId,
      inrBalance: 1000000,
      coinBalances: [],
      totalDeposited: 1000000,
      totalWithdrawn: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.wallets.push(newWallet);
    saveStore(store);
    return newWallet;
  },

  async updateWallet(wallet: IWallet): Promise<IWallet> {
    if (isDbConnected()) {
      await WalletModel.updateOne({ userId: wallet.userId }, { $set: wallet });
      return wallet;
    }
    const index = store.wallets.findIndex((w) => w.userId === wallet.userId);
    if (index !== -1) {
      store.wallets[index] = { ...wallet, updatedAt: new Date() };
      saveStore(store);
    }
    return wallet;
  },

  // Transactions
  async createTransaction(txData: Partial<ITransaction>): Promise<ITransaction> {
    const tx: ITransaction = {
      _id: generateId(),
      userId: txData.userId!,
      type: txData.type!,
      amount: txData.amount!,
      currency: txData.currency || 'INR',
      fee: txData.fee || 0,
      status: txData.status || 'COMPLETED',
      txHash: txData.txHash || 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      metadata: txData.metadata || {},
      createdAt: new Date(),
    };
    if (isDbConnected()) {
      const doc = new TransactionModel(tx);
      await doc.save();
      return doc.toObject() as unknown as ITransaction;
    }
    store.transactions.unshift(tx);
    saveStore(store);
    return tx;
  },

  async getTransactionsByUserId(userId: string): Promise<ITransaction[]> {
    if (isDbConnected()) {
      return (await TransactionModel.find({ userId }).sort({ createdAt: -1 })) as unknown as ITransaction[];
    }
    return store.transactions.filter((t) => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Orders
  async createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
    const order: IOrder = {
      _id: generateId(),
      userId: orderData.userId!,
      pair: orderData.pair!,
      side: orderData.side!,
      type: orderData.type!,
      price: orderData.price!,
      quantity: orderData.quantity!,
      totalInr: orderData.totalInr!,
      executedQuantity: orderData.executedQuantity || orderData.quantity!,
      fee: orderData.fee || 0,
      status: orderData.status || 'FILLED',
      createdAt: new Date(),
    };
    if (isDbConnected()) {
      const doc = new OrderModel(order);
      await doc.save();
      return doc.toObject() as unknown as IOrder;
    }
    store.orders.unshift(order);
    saveStore(store);
    return order;
  },

  async getOrdersByUserId(userId: string): Promise<IOrder[]> {
    if (isDbConnected()) {
      return (await OrderModel.find({ userId }).sort({ createdAt: -1 })) as unknown as IOrder[];
    }
    return store.orders.filter((o) => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // Futures
  async createFuturesPosition(posData: Partial<IFuturesPosition>): Promise<IFuturesPosition> {
    const pos: IFuturesPosition = {
      _id: generateId(),
      userId: posData.userId!,
      pair: posData.pair!,
      side: posData.side!,
      entryPrice: posData.entryPrice!,
      currentPrice: posData.currentPrice!,
      quantity: posData.quantity!,
      leverage: posData.leverage!,
      margin: posData.margin!,
      marginType: posData.marginType || 'ISOLATED',
      liquidationPrice: posData.liquidationPrice!,
      takeProfit: posData.takeProfit,
      stopLoss: posData.stopLoss,
      unrealizedPnl: posData.unrealizedPnl || 0,
      realizedPnl: posData.realizedPnl || 0,
      status: 'OPEN',
      createdAt: new Date(),
    };
    if (isDbConnected()) {
      const doc = new FuturesPositionModel(pos);
      await doc.save();
      return doc.toObject() as unknown as IFuturesPosition;
    }
    store.futuresPositions.unshift(pos);
    saveStore(store);
    return pos;
  },

  async getFuturesPositionsByUserId(userId: string): Promise<IFuturesPosition[]> {
    if (isDbConnected()) {
      return (await FuturesPositionModel.find({ userId }).sort({ createdAt: -1 })) as unknown as IFuturesPosition[];
    }
    return store.futuresPositions.filter((p) => p.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async updateFuturesPosition(position: IFuturesPosition): Promise<IFuturesPosition> {
    if (isDbConnected()) {
      await FuturesPositionModel.updateOne({ _id: position._id }, { $set: position });
      return position;
    }
    const idx = store.futuresPositions.findIndex((p) => p._id === position._id);
    if (idx !== -1) {
      store.futuresPositions[idx] = position;
      saveStore(store);
    }
    return position;
  },

  // Watchlist
  async getWatchlist(userId: string): Promise<string[]> {
    if (isDbConnected()) {
      const doc = await WatchlistModel.findOne({ userId });
      return doc?.symbols || ['BTC', 'ETH', 'SOL'];
    }
    const item = store.watchlists.find((w) => w.userId === userId);
    return item ? item.symbols : ['BTC', 'ETH', 'SOL'];
  },

  async toggleWatchlist(userId: string, symbol: string): Promise<string[]> {
    let symbols = await this.getWatchlist(userId);
    if (symbols.includes(symbol)) {
      symbols = symbols.filter((s) => s !== symbol);
    } else {
      symbols.push(symbol);
    }
    if (isDbConnected()) {
      await WatchlistModel.findOneAndUpdate(
        { userId },
        { $set: { symbols } },
        { upsert: true, new: true }
      );
    } else {
      const idx = store.watchlists.findIndex((w) => w.userId === userId);
      if (idx !== -1) {
        store.watchlists[idx].symbols = symbols;
      } else {
        store.watchlists.push({
          _id: generateId(),
          userId,
          symbols,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      saveStore(store);
    }
    return symbols;
  },

  // Notifications
  async getNotifications(userId: string): Promise<INotification[]> {
    if (isDbConnected()) {
      return (await NotificationModel.find({ userId }).sort({ createdAt: -1 })) as unknown as INotification[];
    }
    return store.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addNotification(data: Partial<INotification>): Promise<INotification> {
    const notif: INotification = {
      _id: generateId(),
      userId: data.userId!,
      title: data.title!,
      message: data.message!,
      type: data.type || 'INFO',
      isRead: false,
      createdAt: new Date(),
    };
    if (isDbConnected()) {
      const doc = new NotificationModel(notif);
      await doc.save();
      return doc.toObject() as unknown as INotification;
    }
    store.notifications.unshift(notif);
    saveStore(store);
    return notif;
  },

  // Price Alerts
  async getPriceAlerts(userId: string): Promise<IPriceAlert[]> {
    if (isDbConnected()) {
      return (await PriceAlertModel.find({ userId }).sort({ createdAt: -1 })) as unknown as IPriceAlert[];
    }
    return store.priceAlerts.filter((a) => a.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createPriceAlert(data: Partial<IPriceAlert>): Promise<IPriceAlert> {
    const alert: IPriceAlert = {
      _id: generateId(),
      userId: data.userId!,
      symbol: data.symbol!,
      targetPrice: data.targetPrice!,
      condition: data.condition!,
      isActive: true,
      createdAt: new Date(),
    };
    if (isDbConnected()) {
      const doc = new PriceAlertModel(alert);
      await doc.save();
      return doc.toObject() as unknown as IPriceAlert;
    }
    store.priceAlerts.unshift(alert);
    saveStore(store);
    return alert;
  },
};
