import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserAccount } from '../types/index.js';

export interface Web3WalletState {
  address: string;
  name: string;
  studentId: string;
  email: string;
  role: 'student' | 'organizer';
  isConnected: boolean;
  network: string;
  balanceEth: number;
}

interface WalletContextType {
  wallet: Web3WalletState;
  connectWallet: (preset?: 'duy' | 'organizer' | 'custom', customAddress?: string) => void;
  disconnectWallet: () => void;
  switchRole: (role: 'student' | 'organizer') => void;
  login: (email: string, password?: string, roleHint?: 'student' | 'organizer') => Promise<{ success: boolean; redirectTo: string; user: UserAccount }>;
  register: (data: { email: string; password?: string; name: string; studentId?: string; role?: 'student' | 'organizer' }) => Promise<{ success: boolean; redirectTo: string; user: UserAccount }>;
  requestPasswordReset: (identifier: string) => Promise<{ success: boolean; message: string; maskedEmail: string; simulatedOtp?: string; userEmail: string; userName: string }>;
  confirmPasswordReset: (identifier: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string; accountEmail?: string }>;
  logout: () => void;
  signMessage: (message: string) => Promise<string>;
  isSignModalOpen: boolean;
  setIsSignModalOpen: (open: boolean) => void;
  pendingSignMessage: string | null;
  confirmSign: () => void;
  rejectSign: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalInitialTab: 'btc-login' | 'student-login' | 'student-register';
  openAuthModal: (tab?: 'btc-login' | 'student-login' | 'student-register') => void;
}

const DEFAULT_STUDENT: Web3WalletState = {
  address: '0x71C8395B30623A8C7d21b470D5A3ef928CFA389B',
  name: 'Nguyễn Đình Tấn Duy',
  studentId: '24100484',
  email: 'duyndtk8cpascal@gmail.com',
  role: 'student',
  isConnected: true,
  network: 'Polygon Amoy Testnet (EVM)',
  balanceEth: 0.45
};

const DEFAULT_ORGANIZER: Web3WalletState = {
  address: '0x89C71fE44bA87498c19Ce87654D9c6b73aA257e1',
  name: 'Ban Tổ Chức ĐH Quốc Gia',
  studentId: '',
  email: 'btc@eventpass.edu.vn',
  role: 'organizer',
  isConnected: true,
  network: 'Polygon Amoy Testnet (EVM)',
  balanceEth: 5.20
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<Web3WalletState>(() => {
    const saved = localStorage.getItem('eventpass_wallet');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_STUDENT;
  });

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [pendingSignMessage, setPendingSignMessage] = useState<string | null>(null);
  const [signResolver, setSignResolver] = useState<{ resolve: (sig: string) => void; reject: (err: Error) => void } | null>(null);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'btc-login' | 'student-login' | 'student-register'>('student-login');

  useEffect(() => {
    localStorage.setItem('eventpass_wallet', JSON.stringify(wallet));
  }, [wallet]);

  const openAuthModal = (tab: 'btc-login' | 'student-login' | 'student-register' = 'student-login') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const connectWallet = (preset: 'duy' | 'organizer' | 'custom' = 'duy', customAddress?: string) => {
    if (preset === 'duy') {
      setWallet(DEFAULT_STUDENT);
    } else if (preset === 'organizer') {
      setWallet(DEFAULT_ORGANIZER);
    } else {
      setWallet({
        address: customAddress || `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`,
        name: 'Sinh viên Khách',
        studentId: '24109999',
        email: 'guest@student.edu.vn',
        role: 'student',
        isConnected: true,
        network: 'Polygon Amoy Testnet (EVM)',
        balanceEth: 0.1
      });
    }
  };

  const login = async (email: string, password?: string, roleHint?: 'student' | 'organizer') => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, roleHint })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Đăng nhập thất bại');
    }

    const u: UserAccount = data.user;
    setWallet({
      address: u.address,
      name: u.name,
      studentId: u.studentId || '',
      email: u.email,
      role: u.role,
      isConnected: true,
      network: 'Polygon Amoy Testnet (EVM)',
      balanceEth: u.role === 'organizer' ? 5.2 : 0.45
    });

    setIsAuthModalOpen(false);
    return data;
  };

  const register = async (formData: { email: string; password?: string; name: string; studentId?: string; role?: 'student' | 'organizer' }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Đăng ký thất bại');
    }

    const u: UserAccount = data.user;
    setWallet({
      address: u.address,
      name: u.name,
      studentId: u.studentId || '',
      email: u.email,
      role: u.role,
      isConnected: true,
      network: 'Polygon Amoy Testnet (EVM)',
      balanceEth: 0.2
    });

    setIsAuthModalOpen(false);
    return data;
  };

  const requestPasswordReset = async (identifier: string) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Gửi yêu cầu khôi phục mật khẩu thất bại');
    }
    return data;
  };

  const confirmPasswordReset = async (identifier: string, otp: string, newPassword: string) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, otp, newPassword })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Đặt lại mật khẩu mới thất bại');
    }
    return data;
  };

  const logout = () => {
    // Revert to demo guest or student
    setWallet(prev => ({
      ...prev,
      isConnected: false
    }));
    openAuthModal('student-login');
  };

  const disconnectWallet = () => {
    setWallet(prev => ({
      ...prev,
      isConnected: false
    }));
  };

  const switchRole = (newRole: 'student' | 'organizer') => {
    if (newRole === 'organizer') {
      setWallet(DEFAULT_ORGANIZER);
    } else {
      setWallet(DEFAULT_STUDENT);
    }
  };

  const signMessage = (message: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      setPendingSignMessage(message);
      setSignResolver({ resolve, reject });
      setIsSignModalOpen(true);
    });
  };

  const confirmSign = () => {
    if (signResolver && pendingSignMessage) {
      const mockSignature = `0x${Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}1b`;
      signResolver.resolve(mockSignature);
      setIsSignModalOpen(false);
      setPendingSignMessage(null);
      setSignResolver(null);
    }
  };

  const rejectSign = () => {
    if (signResolver) {
      signResolver.reject(new Error('Người dùng đã hủy ký giao dịch trên ví'));
      setIsSignModalOpen(false);
      setPendingSignMessage(null);
      setSignResolver(null);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        switchRole,
        login,
        register,
        requestPasswordReset,
        confirmPasswordReset,
        logout,
        signMessage,
        isSignModalOpen,
        setIsSignModalOpen,
        pendingSignMessage,
        confirmSign,
        rejectSign,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalInitialTab,
        openAuthModal
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
