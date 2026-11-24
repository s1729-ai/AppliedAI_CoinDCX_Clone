import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { formatINR } from '../utils/formatters';
import { ShieldCheck, User, Key, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { wallet } = useWallet();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-gray-400 text-xs">
        Please log in to view profile details.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] py-8 text-xs text-[#eaecef]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Account Profile</h1>
          <p className="text-gray-400 mt-1">Verification status, limits, and educational demo credentials</p>
        </div>

        {/* User Card */}
        <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0052fe] to-emerald-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                KYC Verified Demo
              </span>
            </div>
            <p className="text-gray-400 font-mono mt-0.5">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-400">
              <div>Role: <span className="text-white font-semibold capitalize">{user.role}</span></div>
              <div>Account Type: <span className="text-blue-400 font-semibold">Educational Demo</span></div>
              <div>Wallet Balance: <span className="text-emerald-400 font-bold">{formatINR(wallet?.inrBalance || 0)}</span></div>
            </div>
          </div>
        </div>

        {/* Security & Limits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Security & Verification
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#121824] border border-[#1f2937]">
                <div>
                  <div className="font-semibold text-white">PAN & Aadhaar KYC</div>
                  <div className="text-[10px] text-gray-500">Verified for demo trading simulation</div>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-[#121824] border border-[#1f2937]">
                <div>
                  <div className="font-semibold text-white">Two-Factor Authentication</div>
                  <div className="text-[10px] text-gray-500">Simulated 2FA security layer active</div>
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              Virtual Limits
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#121824] border border-[#1f2937]">
                <span className="text-gray-400">Daily Spot Order Limit:</span>
                <span className="font-mono text-white font-bold">₹50,00,000</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#121824] border border-[#1f2937]">
                <span className="text-gray-400">Max Futures Leverage:</span>
                <span className="font-mono text-amber-400 font-bold">50x</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[#121824] border border-[#1f2937]">
                <span className="text-gray-400">Simulated Maker / Taker Fee:</span>
                <span className="font-mono text-emerald-400 font-bold">0.10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Card */}
        <div className="p-4 rounded-xl bg-[#121824] border border-[#1f2937] text-gray-400 text-[11px] leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Educational Demonstration Note:</strong> This user profile and all associated wallets, orders, and balances exist purely inside the virtual environment for your B.Tech Applied AI project. No external financial or banking networks are involved.
          </div>
        </div>
      </div>
    </div>
  );
};
