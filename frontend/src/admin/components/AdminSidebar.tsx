import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Users,
  Disc3,
  Music,
  Calendar,
  Video,
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
}

export const AdminSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

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
        className={`fixed top-0 bottom-0 left-0 z-50 w-56 bg-[#08080a] border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Compact Brand Header */}
        <div className="h-14 px-4 border-b border-zinc-800/80 flex items-center justify-between">
          <NavLink to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-vexo-red to-[#990000] flex items-center justify-center shadow-md shadow-red-950/50 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm tracking-wider text-white">VEXO</span>
                <span className="text-[8px] uppercase tracking-widest px-1 py-0.2 rounded bg-red-950/80 border border-red-800/50 text-red-400 font-mono font-bold">
                  CMS
                </span>
              </div>
              <p className="text-[9px] text-zinc-500 tracking-wider font-mono">RECORD LABEL</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation Section List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <h3 className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item, iIdx) => (
                  <NavLink
                    key={`${item.path}-${iIdx}`}
                    to={item.path}
                    end={item.exact}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium transition-all group ${
                        isActive
                          ? 'bg-red-950/40 text-white border-l-2 border-vexo-red shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <item.icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-vexo-red transition-colors shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-vexo-red text-white shadow-[0_0_8px_rgba(220,38,38,0.6)] animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Quick Links & User Badge */}
        <div className="p-2.5 border-t border-zinc-800/80 bg-[#060608] space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/60 border border-zinc-800 text-[11px] text-zinc-400 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <ExternalLink className="w-3 h-3 text-zinc-500" />
              <span>Public Site</span>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono">vexomusic.in</span>
          </a>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0">
                {user?.name?.substring(0, 2) || 'AD'}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-white truncate">{user?.name || 'Administrator'}</p>
                <span className="text-[8px] font-mono text-vexo-red uppercase tracking-wider">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
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
