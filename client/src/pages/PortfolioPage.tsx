import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyFull, formatINR, formatPercent, formatQuantity } from '../utils/formatters';
import api from '../services/api';
import { IPortfolioData } from '../types';
import {
  PieChart as PieIcon,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  RefreshCw,
  Award,
} from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<IPortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPortfolio = async () => {
    if (!user) return;
    try {
      const res = await api.get('/portfolio');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 4000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Sign in to view your Portfolio</h2>
        <p className="text-xs text-gray-400 mb-4">
          Connect your demo account with ₹10,00,000 virtual balance to track performance.
        </p>
        <a
          href="/login"
          className="px-6 py-2.5 bg-[#0052fe] hover:bg-[#1652f0] text-white font-bold rounded-xl text-xs transition"
        >
          Sign In
        </a>
      </div>
    );
  }

  const isProfit = (data?.totalPnl || 0) >= 0;

  return (
    <div className="min-h-screen bg-[#0b0e14] py-8 text-xs text-[#eaecef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Portfolio Dashboard</h1>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                Simulation Analytics
              </span>
            </div>
            <p className="text-gray-400 mt-1">
              Real-time returns, asset distribution, and historical performance
            </p>
          </div>

          <button
            onClick={fetchPortfolio}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#121824] hover:bg-[#1a2333] border border-[#1f2937] rounded-xl text-gray-300 transition w-fit"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
            <div className="text-gray-400 text-xs font-medium">Total Portfolio Value</div>
            <div className="text-2xl font-mono font-extrabold text-white mt-1">
              {formatINR(data?.totalPortfolioValue || 0)}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Cash + Active Holdings</div>
          </div>

          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
            <div className="text-gray-400 text-xs font-medium">Total Virtual Investment</div>
            <div className="text-2xl font-mono font-extrabold text-gray-300 mt-1">
              {formatINR(data?.totalInvestment || 1000000)}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">Initial Demo Seed Capital</div>
          </div>

          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
            <div className="text-gray-400 text-xs font-medium">Total Profit / Loss</div>
            <div
              className={`text-2xl font-mono font-extrabold mt-1 flex items-center gap-1 ${
                isProfit ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {isProfit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              {formatINR(data?.totalPnl || 0, true)}
            </div>
            <div
              className={`text-[11px] font-semibold mt-1 ${
                isProfit ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatPercent(data?.totalPnlPercent || 0)} Total Return
            </div>
          </div>

          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
            <div className="text-gray-400 text-xs font-medium">Daily 24h P&L</div>
            <div
              className={`text-2xl font-mono font-extrabold mt-1 ${
                (data?.dailyPnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {formatINR(data?.dailyPnl || 0, true)}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              {formatPercent(data?.dailyPnlPercent || 0)} 24h shift
            </div>
          </div>
        </div>

        {/* Asset Allocation & Performance Curve Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Asset Allocation Donut / Bar (Col 5) */}
          <div className="lg:col-span-5 bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2937] mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" />
                Asset Allocation
              </h3>
              <span className="text-[11px] text-gray-500">Capital Distribution</span>
            </div>

            {/* Distribution Stacked Bar */}
            <div className="w-full h-4 rounded-full bg-gray-800 flex overflow-hidden mb-6">
              {data?.allocation.map((item) => (
                <div
                  key={item.symbol}
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  title={`${item.label}: ${item.percentage}%`}
                  className="h-full transition-all duration-500"
                />
              ))}
            </div>

            {/* Legend list */}
            <div className="space-y-3">
              {data?.allocation.map((item) => (
                <div key={item.symbol} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-white">{item.label}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-gray-300 font-bold mr-2">{formatINR(item.value)}</span>
                    <span className="text-gray-400">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trend History (Col 7) */}
          <div className="lg:col-span-7 bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1f2937] mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Performance Trajectory (7 Days)
                </h3>
                <span className="text-[11px] text-gray-500 font-mono">Daily Close</span>
              </div>

              {/* Bar / Trend Chart */}
              <div className="grid grid-cols-7 gap-2 items-end h-44 pt-6 pb-2">
                {data?.performanceHistory.map((pt, idx) => {
                  const values = data.performanceHistory.map((p) => p.value);
                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  const heightPercent = Math.max(
                    15,
                    Math.min(100, ((pt.value - min * 0.98) / ((max - min * 0.98) || 1)) * 100)
                  );

                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-blue-600/30 to-blue-500 rounded-t-lg transition-all duration-500 hover:brightness-125"
                        title={`${pt.date}: ${formatINR(pt.value)}`}
                      />
                      <span className="text-[10px] text-gray-500">{pt.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1f2937] flex items-center justify-between text-[11px] text-gray-400">
              <span>Simulation Benchmark Rate</span>
              <span className="text-emerald-400 font-semibold">+6.4% Compound Growth</span>
            </div>
          </div>
        </div>

        {/* Individual Coin Holdings Table */}
        <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1f2937] bg-[#121824] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Holdings Detail</h3>
            <span className="text-xs text-gray-400 font-mono">
              {data?.holdings.length || 0} Assets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead className="bg-[#121824] text-gray-400 uppercase text-[10px] font-semibold tracking-wider font-sans">
                <tr>
                  <th className="px-6 py-3">Asset</th>
                  <th className="px-4 py-3">Holdings</th>
                  <th className="px-4 py-3">Avg Buy Price</th>
                  <th className="px-4 py-3">Current Price</th>
                  <th className="px-4 py-3">Current Value</th>
                  <th className="px-4 py-3">Unrealized P&L</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {data?.holdings && data.holdings.length > 0 ? (
                  data.holdings.map((h) => {
                    const isCoinProfit = h.pnl >= 0;
                    return (
                      <tr key={h.coin} className="hover:bg-[#121824] transition text-[11px]">
                        <td className="px-6 py-3.5 font-sans font-bold text-white flex items-center gap-2">
                          <img src={h.logo} alt={h.name} className="w-6 h-6 rounded-full" />
                          <div>
                            <div>{h.name}</div>
                            <div className="text-[10px] text-gray-400 font-normal">{h.coin}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-white">{formatQuantity(h.quantity)}</td>
                        <td className="px-4 py-3.5 text-gray-300">
                          {formatCurrencyFull(h.avgBuyPrice)}
                        </td>
                        <td className="px-4 py-3.5 text-white font-bold">
                          {formatCurrencyFull(h.currentPrice)}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-white">
                          {formatINR(h.currentValue)}
                        </td>
                        <td
                          className={`px-4 py-3.5 font-bold ${
                            isCoinProfit ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {isCoinProfit ? '+' : ''}
                          {formatINR(h.pnl)} ({formatPercent(h.pnlPercent)})
                        </td>
                        <td className="px-6 py-3.5 text-right font-sans">
                          <a
                            href={`/trade/spot?pair=${h.coin}INR`}
                            className="px-3 py-1 rounded-lg bg-[#0052fe] hover:bg-[#1652f0] text-white font-semibold transition"
                          >
                            Trade
                          </a>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500 font-sans">
                      You currently hold only INR cash. Buy crypto in{' '}
                      <a href="/trade/spot" className="text-blue-400 underline">
                        Spot Trading
                      </a>{' '}
                      to build your portfolio!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
