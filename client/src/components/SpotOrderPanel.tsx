import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { ICoin } from '../types';
import { formatCurrencyFull, formatINR, formatQuantity } from '../utils/formatters';
import api from '../services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface SpotOrderPanelProps {
  coin: ICoin;
  onOrderSuccess?: () => void;
}

export const SpotOrderPanel: React.FC<SpotOrderPanelProps> = ({ coin, onOrderSuccess }) => {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useWallet();

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState<string>(coin.lastPrice.toString());
  const [inrAmount, setInrAmount] = useState<string>('');
  const [coinQuantity, setCoinQuantity] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const coinBalance = wallet?.coinBalances.find((b) => b.coin === coin.symbol)?.free || 0;
  const inrBalance = wallet?.inrBalance || 0;
  const effectivePrice = orderType === 'MARKET' ? coin.lastPrice : parseFloat(limitPrice) || coin.lastPrice;

  const handleInrChange = (val: string) => {
    setInrAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && effectivePrice > 0) {
      setCoinQuantity((num / effectivePrice).toFixed(6));
    } else {
      setCoinQuantity('');
    }
  };

  const handleQuantityChange = (val: string) => {
    setCoinQuantity(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setInrAmount((num * effectivePrice).toFixed(2));
    } else {
      setInrAmount('');
    }
  };

  const handlePercentClick = (percent: number) => {
    if (side === 'BUY') {
      const targetInr = (inrBalance * (percent / 100)) * 0.999; // account for fee
      handleInrChange(targetInr.toFixed(2));
    } else {
      const targetQty = coinBalance * (percent / 100);
      handleQuantityChange(targetQty.toFixed(6));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: 'error', text: 'Please log in to trade' });
      return;
    }

    const qty = parseFloat(coinQuantity);
    const inr = parseFloat(inrAmount);

    if (isNaN(qty) || qty <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await api.post('/spot/order', {
        pair: `${coin.symbol}/INR`,
        side,
        type: orderType,
        price: effectivePrice,
        quantity: qty,
        totalInr: inr,
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        setInrAmount('');
        setCoinQuantity('');
        await refreshWallet();
        if (onOrderSuccess) onOrderSuccess();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Trade execution failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const feeAmount = (parseFloat(inrAmount) || 0) * 0.001;

  return (
    <div className="bg-[#0b0e14] border border-[#1f2937] rounded-xl p-4 text-xs flex flex-col justify-between">
      <div>
        {/* Buy / Sell Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#121824] rounded-lg border border-[#1f2937] mb-4">
          <button
            type="button"
            onClick={() => {
              setSide('BUY');
              setMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-md transition ${
              side === 'BUY'
                ? 'bg-[#00c076] text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Buy {coin.symbol}
          </button>
          <button
            type="button"
            onClick={() => {
              setSide('SELL');
              setMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-md transition ${
              side === 'SELL'
                ? 'bg-[#f6465d] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sell {coin.symbol}
          </button>
        </div>

        {/* Order Type Toggle */}
        <div className="flex items-center gap-4 mb-4 text-gray-400 font-medium">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="orderType"
              checked={orderType === 'MARKET'}
              onChange={() => setOrderType('MARKET')}
              className="text-blue-600 focus:ring-0 bg-transparent"
            />
            <span className={orderType === 'MARKET' ? 'text-white' : ''}>Market Order</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="orderType"
              checked={orderType === 'LIMIT'}
              onChange={() => setOrderType('LIMIT')}
              className="text-blue-600 focus:ring-0 bg-transparent"
            />
            <span className={orderType === 'LIMIT' ? 'text-white' : ''}>Limit Order</span>
          </label>
        </div>

        {/* Available Balance */}
        <div className="flex items-center justify-between text-gray-400 mb-3 bg-[#121824] p-2.5 rounded-lg border border-[#1f2937]">
          <span>Available:</span>
          <span className="font-mono text-white font-semibold">
            {side === 'BUY' ? formatINR(inrBalance) : `${formatQuantity(coinBalance)} ${coin.symbol}`}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Limit Price Input */}
          {orderType === 'LIMIT' && (
            <div>
              <label className="block text-gray-400 mb-1">Limit Price (INR)</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="w-full bg-[#121824] border border-[#1f2937] rounded-lg px-3 py-2 text-white font-mono focus:border-blue-500 outline-none"
                  placeholder="Enter limit price"
                />
                <span className="absolute right-3 top-2.5 text-gray-500 font-mono">INR</span>
              </div>
            </div>
          )}

          {/* Amount in INR */}
          <div>
            <label className="block text-gray-400 mb-1">Total INR Amount</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={inrAmount}
                onChange={(e) => handleInrChange(e.target.value)}
                className="w-full bg-[#121824] border border-[#1f2937] rounded-lg px-3 py-2 text-white font-mono focus:border-blue-500 outline-none"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-2.5 text-gray-500 font-mono">₹</span>
            </div>
          </div>

          {/* Quantity in Coin */}
          <div>
            <label className="block text-gray-400 mb-1">Quantity ({coin.symbol})</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={coinQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-full bg-[#121824] border border-[#1f2937] rounded-lg px-3 py-2 text-white font-mono focus:border-blue-500 outline-none"
                placeholder="0.0000"
              />
              <span className="absolute right-3 top-2.5 text-gray-500 font-mono">{coin.symbol}</span>
            </div>
          </div>

          {/* Percentage Quick Selector */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentClick(pct)}
                className="py-1 bg-[#121824] hover:bg-[#1a2333] border border-[#1f2937] text-gray-300 rounded font-medium transition"
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Summary Details */}
          <div className="pt-2 border-t border-[#1f2937] space-y-1.5 text-[11px] text-gray-400">
            <div className="flex justify-between">
              <span>Simulated Fee (0.1%):</span>
              <span className="font-mono text-gray-300">{formatINR(feeAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-300">Net Execution:</span>
              <span className="font-mono text-white">
                {formatINR((parseFloat(inrAmount) || 0) + (side === 'BUY' ? feeAmount : -feeAmount))}
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

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold text-sm transition shadow-lg ${
              side === 'BUY'
                ? 'bg-[#00c076] hover:bg-[#00d383] text-black shadow-emerald-500/20'
                : 'bg-[#f6465d] hover:bg-[#ff556d] text-white shadow-red-500/20'
            } disabled:opacity-50`}
          >
            {isLoading
              ? 'Processing Virtual Order...'
              : `${side === 'BUY' ? 'Buy' : 'Sell'} ${coin.symbol} (Demo)`}
          </button>
        </form>
      </div>
    </div>
  );
};
