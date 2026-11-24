import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Award, HeartHandshake, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070a0e] border-t border-[#1a2230] text-gray-400 text-xs pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compliance and Trust Highlights (CoinDCX style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-[#1a2230]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">F.I.U. Compliant</div>
              <div className="text-[11px] text-gray-500">Adhering to Indian regulatory standards</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">ISO/IEC 27001:2022</div>
              <div className="text-[11px] text-gray-500">Global grade security infrastructure</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Proof of Reserve</div>
              <div className="text-[11px] text-gray-500">100% virtual demo asset backing</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">24x7 AI Assistance</div>
              <div className="text-[11px] text-gray-500">Instant technical analysis & advice</div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10">
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Products</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/trade/spot" className="hover:text-white transition">CoinDCX Spot</Link></li>
              <li><Link to="/trade/futures" className="hover:text-white transition">CoinDCX Futures (50x)</Link></li>
              <li><Link to="/markets" className="hover:text-white transition">Crypto Prices</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-white transition">AI Market Analyst</Link></li>
              <li><Link to="/wallet" className="hover:text-white transition">Virtual Wallet</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Popular Coins</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/trade/spot?pair=BTCINR" className="hover:text-white transition">Buy Bitcoin (BTC)</Link></li>
              <li><Link to="/trade/spot?pair=ETHINR" className="hover:text-white transition">Buy Ethereum (ETH)</Link></li>
              <li><Link to="/trade/spot?pair=SOLINR" className="hover:text-white transition">Buy Solana (SOL)</Link></li>
              <li><Link to="/trade/spot?pair=XRPINR" className="hover:text-white transition">Buy Ripple (XRP)</Link></li>
              <li><Link to="/trade/spot?pair=DOGEINR" className="hover:text-white transition">Buy Dogecoin (DOGE)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Applied AI Tools</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/ai-assistant" className="hover:text-white transition">RSI & MACD Screener</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-white transition">Bullish/Bearish Sentiment</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-white transition">AI Trade Review</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-white transition">Trading Coach Chatbot</Link></li>
              <li><Link to="/portfolio" className="hover:text-white transition">Portfolio Diagnostics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company & Learn</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="https://coindcx.com/blog/" target="_blank" rel="noreferrer" className="hover:text-white transition inline-flex items-center gap-1">CoinDCX Blog <ExternalLink className="w-2.5 h-2.5" /></a></li>
              <li><a href="https://coindcx.com/" target="_blank" rel="noreferrer" className="hover:text-white transition inline-flex items-center gap-1">Official Reference <ExternalLink className="w-2.5 h-2.5" /></a></li>
              <li><span className="text-gray-500">B.Tech Applied AI Project</span></li>
              <li><span className="text-gray-500">Academic Simulation</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Demo Notice</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              This platform is an independent educational simulation built exclusively for a B.Tech Applied AI project. It uses original branding named <strong>CoinDCX Demo</strong>.
            </p>
            <div className="mt-3 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]">
              No real fiat or cryptocurrency is transacted. All balances are virtual demo funds.
            </div>
          </div>
        </div>

        {/* Regulatory Disclaimer (Mandatory) */}
        <div className="border-t border-[#1a2230] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} CoinDCX Demo. All rights reserved. Built for B.Tech Applied AI.
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/profile" className="hover:text-gray-300">Terms of Use</Link>
            <Link to="/profile" className="hover:text-gray-300">Privacy Policy</Link>
            <Link to="/profile" className="hover:text-gray-300">Risk Disclosure</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
