import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { IWalletData } from '../types';
import { useAuth } from './AuthContext';

interface WalletContextType {
  wallet: IWalletData | null;
  isLoading: boolean;
  refreshWallet: () => Promise<void>;
  depositDemoFunds: (amount: number) => Promise<boolean>;
  withdrawDemoFunds: (amount: number, bankName?: string, accountNumber?: string) => Promise<boolean>;
  transferCrypto: (coin: string, quantity: number, address: string) => Promise<boolean>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<IWalletData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshWallet = useCallback(async () => {
    if (!user) {
      setWallet(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.get('/wallet');
      if (res.data.success) {
        setWallet(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching wallet:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshWallet();
    const interval = setInterval(() => {
      if (user) refreshWallet();
    }, 4000);
    return () => clearInterval(interval);
  }, [user, refreshWallet]);

  const depositDemoFunds = async (amount: number): Promise<boolean> => {
    try {
      const res = await api.post('/wallet/deposit', { amount });
      if (res.data.success) {
        await refreshWallet();
        return true;
      }
      return false;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Deposit failed');
    }
  };

  const withdrawDemoFunds = async (amount: number, bankName?: string, accountNumber?: string): Promise<boolean> => {
    try {
      const res = await api.post('/wallet/withdraw', { amount, bankName, accountNumber });
      if (res.data.success) {
        await refreshWallet();
        return true;
      }
      return false;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Withdrawal failed');
    }
  };

  const transferCrypto = async (coin: string, quantity: number, address: string): Promise<boolean> => {
    try {
      const res = await api.post('/wallet/transfer', { coin, quantity, recipientAddress: address });
      if (res.data.success) {
        await refreshWallet();
        return true;
      }
      return false;
    } catch (e: any) {
      throw new Error(e.response?.data?.message || 'Transfer failed');
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isLoading,
        refreshWallet,
        depositDemoFunds,
        withdrawDemoFunds,
        transferCrypto,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within a WalletProvider');
  return context;
};
