import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { formatCurrencyFull, formatQuantity } from '../utils/formatters';

interface OrderBookProps {
  symbol: string;
  isFutures?: boolean;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export const OrderBook: React.FC<OrderBookProps> = ({ symbol, isFutures = false }) => {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [lastPrice, setLastPrice] = useState<number>(0);
  const [spread, setSpread] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchOrderBook = async () => {
      try {
        const res = await api.get(`/markets/orderbook/${symbol}`);
        if (res.data.success && isMounted) {
          setBids(res.data.data.bids || []);
          setAsks(res.data.data.asks || []);
          setLastPrice(res.data.data.lastPrice || 0);
          setSpread(res.data.data.spread || 0);
        }
      } catch (e) {
        // error handling
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  const maxTotal = Math.max(
    ...bids.map((b) => b.total),
    ...asks.map((a) => a.total),
    1
  );

  return (
    <div className="bg-[#0b0e14] border border-[#1f2937] rounded-xl p-3 flex flex-col h-full text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2937] text-gray-400 font-medium">
        <span>Order Book</span>
        <span className="text-[11px] text-gray-500">Spread: {spread}</span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 py-1.5 text-gray-500 text-[10px] uppercase font-semibold">
        <span>Price ({isFutures ? 'USDT' : 'INR'})</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sells - Red, showing descending) */}
      <div className="space-y-0.5 overflow-hidden flex flex-col justify-end">
        {asks.slice(0, 7).map((ask, idx) => {
          const depthPercent = (ask.total / maxTotal) * 100;
          return (
            <div key={`ask-${idx}`} className="relative grid grid-cols-3 py-0.5 px-1 font-mono text-[11px]">
              <div
                className="absolute inset-y-0 right-0 bg-red-500/10 pointer-events-none"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="text-red-400 font-medium z-10">{ask.price}</span>
              <span className="text-right text-gray-300 z-10">{formatQuantity(ask.quantity, 4)}</span>
              <span className="text-right text-gray-500 z-10">{formatQuantity(ask.total, 3)}</span>
            </div>
          );
        })}
      </div>

      {/* Mid Market Price */}
      <div className="my-2 py-1.5 px-2 bg-[#121824] rounded-lg border border-[#1f2937] flex items-center justify-between">
        <span className="font-mono font-bold text-sm text-emerald-400">
          {isFutures ? `$${lastPrice}` : formatCurrencyFull(lastPrice)}
        </span>
        <span className="text-[10px] text-gray-400">Market Price</span>
      </div>

      {/* Bids (Buys - Green) */}
      <div className="space-y-0.5 overflow-hidden">
        {bids.slice(0, 7).map((bid, idx) => {
          const depthPercent = (bid.total / maxTotal) * 100;
          return (
            <div key={`bid-${idx}`} className="relative grid grid-cols-3 py-0.5 px-1 font-mono text-[11px]">
              <div
                className="absolute inset-y-0 right-0 bg-emerald-500/10 pointer-events-none"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="text-emerald-400 font-medium z-10">{bid.price}</span>
              <span className="text-right text-gray-300 z-10">{formatQuantity(bid.quantity, 4)}</span>
              <span className="text-right text-gray-500 z-10">{formatQuantity(bid.total, 3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
