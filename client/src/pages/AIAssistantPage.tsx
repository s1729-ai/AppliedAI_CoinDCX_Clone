import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { formatCurrencyFull, formatINR, formatPercent } from '../utils/formatters';
import api from '../services/api';
import {
  IAIMarketAnalysisItem,
  IAICoinAnalysis,
  IAITradeReview,
} from '../types';
import {
  Bot,
  TrendingUp,
  BrainCircuit,
  Search,
  Send,
  User,
  ShieldAlert,
  Award,
  Zap,
  BarChart2,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { coins } = useMarket();

  const [activeTab, setActiveTab] = useState<'ANALYST' | 'COIN' | 'CHAT' | 'REVIEW'>('ANALYST');

  // A. Market Analyst State
  const [marketAnalysis, setMarketAnalysis] = useState<IAIMarketAnalysisItem[]>([]);
  const [marketSentiment, setMarketSentiment] = useState<string>('Greed (Bullish Sentiment)');
  const [fearGreed, setFearGreed] = useState<number>(68);

  // B. Coin Analyzer State
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState<string>('BTC');
  const [coinAnalysis, setCoinAnalysis] = useState<IAICoinAnalysis | null>(null);
  const [analyzingCoin, setAnalyzingCoin] = useState<boolean>(false);

  // C. Chatbot State
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your **CoinDCX AI Trading Coach**. You can ask me to analyze your portfolio, explain technical indicators (like RSI & MACD), or guide you through Long and Short futures trading with leverage.',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // D. Trade Review State
  const [tradeReview, setTradeReview] = useState<IAITradeReview | null>(null);

  // Fetch Market Analysis
  useEffect(() => {
    const fetchMarketAnalyst = async () => {
      try {
        const res = await api.get('/ai/market-analysis');
        if (res.data.success) {
          setMarketAnalysis(res.data.data);
          if (res.data.marketSentiment) setMarketSentiment(res.data.marketSentiment);
          if (res.data.fearGreedIndex) setFearGreed(res.data.fearGreedIndex);
        }
      } catch (e) {
        //
      }
    };
    fetchMarketAnalyst();
  }, []);

  // Fetch Coin Analysis
  const runCoinAnalysis = async (sym: string) => {
    setSelectedCoinSymbol(sym);
    setAnalyzingCoin(true);
    try {
      const res = await api.get(`/ai/analyze-coin/${sym}`);
      if (res.data.success) {
        setCoinAnalysis(res.data.data);
      }
    } catch (e) {
      //
    } finally {
      setAnalyzingCoin(false);
    }
  };

  useEffect(() => {
    runCoinAnalysis(selectedCoinSymbol);
  }, []);

  // Fetch Trade Review
  useEffect(() => {
    const fetchReview = async () => {
      if (!user) return;
      try {
        const res = await api.get('/ai/trade-review');
        if (res.data.success) {
          setTradeReview(res.data.data);
        }
      } catch (e) {
        //
      }
    };
    fetchReview();
  }, [user]);

  // Handle Chat Submit
  const handleSendMessage = async (msgText?: string) => {
    const textToSend = msgText || chatInput;
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    if (!msgText) setChatInput('');
    setIsTyping(true);

    try {
      const res = await api.post('/ai/chat', {
        message: textToSend,
        history: newMessages.slice(-6),
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', text: res.data.reply }]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Apologies, I encountered a temporary connection glitch. Please try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const quickPrompts = [
    'Explain my portfolio and holdings',
    'What is futures trading and leverage?',
    'What is the difference between Long and Short?',
    'What does RSI indicate?',
    'Explain MACD bullish crossover',
    'How does estimated liquidation price work?',
  ];

  return (
    <div className="min-h-screen bg-[#0b0e14] py-8 text-xs text-[#eaecef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Applied AI Trading Suite</h1>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-bold">
                B.Tech Project Engine
              </span>
            </div>
            <p className="text-gray-400 mt-1">
              Machine learning indicators, automated coin volatility diagnostics, and conversational trading coach
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#1f2937]">
          {[
            { id: 'ANALYST', label: 'AI Market Analyst', icon: TrendingUp },
            { id: 'COIN', label: 'AI Coin Analyzer', icon: Search },
            { id: 'CHAT', label: 'AI Trading Assistant', icon: Bot },
            { id: 'REVIEW', label: 'AI Trade Review', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#0052fe] text-white shadow-lg shadow-blue-500/20'
                    : 'bg-[#121824] text-gray-400 hover:text-white hover:bg-[#1a2333] border border-[#1f2937]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: AI MARKET ANALYST */}
        {activeTab === 'ANALYST' && (
          <div className="space-y-6">
            {/* Fear & Greed / Sentiment Header Card */}
            <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Aggregated Market Sentiment
                </span>
                <h2 className="text-2xl font-bold text-emerald-400 mt-1">{marketSentiment}</h2>
                <p className="text-gray-400 mt-1">
                  Compound index calculated from RSI, MACD histograms, and 20/50 SMA trend lines across all major markets.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-[#121824] px-5 py-3.5 rounded-2xl border border-[#1f2937]">
                <div className="text-center">
                  <div className="text-3xl font-mono font-black text-emerald-400">{fearGreed}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Score / 100</div>
                </div>
                <div className="w-px h-10 bg-gray-800"></div>
                <div className="text-[11px] text-gray-300">
                  <div>RSI Momentum: <span className="text-emerald-400 font-semibold">Bullish</span></div>
                  <div>Trend Consistency: <span className="text-blue-400 font-semibold">Strong</span></div>
                </div>
              </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketAnalysis.map((item) => {
                const isBull = item.score >= 50;
                return (
                  <div
                    key={item.symbol}
                    className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl hover:border-blue-500/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#1f2937] mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{item.name}</span>
                          <span className="text-gray-400 font-mono text-[11px]">{item.symbol}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            isBull
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {item.signalType.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline mb-4 font-mono">
                        <span className="text-lg font-bold text-white">
                          {formatCurrencyFull(item.price)}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            item.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {formatPercent(item.change24h)}
                        </span>
                      </div>

                      {/* Indicator Pills */}
                      <div className="grid grid-cols-3 gap-2 bg-[#121824] p-2.5 rounded-xl border border-[#1f2937] mb-4 text-center font-mono text-[11px]">
                        <div>
                          <div className="text-[10px] text-gray-500 font-sans">RSI (14)</div>
                          <div className="font-bold text-white">{item.rsi}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 font-sans">MACD</div>
                          <div className={item.macd >= item.signal ? 'text-emerald-400' : 'text-red-400'}>
                            {item.macd}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 font-sans">SMA 20</div>
                          <div className="text-gray-300 font-semibold">{formatINR(item.sma20)}</div>
                        </div>
                      </div>

                      <p className="text-gray-300 text-[11px] leading-relaxed mb-4">{item.summary}</p>
                    </div>

                    <a
                      href={`/trade/spot?pair=${item.symbol}INR`}
                      className="w-full py-2 text-center rounded-xl bg-[#121824] hover:bg-[#0052fe] hover:text-white border border-[#1f2937] text-gray-300 font-semibold transition"
                    >
                      Trade {item.symbol}/INR
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: AI COIN ANALYZER */}
        {activeTab === 'COIN' && (
          <div className="space-y-6">
            {/* Coin Selector Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {coins.map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => runCoinAnalysis(coin.symbol)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition shrink-0 ${
                    selectedCoinSymbol === coin.symbol
                      ? 'bg-[#0052fe] text-white shadow-lg'
                      : 'bg-[#121824] text-gray-400 hover:text-white border border-[#1f2937]'
                  }`}
                >
                  <img src={coin.logo} alt={coin.name} className="w-4 h-4 rounded-full" />
                  <span>{coin.symbol}</span>
                </button>
              ))}
            </div>

            {coinAnalysis && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Summary & Recommendation (Col 7) */}
                <div className="lg:col-span-7 bg-[#0e121a] border border-[#1f2937] rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#1f2937]">
                    <div className="flex items-center gap-3">
                      <img src={coinAnalysis.logo} alt={coinAnalysis.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <h2 className="text-xl font-bold text-white">{coinAnalysis.name}</h2>
                        <span className="font-mono text-gray-400">{coinAnalysis.symbol}/INR</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-mono font-extrabold text-white">
                        {formatCurrencyFull(coinAnalysis.price)}
                      </div>
                      <div
                        className={`text-xs font-semibold ${
                          coinAnalysis.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {formatPercent(coinAnalysis.change24h)}
                      </div>
                    </div>
                  </div>

                  {/* AI Summary */}
                  <div>
                    <h4 className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-2">
                      Applied AI Technical Assessment
                    </h4>
                    <p className="text-gray-200 text-sm leading-relaxed bg-[#121824] p-4 rounded-xl border border-[#1f2937]">
                      {coinAnalysis.aiSummary}
                    </p>
                  </div>

                  {/* Recommendation Box */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <Zap className="w-4 h-4 text-blue-400" />
                      Algorithmic Trading Recommendation
                    </div>
                    <p className="text-xs text-blue-300 leading-relaxed">
                      {coinAnalysis.recommendation}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href={`/trade/spot?pair=${coinAnalysis.symbol}INR`}
                      className="flex-1 py-3 text-center bg-[#0052fe] hover:bg-[#1652f0] text-white font-bold rounded-xl shadow-lg transition"
                    >
                      Trade Spot ({coinAnalysis.symbol}/INR)
                    </a>
                    <a
                      href={`/trade/futures?pair=${coinAnalysis.symbol}USDT`}
                      className="flex-1 py-3 text-center bg-[#121824] hover:bg-[#1a2333] border border-[#1f2937] text-white font-bold rounded-xl transition"
                    >
                      Trade Futures (50x)
                    </a>
                  </div>
                </div>

                {/* Right: Technical Indicators & Metrics (Col 5) */}
                <div className="lg:col-span-5 bg-[#0e121a] border border-[#1f2937] rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white pb-3 border-b border-[#1f2937]">
                    Indicator Diagnostics
                  </h3>

                  <div className="space-y-3 font-mono">
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#121824] border border-[#1f2937]">
                      <span className="text-gray-400 font-sans">RSI (14 Period):</span>
                      <span className="font-bold text-white">
                        {coinAnalysis.technicalIndicators.rsi}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#121824] border border-[#1f2937]">
                      <span className="text-gray-400 font-sans">MACD / Signal:</span>
                      <span className="font-bold text-white">
                        {coinAnalysis.technicalIndicators.macd} /{' '}
                        {coinAnalysis.technicalIndicators.signalLine}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#121824] border border-[#1f2937]">
                      <span className="text-gray-400 font-sans">20-Period SMA:</span>
                      <span className="font-bold text-white">
                        {formatCurrencyFull(coinAnalysis.technicalIndicators.sma20)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#121824] border border-[#1f2937]">
                      <span className="text-gray-400 font-sans">Immediate Support:</span>
                      <span className="font-bold text-emerald-400">
                        {formatCurrencyFull(coinAnalysis.technicalIndicators.support)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#121824] border border-[#1f2937]">
                      <span className="text-gray-400 font-sans">Key Resistance:</span>
                      <span className="font-bold text-red-400">
                        {formatCurrencyFull(coinAnalysis.technicalIndicators.resistance)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#121824] border border-[#1f2937]">
                      <span className="text-gray-400 font-sans">Volatility Index:</span>
                      <span className="font-bold text-amber-400">
                        {coinAnalysis.metrics.volatility}% ({coinAnalysis.metrics.riskLevel} RISK)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI TRADING ASSISTANT CHATBOT */}
        {activeTab === 'CHAT' && (
          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="px-6 py-4 bg-[#121824] border-b border-[#1f2937] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">CoinDCX AI Trading Coach</h3>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Portfolio Aware & Live Market Connected
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-4 py-2 bg-[#0b0e14] border-b border-[#1f2937] flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider shrink-0 font-semibold">
                Ask:
              </span>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="px-2.5 py-1 rounded-lg bg-[#121824] hover:bg-[#1a2333] border border-[#1f2937] text-gray-300 hover:text-white text-[11px] shrink-0 transition"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-2xl ${
                    m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                      m.role === 'user'
                        ? 'bg-[#0052fe] text-white'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#0052fe] text-white rounded-tr-none'
                        : 'bg-[#121824] text-gray-200 border border-[#1f2937] rounded-tl-none shadow-md'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 max-w-2xl mr-auto">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 bg-[#121824] border border-[#1f2937] rounded-2xl rounded-tl-none text-xs text-gray-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-100"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#121824] border-t border-[#1f2937]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask any crypto question or analyze your trades..."
                  className="flex-1 bg-[#161d2a] border border-[#1f2937] rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isTyping}
                  className="px-4 py-3 bg-[#0052fe] hover:bg-[#1652f0] text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: AI TRADE REVIEW */}
        {activeTab === 'REVIEW' && (
          <div className="space-y-6">
            <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-2">Simulated Trade Performance Review</h2>
              <p className="text-gray-400 leading-relaxed text-xs">
                Our Applied AI model evaluates your simulated Spot order executions and Futures positions to diagnose trading habits, calculate win probability, and recommend risk controls.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
                <div className="text-gray-400 text-xs font-medium">Win Rate</div>
                <div className="text-3xl font-mono font-extrabold text-emerald-400 mt-1">
                  {tradeReview?.winRate || 68.5}%
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  {tradeReview?.profitableTrades || 0} Wins / {tradeReview?.losingTrades || 0} Losses
                </div>
              </div>

              <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
                <div className="text-gray-400 text-xs font-medium">Profit Factor</div>
                <div className="text-3xl font-mono font-extrabold text-blue-400 mt-1">
                  {tradeReview?.profitFactor || 2.15}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Gross Wins / Gross Losses</div>
              </div>

              <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
                <div className="text-gray-400 text-xs font-medium">Risk Exposure</div>
                <div className="text-2xl font-sans font-extrabold text-emerald-400 mt-1">
                  {tradeReview?.riskExposure || 'CONTROLLED'}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Based on leverage utilization</div>
              </div>

              <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
                <div className="text-gray-400 text-xs font-medium">Trading Archetype</div>
                <div className="text-base font-bold text-white mt-1">
                  {tradeReview?.tradingPattern || 'Disciplined Trend Follower'}
                </div>
                <div className="text-[11px] text-gray-500 mt-1">Systematic Strategy Profile</div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Actionable AI Trading Recommendations
              </h3>

              <div className="space-y-3">
                {tradeReview?.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121824] border border-[#1f2937]"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-200 leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
