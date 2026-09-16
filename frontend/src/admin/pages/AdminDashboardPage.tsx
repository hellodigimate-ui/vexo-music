import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Disc3,
  Music,
  Video,
  Calendar,
  Briefcase,
  Mail,
  Image as ImageIcon,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Radio,
  Headphones,
} from 'lucide-react';
import { adminDashboardApi, adminInquiriesApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';

export const AdminDashboardPage: React.FC = () => {
  const toast = useAdminToast();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await adminDashboardApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickStatusChange = async (inquiryId: string, status: string) => {
    try {
      await adminInquiriesApi.updateStatus(inquiryId, status);
      toast.success('Inquiry updated', `Booking status changed to ${status}.`);
      fetchStats();
    } catch (err: any) {
      toast.error('Failed to update status', err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <div className="w-8 h-8 border-2 border-vexo-red border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-widest">CONNECTING TO VEXO MUSIC CONSOLE...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/30 border border-red-800/40 text-red-300 space-y-3">
        <p className="font-semibold text-sm">Failed to connect with Backend API</p>
        <p className="text-xs text-red-400 font-mono">{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 rounded-lg bg-red-900/60 hover:bg-red-800 text-xs font-semibold text-white transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const kpis = stats?.kpis || {};

  const kpiCards = [
    { title: 'SIGNED ARTISTS', count: kpis.totalArtists || 0, icon: Users, link: '/admin/artists', color: 'from-red-500/20 to-zinc-900/50', border: 'border-red-900/40' },
    { title: 'ALBUMS & EPS', count: kpis.totalAlbums || 0, icon: Disc3, link: '/admin/music', color: 'from-amber-500/20 to-zinc-900/50', border: 'border-amber-900/40' },
    { title: 'CATALOG TRACKS', count: kpis.totalTracks || 0, icon: Music, link: '/admin/music', color: 'from-emerald-500/20 to-zinc-900/50', border: 'border-emerald-900/40' },
    { title: 'MUSIC VIDEOS & VISUALS', count: kpis.totalVideos || 0, icon: Video, link: '/admin/videos', color: 'from-sky-500/20 to-zinc-900/50', border: 'border-sky-900/40' },
    { title: 'LIVE CONCERTS & TOURS', count: kpis.totalEvents || 0, icon: Calendar, link: '/admin/events', color: 'from-purple-500/20 to-zinc-900/50', border: 'border-purple-900/40' },
    { title: 'STUDIO SERVICES', count: kpis.totalServices || 0, icon: Briefcase, link: '/admin/services', color: 'from-rose-500/20 to-zinc-900/50', border: 'border-rose-900/40' },
    { title: 'COVER ART & MEDIA', count: kpis.totalMedia || 0, icon: ImageIcon, link: '/admin/media', color: 'from-indigo-500/20 to-zinc-900/50', border: 'border-indigo-900/40' },
    { title: 'CLIENT INQUIRIES', count: kpis.totalInquiries || 0, badge: kpis.newInquiries ? `${kpis.newInquiries} NEW` : undefined, icon: Mail, link: '/admin/enquiries', color: 'from-red-600/30 to-zinc-900/50', border: 'border-vexo-red/60' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Platform Summary */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#14141c] dark:via-[#101017] dark:to-[#0a0a0f] border border-slate-200 dark:border-zinc-800/80 p-8 shadow-xs">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-vexo-red/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/50 text-[11px] font-mono text-vexo-red dark:text-red-400">
            <Radio className="w-3.5 h-3.5 text-vexo-red animate-pulse" />
            <span className="font-semibold tracking-wider uppercase">VEXO MUSIC ENTERTAINMENT &bull; RECORD LABEL CONSOLE</span>
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-wide flex items-center gap-3">
              <span>VEXO LABEL CONTROL CENTER</span>
              <Headphones className="w-7 h-7 text-vexo-red" />
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-2xl mt-1">
              Synchronize label releases, roster artists, YouTube music videos, stadium tour itineraries, and studio booking inquiries in real time.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-4">
            <NavLink
              to="/admin/artists"
              className="px-4 py-2.5 rounded-xl bg-vexo-red hover:bg-[#c50000] active:scale-[0.98] text-xs font-semibold text-white shadow-xs hover:shadow-md hover:shadow-red-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Signed Artist</span>
            </NavLink>

            <NavLink
              to="/admin/music"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Disc3 className="w-4 h-4 text-vexo-red" />
              <span>Release Album / Track</span>
            </NavLink>

            <NavLink
              to="/admin/videos"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Video className="w-4 h-4 text-sky-500 dark:text-sky-400" />
              <span>Publish Music Video</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* KPI Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <NavLink
              key={card.title}
              to={card.link}
              className={`group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-gradient-to-br dark:${card.color} border border-slate-200 dark:${card.border} hover:border-slate-300 dark:hover:border-white/20 shadow-xs hover:shadow-sm transition-all duration-300 flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-white">
                  <Icon className="w-5 h-5" />
                </div>
                {card.badge ? (
                  <span className="px-2 py-0.5 rounded-md bg-vexo-red text-[10px] font-mono font-bold text-white shadow-xs">
                    {card.badge}
                  </span>
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-slate-400 dark:text-zinc-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                )}
              </div>

              <div className="mt-6 space-y-1">
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{card.count}</p>
                <p className="text-[11px] font-mono tracking-wider uppercase text-slate-500 dark:text-zinc-400">{card.title}</p>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Grid: Recent Inquiries & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Inquiries Section (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                <Mail className="w-4 h-4 text-vexo-red" />
                <span>Recent Studio Booking Inquiries</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-500">Client project submissions from the official contact form</p>
            </div>
            <NavLink
              to="/admin/enquiries"
              className="text-xs font-mono text-vexo-red hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-zinc-800/60 shadow-xs">
            {(!stats?.recentInquiries || stats.recentInquiries.length === 0) ? (
              <div className="py-12 text-center text-xs text-slate-400 dark:text-zinc-500 font-mono">
                No recent booking submissions.
              </div>
            ) : (
              stats.recentInquiries.map((inq: any) => (
                <div key={inq.id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-vexo-red">{inq.referenceId}</span>
                      <span className="text-xs text-slate-400 dark:text-zinc-500">&bull;</span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">{inq.name}</span>
                      {inq.status === 'NEW' && (
                        <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-[10px] font-mono text-vexo-red dark:text-red-400 font-bold">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-1">{inq.message}</p>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                      <span>Service: {inq.service}</span>
                      <span>&bull;</span>
                      <span>{inq.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {inq.status === 'NEW' && (
                      <button
                        onClick={() => handleQuickStatusChange(inq.id, 'CONTACTED')}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800/60 text-[11px] font-mono text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Mark Contacted
                      </button>
                    )}
                    <NavLink
                      to="/admin/enquiries"
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-[11px] font-mono text-slate-700 dark:text-zinc-300 hover:text-slate-950 dark:hover:text-white transition-colors"
                    >
                      Review
                    </NavLink>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Log Stream (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
                <span>Audit Trail Activity</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-500">Recent administrative logs</p>
            </div>
            <NavLink
              to="/admin/activity-logs"
              className="text-xs font-mono text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            >
              Logs
            </NavLink>
          </div>

          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 divide-y divide-slate-100 dark:divide-zinc-800/60 space-y-3 shadow-xs">
            {(!stats?.recentActivity || stats.recentActivity.length === 0) ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500 font-mono">
                No recent activity records.
              </div>
            ) : (
              stats.recentActivity.map((log: any) => (
                <div key={log.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white font-mono text-[11px]">{log.action}</span>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                    <span className="text-slate-800 dark:text-zinc-300 font-medium">{log.adminUserName || 'Admin'}</span> updated {log.entityType}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
