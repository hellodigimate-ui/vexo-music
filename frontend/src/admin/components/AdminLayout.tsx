import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { AdminMobileNavigation } from './AdminMobileNavigation';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex selection:bg-vexo-red selection:text-white font-sans antialiased">
      {/* Desktop & Mobile Sidebar Drawer */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60 pb-16 lg:pb-0">
        {/* Topbar Header */}
        <AdminTopbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          title={meta.title}
          subtitle={meta.subtitle}
        />

        {/* Dashboard Shell Canvas */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
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
