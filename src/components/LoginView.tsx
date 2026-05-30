import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { getUserAuth, setUserAuth, getProfile } from '../storage';

interface LoginViewProps {
  onNavigate: (route: string) => void;
  onLoginSuccess: (name: string, email: string) => void;
}

export default function LoginView({ onNavigate, onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    // In local localStorage MVP, we check if user exists. If not, we just register them as well or standard log in
    const existingAuth = getUserAuth();
    let nameToUse = 'Adarsh';

    if (existingAuth && existingAuth.email === email) {
      nameToUse = existingAuth.name;
    }

    setUserAuth({ name: nameToUse, email, loggedIn: true });
    onLoginSuccess(nameToUse, email);
  };

  const handleDemoLogin = () => {
    setUserAuth({ 
      name: 'Adarsh', 
      email: 'adarsh.7025.v@gmail.com', 
      loggedIn: true 
    });
    onLoginSuccess('Adarsh', 'adarsh.7025.v@gmail.com');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div 
            onClick={() => onNavigate('landing')}
            className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl font-mono mx-auto mb-3 cursor-pointer hover:opacity-85"
          >
            B
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Welcome back to BUDGETY</h2>
          <p className="text-neutral-500 text-sm mt-1">Calm, human-friendly financial planning</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm p-8"
        >
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 text-rose-800 rounded-xl text-xs flex gap-2 items-start border border-rose-100">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., adarsh@gmail.com"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-300"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-300"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              Sign In to Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Backdoor */}
          <div className="mt-6 border-t border-dashed border-neutral-100 pt-4 text-center">
            <button
              id="btn-demo-login"
              type="button"
              onClick={handleDemoLogin}
              className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-medium transition-all"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Demo Quick Login (Skip Credential Typing)
            </button>
            <p className="text-[10px] text-neutral-400 mt-1 max-w-xs mx-auto">
              Click this to immediately explore with prefilled local charts and simulation data.
            </p>
          </div>
        </motion.div>

        <p className="text-center text-sm text-neutral-500 mt-6 md:mt-8">
          Don't have an account?{' '}
          <button
            id="login-to-signup"
            onClick={() => onNavigate('signup')}
            className="text-neutral-900 border-b border-neutral-900 font-medium hover:opacity-80 transition-opacity"
          >
            Create one for free
          </button>
        </p>
      </div>
    </div>
  );
}
