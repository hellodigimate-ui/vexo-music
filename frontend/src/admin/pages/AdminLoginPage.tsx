import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Flame, Lock, Mail, ArrowRight, ShieldAlert, Zap, ShieldCheck, CheckCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLoginPage: React.FC = () => {
  // Pre-filled by default for instant 1-click access
  const [email, setEmail] = useState('admin@vexomusic.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleLoginWithCredentials = async (targetEmail: string, targetPass: string) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login({ email: targetEmail, password: targetPass });
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid admin credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    await handleLoginWithCredentials(email, password);
  };

  const handleInstantLogin = async () => {
    setEmail('admin@vexomusic.com');
    setPassword('admin');
    await handleLoginWithCredentials('admin@vexomusic.com', 'admin');
  };

  return (
    <div className="min-h-screen bg-[#070709] flex flex-col justify-center items-center px-4 py-12 selection:bg-vexo-red selection:text-white relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-vexo-red to-[#800000] shadow-xl shadow-red-950/60 ring-1 ring-white/10">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider text-white">VEXO ADMIN</h1>
            <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase mt-1">
              RECORD LABEL & CMS CONTROL CENTER
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#0e0e13]/90 border border-zinc-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Instant 1-Click Login Button */}
          <div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleInstantLogin}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-vexo-red via-red-600 to-[#8b0000] hover:from-red-600 hover:to-red-700 text-white font-bold text-sm tracking-wide shadow-xl shadow-red-950/80 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.99] cursor-pointer disabled:opacity-50 group border border-red-500/30"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400 group-hover:animate-bounce" />
                  <span>1-CLICK ADMIN LOGIN</span>
                  <ArrowRight className="w-4 h-4 text-red-200" />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-zinc-500 font-mono mt-1.5">
              Instant one-touch access with official Administrator credentials
            </p>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              or sign in manually
            </span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-xs text-red-200 animate-shake">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vexomusic.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red text-xs text-white placeholder-zinc-600 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-zinc-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red text-xs text-white placeholder-zinc-600 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-zinc-400" />
                  <span>Authenticate & Enter</span>
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Helper */}
          <div className="pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@vexomusic.com');
                setPassword('admin');
                setError(null);
              }}
              className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5 text-vexo-red" />
              <span>Quick-Fill Default Credentials (admin@vexomusic.com / admin)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-[11px] text-zinc-600 font-mono">
            VEXO ENTERTAINMENT PVT. LTD. &bull; ALL RIGHTS RESERVED &bull; 2026
          </p>
        </div>
      </div>
    </div>
  );
};
