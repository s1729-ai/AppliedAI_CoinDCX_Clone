import React from 'react';
import { AlertCircle, PlusCircle, ShieldCheck } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';

export const DemoBanner: React.FC = () => {
  const { wallet, depositDemoFunds } = useWallet();
  const { user } = useAuth();

  const handleQuickAdd = async () => {
    try {
      await depositDemoFunds(100000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-950 via-[#0d1527] to-[#121c33] border-b border-blue-900/40 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 select-none">
      <div className="flex items-center gap-2 text-blue-200">
        <span className="flex items-center gap-1 font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          DEMO SIMULATION
        </span>
        <span className="hidden sm:inline text-gray-300">
          Independent Educational Simulation for B.Tech Applied AI — Not the official CoinDCX service. All funds and trades are 100% virtual.
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user && wallet && (
          <div className="flex items-center gap-1.5 bg-[#0b0e14]/80 px-2.5 py-0.5 rounded border border-gray-800">
            <span className="text-gray-400">Virtual INR:</span>
            <span className="font-semibold text-emerald-400">{formatINR(wallet.inrBalance)}</span>
          </div>
        )}

        {user && (
          <button
            onClick={handleQuickAdd}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-medium px-2 py-0.5 rounded transition text-[11px]"
            title="Add ₹1,00,000 virtual INR to demo wallet"
          >
            <PlusCircle className="w-3 h-3" />
            +₹1 Lakh Demo
          </button>
        )}
      </div>
    </div>
  );
};
