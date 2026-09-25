import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Video,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { VideoFilters } from '../components/videos/VideoFilters';
import { VideoTable, type VideoItem } from '../components/videos/VideoTable';
import { VideoCard } from '../components/videos/VideoCard';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { adminVideosApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';

export const AdminVideosPage: React.FC = () => {
  const toast = useAdminToast();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVideosData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminVideosApi.list();
      if (res.success && Array.isArray(res.data)) {
        setVideos(res.data);
      }
    } catch (err: any) {
      toast.error('Failed to load videos', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVideosData();
  }, [fetchVideosData]);

  // Quick Toggle Featured
  const handleToggleFeatured = async (video: VideoItem) => {
    const newFeatured = !video.featured;
    try {
      const res = await adminVideosApi.update(video.id, { featured: newFeatured });
      if (res.success) {
        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, featured: newFeatured } : v))
        );
        toast.success(
          newFeatured ? 'Featured Hero Spotlight' : 'Standard Video',
          `"${video.title}" is now ${newFeatured ? 'spotlighted as featured hero video' : 'set to standard'}.`
        );
      }
    } catch (err: any) {
      toast.error('Update Failed', err.message);
    }
  };

  // Quick Toggle Published
  const handleTogglePublished = async (video: VideoItem) => {
    const newPublished = video.published === false ? true : false;
    try {
      const res = await adminVideosApi.update(video.id, { published: newPublished });
      if (res.success) {
        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, published: newPublished } : v))
        );
        toast.success(
          newPublished ? 'Video Published' : 'Video Set to Draft',
          `"${video.title}" is now ${newPublished ? 'live in video library' : 'hidden from public view'}.`
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
      const res = await adminVideosApi.delete(deleteTarget.id);
      if (res.success) {
        toast.success('Video Deleted', `Video "${deleteTarget.title}" was removed.`);
        setDeleteTarget(null);
        fetchVideosData();
      }
    } catch (err: any) {
      toast.error('Deletion Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered computation
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.artist.toLowerCase().includes(q) ||
        v.youtubeId.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        (Array.isArray(v.tags)
          ? v.tags.some((t) => t.toLowerCase().includes(q))
          : typeof v.tags === 'string' && v.tags.toLowerCase().includes(q));

      const matchesCategory =
        categoryFilter === 'all' ||
        v.category.toLowerCase() === categoryFilter.toLowerCase();

      const matchesFeatured =
        featuredFilter === 'all' ||
        (featuredFilter === 'featured' && v.featured) ||
        (featuredFilter === 'standard' && !v.featured);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && v.published !== false) ||
        (statusFilter === 'draft' && v.published === false);

      return matchesSearch && matchesCategory && matchesFeatured && matchesStatus;
    });
  }, [videos, searchQuery, categoryFilter, featuredFilter, statusFilter]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredVideos.length / pageSize) || 1;
  const paginatedVideos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredVideos.slice(start, start + pageSize);
  }, [filteredVideos, currentPage, pageSize]);

  // Statistics
  const totalVideos = videos.length;
  const publishedCount = videos.filter((v) => v.published !== false).length;
  const featuredCount = videos.filter((v) => v.featured).length;

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-vexo-red font-mono text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> VIDEO PRODUCTION & YOUTUBE STREAM SYNC
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
            Music Videos & Visual Media
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Manage official music videos, live stadium performances, visualizers, and behind-the-scenes content.
          </p>
        </div>

        <NavLink
          to="/admin/videos/new"
          className="px-5 py-2.5 rounded-xl bg-vexo-red hover:bg-[#c50000] active:scale-[0.98] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-xs hover:shadow-md hover:shadow-red-500/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Video</span>
        </NavLink>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Videos */}
        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-vexo-red/10 border border-red-200 dark:border-vexo-red/30 flex items-center justify-center text-vexo-red">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Media Library</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalVideos}</p>
          </div>
        </div>

        {/* Published Videos */}
        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">Live on Catalogue</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{publishedCount}</p>
          </div>
        </div>

        {/* Featured Heroes */}
        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-500">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">Featured Hero Spotlights</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{featuredCount}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Filters Bar */}
      <VideoFilters
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        categoryFilter={categoryFilter}
        onCategoryChange={(cat) => {
          setCategoryFilter(cat);
          setCurrentPage(1);
        }}
        featuredFilter={featuredFilter}
        onFeaturedChange={(ft) => {
          setFeaturedFilter(ft);
          setCurrentPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(st) => {
          setStatusFilter(st);
          setCurrentPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={filteredVideos.length}
      />

      {/* Main List Rendering */}
      {isLoading ? (
        <div className="p-20 text-center text-xs font-mono text-zinc-500 animate-pulse">
          LOADING VIDEO MEDIA DIRECTORY...
        </div>
      ) : paginatedVideos.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-[#0e0e13] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">No video content found</p>
            <p className="text-xs text-zinc-500 mt-1">
              Try adjusting your search criteria or publish a new video.
            </p>
          </div>
          <NavLink
            to="/admin/videos/new"
            className="px-4 py-2 rounded-xl bg-vexo-red hover:bg-vexo-red-bright text-white text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Publish First Video</span>
          </NavLink>
        </div>
      ) : viewMode === 'table' ? (
        <VideoTable
          videos={paginatedVideos}
          onToggleFeatured={handleToggleFeatured}
          onTogglePublished={handleTogglePublished}
          onDelete={(video) => setDeleteTarget(video)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onToggleFeatured={handleToggleFeatured}
              onTogglePublished={handleTogglePublished}
              onDelete={(video) => setDeleteTarget(video)}
            />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
          <span className="text-xs font-mono text-zinc-500">
            Page {currentPage} of {totalPages} &bull; Showing {paginatedVideos.length} of {filteredVideos.length} videos
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-zinc-900 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-zinc-900 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Music-Themed Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="REMOVE MUSIC VIDEO CONTENT"
        itemName={deleteTarget?.title}
        message={`Are you sure you want to delete video "${deleteTarget?.title}"? This will unlink the YouTube player embed from the website.`}
        confirmText="DELETE VIDEO"
        cancelText="KEEP VIDEO"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminVideosPage;
