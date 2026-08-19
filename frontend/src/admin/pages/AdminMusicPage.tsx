import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import {
  Disc3,
  Music,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  Layers,
  ChevronRight,
  Headphones,
  Check,
} from 'lucide-react';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
import { adminAlbumsApi, adminTracksApi, adminArtistsApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { Modal } from '../components/Modal';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { TrackModal, type TrackFormData } from '../components/tracks/TrackModal';
import { MediaInput } from '../components/media/MediaInput';
import { formatTime } from '../../lib/utils';

export const AdminMusicPage: React.FC = () => {
  const toast = useAdminToast();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'albums' | 'tracks'>(
    searchParams.get('tab') === 'tracks' ? 'tracks' : 'albums'
  );
  const [albums, setAlbums] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Album for Dedicated Detail View
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(
    params.id || searchParams.get('albumId') || null
  );

  // Styled Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'album' | 'track';
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Album Modal State
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<any | null>(null);
  const [albumFormData, setAlbumFormData] = useState({
    title: '',
    artistName: '',
    artistId: '',
    coverUrl: '',
    releaseDate: '',
    year: new Date().getFullYear(),
    genre: '',
    spotifyUrl: '',
    youtubeUrl: '',
    appleMusicUrl: '',
    featured: false,
  });

  // Track Modal State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<TrackFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [albumsRes, tracksRes, artistsRes] = await Promise.all([
        adminAlbumsApi.list(),
        adminTracksApi.list(),
        adminArtistsApi.list(),
      ]);

      if (albumsRes.success) setAlbums(albumsRes.data);
      if (tracksRes.success) setTracks(tracksRes.data);
      if (artistsRes.success) setArtists(artistsRes.data);
    } catch (err: any) {
      toast.error('Failed to fetch music records', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync query param changes
  useEffect(() => {
    const qAlbumId = searchParams.get('albumId');
    if (qAlbumId !== selectedAlbumId) {
      setSelectedAlbumId(qAlbumId);
    }
  }, [searchParams]);

  const selectAlbum = (id: string | null) => {
    setSelectedAlbumId(id);
    if (id) {
      setSearchParams({ albumId: id });
    } else {
      setSearchParams({});
    }
  };

  // Album Handlers
  const openCreateAlbum = () => {
    setEditingAlbum(null);
    setAlbumFormData({
      title: '',
      artistName: artists[0]?.name || '',
      artistId: artists[0]?.id || '',
      coverUrl: '',
      releaseDate: new Date().toISOString().split('T')[0],
      year: new Date().getFullYear(),
      genre: 'Electronic / Synthwave',
      spotifyUrl: '',
      youtubeUrl: '',
      appleMusicUrl: '',
      featured: false,
    });
    setIsAlbumModalOpen(true);
  };

  const openEditAlbum = (album: any) => {
    setEditingAlbum(album);
    setAlbumFormData({
      title: album.title,
      artistName: album.artistName,
      artistId: album.artistId || '',
      coverUrl: album.coverUrl,
      releaseDate: album.releaseDate,
      year: album.year,
      genre: album.genre,
      spotifyUrl: album.spotifyUrl || '',
      youtubeUrl: album.youtubeUrl || '',
      appleMusicUrl: album.appleMusicUrl || '',
      featured: Boolean(album.featured),
    });
    setIsAlbumModalOpen(true);
  };

  const handleAlbumSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingAlbum) {
        await adminAlbumsApi.update(editingAlbum.id, albumFormData);
        toast.success('Album updated', `"${albumFormData.title}" has been updated.`);
      } else {
        await adminAlbumsApi.create(albumFormData);
        toast.success('Album created', `"${albumFormData.title}" added to label catalog.`);
      }
      setIsAlbumModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Album operation failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Track Handlers
  const openCreateTrack = () => {
    setEditingTrack(null);
    setIsTrackModalOpen(true);
  };

  const openEditTrack = (track: any) => {
    setEditingTrack({
      id: track.id,
      title: track.title,
      artistName: track.artistName,
      artistId: track.artistId || '',
      albumId: track.albumId || '',
      duration: track.duration || 210,
      coverUrl: track.coverUrl || '',
      audioUrl: track.audioUrl || '',
      spotifyUrl: track.spotifyUrl || '',
      spotifyTrackId: track.spotifyTrackId || '',
      youtubeUrl: track.youtubeUrl || '',
      genre: track.genre || 'Electronic',
      order: track.order || 1,
      published: track.published !== false,
      isPopular: Boolean(track.isPopular),
    });
    setIsTrackModalOpen(true);
  };

  const handleSaveTrack = async (formData: TrackFormData) => {
    try {
      if (formData.id) {
        await adminTracksApi.update(formData.id, formData);
        toast.success('Track updated', `"${formData.title}" has been updated.`);
      } else {
        await adminTracksApi.create(formData);
        toast.success('Track released', `"${formData.title}" published to catalog.`);
      }
      setIsTrackModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Track operation failed', err.message);
      throw err;
    }
  };

  const handleToggleTrackPublish = async (track: any) => {
    const newStatus = track.published === false ? true : false;
    try {
      await adminTracksApi.update(track.id, { published: newStatus });
      setTracks((prev) =>
        prev.map((t) => (t.id === track.id ? { ...t, published: newStatus } : t))
      );
      toast.success(
        newStatus ? 'Track Published' : 'Track Set to Draft',
        `"${track.title}" visibility updated.`
      );
    } catch (err: any) {
      toast.error('Failed to update status', err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'album') {
        await adminAlbumsApi.delete(deleteTarget.id);
        toast.success('Album Expelled', `Album "${deleteTarget.title}" was permanently removed.`);
      } else {
        await adminTracksApi.delete(deleteTarget.id);
        toast.success('Track Expelled', `Track "${deleteTarget.title}" was removed.`);
      }
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered queries
  const filteredAlbums = albums.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.artistName.toLowerCase().includes(q) ||
      (a.genre && a.genre.toLowerCase().includes(q))
    );
  });

  const filteredTracks = tracks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artistName.toLowerCase().includes(q) ||
      (t.genre && t.genre.toLowerCase().includes(q))
    );
  });

  // If a specific album is selected, render the dedicated AlbumDetailView
  if (selectedAlbumId) {
    return (
      <AlbumDetailView
        albumId={selectedAlbumId}
        onBack={() => selectAlbum(null)}
        onEditAlbum={openEditAlbum}
        artists={artists}
        albumsList={albums}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar: Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-[#0e0e13] border border-zinc-800 w-fit">
          <button
            onClick={() => setActiveTab('albums')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'albums'
                ? 'bg-vexo-red text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Disc3 className="w-4 h-4" />
            <span>Albums & EPs ({albums.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'tracks'
                ? 'bg-vexo-red text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Tracks Directory ({tracks.length})</span>
          </button>
        </div>

        {/* Right side search & create */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="pl-10 pr-4 py-2 rounded-xl bg-[#0e0e13] border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none"
            />
          </div>

          {activeTab === 'albums' ? (
            <button
              onClick={openCreateAlbum}
              className="px-4 py-2.5 rounded-xl bg-vexo-red hover:bg-vexo-red-bright text-xs font-semibold text-white shadow-[0_0_20px_rgba(224,0,0,0.35)] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Album</span>
            </button>
          ) : (
            <button
              onClick={() => openCreateTrack()}
              className="px-4 py-2.5 rounded-xl bg-vexo-red hover:bg-vexo-red-bright text-xs font-semibold text-white shadow-[0_0_20px_rgba(224,0,0,0.35)] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Track</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'albums' ? (
        <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="py-20 text-center text-xs font-mono text-zinc-500 animate-pulse">
              LOADING DISCOGRAPHY...
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div className="py-20 text-center text-xs text-zinc-500">No albums found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121218] border-b border-zinc-800/80 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  <tr>
                    <th className="py-3.5 px-6">Release Title</th>
                    <th className="py-3.5 px-6">Primary Artist</th>
                    <th className="py-3.5 px-6">Genre & Year</th>
                    <th className="py-3.5 px-6">Album Tracklist</th>
                    <th className="py-3.5 px-6">Streaming DSPs</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredAlbums.map((album) => {
                    const albumTracksCount = tracks.filter((t) => t.albumId === album.id).length;
                    return (
                      <tr key={album.id} className="hover:bg-zinc-900/40 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-700/80 shrink-0">
                              {album.coverUrl ? (
                                <img
                                  src={album.coverUrl}
                                  alt={album.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                  <Disc3 className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <button
                                onClick={() => selectAlbum(album.id)}
                                className="font-bold text-white text-xs hover:text-vexo-red-bright transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>{album.title}</span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-vexo-red-bright" />
                              </button>
                              <p className="text-[10px] font-mono text-zinc-500">
                                Released: {album.releaseDate || album.year || '2026'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-semibold text-zinc-200">{album.artistName}</td>

                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300">
                            {album.genre} &bull; {album.year}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <button
                            onClick={() => selectAlbum(album.id)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-vexo-red/40 hover:bg-vexo-red/10 text-xs font-mono text-zinc-300 hover:text-vexo-red-bright transition-all cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5 text-vexo-red-bright" />
                            <span>
                              {albumTracksCount} {albumTracksCount === 1 ? 'Track' : 'Tracks'}
                            </span>
                            <span className="text-[10px] text-zinc-500">→ Manage</span>
                          </button>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {album.spotifyUrl && (
                              <a
                                href={album.spotifyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-900 transition-colors"
                              >
                                <Headphones className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {album.youtubeUrl && (
                              <a
                                href={album.youtubeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400 hover:bg-red-900 transition-colors"
                              >
                                <YoutubeIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => selectAlbum(album.id)}
                              title="Manage Tracks in Album"
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Music className="w-3 h-3 text-vexo-red-bright" />
                              <span>Tracks</span>
                            </button>
                            <button
                              onClick={() => openEditAlbum(album)}
                              title="Edit Album"
                              className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({ type: 'album', id: album.id, title: album.title })
                              }
                              title="Delete Album"
                              className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Tracks Tab */
        <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="py-20 text-center text-xs font-mono text-zinc-500 animate-pulse">
              LOADING TRACKS...
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="py-20 text-center text-xs text-zinc-500">No tracks found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121218] border-b border-zinc-800/80 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  <tr>
                    <th className="py-3.5 px-6">Track # / Title</th>
                    <th className="py-3.5 px-6">Album</th>
                    <th className="py-3.5 px-6">Artist</th>
                    <th className="py-3.5 px-6">Duration</th>
                    <th className="py-3.5 px-6">Visibility</th>
                    <th className="py-3.5 px-6">DSP Links</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredTracks.map((track) => {
                    const parentAlbum = albums.find((a) => a.id === track.albumId);
                    const isPublished = track.published !== false;

                    return (
                      <tr key={track.id} className="hover:bg-zinc-900/40 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono font-bold text-zinc-400 text-xs shrink-0">
                              {String(track.order || 1).padStart(2, '0')}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs flex items-center gap-2">
                                {track.title}
                                {track.isPopular && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-[9px] font-mono text-amber-400">
                                    POPULAR
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] font-mono text-zinc-500">ID: {track.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          {parentAlbum ? (
                            <button
                              onClick={() => selectAlbum(parentAlbum.id)}
                              className="font-medium text-zinc-300 hover:text-vexo-red-bright transition-colors text-left"
                            >
                              {parentAlbum.title}
                            </button>
                          ) : (
                            <span className="text-zinc-500 font-mono text-[11px]">
                              Single / Unassigned
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 font-semibold text-zinc-200">{track.artistName}</td>

                        <td className="py-4 px-6 font-mono text-zinc-400">
                          {formatTime(track.duration || 210)}
                        </td>

                        <td className="py-4 px-6">
                          <button
                            type="button"
                            onClick={() => handleToggleTrackPublish(track)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isPublished
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {isPublished ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span>{isPublished ? 'Published' : 'Draft'}</span>
                          </button>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5">
                            {track.spotifyUrl && (
                              <a
                                href={track.spotifyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 hover:bg-emerald-900"
                              >
                                <Headphones className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {track.youtubeUrl && (
                              <a
                                href={
                                  track.youtubeUrl.startsWith('http')
                                    ? track.youtubeUrl
                                    : `https://youtu.be/${track.youtubeUrl}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400 hover:bg-red-900"
                              >
                                <YoutubeIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditTrack(track)}
                              className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({ type: 'track', id: track.id, title: track.title })
                              }
                              title="Delete Track"
                              className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Album Modal */}
      <Modal
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        title={editingAlbum ? 'Edit Album' : 'Create New Album'}
      >
        <form onSubmit={handleAlbumSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1">Album Title *</label>
            <input
              type="text"
              required
              value={albumFormData.title}
              onChange={(e) => setAlbumFormData({ ...albumFormData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:border-vexo-red focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Artist Name *</label>
              <input
                type="text"
                required
                value={albumFormData.artistName}
                onChange={(e) => setAlbumFormData({ ...albumFormData, artistName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:border-vexo-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Genre *</label>
              <input
                type="text"
                required
                value={albumFormData.genre}
                onChange={(e) => setAlbumFormData({ ...albumFormData, genre: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:border-vexo-red focus:outline-none"
              />
            </div>
          </div>

          <div>
            <MediaInput
              label="ALBUM COVER ARTWORK"
              value={albumFormData.coverUrl}
              onChange={(url) => setAlbumFormData({ ...albumFormData, coverUrl: url })}
              placeholder="https://... (or select from Media Library)"
              allowedTypes={['image']}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Release Date</label>
              <input
                type="date"
                value={albumFormData.releaseDate}
                onChange={(e) => setAlbumFormData({ ...albumFormData, releaseDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:border-vexo-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1">Year</label>
              <input
                type="number"
                min="1900"
                value={albumFormData.year}
                onKeyDown={(e) => {
                  if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                }}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setAlbumFormData({
                    ...albumFormData,
                    year: isNaN(val) ? 2026 : Math.max(1900, val),
                  });
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:border-vexo-red focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsAlbumModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-vexo-red hover:bg-vexo-red-bright text-xs font-semibold text-white shadow-lg shadow-red-950/60 transition-colors"
            >
              {isSubmitting ? 'Saving...' : editingAlbum ? 'Update Album' : 'Create Album'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Track Creator / Editor Modal */}
      <TrackModal
        isOpen={isTrackModalOpen}
        onClose={() => {
          setIsTrackModalOpen(false);
          setEditingTrack(null);
        }}
        onSave={handleSaveTrack}
        initialData={editingTrack}
        albums={albums}
        artists={artists}
        defaultAlbumId={albums[0]?.id}
        nextTrackNumber={tracks.length + 1}
      />

      {/* Music-Themed Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'album' ? 'EXPEL ALBUM FROM ROSTER' : 'EXPEL TRACK'}
        itemName={deleteTarget?.title}
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmText="EXPEL NOW"
        cancelText="CANCEL"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminMusicPage;
