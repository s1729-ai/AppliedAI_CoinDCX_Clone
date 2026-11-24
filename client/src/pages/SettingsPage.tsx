import React, { useState } from 'react';
import { Sliders, Bell, Shield, Moon, Eye, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [orderConfirmation, setOrderConfirmation] = useState(true);
  const [defaultLeverage, setDefaultLeverage] = useState('10');
  const [tradeNotifications, setTradeNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] py-8 text-xs text-[#eaecef]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Trading Settings</h1>
          <p className="text-gray-400 mt-1">Configure trading terminal preferences and notification alerts</p>
        </div>

        <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Terminal Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#121824] border border-[#1f2937]">
                <div>
                  <div className="font-semibold text-white">Order Confirmation Modal</div>
                  <div className="text-[10px] text-gray-500">Show prompt prior to submitting spot/futures trades</div>
                </div>
                <input
                  type="checkbox"
                  checked={orderConfirmation}
                  onChange={(e) => setOrderConfirmation(e.target.checked)}
                  className="w-4 h-4 accent-[#0052fe] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#121824] border border-[#1f2937]">
                <div>
                  <div className="font-semibold text-white">Default Futures Leverage</div>
                  <div className="text-[10px] text-gray-500">Preset multiplier when loading Futures terminal</div>
                </div>
                <select
                  value={defaultLeverage}
                  onChange={(e) => setDefaultLeverage(e.target.value)}
                  className="bg-[#161d2a] border border-gray-800 rounded-lg px-3 py-1.5 text-white outline-none"
                >
                  <option value="5">5x</option>
                  <option value="10">10x</option>
                  <option value="20">20x</option>
                  <option value="50">50x</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#121824] border border-[#1f2937]">
                <div>
                  <div className="font-semibold text-white">Trade Fill Alerts</div>
                  <div className="text-[10px] text-gray-500">Receive toasts when orders or futures positions close</div>
                </div>
                <input
                  type="checkbox"
                  checked={tradeNotifications}
                  onChange={(e) => setTradeNotifications(e.target.checked)}
                  className="w-4 h-4 accent-[#0052fe] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#121824] border border-[#1f2937]">
                <div>
                  <div className="font-semibold text-white">AI Analyst Price Alerts</div>
                  <div className="text-[10px] text-gray-500">Notify when RSI crosses extreme overbought/oversold levels</div>
                </div>
                <input
                  type="checkbox"
                  checked={priceAlerts}
                  onChange={(e) => setPriceAlerts(e.target.checked)}
                  className="w-4 h-4 accent-[#0052fe] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#0052fe] hover:bg-[#1652f0] text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            {saved ? <Check className="w-4 h-4" /> : null}
            {saved ? 'Preferences Saved!' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};
