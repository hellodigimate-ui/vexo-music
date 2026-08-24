import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Music,
  Disc3,
  Image,
  Clock,
  Radio,
  Check,
} from 'lucide-react';
import { MediaInput } from '../media/MediaInput';

export interface TrackFormData {
  id?: string;
  title: string;
  artistName: string;
  artistId: string;
  albumId: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  spotifyUrl: string;
  spotifyTrackId: string;
  youtubeUrl: string;
  genre: string;
  order: number;
  published: boolean;
  isPopular: boolean;
}

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (track: TrackFormData) => Promise<void>;
  initialData?: TrackFormData | null;
  albums: Array<{ id: string; title: string; artistName: string; coverUrl: string; genre: string }>;
  artists: Array<{ id: string; name: string }>;
  defaultAlbumId?: string;
  nextTrackNumber?: number;
}

export const TrackModal: React.FC<TrackModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  albums,
  artists,
  defaultAlbumId,
  nextTrackNumber = 1,
}) => {
  const [formData, setFormData] = useState<TrackFormData>({
    title: '',
    artistName: '',
    artistId: '',
    albumId: defaultAlbumId || '',
    duration: 210,
    coverUrl: '',
    audioUrl: '',
    spotifyUrl: '',
    spotifyTrackId: '',
    youtubeUrl: '',
    genre: 'Electronic',
    order: nextTrackNumber,
    published: true,
    isPopular: false,
  });

  const [durationInput, setDurationInput] = useState('3:30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync initialData or defaults
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      const mins = Math.floor((initialData.duration || 0) / 60);
      const secs = (initialData.duration || 0) % 60;
      setDurationInput(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    } else {
      const selectedAlbum = albums.find((a) => a.id === defaultAlbumId);
      setFormData({
        title: '',
        artistName: selectedAlbum?.artistName || artists[0]?.name || 'VEXO Artist',
        artistId: artists.find((art) => art.name === selectedAlbum?.artistName)?.id || artists[0]?.id || '',
        albumId: defaultAlbumId || albums[0]?.id || '',
        duration: 210,
        coverUrl: selectedAlbum?.coverUrl || '',
        audioUrl: '',
        spotifyUrl: '',
        spotifyTrackId: '',
        youtubeUrl: '',
        genre: selectedAlbum?.genre || 'Electronic',
        order: nextTrackNumber,
        published: true,
        isPopular: false,
      });
      setDurationInput('3:30');
    }
    setError('');
  }, [initialData, defaultAlbumId, nextTrackNumber, isOpen]);

  // When album changes, auto-populate cover and artist if empty
  const handleAlbumChange = (albumId: string) => {
    const album = albums.find((a) => a.id === albumId);
    setFormData((prev) => ({
      ...prev,
      albumId,
      coverUrl: prev.coverUrl || album?.coverUrl || '',
      artistName: prev.artistName || album?.artistName || '',
      genre: prev.genre || album?.genre || 'Electronic',
    }));
  };

  // Convert mm:ss or number to seconds
  const parseDuration = (str: string): number => {
    if (str.includes(':')) {
      const parts = str.split(':');
      const m = parseInt(parts[0], 10) || 0;
      const s = parseInt(parts[1], 10) || 0;
      return m * 60 + s;
    }
    return parseInt(str, 10) || 180;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Track Title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const calculatedDuration = parseDuration(durationInput);
      await onSave({
        ...formData,
        duration: calculatedDuration,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save track.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0e0e13] border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
              <Disc3 className="w-5 h-5 animate-[spin_8s_linear_infinite]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                {initialData?.id ? 'Edit Track' : 'Add Track to Album'}
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {formData.albumId
                  ? `Target: ${albums.find((a) => a.id === formData.albumId)?.title || 'Selected Album'}`
                  : 'Assign track metadata and audio streaming'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          {/* Section 1: Core Track Identity */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800/60 flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-vexo-red-bright" /> Core Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Title */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-zinc-300">
                  Track Title <span className="text-vexo-red">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Satane Lage Ho (Official Single)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-vexo-red/50"
                  required
                />
              </div>

              {/* Track Number / Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-zinc-300">
                  Track # / Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
                  }}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setFormData({ ...formData, order: isNaN(val) ? 1 : Math.max(1, val) });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-white focus:outline-none focus:border-vexo-red/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Parent Album */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-zinc-300">
                  Belongs to Album <span className="text-vexo-red">*</span>
                </label>
                <select
                  value={formData.albumId}
                  onChange={(e) => handleAlbumChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-vexo-red/50"
                >
                  <option value="">-- Standalone / Unassigned --</option>
                  {albums.map((alb) => (
                    <option key={alb.id} value={alb.id}>
                      {alb.title} ({alb.artistName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Artist Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-zinc-300">
                  Artist Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rashmi Nishad & Sonu Charan Bhatt"
                  value={formData.artistName}
                  onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-vexo-red/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center justify-between">
                  <span>Duration (mm:ss)</span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {parseDuration(durationInput)}s
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="3:45"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-white focus:outline-none focus:border-vexo-red/50"
                />
              </div>

              {/* Genre */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-zinc-300">
                  Genre
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajasthani Folk / Electronic"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-vexo-red/50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Media & Artwork */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800/60 flex items-center gap-2">
              <Image className="w-3.5 h-3.5 text-vexo-red-bright" /> Artwork & Audio Streams
            </h4>

            {/* Cover Image */}
            <div>
              <MediaInput
                label="TRACK ARTWORK IMAGE"
                value={formData.coverUrl}
                onChange={(url) => setFormData({ ...formData, coverUrl: url })}
                placeholder="https://... (or select from Media Library)"
                allowedTypes={['image']}
                helperText="Optional: inherits album cover artwork if left empty"
              />
            </div>

            {/* Audio Preview */}
            <div>
              <MediaInput
                label="AUDIO PREVIEW STREAM"
                value={formData.audioUrl}
                onChange={(url) => setFormData({ ...formData, audioUrl: url })}
                placeholder="https://... (.mp3 / .wav audio preview file)"
                allowedTypes={['audio']}
                helperText="Select or upload an audio preview master file"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Spotify URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-zinc-300">
                  Spotify URL
                </label>
                <input
                  type="url"
                  placeholder="https://open.spotify.com/track/..."
                  value={formData.spotifyUrl}
                  onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-vexo-red/50"
                />
              </div>

              {/* Spotify Track ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-zinc-300">
                  Spotify Track ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4cOdK2wGLETKBW3PvgPWqT"
                  value={formData.spotifyTrackId}
                  onChange={(e) => setFormData({ ...formData, spotifyTrackId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-vexo-red/50"
                />
              </div>
            </div>

            {/* YouTube URL / Video ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-zinc-300">
                YouTube URL or Video ID
              </label>
              <input
                type="text"
                placeholder="https://youtu.be/HcEcM5AtEZ8 or HcEcM5AtEZ8"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-vexo-red/50"
              />
            </div>
          </div>

          {/* Section 3: Publishing & Visibility */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800/60 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-vexo-red-bright" /> Visibility & Controls
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Published Toggle Button */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white">Publish Status</p>
                  <p className="text-[11px] text-zinc-500">Live in album tracklist</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, published: !formData.published })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    formData.published
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {formData.published ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  <span>{formData.published ? 'Published' : 'Draft'}</span>
                </button>
              </div>

              {/* Popular Flag */}
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-white">Featured Single</p>
                  <p className="text-[11px] text-zinc-500">Highlight in catalog</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isPopular: !formData.isPopular })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    formData.isPopular
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  <Disc3 className={`w-3.5 h-3.5 ${formData.isPopular ? 'text-amber-400' : ''}`} />
                  <span>{formData.isPopular ? 'Featured' : 'Standard'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-vexo-red hover:bg-vexo-red-bright text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(224,0,0,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : initialData?.id ? 'Update Track' : 'Save Track'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackModal;
