import React from 'react';
import { Menu, Radio, Disc3, Music2 } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
  title,
  subtitle,
}) => {
  const { user } = useAdminAuth();

  return (
    <header className="h-14 px-4 lg:px-6 border-b border-zinc-800/80 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Music2 className="w-4 h-4 text-vexo-red" />
              <span>{title}</span>
            </h1>
            {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Music Studio Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/40 border border-red-800/50 text-[11px] font-mono text-red-400">
          <Radio className="w-3.5 h-3.5 text-vexo-red animate-pulse" />
          <span className="font-bold tracking-wider">STUDIO CONSOLE &bull; LIVE ON AIR</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-xs font-bold text-vexo-red font-mono">
            <Disc3 className="w-4 h-4 text-vexo-red" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-zinc-200">{user?.name || 'VEXO Label Admin'}</p>
            <p className="text-[10px] text-zinc-500 font-mono">{user?.email || 'admin@vexomusic.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
