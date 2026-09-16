import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Users,
  Disc3,
  Music,
  Calendar,
  Video,
  Camera,
  Briefcase,
  Image as ImageIcon,
  Mail,
  Sliders,
  ShieldCheck,
  FileText,
  LogOut,
  ExternalLink,
  ChevronRight,
  Flame,
  Pin,
  PinOff,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminMockStore } from '../services/adminMockStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export const AdminSidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isPinned = false,
  onTogglePin,
}) => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);
  const leaveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Expanded if mobile drawer is open, or desktop sidebar is pinned or currently hovered
  const isExpanded = isOpen || isPinned || isHovered;

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 160);
  };

  React.useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  // Get live new enquiries count from store
  const [newCount, setNewCount] = React.useState(() => {
    try {
      return adminMockStore.getInquiries().newCount || 0;
    } catch {
      return 0;
    }
  });

  React.useEffect(() => {
    const updateCount = () => {
      try {
        const count = adminMockStore.getInquiries().newCount || 0;
        setNewCount(count);
      } catch {}
    };
    updateCount();
    const interval = setInterval(updateCount, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navSections: NavSection[] = [
    {
      title: 'DASHBOARD',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: 'CONTENT',
      items: [
        { name: 'Homepage', path: '/admin/homepage', icon: Globe },
        { name: 'Pre-Wedding Studio', path: '/admin/pre-wedding', icon: Camera },
        { name: 'Artists', path: '/admin/artists', icon: Users },
        { name: 'Albums', path: '/admin/music', icon: Disc3 },
        { name: 'Tracks', path: '/admin/music?tab=tracks', icon: Music },
        { name: 'Events', path: '/admin/events', icon: Calendar },
        { name: 'Videos', path: '/admin/videos', icon: Video },
        { name: 'Services', path: '/admin/services', icon: Briefcase },
      ],
    },
    {
      title: 'MEDIA',
      items: [
        { name: 'Media Library', path: '/admin/media', icon: ImageIcon },
      ],
    },
    {
      title: 'BUSINESS',
      items: [
        {
          name: 'Contact Requests',
          path: '/admin/enquiries',
          icon: Mail,
          badge: newCount > 0 ? `${newCount}` : undefined,
        },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        { name: 'Website Settings', path: '/admin/site-settings', icon: Sliders },
      ],
    },
    {
      title: 'ADMIN',
      items: [
        { name: 'Users', path: '/admin/users', icon: ShieldCheck },
        { name: 'Activity Logs', path: '/admin/activity-logs', icon: FileText },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`admin-sidebar fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-[#08080a] border-r border-slate-200 dark:border-zinc-800/80 flex flex-col transition-all duration-300 ease-in-out select-none overflow-x-hidden ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${
          isExpanded
            ? 'lg:w-64 shadow-2xl shadow-slate-900/15 dark:shadow-[0_0_40px_rgba(0,0,0,0.85)]'
            : 'lg:w-[72px]'
        }`}
      >
        {/* Brand Header */}
        <div className={`h-14 border-b border-slate-200 dark:border-zinc-800/80 flex items-center transition-all duration-200 shrink-0 ${
          isExpanded ? 'px-3.5 justify-between' : 'justify-center px-0'
        }`}>
          <NavLink to="/admin" className="flex items-center gap-2.5 group min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-vexo-red to-[#990000] flex items-center justify-center shadow-md shadow-red-950/50 group-hover:scale-105 transition-transform shrink-0">
              <Flame className="w-4 h-4 text-white" />
            </div>
            {isExpanded && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="font-extrabold text-sm tracking-wider text-slate-900 dark:text-white">VEXO</span>
                  <span className="text-[9px] uppercase tracking-widest px-1 py-0.2 rounded bg-red-50 dark:bg-red-950/90 border border-red-200 dark:border-red-800 text-vexo-red dark:text-red-400 font-mono font-bold">
                    CMS
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 dark:text-zinc-400 tracking-wider font-mono font-semibold truncate">RECORD LABEL</p>
              </div>
            )}
          </NavLink>

          {/* Pin/Unpin button on desktop when expanded */}
          {isExpanded && onTogglePin && (
            <button
              type="button"
              onClick={onTogglePin}
              title={isPinned ? 'Unpin sidebar (hover to open/close)' : 'Pin sidebar open'}
              className="hidden lg:flex min-h-0 h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            >
              {isPinned ? (
                <Pin className="w-3.5 h-3.5 text-vexo-red fill-vexo-red" />
              ) : (
                <PinOff className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Section List */}
        <div className={`flex-1 overflow-y-auto py-2.5 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-zinc-800 ${
          isExpanded ? 'px-2.5' : 'px-2'
        }`}>
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {isExpanded ? (
                <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 px-2.5 py-1 truncate">
                  {section.title}
                </h3>
              ) : (
                sIdx > 0 && <div className="my-2 mx-1 border-t border-slate-200 dark:border-zinc-800/80" />
              )}

              <div className="space-y-0.5">
                {section.items.map((item, iIdx) => (
                  <NavLink
                    key={`${item.path}-${iIdx}`}
                    to={item.path}
                    end={item.exact}
                    onClick={onClose}
                    title={!isExpanded ? item.name : undefined}
                    className={({ isActive }) =>
                      `relative flex items-center min-h-0 h-10 rounded-xl text-xs transition-all duration-200 group overflow-hidden ${
                        isExpanded
                          ? 'justify-between px-2.5 py-2'
                          : 'justify-center w-10 mx-auto'
                      } ${
                        isActive
                          ? 'nav-item-active bg-gradient-to-r from-red-500/15 via-red-500/5 to-transparent dark:from-vexo-red/20 dark:via-vexo-red/5 dark:to-transparent text-slate-900 dark:text-white font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-zinc-900/60 font-medium hover:translate-x-0.5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Red Accent Active Indicator Pill */}
                        {isActive && isExpanded && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-vexo-red shadow-[0_0_8px_rgba(224,0,0,0.7)]" />
                        )}

                        <div className={`flex items-center gap-2.5 min-w-0 ${!isExpanded ? 'justify-center' : ''}`}>
                          <item.icon
                            className={`w-4 h-4 transition-all duration-200 shrink-0 ${
                              isActive
                                ? 'text-vexo-red scale-110 drop-shadow-[0_0_6px_rgba(224,0,0,0.4)]'
                                : 'text-slate-500 dark:text-zinc-500 group-hover:text-vexo-red group-hover:scale-110'
                            }`}
                          />
                          {isExpanded && (
                            <span className="truncate whitespace-nowrap">{item.name}</span>
                          )}
                        </div>

                        {/* Badges & Chevron (Expanded) */}
                        {isExpanded && (
                          <div className="flex items-center gap-1 shrink-0">
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-vexo-red text-white shadow-[0_0_6px_rgba(220,38,38,0.7)] animate-pulse">
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight
                              className={`w-3 h-3 transition-all duration-200 ${
                                isActive
                                  ? 'text-vexo-red opacity-100 translate-x-0'
                                  : 'text-slate-400 dark:text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                              }`}
                            />
                          </div>
                        )}

                        {/* Badge notification dot (Collapsed) */}
                        {!isExpanded && item.badge && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-vexo-red ring-2 ring-white dark:ring-[#08080a] animate-pulse" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Quick Links & User Badge */}
        <div className={`border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-[#060608] space-y-2 overflow-hidden transition-all duration-200 shrink-0 ${
          isExpanded ? 'p-2.5' : 'p-1.5'
        }`}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={!isExpanded ? "Public Site (vexomusic.in)" : undefined}
            className={`flex items-center min-h-0 rounded-lg bg-white dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white transition-colors shadow-xs ${
              isExpanded ? 'justify-between px-2.5 py-1.5' : 'justify-center h-9 w-10 mx-auto'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
              {isExpanded && <span className="truncate">Public Site</span>}
            </div>
            {isExpanded && <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">vexomusic.in</span>}
          </a>

          <div className={`flex items-center ${isExpanded ? 'justify-between pt-0.5' : 'justify-center flex-col gap-1.5 pt-1'}`}>
            <div className={`flex items-center gap-2 min-w-0 ${!isExpanded ? 'justify-center' : ''}`}>
              <div
                title={user?.name || 'Administrator'}
                className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 flex items-center justify-center text-[11px] font-bold text-slate-800 dark:text-white uppercase shrink-0"
              >
                {user?.name?.substring(0, 2) || 'AD'}
              </div>
              {isExpanded && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Administrator'}</p>
                  <span className="text-[9px] font-mono text-vexo-red uppercase tracking-wider font-bold">
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="min-h-0 h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
