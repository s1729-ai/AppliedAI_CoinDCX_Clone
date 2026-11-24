import axios from 'axios';
import { ICoin } from '../types';

export interface Candlestick {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookItem {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookItem[];
  asks: OrderBookItem[];
  lastPrice: number;
  spread: number;
}

export interface TradeItem {
  id: string;
  price: number;
  quantity: number;
  time: number;
  side: 'BUY' | 'SELL';
}

const INITIAL_COINS: ICoin[] = [
  {
    _id: 'coin-btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    baseAsset: 'BTC',
    quoteAsset: 'INR',
    lastPrice: 8345200,
    change24h: 3.42,
    high24h: 8450000,
    low24h: 8090000,
    volume24h: 18450.25,
    marketCap: 164200000000000,
    circulatingSupply: 19780000,
    description: 'Bitcoin is the first decentralized digital currency, enabling peer-to-peer transfers worldwide without intermediaries.',
    isListed: true,
    sparkline: [8120000, 8150000, 8090000, 8220000, 8280000, 8310000, 8345200],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-eth',
    symbol: 'ETH',
    name: 'Ethereum',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    baseAsset: 'ETH',
    quoteAsset: 'INR',
    lastPrice: 312450,
    change24h: 4.15,
    high24h: 318000,
    low24h: 298500,
    volume24h: 48920.8,
    marketCap: 37500000000000,
    circulatingSupply: 120400000,
    description: 'Ethereum is a decentralized open-source blockchain featuring smart contract functionality and decentralized applications.',
    isListed: true,
    sparkline: [301000, 298500, 305000, 308000, 310500, 312450],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-sol',
    symbol: 'SOL',
    name: 'Solana',
    logo: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    baseAsset: 'SOL',
    quoteAsset: 'INR',
    lastPrice: 19850,
    change24h: 7.82,
    high24h: 20400,
    low24h: 18200,
    volume24h: 284100.5,
    marketCap: 9300000000000,
    circulatingSupply: 468000000,
    description: 'Solana is a high-performance blockchain supporting builders around the world making crypto apps that scale today.',
    isListed: true,
    sparkline: [18300, 18500, 18200, 19100, 19450, 19850],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-bnb',
    symbol: 'BNB',
    name: 'BNB',
    logo: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    baseAsset: 'BNB',
    quoteAsset: 'INR',
    lastPrice: 58240,
    change24h: -0.85,
    high24h: 59400,
    low24h: 57600,
    volume24h: 89340.2,
    marketCap: 8500000000000,
    circulatingSupply: 145000000,
    description: 'BNB powers the BNB Chain ecosystem and offers gas fee discounts on trades.',
    isListed: true,
    sparkline: [58900, 59200, 58400, 57900, 58100, 58240],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-xrp',
    symbol: 'XRP',
    name: 'XRP',
    logo: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    baseAsset: 'XRP',
    quoteAsset: 'INR',
    lastPrice: 194.5,
    change24h: 12.4,
    high24h: 208.0,
    low24h: 171.2,
    volume24h: 2450000.0,
    marketCap: 11000000000000,
    circulatingSupply: 56900000000,
    description: 'XRP is a digital asset built for global cross-border payments with sub-second settlements.',
    isListed: true,
    sparkline: [173, 178, 182, 188, 191, 194.5],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-doge',
    symbol: 'DOGE',
    name: 'Dogecoin',
    logo: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    baseAsset: 'DOGE',
    quoteAsset: 'INR',
    lastPrice: 34.2,
    change24h: -2.15,
    high24h: 36.8,
    low24h: 33.1,
    volume24h: 14200000.0,
    marketCap: 4900000000000,
    circulatingSupply: 146000000000,
    description: 'Dogecoin is an open-source peer-to-peer cryptocurrency favored by Shiba Inus worldwide.',
    isListed: true,
    sparkline: [35.5, 36.2, 35.0, 34.6, 33.8, 34.2],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-ada',
    symbol: 'ADA',
    name: 'Cardano',
    logo: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    baseAsset: 'ADA',
    quoteAsset: 'INR',
    lastPrice: 84.7,
    change24h: 5.62,
    high24h: 87.2,
    low24h: 79.5,
    volume24h: 3120000.0,
    marketCap: 2980000000000,
    circulatingSupply: 35700000000,
    description: 'Cardano is a proof-of-stake blockchain platform built on peer-reviewed research.',
    isListed: true,
    sparkline: [80.2, 81.5, 83.0, 82.4, 85.1, 84.7],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-trx',
    symbol: 'TRX',
    name: 'TRON',
    logo: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
    baseAsset: 'TRX',
    quoteAsset: 'INR',
    lastPrice: 17.8,
    change24h: 1.15,
    high24h: 18.2,
    low24h: 17.4,
    volume24h: 8900000.0,
    marketCap: 1540000000000,
    circulatingSupply: 86500000000,
    description: 'TRON is dedicated to accelerating the decentralization of the internet via blockchain technology.',
    isListed: true,
    sparkline: [17.5, 17.6, 17.4, 17.7, 17.9, 17.8],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-avax',
    symbol: 'AVAX',
    name: 'Avalanche',
    logo: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    baseAsset: 'AVAX',
    quoteAsset: 'INR',
    lastPrice: 3450,
    change24h: -1.82,
    high24h: 3590,
    low24h: 3380,
    volume24h: 320000.0,
    marketCap: 1410000000000,
    circulatingSupply: 409000000,
    description: 'Avalanche is a future-proof, fast smart contracts platform built for high-throughput dApps.',
    isListed: true,
    sparkline: [3520, 3580, 3490, 3420, 3410, 3450],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-dot',
    symbol: 'DOT',
    name: 'Polkadot',
    logo: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    baseAsset: 'DOT',
    quoteAsset: 'INR',
    lastPrice: 742,
    change24h: 3.1,
    high24h: 765,
    low24h: 712,
    volume24h: 940000.0,
    marketCap: 1060000000000,
    circulatingSupply: 1430000000,
    description: 'Polkadot empowers blockchain networks to operate together seamlessly across trust boundaries.',
    isListed: true,
    sparkline: [718, 725, 715, 730, 745, 742],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-link',
    symbol: 'LINK',
    name: 'Chainlink',
    logo: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    baseAsset: 'LINK',
    quoteAsset: 'INR',
    lastPrice: 1680,
    change24h: 6.4,
    high24h: 1720,
    low24h: 1560,
    volume24h: 410000.0,
    marketCap: 1020000000000,
    circulatingSupply: 608000000,
    description: 'Chainlink provides verifiable and decentralized oracle computations connecting smart contracts to real-world data.',
    isListed: true,
    sparkline: [1580, 1610, 1590, 1640, 1670, 1680],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-ltc',
    symbol: 'LTC',
    name: 'Litecoin',
    logo: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
    baseAsset: 'LTC',
    quoteAsset: 'INR',
    lastPrice: 9150,
    change24h: 2.1,
    high24h: 9380,
    low24h: 8900,
    volume24h: 115000.0,
    marketCap: 686000000000,
    circulatingSupply: 75000000,
    description: 'Litecoin is a peer-to-peer cryptocurrency created to provide fast, secure, and low-cost payments.',
    isListed: true,
    sparkline: [8950, 9020, 8920, 9110, 9190, 9150],
    updatedAt: new Date(),
  },
  {
    _id: 'coin-shib',
    symbol: 'SHIB',
    name: 'Shiba Inu',
    logo: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
    baseAsset: 'SHIB',
    quoteAsset: 'INR',
    lastPrice: 0.002245,
    change24h: -1.35,
    high24h: 0.00238,
    low24h: 0.00219,
    volume24h: 5600000000.0,
    marketCap: 1320000000000,
    circulatingSupply: 589000000000000,
    description: 'Shiba Inu token is a decentralized, community-led currency held by millions across the globe.',
    isListed: true,
    sparkline: [0.00228, 0.00231, 0.00225, 0.00222, 0.002245],
    updatedAt: new Date(),
  },
];

// In-memory live store for market tickers
let activeCoins: ICoin[] = JSON.parse(JSON.stringify(INITIAL_COINS));

// Futures tickers in USDT
export interface FuturesTicker {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  fundingRate: number; // e.g. 0.0100%
  openInterest: number; // in USDT
  indexPrice: number;
  markPrice: number;
}

let activeFutures: FuturesTicker[] = [
  {
    symbol: 'BTCUSDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    lastPrice: 96850.5,
    change24h: 3.55,
    high24h: 98200.0,
    low24h: 94100.0,
    volume24h: 1245000000,
    fundingRate: 0.0102,
    openInterest: 485000000,
    indexPrice: 96845.2,
    markPrice: 96848.9,
  },
  {
    symbol: 'ETHUSDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    lastPrice: 3624.8,
    change24h: 4.25,
    high24h: 3710.0,
    low24h: 3480.0,
    volume24h: 820000000,
    fundingRate: 0.0098,
    openInterest: 260000000,
    indexPrice: 3623.5,
    markPrice: 3624.1,
  },
  {
    symbol: 'SOLUSDT',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    lastPrice: 231.4,
    change24h: 8.12,
    high24h: 242.0,
    low24h: 212.5,
    volume24h: 490000000,
    fundingRate: 0.0125,
    openInterest: 145000000,
    indexPrice: 231.2,
    markPrice: 231.35,
  },
];

// Poll CoinDCX public tickers when available
export const syncCoinDCXTickers = async () => {
  try {
    const res = await axios.get('https://public.coindcx.com/exchange/ticker', { timeout: 3500 });
    if (Array.isArray(res.data)) {
      const tickerMap = new Map<string, any>();
      res.data.forEach((item: any) => {
        if (item.market) {
          tickerMap.set(item.market.toUpperCase(), item);
        }
      });

      // Update spot INR coins
      activeCoins = activeCoins.map((coin) => {
        const pairKey = `${coin.symbol}INR`;
        const match = tickerMap.get(pairKey);
        if (match && parseFloat(match.last_price) > 0) {
          const lastPrice = parseFloat(match.last_price);
          const change24h = parseFloat(match.change_24_hour) || coin.change24h;
          const high24h = parseFloat(match.high) || coin.high24h;
          const low24h = parseFloat(match.low) || coin.low24h;
          const volume24h = parseFloat(match.volume) || coin.volume24h;
          const sparkline = [...(coin.sparkline || []).slice(-15), lastPrice];
          return {
            ...coin,
            lastPrice,
            change24h,
            high24h,
            low24h,
            volume24h,
            sparkline,
            updatedAt: new Date(),
          };
        }
        return coin;
      });

      // Update futures pairs
      activeFutures = activeFutures.map((fut) => {
        const match = tickerMap.get(fut.symbol);
        if (match && parseFloat(match.last_price) > 0) {
          const lastPrice = parseFloat(match.last_price);
          return {
            ...fut,
            lastPrice,
            change24h: parseFloat(match.change_24_hour) || fut.change24h,
            high24h: parseFloat(match.high) || fut.high24h,
            low24h: parseFloat(match.low) || fut.low24h,
            volume24h: parseFloat(match.volume) || fut.volume24h,
            markPrice: lastPrice * (1 + (Math.random() - 0.5) * 0.0004),
          };
        }
        return fut;
      });
    }
  } catch (err: any) {
    // If external call fails, apply natural micro-jitter simulation
    applyMicroPriceJitter();
  }
};

const applyMicroPriceJitter = () => {
  activeCoins = activeCoins.map((coin) => {
    // Small realistic price shift +/- 0.05%
    const delta = (Math.random() - 0.495) * 0.001;
    const newPrice = Number((coin.lastPrice * (1 + delta)).toFixed(coin.lastPrice < 1 ? 6 : 2));
    const sparkline = [...(coin.sparkline || []).slice(-20), newPrice];
    return {
      ...coin,
      lastPrice: newPrice,
      sparkline,
      updatedAt: new Date(),
    };
  });

  activeFutures = activeFutures.map((fut) => {
    const delta = (Math.random() - 0.495) * 0.001;
    const newPrice = Number((fut.lastPrice * (1 + delta)).toFixed(2));
    return {
      ...fut,
      lastPrice: newPrice,
      markPrice: Number((newPrice * (1 + (Math.random() - 0.5) * 0.0003)).toFixed(2)),
    };
  });
};

// Run background price sync every 3 seconds
setInterval(syncCoinDCXTickers, 3000);

export const marketDataService = {
  getAllCoins(): ICoin[] {
    return activeCoins;
  },

  getCoinBySymbol(symbol: string): ICoin | undefined {
    return activeCoins.find((c) => c.symbol.toUpperCase() === symbol.toUpperCase());
  },

  getAllFutures(): FuturesTicker[] {
    return activeFutures;
  },

  getFuturesBySymbol(symbol: string): FuturesTicker | undefined {
    return activeFutures.find((f) => f.symbol.toUpperCase() === symbol.toUpperCase());
  },

  generateCandlesticks(symbol: string, timeframe: string = '15m', count: number = 80): Candlestick[] {
    const coin = this.getCoinBySymbol(symbol);
    const fut = this.getFuturesBySymbol(symbol);
    const currentPrice = coin?.lastPrice || fut?.lastPrice || 50000;

    let intervalSeconds = 900; // 15m default
    if (timeframe === '1m') intervalSeconds = 60;
    else if (timeframe === '5m') intervalSeconds = 300;
    else if (timeframe === '1h') intervalSeconds = 3600;
    else if (timeframe === '1d') intervalSeconds = 86400;

    const now = Math.floor(Date.now() / 1000);
    const candles: Candlestick[] = [];

    let price = currentPrice * (1 - count * 0.0012); // historical drift
    for (let i = count; i >= 0; i--) {
      const time = now - i * intervalSeconds;
      const volatility = currentPrice * 0.004;
      const change = (Math.random() - 0.485) * volatility;
      const open = price;
      const close = Number((open + change).toFixed(price < 1 ? 6 : 2));
      const high = Number((Math.max(open, close) + Math.random() * volatility * 0.6).toFixed(price < 1 ? 6 : 2));
      const low = Number((Math.min(open, close) - Math.random() * volatility * 0.6).toFixed(price < 1 ? 6 : 2));
      const volume = Number((Math.random() * 50 + 10).toFixed(2));

      candles.push({ time, open, high, low, close, volume });
      price = close;
    }

    // Ensure the last candle closes at approximately the current price
    if (candles.length > 0) {
      candles[candles.length - 1].close = currentPrice;
    }

    return candles;
  },

  generateOrderBook(symbol: string): OrderBook {
    const coin = this.getCoinBySymbol(symbol);
    const fut = this.getFuturesBySymbol(symbol);
    const midPrice = coin?.lastPrice || fut?.lastPrice || 10000;

    const bids: OrderBookItem[] = [];
    const asks: OrderBookItem[] = [];

    let bidTotal = 0;
    let askTotal = 0;

    for (let i = 1; i <= 8; i++) {
      const bidDiff = midPrice * (0.0004 * i);
      const askDiff = midPrice * (0.0004 * i);

      const bidPrice = Number((midPrice - bidDiff).toFixed(midPrice < 1 ? 6 : 2));
      const askPrice = Number((midPrice + askDiff).toFixed(midPrice < 1 ? 6 : 2));

      const bidQty = Number((Math.random() * 1.5 + 0.1).toFixed(3));
      const askQty = Number((Math.random() * 1.5 + 0.1).toFixed(3));

      bidTotal += bidQty;
      askTotal += askQty;

      bids.push({ price: bidPrice, quantity: bidQty, total: Number(bidTotal.toFixed(3)) });
      asks.push({ price: askPrice, quantity: askQty, total: Number(askTotal.toFixed(3)) });
    }

    const spread = Number((asks[0].price - bids[0].price).toFixed(midPrice < 1 ? 6 : 2));

    return {
      bids,
      asks: asks.reverse(),
      lastPrice: midPrice,
      spread,
    };
  },

  generateRecentTrades(symbol: string): TradeItem[] {
    const coin = this.getCoinBySymbol(symbol);
    const fut = this.getFuturesBySymbol(symbol);
    const price = coin?.lastPrice || fut?.lastPrice || 10000;

    const trades: TradeItem[] = [];
    const now = Date.now();

    for (let i = 0; i < 15; i++) {
      const side: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const offset = (Math.random() - 0.5) * price * 0.001;
      const tradePrice = Number((price + offset).toFixed(price < 1 ? 6 : 2));
      const quantity = Number((Math.random() * 0.8 + 0.02).toFixed(4));
      const time = now - i * Math.floor(Math.random() * 3000 + 500);

      trades.push({
        id: 'tr-' + (now - i) + '-' + i,
        price: tradePrice,
        quantity,
        time,
        side,
      });
    }

    return trades;
  },
};
