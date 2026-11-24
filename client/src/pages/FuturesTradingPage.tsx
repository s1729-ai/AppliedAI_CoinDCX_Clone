import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { TradingViewChart } from '../components/TradingViewChart';
import { OrderBook } from '../components/OrderBook';
import { RecentTrades } from '../components/RecentTrades';
import { FuturesOrderPanel } from '../components/FuturesOrderPanel';
import { PositionsTable } from '../components/PositionsTable';
import { formatPercent, formatUSDT } from '../utils/formatters';
import api from '../services/api';
import { IFuturesPosition } from '../types';
import { ChevronDown, Zap } from 'lucide-react';

export const FuturesTradingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { futures } = useMarket();
  const { user } = useAuth();

  const pairQuery = searchParams.get('pair') || 'BTCUSDT';
  const [activePair, setActivePair] = useState<string>(pairQuery);
  const [pairDropdownOpen, setPairDropdownOpen] = useState<boolean>(false);

  const [openPositions, setOpenPositions] = useState<IFuturesPosition[]>([]);
  const [closedPositions, setClosedPositions] = useState<IFuturesPosition[]>([]);

  const currentTicker = futures.find((f) => f.symbol === activePair) || futures[0];

  const handleSelectPair = (sym: string) => {
    setActivePair(sym);
    setSearchParams({ pair: sym });
    setPairDropdownOpen(false);
  };

  const fetchPositions = async () => {
    if (!user) return;
    try {
      const res = await api.get('/futures/positions');
      if (res.data.success) {
        setOpenPositions(res.data.data.open || []);
        setClosedPositions(res.data.data.closed || []);
      }
    } catch (e) {
      //
    }
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 3000);
    return () => clearInterval(interval);
  }, [user]);

  if (!currentTicker) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-gray-400">
        Loading Futures Terminal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#eaecef] p-2 sm:p-4 text-xs">
      {/* Top Futures Bar */}
      <div className="bg-[#0e121a] border border-[#1f2937] rounded-xl px-4 py-2.5 mb-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setPairDropdownOpen(!pairDropdownOpen)}
              className="flex items-center gap-2 hover:bg-[#161d2a] px-3 py-1.5 rounded-lg border border-[#1f2937] transition"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-sm">{currentTicker.symbol} Perpetual</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1 py-0.2 rounded font-bold">
                50x
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {pairDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-[#121824] border border-[#1f2937] rounded-xl shadow-2xl py-2 z-50">
                {futures.map((fut) => (
                  <div
                    key={fut.symbol}
                    onClick={() => handleSelectPair(fut.symbol)}
                    className="flex items-center justify-between px-3 py-2 hover:bg-[#1a2333] cursor-pointer transition"
                  >
                    <div>
                      <div className="font-bold text-white">{fut.symbol}</div>
                      <div className="text-[10px] text-gray-400">Up to 50x Leverage</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-white">{formatUSDT(fut.lastPrice)}</div>
                      <div
                        className={`text-[10px] ${
                          fut.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {formatPercent(fut.change24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ticker Metrics */}
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <div className="text-gray-500 text-[10px] uppercase font-semibold">Mark Price</div>
            <div className="font-mono font-bold text-base text-white">
              {formatUSDT(currentTicker.markPrice || currentTicker.lastPrice)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase font-semibold">Index Price</div>
            <div className="font-mono text-gray-300">{formatUSDT(currentTicker.indexPrice)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase font-semibold">24h Change</div>
            <div
              className={`font-semibold text-xs ${
                currentTicker.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatPercent(currentTicker.change24h)}
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="text-gray-500 text-[10px] uppercase font-semibold">Funding Rate / 8h</div>
            <div className="font-mono text-emerald-400 font-semibold">
              +{currentTicker.fundingRate}%
            </div>
          </div>
          <div className="hidden md:block">
            <div className="text-gray-500 text-[10px] uppercase font-semibold">Open Interest</div>
            <div className="font-mono text-gray-300">
              {formatUSDT(currentTicker.openInterest)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Chart & Positions (Col 8) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <TradingViewChart symbol={currentTicker.symbol} isFutures />

          {/* Positions Table */}
          <PositionsTable
            positions={openPositions}
            closedPositions={closedPositions}
            onPositionClosed={fetchPositions}
          />
        </div>

        {/* Order Panel & Book (Col 4) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <FuturesOrderPanel ticker={currentTicker} onPositionOpened={fetchPositions} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
            <OrderBook symbol={currentTicker.symbol} isFutures />
            <RecentTrades symbol={currentTicker.symbol} isFutures />
          </div>
        </div>
      </div>
    </div>
  );
};
