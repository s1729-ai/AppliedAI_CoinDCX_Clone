import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyFull, formatPercent, formatINR } from '../utils/formatters';
import { SparklineChart } from '../components/SparklineChart';
import {
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  Award,
  Lock,
  ChevronRight,
  Bot,
  PieChart,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { coins, futures } = useMarket();
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'POPULAR' | 'GAINERS' | 'LOSERS'>('POPULAR');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Sorting
  let displayedCoins = [...coins];
  if (activeTab === 'GAINERS') {
    displayedCoins.sort((a, b) => b.change24h - a.change24h);
  } else if (activeTab === 'LOSERS') {
    displayedCoins.sort((a, b) => a.change24h - b.change24h);
  } else {
    // Popular default
    displayedCoins = coins.slice(0, 6);
  }

  const handleInstantDemo = async () => {
    await demoLogin();
    navigate('/markets');
  };

  const faqs = [
    {
      q: 'What is CoinDCX Demo?',
      a: 'CoinDCX Demo is an independent educational cryptocurrency exchange simulation built for a B.Tech Applied AI project. It replicates the CoinDCX user experience and trading workflows using 100% virtual demo funds (₹10,00,000 initial balance) with no real financial risk.',
    },
    {
      q: 'How does Spot Trading work on this platform?',
      a: 'Spot Trading allows you to simulate purchasing and selling cryptocurrencies (BTC, ETH, SOL, etc.) with virtual INR. Your virtual wallet updates in real time based on simulated 0.1% fees and live CoinDCX market prices.',
    },
    {
      q: 'How does Futures Trading with 50x Leverage work?',
      a: 'In Futures Trading, you can open Long positions (profiting when prices rise) or Short positions (profiting when prices fall) using up to 50x virtual leverage. The system accurately calculates liquidation price, unrealized P&L, and margin requirements.',
    },
    {
      q: 'What AI features are integrated into this project?',
      a: 'The platform integrates four specialized Applied AI components: an AI Market Analyst (RSI, MACD, and multi-indicator bullish/bearish scoring), an AI Coin Analyzer (volatility and risk rating), an AI Trading Assistant (conversational crypto coach), and an AI Trade Reviewer (evaluating user win rates and risk management).',
    },
    {
      q: 'Is real money required or transacted?',
      a: 'No. This platform is strictly for academic and learning purposes. All deposits, balances, orders, and futures positions use virtual simulated funds.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#eaecef]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[#1f2937]">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0052fe]/15 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                <span>India Ka Crypto Coach — Demo Edition</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                India's Safest & Simplest <br />
                <span className="bg-gradient-to-r from-[#0052fe] via-[#00a3ff] to-[#00d395] bg-clip-text text-transparent">
                  Crypto Trading Simulation
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Experience real-time Spot & Futures crypto trading powered by Applied AI.
                Practice with <strong>₹10,00,000 virtual INR</strong>, live market data, TradingView candlestick charts, and personal AI trade reviews.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                {user ? (
                  <Link
                    to="/trade/spot"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0052fe] hover:bg-[#1652f0] text-white font-bold text-sm shadow-xl shadow-blue-500/30 transition transform hover:-translate-y-0.5"
                  >
                    <span>Launch Spot Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleInstantDemo}
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition transform hover:-translate-y-0.5"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Instant Demo (₹10 Lakh Free)</span>
                    </button>
                    <Link
                      to="/register"
                      className="px-6 py-3.5 rounded-xl bg-[#121824] hover:bg-[#1a2333] border border-[#1f2937] text-white font-bold text-sm transition"
                    >
                      Create Account
                    </Link>
                  </>
                )}
                <Link
                  to="/ai-assistant"
                  className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-800/40 text-blue-300 font-semibold text-sm transition"
                >
                  <Bot className="w-4 h-4 text-blue-400" />
                  <span>AI Analyst</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#1f2937] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>₹10,00,000 Demo Balance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Zero Real Risk</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Up to 50x Futures</span>
                </div>
              </div>
            </div>

            {/* Right Hero Ticker Cards */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-[#1f2937]">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Trending Markets (INR)
                  </span>
                  <Link to="/markets" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-[#1f2937]">
                  {coins.slice(0, 4).map((coin) => (
                    <Link
                      key={coin.symbol}
                      to={`/trade/spot?pair=${coin.symbol}INR`}
                      className="flex items-center justify-between py-3.5 hover:bg-[#121824] px-2 rounded-xl transition group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={coin.logo} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400 transition">
                            {coin.symbol}
                          </div>
                          <div className="text-xs text-gray-400">{coin.name}</div>
                        </div>
                      </div>

                      <div className="hidden sm:block">
                        <SparklineChart
                          data={coin.sparkline}
                          isPositive={coin.change24h >= 0}
                          width={80}
                          height={28}
                        />
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-white">
                          {formatCurrencyFull(coin.lastPrice)}
                        </div>
                        <div
                          className={`text-xs font-semibold ${
                            coin.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {formatPercent(coin.change24h)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Cryptocurrencies Table Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Top Cryptocurrencies Today</h2>
            <p className="text-xs text-gray-400 mt-1">
              Live market rates streamed from CoinDCX and simulated public tickers
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-[#121824] p-1 rounded-xl border border-[#1f2937]">
            <button
              onClick={() => setActiveTab('POPULAR')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'POPULAR'
                  ? 'bg-[#0052fe] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setActiveTab('GAINERS')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'GAINERS'
                  ? 'bg-[#0052fe] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Top Gainers
            </button>
            <button
              onClick={() => setActiveTab('LOSERS')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'LOSERS'
                  ? 'bg-[#0052fe] text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Top Losers
            </button>
          </div>
        </div>

        {/* Coin Table */}
        <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121824] text-gray-400 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">24h Change</th>
                  <th className="px-4 py-3.5 hidden md:table-cell">24h High / Low</th>
                  <th className="px-4 py-3.5 hidden lg:table-cell">24h Volume</th>
                  <th className="px-4 py-3.5 hidden sm:table-cell text-center">Trend (7d)</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {displayedCoins.map((coin) => (
                  <tr key={coin.symbol} className="hover:bg-[#121824] transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={coin.logo} alt={coin.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="font-bold text-white text-sm">{coin.name}</div>
                          <div className="text-[11px] text-gray-400">{coin.symbol}</div>
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
                    <td className="px-4 py-4 hidden md:table-cell font-mono text-gray-400">
                      <div>H: {formatCurrencyFull(coin.high24h)}</div>
                      <div className="text-[10px] text-gray-500">L: {formatCurrencyFull(coin.low24h)}</div>
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
                      <Link
                        to={`/trade/spot?pair=${coin.symbol}INR`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0052fe] hover:bg-[#1652f0] text-white font-semibold text-xs transition"
                      >
                        Trade
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#121824] text-center border-t border-[#1f2937]">
            <Link
              to="/markets"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              Explore all 13+ cryptocurrencies in Markets <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Applied AI & Exchange Products Showcase */}
      <section className="py-16 bg-[#070a0e] border-y border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white">One Platform, Endless Possibilities</h2>
            <p className="text-sm text-gray-400 mt-2">
              Learn, test, and master crypto trading with cutting-edge tools built for B.Tech Applied AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Spot Card */}
            <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-6 hover:border-blue-500/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Spot Trading Terminal</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Execute simulated market and limit buys/sells across 13 major cryptocurrencies with real-time TradingView charts and live order books.
              </p>
              <Link
                to="/trade/spot"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
              >
                Start Spot Trading <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Futures Card */}
            <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-6 hover:border-emerald-500/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Futures Trading (50x)
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Test Long and Short trading strategies on BTCUSDT, ETHUSDT, and SOLUSDT with leverage up to 50x, TP/SL, and automated liquidation risk tracking.
              </p>
              <Link
                to="/trade/futures"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
              >
                Trade Futures Demo <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* AI Assistant Card */}
            <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-6 hover:border-purple-500/40 transition group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Applied AI Suite</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Leverage mathematical RSI & MACD signal detection, portfolio risk diagnostics, trade journal evaluations, and conversational AI guidance.
              </p>
              <Link
                to="/ai-assistant"
                className="text-xs font-bold text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
              >
                Open AI Analyst <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Have Questions? We've Got Answers</h2>
          <p className="text-xs text-gray-400 mt-2">Everything you need to know about the CoinDCX Demo simulation</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#0e121a] border border-[#1f2937] rounded-xl overflow-hidden transition"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-semibold text-white hover:text-blue-400 transition"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    faqOpen === idx ? 'rotate-90 text-blue-400' : ''
                  }`}
                />
              </button>
              {faqOpen === idx && (
                <div className="px-5 pb-4 text-xs text-gray-400 leading-relaxed border-t border-[#1f2937]/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
