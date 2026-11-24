import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';
import { WalletProvider } from './context/WalletContext';

// Components
import { DemoBanner } from './components/DemoBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { DepositModal } from './components/DepositModal';

// Pages
import { HomePage } from './pages/HomePage';
import { MarketsPage } from './pages/MarketsPage';
import { SpotTradingPage } from './pages/SpotTradingPage';
import { FuturesTradingPage } from './pages/FuturesTradingPage';
import { WalletPage } from './pages/WalletPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { OrdersPage } from './pages/OrdersPage';
import { HistoryPage } from './pages/HistoryPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  // Keyboard shortcut Ctrl+K to open search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AuthProvider>
      <MarketProvider>
        <WalletProvider>
          <Router>
            <div className="min-h-screen bg-[#0b0e14] text-[#eaecef] flex flex-col font-sans selection:bg-[#0052fe] selection:text-white">
              {/* Permanent Demo Simulation Banner */}
              <DemoBanner />

              {/* Navigation Header */}
              <Navbar
                onOpenSearch={() => setSearchOpen(true)}
                onOpenDeposit={() => setDepositOpen(true)}
              />

              {/* Application Pages */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/markets" element={<MarketsPage />} />
                  <Route path="/trade/spot" element={<SpotTradingPage />} />
                  <Route path="/trade/futures" element={<FuturesTradingPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/ai-assistant" element={<AIAssistantPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* CoinDCX Footer */}
              <Footer />

              {/* Global Modals */}
              <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
              <DepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
            </div>
          </Router>
        </WalletProvider>
      </MarketProvider>
    </AuthProvider>
  );
};
export default App;
