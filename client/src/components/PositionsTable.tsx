import React, { useState } from 'react';
import { IFuturesPosition } from '../types';
import { formatCurrencyFull, formatINR, formatPercent, formatUSDT } from '../utils/formatters';
import api from '../services/api';
import { XCircle, Edit3 } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

interface PositionsTableProps {
  positions: IFuturesPosition[];
  closedPositions?: IFuturesPosition[];
  onPositionClosed?: () => void;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  positions,
  closedPositions = [],
  onPositionClosed,
}) => {
  const { refreshWallet } = useWallet();
  const [activeTab, setActiveTab] = useState<'OPEN' | 'HISTORY'>('OPEN');
  const [closingId, setClosingId] = useState<string | null>(null);

  const handleClose = async (positionId: string) => {
    setClosingId(positionId);
    try {
      const res = await api.post('/futures/close', { positionId });
      if (res.data.success) {
        await refreshWallet();
        if (onPositionClosed) onPositionClosed();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="bg-[#0b0e14] border border-[#1f2937] rounded-xl overflow-hidden text-xs">
      {/* Header Tabs */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-[#1f2937] bg-[#0e121a]">
        <button
          onClick={() => setActiveTab('OPEN')}
          className={`font-semibold pb-1 transition flex items-center gap-1.5 ${
            activeTab === 'OPEN'
              ? 'text-white border-b-2 border-[#0052fe]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Open Positions
          <span className="bg-blue-500/20 text-blue-400 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {positions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`font-semibold pb-1 transition flex items-center gap-1.5 ${
            activeTab === 'HISTORY'
              ? 'text-white border-b-2 border-[#0052fe]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Position History
          <span className="bg-gray-800 text-gray-400 text-[10px] px-1.5 py-0.2 rounded-full">
            {closedPositions.length}
          </span>
        </button>
      </div>

      {activeTab === 'OPEN' ? (
        <div className="overflow-x-auto">
          {positions.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No open futures positions. Open a simulated Long or Short trade above!
            </div>
          ) : (
            <table className="w-full text-left font-mono">
              <thead className="bg-[#121824] text-gray-500 text-[10px] uppercase font-sans">
                <tr>
                  <th className="px-4 py-2">Symbol</th>
                  <th className="px-3 py-2">Size</th>
                  <th className="px-3 py-2">Entry Price</th>
                  <th className="px-3 py-2">Mark Price</th>
                  <th className="px-3 py-2">Liq. Price</th>
                  <th className="px-3 py-2">Margin</th>
                  <th className="px-3 py-2">P&L (ROE %)</th>
                  <th className="px-4 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {positions.map((pos) => {
                  const isLong = pos.side === 'LONG';
                  const isProfit = (pos.unrealizedPnl || 0) >= 0;

                  return (
                    <tr key={pos._id} className="hover:bg-[#121824] transition text-[11px]">
                      <td className="px-4 py-2.5 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{pos.pair}</span>
                          <span
                            className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                              isLong
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {pos.leverage}x {pos.side}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-200">{pos.quantity}</td>
                      <td className="px-3 py-2.5 text-gray-300">{formatUSDT(pos.entryPrice)}</td>
                      <td className="px-3 py-2.5 text-white font-semibold">{formatUSDT(pos.currentPrice)}</td>
                      <td className="px-3 py-2.5 text-amber-400">{formatUSDT(pos.liquidationPrice)}</td>
                      <td className="px-3 py-2.5 text-gray-300">{formatUSDT(pos.margin)}</td>
                      <td className="px-3 py-2.5 font-bold">
                        <div className={isProfit ? 'text-emerald-400' : 'text-red-400'}>
                          {isProfit ? '+' : ''}
                          {formatUSDT(pos.unrealizedPnl)} ({formatPercent(pos.roe || 0)})
                        </div>
                        <div className="text-[10px] text-gray-500 font-normal">
                          {isProfit ? '+' : ''}
                          {formatINR(pos.unrealizedPnlInr || 0)}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-sans">
                        <button
                          onClick={() => handleClose(pos._id)}
                          disabled={closingId === pos._id}
                          className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 rounded transition font-semibold disabled:opacity-50"
                        >
                          {closingId === pos._id ? 'Closing...' : 'Market Close'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          {closedPositions.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No closed positions yet.</div>
          ) : (
            <table className="w-full text-left font-mono">
              <thead className="bg-[#121824] text-gray-500 text-[10px] uppercase font-sans">
                <tr>
                  <th className="px-4 py-2">Symbol</th>
                  <th className="px-3 py-2">Size</th>
                  <th className="px-3 py-2">Entry</th>
                  <th className="px-3 py-2">Exit</th>
                  <th className="px-3 py-2">Realized P&L</th>
                  <th className="px-4 py-2 text-right">Closed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937]">
                {closedPositions.map((pos) => {
                  const isProfit = (pos.realizedPnl || 0) >= 0;
                  return (
                    <tr key={pos._id} className="hover:bg-[#121824] transition text-[11px]">
                      <td className="px-4 py-2 font-sans font-bold text-white">
                        {pos.pair} ({pos.side})
                      </td>
                      <td className="px-3 py-2 text-gray-300">{pos.quantity}</td>
                      <td className="px-3 py-2 text-gray-400">{formatUSDT(pos.entryPrice)}</td>
                      <td className="px-3 py-2 text-gray-200">{formatUSDT(pos.closedPrice || 0)}</td>
                      <td
                        className={`px-3 py-2 font-bold ${
                          isProfit ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isProfit ? '+' : ''}
                        {formatUSDT(pos.realizedPnl)}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-500 font-sans text-[10px]">
                        {pos.closedAt ? new Date(pos.closedAt).toLocaleTimeString() : '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
