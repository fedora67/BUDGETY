import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { setUserAuth } from '../storage';

interface SignupViewProps {
  onNavigate: (route: string) => void;
  onSignupSuccess: (name: string, email: string) => void;
}

export default function SignupView({ onNavigate, onSignupSuccess }: SignupViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setUserAuth({ name, email, loggedIn: true });
    onSignupSuccess(name, email);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div 
            onClick={() => onNavigate('landing')}
            className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-bold text-xl font-mono mx-auto mb-3 cursor-pointer hover:opacity-85"
          >
            B
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Create your layout</h2>
          <p className="text-neutral-500 text-sm mt-1">Start tracking and saving today</p>
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
                Full Name / Head of Household
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Adarsh"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., adarsh@gmail.com"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                Choose Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 4 characters"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm focus:border-neutral-900 focus:outline-none transition-all placeholder:text-neutral-300"
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-sm py-3 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              Begin Free Buddying
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>

        <p className="text-center text-sm text-neutral-500 mt-6 md:mt-8">
          Already have an account?{' '}
          <button
            id="signup-to-login"
            onClick={() => onNavigate('login')}
            className="text-neutral-900 border-b border-neutral-900 font-medium hover:opacity-80 transition-opacity"
          >
            Log in instead
          </button>
        </p>
      </div>
    </div>
  );
}
