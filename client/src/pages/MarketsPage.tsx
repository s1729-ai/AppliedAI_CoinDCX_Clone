import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { formatCurrencyFull, formatPercent, formatINR } from '../utils/formatters';
import { SparklineChart } from '../components/SparklineChart';
import { Search, Star, ArrowUpDown, TrendingUp, TrendingDown, Info, X } from 'lucide-react';
import { ICoin } from '../types';

export const MarketsPage: React.FC = () => {
  const { coins, watchlist, toggleWatchlist } = useMarket();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'GAINERS' | 'LOSERS' | 'VOLUME' | 'WATCHLIST'>('ALL');
  const [selectedCoin, setSelectedCoin] = useState<ICoin | null>(null);

  // Filter
  let filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  if (activeTab === 'GAINERS') {
    filtered = filtered.filter((c) => c.change24h > 0).sort((a, b) => b.change24h - a.change24h);
  } else if (activeTab === 'LOSERS') {
    filtered = filtered.filter((c) => c.change24h < 0).sort((a, b) => a.change24h - b.change24h);
  } else if (activeTab === 'VOLUME') {
    filtered = [...filtered].sort((a, b) => b.volume24h * b.lastPrice - a.volume24h * a.lastPrice);
  } else if (activeTab === 'WATCHLIST') {
    filtered = filtered.filter((c) => watchlist.includes(c.symbol));
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] py-8 text-xs text-[#eaecef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Cryptocurrency Markets</h1>
            <p className="text-gray-400 mt-1">
              Real-time prices, 24h performance, and volume across {coins.length} listed assets
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coin (BTC, ETH, SOL)..."
              className="w-full bg-[#121824] border border-[#1f2937] rounded-xl pl-9 pr-4 py-2.5 text-white outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'ALL', label: 'All Coins' },
            { id: 'GAINERS', label: 'Top Gainers' },
            { id: 'LOSERS', label: 'Top Losers' },
            { id: 'VOLUME', label: '24h High Volume' },
            { id: 'WATCHLIST', label: `Watchlist (${watchlist.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl font-semibold transition shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#0052fe] text-white shadow-lg shadow-blue-500/20'
                  : 'bg-[#121824] text-gray-400 hover:text-white hover:bg-[#1a2333] border border-[#1f2937]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Markets Table */}
        <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#121824] text-gray-400 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">★</th>
                  <th className="px-4 py-3.5">Asset</th>
                  <th className="px-4 py-3.5">Price (INR)</th>
                  <th className="px-4 py-3.5">24h Change</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">24h High</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">24h Low</th>
                  <th className="px-4 py-3.5 hidden lg:table-cell">24h Volume</th>
                  <th className="px-4 py-3.5 hidden sm:table-cell text-center">Price Trend</th>
                  <th className="px-6 py-3.5 text-right">Quick Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-500">
                      No cryptocurrencies match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((coin) => {
                    const isFav = watchlist.includes(coin.symbol);
                    return (
                      <tr key={coin.symbol} className="hover:bg-[#121824] transition group">
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => toggleWatchlist(coin.symbol)}
                            className="text-gray-600 hover:text-amber-400 transition"
                            title="Add to watchlist"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                isFav ? 'text-amber-400 fill-amber-400' : ''
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div
                            onClick={() => setSelectedCoin(coin)}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <img src={coin.logo} alt={coin.name} className="w-8 h-8 rounded-full" />
                            <div>
                              <div className="font-bold text-white text-sm group-hover:text-blue-400 transition">
                                {coin.name}
                              </div>
                              <div className="text-[11px] text-gray-400 font-mono">{coin.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-sm text-white">
                          {formatCurrencyFull(coin.lastPrice)}
                        </td>
                        <td className="px-4 py-4 font-semibold">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                              coin.change24h >= 0
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-red-400 bg-red-500/10'
                            }`}
                          >
                            {formatPercent(coin.change24h)}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell font-mono text-gray-300">
                          {formatCurrencyFull(coin.high24h)}
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell font-mono text-gray-400">
                          {formatCurrencyFull(coin.low24h)}
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell font-mono text-gray-300">
                          {formatINR(coin.volume24h * coin.lastPrice)}
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell text-center">
                          <div className="flex justify-center">
                            <SparklineChart
                              data={coin.sparkline}
                              isPositive={coin.change24h >= 0}
                              width={90}
                              height={28}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/trade/spot?pair=${coin.symbol}INR`}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/30 font-semibold transition"
                            >
                              Buy
                            </Link>
                            <Link
                              to={`/trade/spot?pair=${coin.symbol}INR`}
                              className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-semibold transition"
                            >
                              Sell
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coin Details Modal */}
        {selectedCoin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedCoin(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <img src={selectedCoin.logo} alt={selectedCoin.name} className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedCoin.name} ({selectedCoin.symbol})
                  </h3>
                  <div className="text-sm font-mono text-emerald-400 font-bold">
                    {formatCurrencyFull(selectedCoin.lastPrice)}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed mb-4">{selectedCoin.description}</p>

              <div className="grid grid-cols-2 gap-3 bg-[#121824] p-3 rounded-xl border border-[#1f2937] mb-6">
                <div>
                  <div className="text-gray-500 text-[10px] uppercase font-semibold">24h High</div>
                  <div className="font-mono text-white font-medium">
                    {formatCurrencyFull(selectedCoin.high24h)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px] uppercase font-semibold">24h Low</div>
                  <div className="font-mono text-white font-medium">
                    {formatCurrencyFull(selectedCoin.low24h)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px] uppercase font-semibold">Market Cap</div>
                  <div className="font-mono text-white font-medium">
                    {formatINR(selectedCoin.marketCap)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-[10px] uppercase font-semibold">Circulating Supply</div>
                  <div className="font-mono text-white font-medium">
                    {selectedCoin.circulatingSupply?.toLocaleString()} {selectedCoin.symbol}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={`/trade/spot?pair=${selectedCoin.symbol}INR`}
                  className="flex-1 py-3 text-center bg-[#0052fe] hover:bg-[#1652f0] text-white font-bold rounded-xl shadow-lg transition"
                >
                  Trade {selectedCoin.symbol}/INR
                </Link>
                <Link
                  to="/ai-assistant"
                  className="px-4 py-3 bg-[#121824] hover:bg-[#1a2333] border border-[#1f2937] text-blue-400 font-semibold rounded-xl transition"
                >
                  AI Analysis
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
