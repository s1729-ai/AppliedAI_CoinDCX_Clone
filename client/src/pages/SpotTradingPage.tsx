import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { TradingViewChart } from '../components/TradingViewChart';
import { OrderBook } from '../components/OrderBook';
import { RecentTrades } from '../components/RecentTrades';
import { SpotOrderPanel } from '../components/SpotOrderPanel';
import { formatCurrencyFull, formatPercent, formatINR } from '../utils/formatters';
import api from '../services/api';
import { IOrder } from '../types';
import { ChevronDown, Star } from 'lucide-react';

export const SpotTradingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { coins, watchlist, toggleWatchlist } = useMarket();
  const { user } = useAuth();

  const pairQuery = searchParams.get('pair') || 'BTCINR';
  const rawSymbol = pairQuery.replace('INR', '').replace('/INR', '').toUpperCase() || 'BTC';

  const [activeSymbol, setActiveSymbol] = useState<string>(rawSymbol);
  const [pairDropdownOpen, setPairDropdownOpen] = useState<boolean>(false);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [activeBottomTab, setActiveBottomTab] = useState<'OPEN' | 'HISTORY'>('OPEN');

  const currentCoin = coins.find((c) => c.symbol === activeSymbol) || coins[0];

  const handleSelectPair = (sym: string) => {
    setActiveSymbol(sym);
    setSearchParams({ pair: `${sym}INR` });
    setPairDropdownOpen(false);
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const res = await api.get('/spot/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (e) {
      //
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (!currentCoin) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-gray-400">
        Loading Spot Terminal...
      </div>
    );
  }

  const isFav = watchlist.includes(currentCoin.symbol);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#eaecef] p-2 sm:p-4 text-xs">
      {/* Top Ticker Header Bar */}
      <div className="bg-[#0e121a] border border-[#1f2937] rounded-xl px-4 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Pair Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setPairDropdownOpen(!pairDropdownOpen)}
              className="flex items-center gap-2 hover:bg-[#161d2a] px-3 py-1.5 rounded-lg border border-[#1f2937] transition"
            >
              <img src={currentCoin.logo} alt={currentCoin.name} className="w-5 h-5 rounded-full" />
              <span className="font-bold text-white text-sm">{currentCoin.symbol}/INR</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {pairDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-[#121824] border border-[#1f2937] rounded-xl shadow-2xl py-2 z-50 max-h-80 overflow-y-auto">
                {coins.map((coin) => (
                  <div
                    key={coin.symbol}
                    onClick={() => handleSelectPair(coin.symbol)}
                    className="flex items-center justify-between px-3 py-2 hover:bg-[#1a2333] cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2">
                      <img src={coin.logo} alt={coin.name} className="w-5 h-5 rounded-full" />
                      <div>
                        <div className="font-bold text-white">{coin.symbol}/INR</div>
                        <div className="text-[10px] text-gray-400">{coin.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-white">{formatCurrencyFull(coin.lastPrice)}</div>
                      <div
                        className={`text-[10px] ${
                          coin.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {formatPercent(coin.change24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => toggleWatchlist(currentCoin.symbol)}
            className="text-gray-500 hover:text-amber-400 transition"
          >
            <Star className={`w-4 h-4 ${isFav ? 'text-amber-400 fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Live Market Stats */}
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-gray-500 text-[10px] uppercase font-semibold">Price</div>
            <div className="font-mono font-bold text-base text-white">
              {formatCurrencyFull(currentCoin.lastPrice)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase font-semibold">24h Change</div>
            <div
              className={`font-semibold text-xs ${
                currentCoin.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatPercent(currentCoin.change24h)}
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="text-gray-500 text-[10px] uppercase font-semibold">24h High</div>
            <div className="font-mono text-gray-300">{formatCurrencyFull(currentCoin.high24h)}</div>
          </div>
          <div className="hidden sm:block">
            <div className="text-gray-500 text-[10px] uppercase font-semibold">24h Low</div>
            <div className="font-mono text-gray-400">{formatCurrencyFull(currentCoin.low24h)}</div>
          </div>
          <div className="hidden md:block">
            <div className="text-gray-500 text-[10px] uppercase font-semibold">24h Volume</div>
            <div className="font-mono text-gray-300">
              {formatINR(currentCoin.volume24h * currentCoin.lastPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Terminal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Chart (Col 8) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <TradingViewChart symbol={currentCoin.symbol} />

          {/* Bottom Tabs: Open Orders & History */}
          <div className="bg-[#0b0e14] border border-[#1f2937] rounded-xl overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#1f2937] bg-[#0e121a]">
              <button
                onClick={() => setActiveBottomTab('OPEN')}
                className={`font-semibold pb-1 transition ${
                  activeBottomTab === 'OPEN'
                    ? 'text-white border-b-2 border-[#0052fe]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Filled Orders ({orders.length})
              </button>
            </div>

            <div className="overflow-x-auto max-h-60 overflow-y-auto">
              {orders.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No orders placed yet. Execute a simulated trade on the right!
                </div>
              ) : (
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-[#121824] text-gray-500 text-[10px] uppercase font-sans">
                    <tr>
                      <th className="px-4 py-2">Pair</th>
                      <th className="px-3 py-2">Side</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Quantity</th>
                      <th className="px-3 py-2">Total INR</th>
                      <th className="px-3 py-2">Fee</th>
                      <th className="px-4 py-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1f2937]">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-[#121824] transition">
                        <td className="px-4 py-2 font-sans font-bold text-white">{o.pair}</td>
                        <td
                          className={`px-3 py-2 font-bold ${
                            o.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {o.side}
                        </td>
                        <td className="px-3 py-2 text-gray-400">{o.type}</td>
                        <td className="px-3 py-2 text-white">{formatCurrencyFull(o.price)}</td>
                        <td className="px-3 py-2 text-gray-300">{o.quantity}</td>
                        <td className="px-3 py-2 text-gray-200">{formatINR(o.totalInr)}</td>
                        <td className="px-3 py-2 text-gray-500">{formatINR(o.fee)}</td>
                        <td className="px-4 py-2 text-right text-gray-500 font-sans text-[10px]">
                          {new Date(o.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Book & Order Panel (Col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <SpotOrderPanel coin={currentCoin} onOrderSuccess={fetchOrders} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
            <OrderBook symbol={currentCoin.symbol} />
            <RecentTrades symbol={currentCoin.symbol} />
          </div>
        </div>
      </div>
    </div>
  );
};
