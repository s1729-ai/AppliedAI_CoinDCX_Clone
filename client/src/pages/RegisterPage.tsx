import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const ok = await register(name, email, password);
      if (ok) {
        navigate('/markets');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
        <h2 className="text-2xl font-extrabold text-white">Create your Demo Trading Account</h2>
        <p className="mt-1 text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
            Log in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0e121a] py-8 px-4 sm:px-10 border border-[#1f2937] shadow-2xl rounded-2xl space-y-6">
          {/* Demo Balance Announcement */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 text-blue-300">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
            <span>
              All accounts instantly receive <strong>₹10,00,000 virtual INR</strong> for risk-free Spot & Futures trading.
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1 font-medium">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121824] border border-[#1f2937] rounded-xl pl-9 pr-3 py-2.5 text-white outline-none focus:border-blue-500"
                  placeholder="Sachin Gupta"
                />
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              </div>
            </div>

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
              <label className="block text-gray-400 mb-1 font-medium">Create Password</label>
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
              {isLoading ? 'Creating Account...' : 'Sign Up & Claim ₹10 Lakh Virtual Funds'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
