import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { formatCurrencyFull, formatPercent } from '../utils/formatters';
import { Search, X, TrendingUp, Zap } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { coins, futures } = useMarket();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const filteredCoins = coins.filter(
    (c) =>
      c.symbol.toLowerCase().includes(query.toLowerCase()) ||
      c.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredFutures = futures.filter((f) =>
    f.symbol.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectSpot = (symbol: string) => {
    navigate(`/trade/spot?pair=${symbol}INR`);
    onClose();
  };

  const handleSelectFutures = (symbol: string) => {
    navigate(`/trade/futures?pair=${symbol}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-xs">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#1f2937] bg-[#121824]">
          <Search className="w-5 h-5 text-gray-400 mr-2.5" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search crypto pairs (BTC, ETH, SOL, USDT)..."
            className="w-full bg-transparent text-white text-sm outline-none placeholder-gray-500"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-[#1f2937] p-2">
          {/* Spot Pairs */}
          <div>
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Spot Pairs (INR)
            </div>
            {filteredCoins.map((coin) => (
              <div
                key={coin.symbol}
                onClick={() => handleSelectSpot(coin.symbol)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#161d2a] cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <img src={coin.logo} alt={coin.name} className="w-6 h-6 rounded-full" />
                  <div>
                    <span className="font-bold text-white mr-1.5">{coin.symbol}/INR</span>
                    <span className="text-gray-400 text-[11px]">{coin.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-white">
                    {formatCurrencyFull(coin.lastPrice)}
                  </div>
                  <div
                    className={`text-[10px] font-semibold ${
                      coin.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatPercent(coin.change24h)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Futures Pairs */}
          <div className="pt-2">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              Futures (USDT - Up to 50x)
            </div>
            {filteredFutures.map((fut) => (
              <div
                key={fut.symbol}
                onClick={() => handleSelectFutures(fut.symbol)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#161d2a] cursor-pointer transition"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{fut.symbol}</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1 py-0.2 rounded font-semibold">
                    50x
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-white">${fut.lastPrice}</div>
                  <div
                    className={`text-[10px] font-semibold ${
                      fut.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {formatPercent(fut.change24h)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
