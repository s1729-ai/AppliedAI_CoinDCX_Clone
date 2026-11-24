import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyFull, formatINR, formatQuantity } from '../utils/formatters';
import { DepositModal } from '../components/DepositModal';
import { WithdrawModal } from '../components/WithdrawModal';
import api from '../services/api';
import { ITransaction } from '../types';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  FileText,
} from 'lucide-react';

export const WalletPage: React.FC = () => {
  const { wallet, refreshWallet, transferCrypto } = useWallet();
  const { user } = useAuth();

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferCoin, setTransferCoin] = useState<string>('BTC');
  const [transferQty, setTransferQty] = useState<string>('');
  const [transferAddress, setTransferAddress] = useState<string>('0x71C...Demo99');
  const [transferMsg, setTransferMsg] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<ITransaction[]>([]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const res = await api.get('/wallet/transactions');
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (e) {
      //
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(transferQty);
    if (isNaN(qty) || qty <= 0) return;

    try {
      await transferCrypto(transferCoin, qty, transferAddress);
      setTransferMsg(`Transferred ${qty} ${transferCoin} successfully (simulated)`);
      setTransferQty('');
      fetchTransactions();
      setTimeout(() => setTransferMsg(null), 3000);
    } catch (err: any) {
      setTransferMsg(err.message || 'Transfer failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] py-8 text-xs text-[#eaecef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Wallet & Balances</h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                100% Demo Virtual Funds
              </span>
            </div>
            <p className="text-gray-400 mt-1">
              Deposit, withdraw, and track simulated INR cash and cryptocurrency holdings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDepositOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0052fe] hover:bg-[#1652f0] text-white font-bold transition shadow-lg shadow-blue-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              Deposit Demo Funds
            </button>
            <button
              onClick={() => setWithdrawOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#121824] hover:bg-[#1a2333] border border-[#1f2937] text-gray-300 hover:text-white font-semibold transition"
            >
              <ArrowUpRight className="w-4 h-4" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Balance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
            <div className="text-gray-400 font-medium mb-1">Total Portfolio Value</div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white">
              {formatINR(wallet?.totalPortfolioValue || 0)}
            </div>
            <div className="text-[11px] text-gray-500 mt-2">
              INR Cash + Crypto Assets combined
            </div>
          </div>

          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
            <div className="text-gray-400 font-medium mb-1">Available INR Cash</div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400">
              {formatINR(wallet?.inrBalance || 0)}
            </div>
            <div className="text-[11px] text-gray-500 mt-2">
              Ready for Spot purchases and Futures margin
            </div>
          </div>

          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
            <div className="text-gray-400 font-medium mb-1">Crypto Holdings Value</div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-blue-400">
              {formatINR(wallet?.cryptoValueInr || 0)}
            </div>
            <div className="text-[11px] text-gray-500 mt-2">
              {wallet?.coinBalances?.filter((b) => b.free > 0).length || 0} active coin positions
            </div>
          </div>
        </div>

        {/* Crypto Holdings Breakdown */}
        <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-[#1f2937] bg-[#121824] flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Crypto Assets</h3>
            <button
              onClick={refreshWallet}
              className="text-gray-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead className="bg-[#121824] text-gray-400 text-[10px] uppercase font-sans font-semibold">
                <tr>
                  <th className="px-6 py-3">Asset</th>
                  <th className="px-4 py-3">Total Balance</th>
                  <th className="px-4 py-3">Available Free</th>
                  <th className="px-4 py-3">Current Price</th>
                  <th className="px-4 py-3">Total Value (INR)</th>
                  <th className="px-6 py-3 text-right">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {wallet?.coinBalances && wallet.coinBalances.filter((b) => b.free > 0).length > 0 ? (
                  wallet.coinBalances
                    .filter((b) => b.free > 0)
                    .map((b) => (
                      <tr key={b.coin} className="hover:bg-[#121824] transition text-[11px]">
                        <td className="px-6 py-3.5 font-sans font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                          {b.coin}
                        </td>
                        <td className="px-4 py-3.5 text-white">{formatQuantity(b.free + b.locked)}</td>
                        <td className="px-4 py-3.5 text-gray-300">{formatQuantity(b.free)}</td>
                        <td className="px-4 py-3.5 text-gray-300">
                          {formatCurrencyFull(b.currentPrice || 0)}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-white">
                          {formatINR(b.currentValue || 0)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-sans">
                          <a
                            href={`/trade/spot?pair=${b.coin}INR`}
                            className="px-3 py-1 rounded-lg bg-[#0052fe] hover:bg-[#1652f0] text-white font-semibold transition"
                          >
                            Trade
                          </a>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500 font-sans">
                      No crypto holdings yet. Use your ₹10,00,000 demo INR in{' '}
                      <a href="/trade/spot" className="text-blue-400 underline">
                        Spot Trading
                      </a>{' '}
                      to buy BTC, ETH, SOL, or other coins!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transfer Demo Crypto & Recent Wallet Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Transfer Box */}
          <div className="lg:col-span-5 bg-[#0e121a] border border-[#1f2937] rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Send className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Simulated Internal Transfer</h3>
            </div>
            <p className="text-gray-400 mb-4 text-[11px]">
              Simulate sending cryptocurrency to another test address within the CoinDCX Demo sandbox.
            </p>

            <form onSubmit={handleTransfer} className="space-y-3">
              <div>
                <label className="block text-gray-400 mb-1">Select Asset</label>
                <select
                  value={transferCoin}
                  onChange={(e) => setTransferCoin(e.target.value)}
                  className="w-full bg-[#121824] border border-[#1f2937] rounded-xl px-3 py-2 text-white outline-none"
                >
                  {wallet?.coinBalances.map((c) => (
                    <option key={c.coin} value={c.coin}>
                      {c.coin} (Available: {c.free})
                    </option>
                  ))}
                  {(!wallet?.coinBalances || wallet.coinBalances.length === 0) && (
                    <option value="BTC">BTC (0.00)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Quantity</label>
                <input
                  type="number"
                  step="any"
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  className="w-full bg-[#121824] border border-[#1f2937] rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Simulated Recipient Address</label>
                <input
                  type="text"
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                  className="w-full bg-[#121824] border border-[#1f2937] rounded-xl px-3 py-2 text-white font-mono outline-none text-[11px]"
                />
              </div>

              {transferMsg && (
                <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px]">
                  {transferMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0052fe] hover:bg-[#1652f0] text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/25 mt-2"
              >
                Send Demo Crypto
              </button>
            </form>
          </div>

          {/* Transaction Activity Table */}
          <div className="lg:col-span-7 bg-[#0e121a] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="px-5 py-3 border-b border-[#1f2937] bg-[#121824] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Recent Wallet Ledger
              </h3>
              <a href="/history" className="text-xs text-blue-400 hover:underline">
                View All
              </a>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-[#121824] text-gray-500 text-[10px] uppercase font-sans">
                  <tr>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Amount</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {transactions.slice(0, 7).map((t) => (
                    <tr key={t._id} className="hover:bg-[#121824] transition">
                      <td className="px-4 py-2.5 font-sans font-semibold text-white">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-300">
                          {t.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-bold text-white">
                        {t.currency === 'INR' ? formatINR(t.amount) : `${t.amount} ${t.currency}`}
                      </td>
                      <td className="px-3 py-2.5 text-emerald-400 font-sans">{t.status}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500 font-sans text-[10px]">
                        {new Date(t.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500 font-sans">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modals */}
        <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
        <WithdrawModal isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} />
      </div>
    </div>
  );
};
