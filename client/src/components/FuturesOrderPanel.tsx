import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { IFuturesTicker } from '../types';
import { formatCurrencyFull, formatINR, formatUSDT } from '../utils/formatters';
import api from '../services/api';
import { CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';

interface FuturesOrderPanelProps {
  ticker: IFuturesTicker;
  onPositionOpened?: () => void;
}

export const FuturesOrderPanel: React.FC<FuturesOrderPanelProps> = ({ ticker, onPositionOpened }) => {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useWallet();

  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [leverage, setLeverage] = useState<number>(10);
  const [marginType, setMarginType] = useState<'CROSS' | 'ISOLATED'>('ISOLATED');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [quantity, setQuantity] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentPrice = ticker.lastPrice;
  const numQty = parseFloat(quantity) || 0;
  const positionValueUsdt = numQty * currentPrice;
  const requiredMarginUsdt = positionValueUsdt / leverage;
  const usdtToInrRate = 86.5;
  const requiredMarginInr = requiredMarginUsdt * usdtToInrRate;

  // Liquidation calculation
  const mmr = 0.005; // 0.5%
  let estLiquidationPrice = 0;
  if (side === 'LONG') {
    estLiquidationPrice = currentPrice * (1 - 1 / leverage + mmr);
  } else {
    estLiquidationPrice = currentPrice * (1 + 1 / leverage - mmr);
  }
  estLiquidationPrice = Math.max(0, estLiquidationPrice);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: 'error', text: 'Please log in to trade futures' });
      return;
    }

    if (numQty <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid position size' });
      return;
    }

    if ((wallet?.inrBalance || 0) < requiredMarginInr) {
      setMessage({
        type: 'error',
        text: `Insufficient INR for margin. Required: ${formatINR(requiredMarginInr)}`,
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await api.post('/futures/position', {
        pair: ticker.symbol,
        side,
        type: orderType,
        quantity: numQty,
        leverage,
        marginType,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        setQuantity('');
        setTakeProfit('');
        setStopLoss('');
        await refreshWallet();
        if (onPositionOpened) onPositionOpened();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to open position' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0b0e14] border border-[#1f2937] rounded-xl p-4 text-xs flex flex-col justify-between">
      <div>
        {/* Margin Mode & Leverage Selector Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2937] mb-3">
          <div className="flex items-center gap-1.5 bg-[#121824] p-0.5 rounded-lg border border-[#1f2937]">
            <button
              type="button"
              onClick={() => setMarginType('ISOLATED')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                marginType === 'ISOLATED' ? 'bg-[#0052fe] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Isolated
            </button>
            <button
              type="button"
              onClick={() => setMarginType('CROSS')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                marginType === 'CROSS' ? 'bg-[#0052fe] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Cross
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#121824] px-2 py-1 rounded-lg border border-amber-500/30 text-amber-300 font-bold">
            <span>{leverage}x Leverage</span>
          </div>
        </div>

        {/* Leverage Slider & Quick Pills */}
        <div className="mb-4 bg-[#121824] p-2.5 rounded-lg border border-[#1f2937]">
          <div className="flex justify-between text-gray-400 mb-1.5">
            <span>Leverage:</span>
            <span className="font-bold text-white">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full accent-[#0052fe] cursor-pointer"
          />
          <div className="flex justify-between gap-1 mt-2">
            {[1, 5, 10, 20, 50].map((lev) => (
              <button
                key={lev}
                type="button"
                onClick={() => setLeverage(lev)}
                className={`flex-1 py-0.5 text-[10px] rounded font-semibold border ${
                  leverage === lev
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-[#182030] text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>

        {/* Long / Short Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#121824] rounded-lg border border-[#1f2937] mb-3">
          <button
            type="button"
            onClick={() => {
              setSide('LONG');
              setMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-md transition ${
              side === 'LONG'
                ? 'bg-[#00c076] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Open Long (Buy)
          </button>
          <button
            type="button"
            onClick={() => {
              setSide('SHORT');
              setMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-md transition ${
              side === 'SHORT'
                ? 'bg-[#f6465d] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Open Short (Sell)
          </button>
        </div>

        {/* Order form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-400 mb-1">Contract Size ({ticker.baseAsset})</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#121824] border border-[#1f2937] rounded-lg px-3 py-2 text-white font-mono focus:border-blue-500 outline-none"
                placeholder={`0.00 ${ticker.baseAsset}`}
              />
              <span className="absolute right-3 top-2.5 text-gray-500 font-mono">{ticker.baseAsset}</span>
            </div>
          </div>

          {/* TP & SL */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-400 mb-1">Take Profit ($)</label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-[#121824] border border-[#1f2937] rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-blue-500 outline-none text-xs"
                placeholder="Optional TP"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Stop Loss ($)</label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-[#121824] border border-[#1f2937] rounded-lg px-2.5 py-1.5 text-white font-mono focus:border-blue-500 outline-none text-xs"
                placeholder="Optional SL"
              />
            </div>
          </div>

          {/* Calculations Box */}
          <div className="bg-[#121824] p-3 rounded-lg border border-[#1f2937] space-y-1.5 text-[11px]">
            <div className="flex justify-between text-gray-400">
              <span>Position Value:</span>
              <span className="font-mono text-white">{formatUSDT(positionValueUsdt)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Required Margin:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                {formatUSDT(requiredMarginUsdt)} ({formatINR(requiredMarginInr)})
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span className="flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                Est. Liquidation:
              </span>
              <span className="font-mono text-amber-400 font-semibold">
                {numQty > 0 ? formatUSDT(estLiquidationPrice) : '--'}
              </span>
            </div>
          </div>

          {/* Message feedback */}
          {message && (
            <div
              className={`p-2 rounded-lg flex items-center gap-2 text-xs ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold text-sm transition shadow-lg ${
              side === 'LONG'
                ? 'bg-[#00c076] hover:bg-[#00d383] text-black shadow-emerald-500/20'
                : 'bg-[#f6465d] hover:bg-[#ff556d] text-white shadow-red-500/20'
            } disabled:opacity-50`}
          >
            {isLoading
              ? 'Opening Position...'
              : `${side === 'LONG' ? 'Open Long' : 'Open Short'} ${leverage}x (Demo)`}
          </button>
        </form>
      </div>
    </div>
  );
};
