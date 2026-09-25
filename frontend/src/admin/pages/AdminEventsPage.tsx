import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Radio,
  Star,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { EventFilters } from '../components/events/EventFilters';
import { EventTable, type EventItem } from '../components/events/EventTable';
import { EventCard } from '../components/events/EventCard';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { adminEventsApi, adminArtistsApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';

export const AdminEventsPage: React.FC = () => {
  const toast = useAdminToast();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [allArtists, setAllArtists] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return 'grid';
    }
    return 'table';
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Deletion Modal State
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEventsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [eventsRes, artistsRes] = await Promise.all([
        adminEventsApi.list(),
        adminArtistsApi.list(),
      ]);

      if (eventsRes.success && Array.isArray(eventsRes.data)) {
        setEvents(eventsRes.data);
      }
      if (artistsRes.success && Array.isArray(artistsRes.data)) {
        setAllArtists(artistsRes.data);
      }
    } catch (err: any) {
      toast.error('Failed to load events', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEventsData();
  }, [fetchEventsData]);

  // Quick Toggle Featured
  const handleToggleFeatured = async (event: EventItem) => {
    const newFeatured = !event.featured;
    try {
      const res = await adminEventsApi.update(event.id, { featured: newFeatured });
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, featured: newFeatured } : e))
        );
        toast.success(
          newFeatured ? 'Featured Spotlight' : 'Standard Event',
          `"${event.title}" is now ${newFeatured ? 'featured on the homepage' : 'set to standard'}.`
        );
      }
    } catch (err: any) {
      toast.error('Update Failed', err.message);
    }
  };

  // Quick Toggle Published
  const handleTogglePublished = async (event: EventItem) => {
    const newPublished = event.published === false ? true : false;
    try {
      const res = await adminEventsApi.update(event.id, { published: newPublished });
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, published: newPublished } : e))
        );
        toast.success(
          newPublished ? 'Event Published' : 'Event Set to Draft',
          `"${event.title}" is now ${newPublished ? 'live on public directory' : 'hidden from public view'}.`
        );
      }
    } catch (err: any) {
      toast.error('Update Failed', err.message);
    }
  };

  // Delete Confirmation Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await adminEventsApi.delete(deleteTarget.id);
      if (res.success) {
        toast.success('Event Cancelled', `Event "${deleteTarget.title}" was removed.`);
        setDeleteTarget(null);
        fetchEventsData();
      }
    } catch (err: any) {
      toast.error('Deletion Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Events computation
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        ev.title.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.location.toLowerCase().includes(q) ||
        ev.mainArtist.toLowerCase().includes(q) ||
        (ev.slug && ev.slug.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' ||
        ev.status?.toLowerCase() === statusFilter.toLowerCase();

      const matchesFeatured =
        featuredFilter === 'all' ||
        (featuredFilter === 'featured' && ev.featured) ||
        (featuredFilter === 'standard' && !ev.featured);

      return matchesSearch && matchesStatus && matchesFeatured;
    });
  }, [events, searchQuery, statusFilter, featuredFilter]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  // Statistics
  const totalEvents = events.length;
  const upcomingCount = events.filter((e) => e.status === 'upcoming' || e.status === 'live').length;
  const featuredCount = events.filter((e) => e.featured).length;

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-vexo-red-bright font-mono text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> LIVE TOUR & CONCERT MANAGEMENT
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
            Live Events & Arena Shows
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Manage stadium itineraries, arena tours, festival appearances, and multi-artist lineups.
          </p>
        </div>

        <NavLink
          to="/admin/events/new"
          className="px-5 py-2.5 rounded-xl bg-vexo-red hover:bg-vexo-red-bright text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(224,0,0,0.4)] transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Live Event</span>
        </NavLink>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Events */}
        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Events</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalEvents}</p>
          </div>
        </div>

        {/* Upcoming / Live */}
        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">Upcoming & Live</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{upcomingCount}</p>
          </div>
        </div>

        {/* Featured Spotlights */}
        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm dark:shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 dark:text-amber-400">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">Featured Spotlights</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{featuredCount}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Filters Bar */}
      <EventFilters
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        featuredFilter={featuredFilter}
        onFeaturedChange={(ft) => {
          setFeaturedFilter(ft);
          setCurrentPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={filteredEvents.length}
      />

      {/* Main List Rendering */}
      {isLoading ? (
        <div className="p-20 text-center text-xs font-mono text-zinc-500 animate-pulse">
          LOADING LIVE EVENTS DIRECTORY...
        </div>
      ) : paginatedEvents.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0e0e13] space-y-4 shadow-sm dark:shadow-none">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">No live events found</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
              Try adjusting your search criteria or schedule a new event.
            </p>
          </div>
          <NavLink
            to="/admin/events/new"
            className="px-4 py-2 rounded-xl bg-vexo-red hover:bg-vexo-red-bright text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule First Event</span>
          </NavLink>
        </div>
      ) : viewMode === 'table' ? (
        <EventTable
          events={paginatedEvents}
          allArtists={allArtists}
          onToggleFeatured={handleToggleFeatured}
          onTogglePublished={handleTogglePublished}
          onDelete={(event) => setDeleteTarget(event)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              allArtists={allArtists}
              onToggleFeatured={handleToggleFeatured}
              onTogglePublished={handleTogglePublished}
              onDelete={(event) => setDeleteTarget(event)}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800/60">
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-500">
            Page {currentPage} of {totalPages} &bull; Showing {paginatedEvents.length} of {filteredEvents.length} events
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer shadow-sm dark:shadow-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer shadow-sm dark:shadow-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Music-Themed Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="CANCEL & DELETE LIVE EVENT"
        itemName={deleteTarget?.title}
        message={`Are you sure you want to permanently cancel event "${deleteTarget?.title}"? All ticketing links will be deactivated.`}
        confirmText="CANCEL & EXPEL EVENT"
        cancelText="KEEP EVENT"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminEventsPage;
