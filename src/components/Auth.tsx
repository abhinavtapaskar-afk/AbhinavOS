import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Shield, Zap, Terminal, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bat-bg flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#eab308_0%,transparent_70%)]" />
        <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bat-card border-bat-yellow/20 relative z-10 p-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-bat-yellow rounded-2xl flex items-center justify-center shadow-bat-glow mb-6">
            <Shield size={32} className="text-bat-bg fill-bat-bg" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-white">AbhinavOS</h1>
          <span className="text-[10px] font-black text-bat-yellow/50 tracking-[0.5em] uppercase mt-2">Secure Terminal Login</span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Operator ID (Email)</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-900/50 border border-bat-yellow/10 rounded-xl py-4 px-5 text-sm font-bold tracking-tight focus:outline-none focus:border-bat-yellow/50 focus:bg-zinc-900 transition-all text-white"
                placeholder="abhinav@batcave.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Access Code (Password)</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-900/50 border border-bat-yellow/10 rounded-xl py-4 px-5 text-sm font-bold tracking-tight focus:outline-none focus:border-bat-yellow/50 focus:bg-zinc-900 transition-all text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-bat-yellow text-bat-bg font-black uppercase tracking-widest text-xs shadow-bat-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <Zap className="animate-spin" size={18} />
            ) : (
              <>
                <Terminal size={18} />
                {isSignUp ? 'Initialize Profile' : 'Gain Access'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] font-black text-zinc-500 hover:text-bat-yellow uppercase tracking-widest transition-colors"
          >
            {isSignUp ? 'Already have credentials? Login' : 'New Operator? Register Profile'}
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-bat-yellow/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-bat-success rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Encrypted Connection</span>
          </div>
          <Cpu size={14} className="text-zinc-800" />
        </div>
      </motion.div>
    </div>
  );
};
