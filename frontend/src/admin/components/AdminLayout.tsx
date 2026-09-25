import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { AdminMobileNavigation } from './AdminMobileNavigation';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    try {
      const saved = localStorage.getItem('vexo_admin_sidebar_pinned');
      // Default to true (docked) on desktop to guarantee non-overlapping layout
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const handleTogglePin = () => {
    setIsSidebarPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vexo_admin_sidebar_pinned', String(next));
      } catch {}
      return next;
    });
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen((prev) => !prev);
    } else {
      handleTogglePin();
    }
  };

  const location = useLocation();

  const getPageMeta = (pathname: string) => {
    switch (pathname) {
      case '/admin':
        return { title: 'Executive Overview', subtitle: 'Platform KPIs, real-time metrics, and live submission queue' };
      case '/admin/homepage':
        return { title: 'Homepage Hero & Banner CMS', subtitle: 'Customize landing page headline, marquee alerts, and live platform counters' };
      case '/admin/artists':
        return { title: 'Artist Roster Management', subtitle: 'Manage signed talent, biographies, genres, and social links' };
      case '/admin/music':
        return { title: 'Music & Discography CMS', subtitle: 'Manage commercial albums, EPs, and digital track stems' };
      case '/admin/events':
        return { title: 'Live Events & Tour Routing', subtitle: 'Manage global tours, arena dates, ticketing links, and lineups' };
      case '/admin/videos':
        return { title: 'Video & Visualizer CMS', subtitle: 'Manage official 4K music videos, visualizers, and concert streams' };
      case '/admin/services':
        return { title: 'Studio Services CMS', subtitle: 'Manage commercial studio offerings, pricing tiers, and gear specs' };
      case '/admin/media':
        return { title: 'Media Asset Library', subtitle: 'Upload and manage promotional imagery, posters, and audio assets' };
      case '/admin/inquiries':
      case '/admin/enquiries':
        return { title: 'Client Inquiries & CRM', subtitle: 'Review and triage project booking requests and contact submissions' };
      case '/admin/site-settings':
        return { title: 'Global Platform Settings', subtitle: 'Manage branding, SEO metadata, corporate contacts, and social handles' };
      case '/admin/users':
        return { title: 'Admin User Governance', subtitle: 'Manage administrative roles, permissions, and security access' };
      case '/admin/activity-logs':
        return { title: 'System Audit Logs', subtitle: 'Track administrative activity, label releases, and CMS updates' };
      default:
        return { title: 'VEXO Label Control Center', subtitle: 'Control system' };
    }
  };

  const meta = getPageMeta(location.pathname);

  return (
    <div className="admin-root min-h-screen bg-slate-100 dark:bg-[#08080a] text-slate-900 dark:text-zinc-100 flex selection:bg-vexo-red selection:text-white font-sans antialiased transition-colors duration-300">
      {/* Desktop & Mobile Sidebar Drawer */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isPinned={isSidebarPinned}
        onTogglePin={handleTogglePin}
      />

      {/* Main Content Area - Fluid flex child that naturally occupies 100% of remaining space */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 transition-all duration-300">
        {/* Topbar Header */}
        <AdminTopbar
          onToggleSidebar={handleToggleSidebar}
          isSidebarPinned={isSidebarPinned}
          title={meta.title}
          subtitle={meta.subtitle}
        />

        {/* Dashboard Shell Canvas - Outer section expands fluidly across the canvas */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-100 dark:bg-[#08080a] transition-colors duration-300">
          <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <AdminMobileNavigation />
    </div>
  );
};

export default AdminLayout;
