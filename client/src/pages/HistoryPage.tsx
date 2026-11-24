import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyFull, formatINR } from '../utils/formatters';
import api from '../services/api';
import { ITransaction } from '../types';
import { History, ArrowDownLeft, ArrowUpRight, TrendingUp, Zap, Filter } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');

  useEffect(() => {
    if (!user) return;
    const fetchTx = async () => {
      try {
        const res = await api.get('/wallet/transactions');
        if (res.data.success) {
          setTransactions(res.data.data);
        }
      } catch (e) {
        //
      }
    };
    fetchTx();
  }, [user]);

  const filtered = filterType === 'ALL'
    ? transactions
    : transactions.filter((t) => t.type === filterType);

  return (
    <div className="min-h-screen bg-[#0b0e14] py-8 text-xs text-[#eaecef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Transaction History</h1>
            <p className="text-gray-400 mt-1">Audit log of all virtual deposits, withdrawals, and trade settlements</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#121824] border border-[#1f2937] rounded-xl px-3 py-2 text-white outline-none"
            >
              <option value="ALL">All Events</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="WITHDRAW">Withdrawals</option>
              <option value="SPOT_BUY">Spot Buy</option>
              <option value="SPOT_SELL">Spot Sell</option>
              <option value="FUTURES_MARGIN">Futures Margin</option>
              <option value="FUTURES_PNL">Futures P&L</option>
            </select>
          </div>
        </div>

        <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono">
              <thead className="bg-[#121824] text-gray-400 uppercase text-[10px] font-semibold tracking-wider font-sans">
                <tr>
                  <th className="px-6 py-3.5">Reference Hash</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Fee</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {filtered.length > 0 ? (
                  filtered.map((t) => (
                    <tr key={t._id} className="hover:bg-[#121824] transition text-[11px]">
                      <td className="px-6 py-3.5 text-gray-400 font-mono text-[10px]">
                        {t.txHash}
                      </td>
                      <td className="px-4 py-3.5 font-sans font-bold text-white">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-200">
                          {t.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        {t.currency === 'INR' ? formatINR(t.amount) : `${t.amount} ${t.currency}`}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{formatINR(t.fee)}</td>
                      <td className="px-4 py-3.5 text-emerald-400 font-sans font-semibold">
                        {t.status}
                      </td>
                      <td className="px-6 py-3.5 text-right text-gray-400 font-sans text-[10px]">
                        {new Date(t.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 font-sans">
                      No matching records found.
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
