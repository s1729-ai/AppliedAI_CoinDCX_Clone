import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { ICoin, IFuturesTicker } from '../types';
import { useAuth } from './AuthContext';

interface MarketContextType {
  coins: ICoin[];
  futures: IFuturesTicker[];
  watchlist: string[];
  isLoading: boolean;
  toggleWatchlist: (symbol: string) => Promise<void>;
  getCoin: (symbol: string) => ICoin | undefined;
  getFutures: (pair: string) => IFuturesTicker | undefined;
  refreshMarkets: () => Promise<void>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [coins, setCoins] = useState<ICoin[]>([]);
  const [futures, setFutures] = useState<IFuturesTicker[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(['BTC', 'ETH', 'SOL']);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCoins = async () => {
    try {
      const res = await api.get('/markets/coins');
      if (res.data.success) {
        setCoins(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching coins:', e);
    }
  };

  const fetchFutures = async () => {
    try {
      const res = await api.get('/markets/futures');
      if (res.data.success) {
        setFutures(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching futures:', e);
    }
  };

  const fetchWatchlist = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/markets/watchlist');
      if (res.data.success) {
        setWatchlist(res.data.data);
      }
    } catch (e) {
      // fallback
    }
  }, [user]);

  const refreshMarkets = async () => {
    await Promise.all([fetchCoins(), fetchFutures()]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshMarkets();
    const interval = setInterval(refreshMarkets, 3000); // 3-second live refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user, fetchWatchlist]);

  const toggleWatchlist = async (symbol: string) => {
    // Optimistic update
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
    if (user) {
      try {
        await api.post('/markets/watchlist/toggle', { symbol });
      } catch (e) {
        fetchWatchlist();
      }
    }
  };

  const getCoin = (symbol: string) => {
    return coins.find((c) => c.symbol.toUpperCase() === symbol.toUpperCase());
  };

  const getFutures = (pair: string) => {
    return futures.find((f) => f.symbol.toUpperCase() === pair.toUpperCase());
  };

  return (
    <MarketContext.Provider
      value={{
        coins,
        futures,
        watchlist,
        isLoading,
        toggleWatchlist,
        getCoin,
        getFutures,
        refreshMarkets,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within a MarketProvider');
  return context;
};
