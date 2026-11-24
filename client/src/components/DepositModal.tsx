import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { formatINR } from '../utils/formatters';
import { X, CheckCircle, PlusCircle, AlertCircle } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { wallet, depositDemoFunds } = useWallet();
  const [customAmount, setCustomAmount] = useState<string>('100000');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const presets = [25000, 50000, 100000, 500000];

  const handleDeposit = async (amt: number) => {
    setIsLoading(true);
    setSuccess(false);
    try {
      await depositDemoFunds(amt);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Deposit Virtual Funds</h3>
            <p className="text-xs text-gray-400">Add simulated INR to test trading risk-free</p>
          </div>
        </div>

        {/* Current Balance */}
        <div className="bg-[#121824] p-3 rounded-xl border border-[#1f2937] mb-4 flex justify-between items-center text-xs">
          <span className="text-gray-400">Current Balance:</span>
          <span className="font-mono text-emerald-400 font-bold text-sm">
            {formatINR(wallet?.inrBalance || 0)}
          </span>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2 font-medium">Select Amount</label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((amt) => (
              <button
                key={amt}
                onClick={() => handleDeposit(amt)}
                disabled={isLoading}
                className="py-2.5 px-3 rounded-xl bg-[#161d2a] hover:bg-[#1e2638] border border-gray-800 text-white font-mono text-xs font-semibold flex items-center justify-center gap-1 transition"
              >
                +{formatINR(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="mb-6">
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Custom Amount (INR)</label>
          <div className="relative">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-[#161d2a] border border-gray-800 rounded-xl px-3 py-2.5 text-white font-mono text-sm outline-none focus:border-blue-500"
              placeholder="e.g. 50000"
            />
            <span className="absolute right-3 top-3 text-gray-400 font-mono text-xs">INR</span>
          </div>
        </div>

        {success ? (
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            Deposit Successful! Added to demo wallet.
          </div>
        ) : (
          <button
            onClick={() => handleDeposit(parseFloat(customAmount) || 50000)}
            disabled={isLoading}
            className="w-full py-3 bg-[#0052fe] hover:bg-[#1652f0] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Confirm Demo Deposit'}
          </button>
        )}
      </div>
    </div>
  );
};
