import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  BarChart2,
  Wallet,
  PieChart,
  Bot,
  FileText,
  Search,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Shield,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { formatINR } from '../utils/formatters';

interface NavbarProps {
  onOpenSearch?: () => void;
  onOpenDeposit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onOpenDeposit }) => {
  const { user, logout, demoLogin } = useAuth();
  const { wallet } = useWallet();
  const location = useLocation();
  const navigate = useNavigate();

  const [tradeMenuOpen, setTradeMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isTradeActive = location.pathname.startsWith('/trade');

  return (
    <nav className="bg-[#0b0e14] border-b border-[#1f2937] sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0052fe] to-[#00d395] flex items-center justify-center p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
                <div className="w-full h-full bg-[#0b0e14] rounded-[10px] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full border-2 border-[#0052fe] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#00d395] rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  Coin<span className="text-[#0052fe]">DCX</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Demo
                </span>
              </div>
            </Link>

            {/* Nav Links (Desktop) */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                to="/markets"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/markets')
                    ? 'text-white bg-[#1a2333]'
                    : 'text-gray-300 hover:text-white hover:bg-[#121824]'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Markets
              </Link>

              {/* Trade Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setTradeMenuOpen(!tradeMenuOpen)}
                  onBlur={() => setTimeout(() => setTradeMenuOpen(false), 200)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                    isTradeActive
                      ? 'text-white bg-[#1a2333]'
                      : 'text-gray-300 hover:text-white hover:bg-[#121824]'
                  }`}
                >
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  Trade
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${tradeMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {tradeMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#121824] border border-[#1f2937] shadow-2xl py-2 z-50">
                    <Link
                      to="/trade/spot"
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-[#1a2333] transition"
                      onClick={() => setTradeMenuOpen(false)}
                    >
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
                        <BarChart2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Spot Trading</div>
                        <div className="text-xs text-gray-400">Buy & Sell crypto with INR</div>
                      </div>
                    </Link>
                    <Link
                      to="/trade/futures"
                      className="flex items-start gap-3 px-4 py-2.5 hover:bg-[#1a2333] transition"
                      onClick={() => setTradeMenuOpen(false)}
                    >
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white flex items-center gap-1.5">
                          Futures Trading
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">50x</span>
                        </div>
                        <div className="text-xs text-gray-400">Long & Short with leverage</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/portfolio"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/portfolio')
                    ? 'text-white bg-[#1a2333]'
                    : 'text-gray-300 hover:text-white hover:bg-[#121824]'
                }`}
              >
                <PieChart className="w-4 h-4 text-purple-400" />
                Portfolio
              </Link>

              <Link
                to="/wallet"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/wallet')
                    ? 'text-white bg-[#1a2333]'
                    : 'text-gray-300 hover:text-white hover:bg-[#121824]'
                }`}
              >
                <Wallet className="w-4 h-4 text-cyan-400" />
                Wallet
              </Link>

              <Link
                to="/ai-assistant"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/ai-assistant')
                    ? 'text-white bg-[#1a2333]'
                    : 'text-gray-300 hover:text-white hover:bg-[#121824]'
                }`}
              >
                <Bot className="w-4 h-4 text-blue-400" />
                AI Assistant
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1 py-0.2 rounded font-semibold">
                  AI
                </span>
              </Link>

              <Link
                to="/orders"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive('/orders')
                    ? 'text-white bg-[#1a2333]'
                    : 'text-gray-300 hover:text-white hover:bg-[#121824]'
                }`}
              >
                <FileText className="w-4 h-4 text-gray-400" />
                Orders
              </Link>
            </div>
          </div>

          {/* Right Header Section */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121824] hover:bg-[#1a2333] border border-[#1f2937] text-gray-400 hover:text-gray-200 text-xs transition"
            >
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <span>Search Coins (BTC, ETH...)</span>
              <kbd className="bg-[#1f2937] px-1.5 py-0.5 rounded text-[10px] text-gray-400">Ctrl K</kbd>
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Balance Pill */}
                {wallet && (
                  <div
                    onClick={onOpenDeposit}
                    className="cursor-pointer bg-gradient-to-r from-blue-950/60 to-emerald-950/40 border border-blue-900/60 hover:border-blue-700/80 px-3 py-1.5 rounded-xl flex items-center gap-2 transition"
                    title="Click to deposit demo funds"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <div className="text-left">
                      <div className="text-[10px] text-gray-400 font-medium">Virtual Portfolio</div>
                      <div className="text-xs font-bold text-white">{formatINR(wallet.totalPortfolioValue)}</div>
                    </div>
                  </div>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                    className="flex items-center gap-2 bg-[#121824] hover:bg-[#1a2333] border border-[#1f2937] px-3 py-1.5 rounded-xl text-sm font-medium text-white transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#0052fe] flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#121824] border border-[#1f2937] shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#1f2937]">
                        <p className="text-xs font-semibold text-white">{user.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400">
                          <Shield className="w-3 h-3" />
                          <span>KYC Verified Demo</span>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#1a2333]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-3.5 h-3.5" />
                        My Profile & Limits
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#1a2333]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Trading Settings
                      </Link>
                      <Link
                        to="/history"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#1a2333]"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Transaction History
                      </Link>
                      <div className="border-t border-[#1f2937] my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          navigate('/');
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await demoLogin();
                    navigate('/markets');
                  }}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-xs font-semibold px-3 py-2 rounded-lg transition"
                >
                  ⚡ Instant Demo
                </button>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#121824] transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#0052fe] hover:bg-[#1652f0] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-blue-500/25 transition"
                >
                  Sign Up (₹10 Lakh Free)
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#121824]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1f2937] bg-[#0b0e14] px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/markets"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm text-gray-200 py-2"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Markets
          </Link>
          <Link
            to="/trade/spot"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm text-gray-200 py-2"
          >
            <BarChart2 className="w-4 h-4 text-blue-400" />
            Spot Trading
          </Link>
          <Link
            to="/trade/futures"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm text-gray-200 py-2"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Futures Trading (50x)
          </Link>
          <Link
            to="/portfolio"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm text-gray-200 py-2"
          >
            <PieChart className="w-4 h-4 text-purple-400" />
            Portfolio
          </Link>
          <Link
            to="/wallet"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm text-gray-200 py-2"
          >
            <Wallet className="w-4 h-4 text-cyan-400" />
            Wallet
          </Link>
          <Link
            to="/ai-assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm text-gray-200 py-2"
          >
            <Bot className="w-4 h-4 text-blue-400" />
            AI Assistant
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm text-gray-200 py-2"
          >
            <FileText className="w-4 h-4 text-gray-400" />
            Orders
          </Link>

          <div className="pt-3 border-t border-[#1f2937]">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Logged in as {user.name}</div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center text-xs py-2 bg-red-500/10 text-red-400 rounded-lg"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs py-2 bg-[#121824] text-white rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-xs py-2 bg-[#0052fe] text-white rounded-lg font-semibold"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
