import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Disc3,
  Calendar,
  Layers,
  Clock,
  Edit2,
  ExternalLink,
  Headphones,
} from 'lucide-react';
import { TrackList, type TrackItem } from '../tracks/TrackList';
import { TrackModal, type TrackFormData } from '../tracks/TrackModal';
import { AdminConfirmModal } from '../AdminConfirmModal';
import { adminTracksApi, adminAlbumsApi } from '../../services/adminApiClient';
import { useAdminToast } from '../../context/AdminToastContext';
import { formatTime } from '../../../lib/utils';

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

interface AlbumDetailViewProps {
  albumId: string;
  onBack: () => void;
  onEditAlbum: (album: any) => void;
  artists: Array<{ id: string; name: string }>;
  albumsList: any[];
}

export const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({
  albumId,
  onBack,
  onEditAlbum,
  artists,
  albumsList,
}) => {
  const toast = useAdminToast();
  const [album, setAlbum] = useState<any | null>(null);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track Modal State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<TrackFormData | null>(null);

  // Delete Track Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<TrackItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAlbumData = useCallback(async () => {
    try {
      setIsLoading(true);
      const albumRes = await adminAlbumsApi.getById(albumId);
      if (albumRes.success && albumRes.data) {
        setAlbum(albumRes.data);
      }

      const tracksRes = await adminTracksApi.listByAlbum(albumId);
      if (tracksRes.success && Array.isArray(tracksRes.data)) {
        setTracks(tracksRes.data);
      }
    } catch (err: any) {
      toast.error('Failed to load album details', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [albumId, toast]);

  useEffect(() => {
    fetchAlbumData();
  }, [fetchAlbumData]);

  // Track Creation / Update
  const handleSaveTrack = async (formData: TrackFormData) => {
    try {
      if (formData.id) {
        const res = await adminTracksApi.update(formData.id, formData);
        if (res.success) {
          toast.success('Track Updated', `"${formData.title}" updated successfully.`);
        }
      } else {
        const res = await adminTracksApi.create({
          ...formData,
          albumId,
        });
        if (res.success) {
          toast.success('Track Added', `"${formData.title}" added to album tracklist.`);
        }
      }
      fetchAlbumData();
    } catch (err: any) {
      toast.error('Track Save Failed', err.message);
      throw err;
    }
  };

  // Reorder Up
  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    const reordered = [...tracks];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;

    // Update order numbers
    reordered.forEach((t, i) => {
      t.order = i + 1;
    });

    setTracks(reordered);
    const trackIds = reordered.map((t) => t.id);
    await adminTracksApi.reorder(albumId, trackIds);
    toast.info('Tracklist Reordered', 'Track sequence updated.');
  };

  // Reorder Down
  const handleMoveDown = async (index: number) => {
    if (index >= tracks.length - 1) return;
    const reordered = [...tracks];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;

    // Update order numbers
    reordered.forEach((t, i) => {
      t.order = i + 1;
    });

    setTracks(reordered);
    const trackIds = reordered.map((t) => t.id);
    await adminTracksApi.reorder(albumId, trackIds);
    toast.info('Tracklist Reordered', 'Track sequence updated.');
  };

  // Toggle Published
  const handleTogglePublish = async (track: TrackItem) => {
    const newStatus = track.published === false ? true : false;
    try {
      const res = await adminTracksApi.update(track.id, { published: newStatus });
      if (res.success) {
        setTracks((prev) =>
          prev.map((t) => (t.id === track.id ? { ...t, published: newStatus } : t))
        );
        toast.success(
          newStatus ? 'Track Published' : 'Track Set to Draft',
          `"${track.title}" is now ${newStatus ? 'live in public album tracklist' : 'hidden from public view'}.`
        );
      }
    } catch (err: any) {
      toast.error('Failed to update status', err.message);
    }
  };

  // Delete Track
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await adminTracksApi.delete(deleteTarget.id);
      if (res.success) {
        toast.success('Track Expelled', `"${deleteTarget.title}" deleted from album.`);
        setDeleteTarget(null);
        fetchAlbumData();
      }
    } catch (err: any) {
      toast.error('Deletion Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalRuntimeSeconds = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  if (isLoading && !album) {
    return (
      <div className="p-12 text-center text-zinc-500 font-mono text-xs animate-pulse">
        Loading album dossier...
      </div>
    );
  }

  if (!album) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-bold text-white">Album not found</p>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
        >
          Return to Discography
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Back Button Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Albums</span>
        </button>

        <button
          onClick={() => onEditAlbum(album)}
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
          <span>Edit Album Metadata</span>
        </button>
      </div>

      {/* Album Hero Dossier */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-vexo-red/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8 relative z-10">
          {/* Cover Art */}
          <div className="relative group shrink-0">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-600 gap-2">
                  <Disc3 className="w-10 h-10" />
                  <span className="text-[10px] font-mono uppercase">VEXO Release</span>
                </div>
              )}
            </div>
            {album.featured && (
              <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase bg-vexo-red text-white shadow-lg">
                Featured
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-vexo-red-bright px-3 py-1 rounded-full bg-vexo-red/10 border border-vexo-red/20">
                {album.genre || 'Original Soundtrack'}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                ID: {album.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight truncate drop-shadow-md">
              {album.title}
            </h1>

            <p className="text-sm font-semibold text-zinc-300">
              By <span className="text-white font-bold">{album.artistName}</span>
            </p>

            {/* Meta Tags Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400 pt-2">
              <div className="flex items-center gap-1.5 bg-zinc-950/60 px-3 py-1 rounded-lg border border-zinc-800/60">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{album.year || new Date(album.releaseDate || '').getFullYear() || 2026}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-950/60 px-3 py-1 rounded-lg border border-zinc-800/60">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                <span>{tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}</span>
              </div>
              {totalRuntimeSeconds > 0 && (
                <div className="flex items-center gap-1.5 bg-zinc-950/60 px-3 py-1 rounded-lg border border-zinc-800/60">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{formatTime(totalRuntimeSeconds)} Runtime</span>
                </div>
              )}
            </div>

            {/* External Links */}
            <div className="flex items-center gap-2 pt-2">
              {album.spotifyUrl && (
                <a
                  href={album.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Spotify</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
              {album.youtubeUrl && (
                <a
                  href={album.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-vexo-red-bright text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-red-500/20 transition-colors"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TRACKS MANAGEMENT SECTION */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <TrackList
          tracks={tracks}
          albumTitle={album.title}
          onAddTrack={() => {
            setEditingTrack(null);
            setIsTrackModalOpen(true);
          }}
          onEditTrack={(track) => {
            setEditingTrack({
              id: track.id,
              title: track.title,
              artistName: track.artistName,
              artistId: artists.find((a) => a.name === track.artistName)?.id || '',
              albumId: album.id,
              duration: track.duration,
              coverUrl: track.coverUrl || album.coverUrl || '',
              audioUrl: track.audioUrl || '',
              spotifyUrl: track.spotifyUrl || '',
              spotifyTrackId: track.spotifyTrackId || '',
              youtubeUrl: track.youtubeUrl || '',
              genre: track.genre || album.genre || 'Electronic',
              order: track.order,
              published: track.published !== false,
              isPopular: Boolean(track.isPopular),
            });
            setIsTrackModalOpen(true);
          }}
          onDeleteTrack={(track) => setDeleteTarget(track)}
          onTogglePublish={handleTogglePublish}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      </div>

      {/* Track Creator / Editor Modal */}
      <TrackModal
        isOpen={isTrackModalOpen}
        onClose={() => {
          setIsTrackModalOpen(false);
          setEditingTrack(null);
        }}
        onSave={handleSaveTrack}
        initialData={editingTrack}
        albums={albumsList}
        artists={artists}
        defaultAlbumId={album.id}
        nextTrackNumber={tracks.length + 1}
      />

      {/* Music-Themed Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={!!deleteTarget}
        title="EXPEL TRACK FROM ALBUM"
        itemName={deleteTarget?.title}
        message={`Are you sure you want to permanently remove track "${deleteTarget?.title}" from "${album.title}"?`}
        confirmText="EXPEL TRACK"
        cancelText="CANCEL"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AlbumDetailView;
