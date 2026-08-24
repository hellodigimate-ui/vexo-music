import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Disc3,
  Video,
  Mail,
  Sliders,
} from 'lucide-react';

export const AdminMobileNavigation: React.FC = () => {
  const mobileNavItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Artists', path: '/admin/artists', icon: Users },
    { name: 'Music', path: '/admin/music', icon: Disc3 },
    { name: 'Videos', path: '/admin/videos', icon: Video },
    { name: 'Enquiries', path: '/admin/enquiries', icon: Mail },
    { name: 'Settings', path: '/admin/site-settings', icon: Sliders },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#08080a]/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 lg:hidden flex items-center justify-around">
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/admin'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
              isActive
                ? 'text-vexo-red'
                : 'text-zinc-500 hover:text-zinc-300'
            }`
          }
        >
          <item.icon className="w-4 h-4" />
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default AdminMobileNavigation;
