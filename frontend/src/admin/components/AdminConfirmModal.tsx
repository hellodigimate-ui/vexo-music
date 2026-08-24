import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, Disc3, Volume2 } from 'lucide-react';

interface AdminConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AdminConfirmModal: React.FC<AdminConfirmModalProps> = ({
  isOpen,
  title,
  itemName,
  message,
  confirmText = 'Confirm & Delete',
  cancelText = 'Keep In Roster',
  isDanger = true,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'VXO';
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Darkened Acoustic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          onClick={isLoading ? undefined : onCancel}
        />

        {/* Modal Chassis: High-End Music Studio Console */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#161622] via-[#0d0d13] to-[#060608] border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(224,0,0,0.35)] ring-1 ring-red-500/30 z-10 space-y-6 overflow-hidden"
        >
          {/* Ambient Glows & Concentric Vinyl Grooves Watermark */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-vexo-red/20 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-red-950/40 rounded-full blur-[90px] pointer-events-none" />
          
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full border border-white/[0.04] pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-white/[0.03] pointer-events-none" />

          {/* Top Audio Header Bar: Equalizer Frequency Spectrum & Close Button */}
          <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-vexo-red-bright animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-red-400 font-bold">
                STUDIO CONSOLE // DELETION WARNING
              </span>
            </div>

            {/* Live Audio Equalizer Wave Animation */}
            <div className="flex items-end gap-1 h-4 px-2 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-800">
              <span className="w-1 bg-vexo-red-bright rounded-full animate-[bounce_1s_infinite_100ms] h-2" />
              <span className="w-1 bg-vexo-red rounded-full animate-[bounce_1s_infinite_300ms] h-3.5" />
              <span className="w-1 bg-red-400 rounded-full animate-[bounce_1s_infinite_150ms] h-2.5" />
              <span className="w-1 bg-vexo-red-bright rounded-full animate-[bounce_1s_infinite_400ms] h-4" />
              <span className="w-1 bg-red-500 rounded-full animate-[bounce_1s_infinite_200ms] h-1.5" />
            </div>

            <button
              onClick={onCancel}
              disabled={isLoading}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Visual: Spinning Vinyl / Audio Laser Node & Title */}
          <div className="relative z-10 flex items-start gap-4 sm:gap-5">
            {/* Vinyl Record Ejector Badge */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-red-500/50 flex items-center justify-center text-vexo-red-bright shadow-[0_0_25px_rgba(224,0,0,0.4)] shrink-0">
              <Disc3 className="w-8 h-8 sm:w-9 sm:h-9 animate-[spin_8s_linear_infinite] text-vexo-red-bright" />
              <span className="absolute w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_#FF1111]" />
            </div>

            <div className="space-y-1.5 pt-0.5">
              <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {message ||
                  'Are you sure you want to delete this record? This action will immediately expel the entry from public directories, playlists, and associated media streams.'}
              </p>
            </div>
          </div>

          {/* Target Track / Artist Visualizer Card */}
          {itemName && (
            <div className="relative z-10 p-4 rounded-2xl bg-black/60 border border-red-500/30 backdrop-blur-md space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span className="flex items-center gap-1.5 text-zinc-400 font-bold">
                  <Volume2 className="w-3.5 h-3.5 text-vexo-red-bright" />
                  TARGET DOSSIER
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-900/50 font-bold">
                  EXPEL FROM ROSTER
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-red-500/30 flex items-center justify-center text-xs font-mono font-bold text-vexo-red-bright shrink-0">
                  {getInitials(itemName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white text-sm truncate">{itemName}</p>
                  <p className="text-[10px] font-mono text-zinc-400">STATUS: ACTIVE CATALOG ENTRY</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={onConfirm}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                isDanger
                  ? 'bg-gradient-to-r from-vexo-red-bright via-vexo-red to-red-700 hover:from-red-500 hover:to-red-800 shadow-[0_0_30px_rgba(224,0,0,0.5)] border border-red-500/40 hover:scale-[1.02]'
                  : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-600'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminConfirmModal;
