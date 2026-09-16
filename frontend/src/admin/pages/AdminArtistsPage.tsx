import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { adminArtistsApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { ArtistFilters } from '../components/artists/ArtistFilters';
import { ArtistTable } from '../components/artists/ArtistTable';
import { AdminArtistCard } from '../components/artists/ArtistCard';

export const AdminArtistsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedFeatured, setSelectedFeatured] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Styled Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArtists = async () => {
    try {
      setIsLoading(true);
      const res = await adminArtistsApi.list();
      if (res.success) {
        setArtists(res.data || []);
      }
    } catch (err: any) {
      toast.error('Failed to fetch artists', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  // Compute available genres dynamically
  const availableGenres = useMemo(() => {
    const genresSet = new Set<string>();
    for (const a of artists) {
      const gList = Array.isArray(a.genres) ? a.genres : (a.genres || '').split(',');
      for (const g of gList) {
        const trimmed = g.trim();
        if (trimmed) genresSet.add(trimmed);
      }
    }
    return Array.from(genresSet).sort();
  }, [artists]);

  // Filter artists
  const filteredArtists = useMemo(() => {
    return artists.filter((a) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.name?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q) ||
        a.slug?.toLowerCase().includes(q) ||
        (Array.isArray(a.genres) && a.genres.some((g: string) => g.toLowerCase().includes(q))) ||
        (typeof a.genres === 'string' && a.genres.toLowerCase().includes(q));

      const gList = Array.isArray(a.genres)
        ? a.genres.map((g: string) => g.trim().toLowerCase())
        : (a.genres || '').toLowerCase().split(',').map((g: string) => g.trim());
      const matchesGenre = selectedGenre === 'ALL' || gList.includes(selectedGenre.toLowerCase());

      const isPublished = !a.isComingSoon;
      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'PUBLISHED' && isPublished) ||
        (selectedStatus === 'COMING_SOON' && !isPublished);

      const matchesFeatured =
        selectedFeatured === 'ALL' ||
        (selectedFeatured === 'FEATURED' && Boolean(a.featured)) ||
        (selectedFeatured === 'STANDARD' && !a.featured);

      return matchesSearch && matchesGenre && matchesStatus && matchesFeatured;
    });
  }, [artists, searchQuery, selectedGenre, selectedStatus, selectedFeatured]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGenre, selectedStatus, selectedFeatured]);

  // Paginate filtered artists
  const totalPages = Math.ceil(filteredArtists.length / pageSize) || 1;
  const paginatedArtists = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArtists.slice(start, start + pageSize);
  }, [filteredArtists, currentPage, pageSize]);

  // 1-Click Quick Toggles
  const handleToggleFeatured = async (artist: any) => {
    const newFeatured = !artist.featured;
    try {
      await adminArtistsApi.update(artist.id, { featured: newFeatured });
      setArtists((prev) =>
        prev.map((a) => (a.id === artist.id ? { ...a, featured: newFeatured } : a))
      );
      toast.success(
        newFeatured ? 'Featured Artist' : 'Standard Artist',
        `"${artist.name}" is now ${newFeatured ? 'featured on the homepage' : 'set to standard'}.`
      );
    } catch (err: any) {
      toast.error('Failed to update featured status', err.message);
    }
  };

  const handleTogglePublished = async (artist: any) => {
    const currentlyPublished = !artist.isComingSoon;
    const newPublished = !currentlyPublished;
    try {
      await adminArtistsApi.update(artist.id, {
        isComingSoon: !newPublished,
        published: newPublished,
      });
      setArtists((prev) =>
        prev.map((a) =>
          a.id === artist.id ? { ...a, isComingSoon: !newPublished } : a
        )
      );
      toast.success(
        newPublished ? 'Artist Published' : 'Artist Unpublished',
        `"${artist.name}" is now ${newPublished ? 'live on the public site' : 'marked as Coming Soon'}.`
      );
    } catch (err: any) {
      toast.error('Failed to update status', err.message);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminArtistsApi.delete(deleteTarget.id);
      toast.info('Artist removed', `Artist "${deleteTarget.name}" deleted from roster.`);
      setDeleteTarget(null);
      fetchArtists();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics
  const totalListeners = useMemo(() => {
    return artists.reduce((acc, a) => acc + (Number(a.monthlyListeners) || 0), 0);
  }, [artists]);

  const featuredCount = useMemo(() => {
    return artists.filter((a) => a.featured).length;
  }, [artists]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Metrics Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-zinc-500">
            <span className="text-slate-600 dark:text-zinc-400">ADMIN CMS</span>
            <span>/</span>
            <span className="text-vexo-red">ARTISTS ROSTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
            <span>Artists Management</span>
            <span className="text-xs font-mono font-normal normal-case px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              {artists.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Manage recording artists, vocalists, genres, social profiles, and public directory visibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Add New Artist Button -> Navigates to /admin/artists/new */}
          <button
            onClick={() => navigate('/admin/artists/new')}
            className="px-5 py-2.5 rounded-xl bg-vexo-red hover:bg-[#c50000] active:scale-[0.98] text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:shadow-md hover:shadow-red-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Artist</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Metrics Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-vexo-red/10 border border-red-200 dark:border-vexo-red/30 flex items-center justify-center text-vexo-red">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-500">Total Signed Artists</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{artists.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-500">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-500">Featured Artists</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{featuredCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-500">Combined Listeners</p>
            <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{totalListeners.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <ArtistFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedGenre={selectedGenre}
        onGenreChange={setSelectedGenre}
        availableGenres={availableGenres}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedFeatured={selectedFeatured}
        onFeaturedChange={setSelectedFeatured}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResults={filteredArtists.length}
      />

      {/* 4. Artists Content Area (Table or Grid) */}
      {isLoading ? (
        <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl py-24 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-vexo-red-bright border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-mono text-zinc-500">LOADING ARTISTS ROSTER...</p>
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl py-20 text-center space-y-3">
          <Users className="w-12 h-12 text-zinc-700 mx-auto" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">No Artists Match Filter</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search criteria, reset active filters, or sign a new artist.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedGenre('ALL');
              setSelectedStatus('ALL');
              setSelectedFeatured('ALL');
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <ArtistTable
          artists={paginatedArtists}
          onToggleFeatured={handleToggleFeatured}
          onTogglePublished={handleTogglePublished}
          onDelete={(artist) => setDeleteTarget({ id: artist.id, name: artist.name })}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedArtists.map((artist) => (
            <AdminArtistCard
              key={artist.id}
              artist={artist}
              onToggleFeatured={handleToggleFeatured}
              onTogglePublished={handleTogglePublished}
              onDelete={(a) => setDeleteTarget({ id: a.id, name: a.name })}
            />
          ))}
        </div>
      )}

      {/* 5. Pagination Bar */}
      {!isLoading && filteredArtists.length > 0 && (
        <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredArtists.length)} to{' '}
              {Math.min(currentPage * pageSize, filteredArtists.length)} of {filteredArtists.length} artists
            </span>

            <span className="text-zinc-600">|</span>

            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-400 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-vexo-red text-white font-bold shadow-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 disabled:hover:text-zinc-400 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Styled Confirmation Modal for Artist Deletion */}
      <AdminConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Remove Artist from Roster"
        itemName={deleteTarget?.name || 'Artist'}
        message="Are you sure you want to remove this artist? This will remove their profile from the public directory, featured showcases, and un-link associated tracks."
        confirmText="Confirm & Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminArtistsPage;
