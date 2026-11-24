import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatCurrencyFull, formatINR, formatUSDT } from '../utils/formatters';
import api from '../services/api';
import { IOrder, IFuturesPosition } from '../types';
import { FileText, Zap, BarChart2 } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'SPOT' | 'FUTURES_OPEN' | 'FUTURES_CLOSED'>('SPOT');
  const [spotOrders, setSpotOrders] = useState<IOrder[]>([]);
  const [futuresOpen, setFuturesOpen] = useState<IFuturesPosition[]>([]);
  const [futuresClosed, setFuturesClosed] = useState<IFuturesPosition[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const spotRes = await api.get('/spot/orders');
        if (spotRes.data.success) setSpotOrders(spotRes.data.data);

        const futRes = await api.get('/futures/positions');
        if (futRes.data.success) {
          setFuturesOpen(futRes.data.data.open || []);
          setFuturesClosed(futRes.data.data.closed || []);
        }
      } catch (e) {
        //
      }
    };
    fetchOrders();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0b0e14] py-8 text-xs text-[#eaecef]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Order Management</h1>
          <p className="text-gray-400 mt-1">Review all your Spot executions and Futures positions</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#1f2937] pb-2">
          <button
            onClick={() => setTab('SPOT')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              tab === 'SPOT'
                ? 'bg-[#0052fe] text-white shadow-lg'
                : 'bg-[#121824] text-gray-400 hover:text-white border border-[#1f2937]'
            }`}
          >
            Spot Orders ({spotOrders.length})
          </button>
          <button
            onClick={() => setTab('FUTURES_OPEN')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              tab === 'FUTURES_OPEN'
                ? 'bg-[#0052fe] text-white shadow-lg'
                : 'bg-[#121824] text-gray-400 hover:text-white border border-[#1f2937]'
            }`}
          >
            Open Futures ({futuresOpen.length})
          </button>
          <button
            onClick={() => setTab('FUTURES_CLOSED')}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              tab === 'FUTURES_CLOSED'
                ? 'bg-[#0052fe] text-white shadow-lg'
                : 'bg-[#121824] text-gray-400 hover:text-white border border-[#1f2937]'
            }`}
          >
            Closed Futures ({futuresClosed.length})
          </button>
        </div>

        {/* Tab 1: Spot */}
        {tab === 'SPOT' && (
          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead className="bg-[#121824] text-gray-400 uppercase text-[10px] font-semibold tracking-wider font-sans">
                  <tr>
                    <th className="px-6 py-3">Pair</th>
                    <th className="px-4 py-3">Side</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Execution Price</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Total INR</th>
                    <th className="px-4 py-3">Simulated Fee</th>
                    <th className="px-6 py-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {spotOrders.length > 0 ? (
                    spotOrders.map((o) => (
                      <tr key={o._id} className="hover:bg-[#121824] transition text-[11px]">
                        <td className="px-6 py-3 font-sans font-bold text-white">{o.pair}</td>
                        <td
                          className={`px-4 py-3 font-bold ${
                            o.side === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {o.side}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{o.type}</td>
                        <td className="px-4 py-3 text-white">{formatCurrencyFull(o.price)}</td>
                        <td className="px-4 py-3 text-gray-300">{o.quantity}</td>
                        <td className="px-4 py-3 text-gray-200">{formatINR(o.totalInr)}</td>
                        <td className="px-4 py-3 text-gray-500">{formatINR(o.fee)}</td>
                        <td className="px-6 py-3 text-right text-gray-500 font-sans text-[10px]">
                          {new Date(o.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500 font-sans">
                        No spot orders placed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Open Futures */}
        {tab === 'FUTURES_OPEN' && (
          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead className="bg-[#121824] text-gray-400 uppercase text-[10px] font-semibold tracking-wider font-sans">
                  <tr>
                    <th className="px-6 py-3">Symbol</th>
                    <th className="px-4 py-3">Leverage / Side</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Entry Price</th>
                    <th className="px-4 py-3">Mark Price</th>
                    <th className="px-4 py-3">Margin</th>
                    <th className="px-4 py-3">Unrealized P&L</th>
                    <th className="px-6 py-3 text-right">Liquidation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {futuresOpen.length > 0 ? (
                    futuresOpen.map((p) => {
                      const isProfit = (p.unrealizedPnl || 0) >= 0;
                      return (
                        <tr key={p._id} className="hover:bg-[#121824] transition text-[11px]">
                          <td className="px-6 py-3 font-sans font-bold text-white">{p.pair}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                p.side === 'LONG'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {p.leverage}x {p.side}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-white">{p.quantity}</td>
                          <td className="px-4 py-3 text-gray-300">{formatUSDT(p.entryPrice)}</td>
                          <td className="px-4 py-3 text-white font-bold">
                            {formatUSDT(p.currentPrice)}
                          </td>
                          <td className="px-4 py-3 text-gray-300">{formatUSDT(p.margin)}</td>
                          <td
                            className={`px-4 py-3 font-bold ${
                              isProfit ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isProfit ? '+' : ''}
                            {formatUSDT(p.unrealizedPnl)}
                          </td>
                          <td className="px-6 py-3 text-right text-amber-400">
                            {formatUSDT(p.liquidationPrice)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500 font-sans">
                        No open futures positions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Closed Futures */}
        {tab === 'FUTURES_CLOSED' && (
          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead className="bg-[#121824] text-gray-400 uppercase text-[10px] font-semibold tracking-wider font-sans">
                  <tr>
                    <th className="px-6 py-3">Symbol</th>
                    <th className="px-4 py-3">Side</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">Entry</th>
                    <th className="px-4 py-3">Exit</th>
                    <th className="px-4 py-3">Realized P&L</th>
                    <th className="px-6 py-3 text-right">Closed Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2937]">
                  {futuresClosed.length > 0 ? (
                    futuresClosed.map((p) => {
                      const isProfit = (p.realizedPnl || 0) >= 0;
                      return (
                        <tr key={p._id} className="hover:bg-[#121824] transition text-[11px]">
                          <td className="px-6 py-3 font-sans font-bold text-white">{p.pair}</td>
                          <td className="px-4 py-3 font-bold text-gray-300">{p.side}</td>
                          <td className="px-4 py-3 text-white">{p.quantity}</td>
                          <td className="px-4 py-3 text-gray-400">{formatUSDT(p.entryPrice)}</td>
                          <td className="px-4 py-3 text-white">{formatUSDT(p.closedPrice || 0)}</td>
                          <td
                            className={`px-4 py-3 font-bold ${
                              isProfit ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isProfit ? '+' : ''}
                            {formatUSDT(p.realizedPnl)}
                          </td>
                          <td className="px-6 py-3 text-right text-gray-500 font-sans text-[10px]">
                            {p.closedAt ? new Date(p.closedAt).toLocaleString() : '--'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500 font-sans">
                        No closed futures trades yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
