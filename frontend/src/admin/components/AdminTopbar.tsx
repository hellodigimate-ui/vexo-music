import React from 'react';
import { Menu, Radio, Disc3, Music2, ExternalLink, ArrowLeft, PanelLeftClose, PanelLeft } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { MusicThemeToggle } from '../../components/theme';

interface AdminTopbarProps {
  onToggleSidebar: () => void;
  isSidebarPinned?: boolean;
  title?: string;
  subtitle?: string;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  onToggleSidebar,
  isSidebarPinned = true,
  title,
  subtitle,
}) => {
  const { user } = useAdminAuth();
  const location = useLocation();
  const isDashboard = location.pathname === '/admin';

  return (
    <header className="admin-topbar h-14 px-3 sm:px-4 lg:px-6 border-b border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#08080a]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between transition-colors duration-300 w-full max-w-full overflow-hidden">
      {/* Left: Sidebar Toggle, Back to Dashboard & Page Title */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 sm:p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          aria-label="Toggle navigation menu"
          title={isSidebarPinned ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isSidebarPinned ? (
            <PanelLeftClose className="w-5 h-5 hidden lg:block" />
          ) : (
            <PanelLeft className="w-5 h-5 hidden lg:block" />
          )}
          <Menu className="w-5 h-5 lg:hidden" />
        </button>

        {!isDashboard && (
          <NavLink
            to="/admin"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 hover:dark:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white transition-all group shadow-xs shrink-0 cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-vexo-red group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline font-mono">Dashboard</span>
          </NavLink>
        )}

        {title && (
          <div className="min-w-0 truncate">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5 sm:gap-2 truncate">
              <Music2 className="w-3.5 h-3.5 text-vexo-red shrink-0" />
              <span className="truncate">{title}</span>
            </h1>
            {subtitle && <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden xl:block truncate">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right: Studio On Air Status & Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Music-Themed Equalizer Toggle */}
        <MusicThemeToggle variant="compact" />

        {/* Studio Status Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-[10px] font-mono text-vexo-red dark:text-red-400 shrink-0">
          <Radio className="w-3 h-3 text-vexo-red animate-pulse" />
          <span className="font-semibold tracking-wider uppercase">STUDIO CONSOLE &bull; LIVE</span>
        </div>

        {/* Public Portal Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-[11px] text-slate-700 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white transition-colors shadow-xs shrink-0"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Live Site</span>
        </a>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-1.5 sm:pl-2 sm:border-l border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-zinc-900 border border-red-100 dark:border-zinc-800 flex items-center justify-center text-xs font-bold text-vexo-red font-mono shrink-0">
            <Disc3 className="w-3.5 h-3.5 text-vexo-red" />
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-[11px] font-semibold text-slate-900 dark:text-zinc-200">{user?.name || 'VEXO Admin'}</p>
            <p className="text-[9px] text-slate-500 dark:text-zinc-500 font-mono">{user?.email || 'admin@vexomusic.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
