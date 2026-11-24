import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Zap, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        navigate('/markets');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await demoLogin();
      navigate('/markets');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-xs text-[#eaecef]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0052fe] to-[#00d395] flex items-center justify-center p-0.5 shadow-lg">
            <div className="w-full h-full bg-[#0b0e14] rounded-[10px] flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-[#0052fe] flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#00d395] rounded-full"></div>
              </div>
            </div>
          </div>
          <span className="text-2xl font-black text-white">
            Coin<span className="text-[#0052fe]">DCX</span> <span className="text-xs text-emerald-400 uppercase font-mono">Demo</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-white">Log in to your Demo Account</h2>
        <p className="mt-1 text-gray-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300">
            register for free ₹10,00,000 virtual balance
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0e121a] py-8 px-4 sm:px-10 border border-[#1f2937] shadow-2xl rounded-2xl space-y-6">
          {/* Instant Demo Button */}
          <button
            onClick={handleDemoAccess}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm"
          >
            <Zap className="w-4 h-4" />
            <span>⚡ One-Click Instant Demo Login</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1f2937]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="px-2 bg-[#0e121a] text-gray-500">Or use email & password</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1 font-medium">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121824] border border-[#1f2937] rounded-xl pl-9 pr-3 py-2.5 text-white outline-none focus:border-blue-500"
                  placeholder="trader@example.com"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-400 font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-[11px] text-blue-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#121824] border border-[#1f2937] rounded-xl pl-9 pr-3 py-2.5 text-white outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0052fe] hover:bg-[#1652f0] text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-500/25 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="pt-2 border-t border-[#1f2937] text-center text-gray-500 text-[11px]">
            Demo Account Credentials: <br />
            <span className="text-gray-300 font-mono">demo@coindcx.edu</span> / <span className="text-gray-300 font-mono">coindcx123</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#0e121a] border border-[#1f2937] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-xs">
            <h3 className="text-sm font-bold text-white mb-2">Password Reset (Demo)</h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              In this educational simulation, you can instantly log in using the demo account above with password <strong>coindcx123</strong> or click "One-Click Instant Demo Login".
            </p>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2.5 bg-[#0052fe] text-white rounded-xl font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
