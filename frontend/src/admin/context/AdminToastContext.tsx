import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, X, Disc3 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const AdminToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 3800) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 active

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast('success', title, message),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast('error', title, message),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast('warning', title, message),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast('info', title, message),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-3 sm:px-0">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const isSuccess = t.type === 'success';
            const isError = t.type === 'error';
            const isWarning = t.type === 'warning';

            const accentColor = isSuccess
              ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
              : isError
              ? 'text-vexo-red-bright border-red-500/50 bg-red-500/10 shadow-[0_0_25px_rgba(224,0,0,0.35)]'
              : isWarning
              ? 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.25)]'
              : 'text-sky-400 border-sky-500/40 bg-sky-500/10 shadow-[0_0_25px_rgba(56,189,248,0.25)]';

            const progressBarColor = isSuccess
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : isError
              ? 'bg-gradient-to-r from-vexo-red to-vexo-red-bright'
              : isWarning
              ? 'bg-gradient-to-r from-amber-500 to-amber-400'
              : 'bg-gradient-to-r from-sky-500 to-sky-400';

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -24, scale: 0.9, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{
                  opacity: 0,
                  scale: 0.88,
                  x: 30,
                  filter: 'blur(4px)',
                  transition: { duration: 0.22, ease: 'easeOut' },
                }}
                transition={{
                  type: 'spring',
                  damping: 24,
                  stiffness: 350,
                  mass: 0.8,
                }}
                className={`pointer-events-auto relative overflow-hidden flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-2xl bg-gradient-to-b from-[#14141f]/95 via-[#0d0d14]/95 to-[#060609]/95 text-white shadow-2xl ${accentColor}`}
              >
                {/* Left Subtle Glow Bar */}
                <div
                  className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                    isSuccess
                      ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                      : isError
                      ? 'bg-vexo-red-bright shadow-[0_0_10px_#FF1111]'
                      : isWarning
                      ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'
                      : 'bg-sky-400 shadow-[0_0_10px_#38bdf8]'
                  }`}
                />

                {/* Animated Music Icon */}
                <div className="shrink-0 mt-0.5 pl-1">
                  {isSuccess ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  ) : isError ? (
                    <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-vexo-red-bright animate-pulse" />
                    </div>
                  ) : isWarning ? (
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                      <Disc3 className="w-4 h-4 text-sky-400 animate-[spin_6s_linear_infinite]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black uppercase tracking-wider text-white">
                      {t.title}
                    </p>
                  </div>
                  {t.message && (
                    <p className="text-[11px] text-zinc-300/90 mt-1 leading-relaxed break-words font-sans">
                      {t.message}
                    </p>
                  )}
                </div>

                {/* Dismiss Close Button */}
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Smooth Countdown Progress Bar */}
                {t.duration && t.duration > 0 && (
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: t.duration / 1000, ease: 'linear' }}
                    className={`absolute bottom-0 left-0 h-[2.5px] opacity-70 ${progressBarColor}`}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useAdminToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useAdminToast must be used within an AdminToastProvider');
  }
  return context;
};

export default AdminToastProvider;
