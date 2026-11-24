import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { formatCurrencyFull, formatQuantity } from '../utils/formatters';

interface RecentTradesProps {
  symbol: string;
  isFutures?: boolean;
}

interface TradeItem {
  id: string;
  price: number;
  quantity: number;
  time: number;
  side: 'BUY' | 'SELL';
}

export const RecentTrades: React.FC<RecentTradesProps> = ({ symbol, isFutures = false }) => {
  const [trades, setTrades] = useState<TradeItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchTrades = async () => {
      try {
        const res = await api.get(`/markets/trades/${symbol}`);
        if (res.data.success && isMounted) {
          setTrades(res.data.data || []);
        }
      } catch (e) {
        // error handling
      }
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  return (
    <div className="bg-[#0b0e14] border border-[#1f2937] rounded-xl p-3 flex flex-col h-full text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2937] text-gray-400 font-medium">
        <span>Recent Trades</span>
        <span className="text-[10px] text-gray-500">Live Execution</span>
      </div>

      <div className="grid grid-cols-3 py-1.5 text-gray-500 text-[10px] uppercase font-semibold">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Time</span>
      </div>

      <div className="space-y-1 overflow-y-auto max-h-[360px] pr-1">
        {trades.map((trade) => {
          const date = new Date(trade.time);
          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          return (
            <div key={trade.id} className="grid grid-cols-3 py-0.5 font-mono text-[11px] hover:bg-[#121824] px-1 rounded transition">
              <span className={trade.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'}>
                {isFutures ? `$${trade.price}` : trade.price}
              </span>
              <span className="text-right text-gray-300">{formatQuantity(trade.quantity, 4)}</span>
              <span className="text-right text-gray-500 text-[10px]">{timeStr}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
