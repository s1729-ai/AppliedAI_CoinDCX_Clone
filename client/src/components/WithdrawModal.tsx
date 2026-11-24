import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { formatINR } from '../utils/formatters';
import { X, CheckCircle, ArrowUpRight } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const { wallet, withdrawDemoFunds } = useWallet();
  const [amount, setAmount] = useState<string>('50000');
  const [bankName, setBankName] = useState<string>('HDFC Bank');
  const [accountNumber, setAccountNumber] = useState<string>('9876543210');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if ((wallet?.inrBalance || 0) < num) {
      setError('Insufficient available INR balance');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await withdrawDemoFunds(num, bankName, accountNumber);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1400);
    } catch (e: any) {
      setError(e.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Withdraw Virtual Funds</h3>
            <p className="text-gray-400">Simulate bank account withdrawal</p>
          </div>
        </div>

        <div className="bg-[#121824] p-3 rounded-xl border border-[#1f2937] mb-4 flex justify-between items-center">
          <span className="text-gray-400">Available INR:</span>
          <span className="font-mono text-emerald-400 font-bold text-sm">
            {formatINR(wallet?.inrBalance || 0)}
          </span>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-3">
          <div>
            <label className="block text-gray-400 mb-1">Amount to Withdraw</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#161d2a] border border-gray-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-2 text-gray-400 font-mono">INR</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-[#161d2a] border border-gray-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Account Number (Demo)</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-[#161d2a] border border-gray-800 rounded-xl px-3 py-2 text-white outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {error && <div className="p-2 rounded-lg bg-red-500/10 text-red-400 text-xs">{error}</div>}

          {success ? (
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2 font-semibold">
              <CheckCircle className="w-4 h-4" />
              Simulated withdrawal completed!
            </div>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0052fe] hover:bg-[#1652f0] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-500/25 disabled:opacity-50 mt-4"
            >
              {isLoading ? 'Processing...' : 'Confirm Withdrawal (Demo)'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
