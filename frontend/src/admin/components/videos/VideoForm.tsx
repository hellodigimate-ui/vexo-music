import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video,
  Play,
  Save,
  ArrowLeft,
  Star,
  Check,
  Clock,
  Layers,
  Link,
  Film,
  Tag,
} from 'lucide-react';
import { MediaInput } from '../media/MediaInput';

export interface VideoFormData {
  title: string;
  artist: string;
  youtubeId: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  publishedAt: string;
  category: string;
  featured: boolean;
  published: boolean;
  description: string;
  tags: string;
  order: number;
}

interface VideoFormProps {
  initialData?: Partial<VideoFormData>;
  allArtists: Array<{ id: string; name: string }>;
  onSubmit: (data: VideoFormData) => Promise<void>;
  isEditing?: boolean;
}

export const VideoForm: React.FC<VideoFormProps> = ({
  initialData,
  allArtists,
  onSubmit,
  isEditing = false,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    artist: allArtists[0]?.name || '',
    youtubeId: '',
    youtubeUrl: '',
    thumbnailUrl: '',
    duration: '04:00',
    views: 0,
    publishedAt: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    category: 'Official Music Videos',
    featured: false,
    published: true,
    description: '',
    tags: '',
    order: 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        youtubeUrl: initialData.youtubeUrl || (initialData.youtubeId ? `https://youtube.com/watch?v=${initialData.youtubeId}` : ''),
        thumbnailUrl: initialData.thumbnailUrl || (initialData.youtubeId ? `https://img.youtube.com/vi/${initialData.youtubeId}/maxresdefault.jpg` : ''),
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
        published: initialData.published !== false,
      }));
    }
  }, [initialData]);

  // YouTube Video ID Extractor function
  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const cleanUrl = url.trim();
    if (/^[\w-]{11}$/.test(cleanUrl)) {
      return cleanUrl;
    }
    const match = cleanUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    return match ? match[1] : null;
  };

  // Handle YouTube URL Input
  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    const extractedId = extractYoutubeId(inputUrl);

    if (extractedId) {
      const autoThumb = `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`;
      setFormData((prev) => ({
        ...prev,
        youtubeUrl: inputUrl,
        youtubeId: extractedId,
        thumbnailUrl: prev.thumbnailUrl && !prev.thumbnailUrl.includes('img.youtube.com') ? prev.thumbnailUrl : autoThumb,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        youtubeUrl: inputUrl,
      }));
    }
  };

  // Handle Raw Video ID input
  const handleYoutubeIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    const autoThumb = val ? `https://img.youtube.com/vi/${val}/maxresdefault.jpg` : '';
    setFormData((prev) => ({
      ...prev,
      youtubeId: val,
      youtubeUrl: val ? `https://youtube.com/watch?v=${val}` : prev.youtubeUrl,
      thumbnailUrl: prev.thumbnailUrl && !prev.thumbnailUrl.includes('img.youtube.com') ? prev.thumbnailUrl : autoThumb,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Video Title is required.');
      return;
    }
    if (!formData.artist.trim()) {
      setError('Artist Credit is required.');
      return;
    }
    if (!formData.youtubeId.trim()) {
      setError('YouTube Video ID is required. Please paste a valid YouTube URL or Video ID.');
      return;
    }
    if (formData.views < 0) {
      setError('Total Views cannot be negative.');
      return;
    }
    if (formData.order < 0) {
      setError('Display Order cannot be negative.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the video.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn pb-16 max-w-5xl mx-auto">
      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. YouTube Source & Extraction Section */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">YouTube Stream & Video Source</h2>
            <p className="text-xs text-zinc-400">Paste any YouTube URL or Video ID to auto-sync thumbnails and embed players.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* YouTube Full URL */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-vexo-red-bright" />
              <span>YouTube Video URL</span>
            </label>
            <input
              type="text"
              value={formData.youtubeUrl}
              onChange={handleYoutubeUrlChange}
              placeholder="e.g. https://www.youtube.com/watch?v=HcEcM5AtEZ8 or https://youtu.be/HcEcM5AtEZ8"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
            <p className="text-[11px] text-zinc-500 font-mono">
              Auto-extracts the 11-character video ID and sets up high-definition thumbnail.
            </p>
          </div>

          {/* YouTube Video ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Extracted Video ID <span className="text-vexo-red">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.youtubeId}
              onChange={handleYoutubeIdChange}
              placeholder="e.g. HcEcM5AtEZ8"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Video Category <span className="text-vexo-red">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-vexo-red/50 transition-colors cursor-pointer"
            >
              <option value="Official Music Videos">Official Music Videos</option>
              <option value="Live Performances">Live Performances</option>
              <option value="Behind The Scenes">Behind The Scenes</option>
              <option value="Visualizers">Visualizers</option>
            </select>
          </div>
        </div>

        {/* Live Video Preview Box */}
        {formData.youtubeId && (
          <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-vexo-red-bright" />
                Live Video Preview
              </span>
              <span className="text-[10px] font-mono text-zinc-500">ID: {formData.youtubeId}</span>
            </div>

            <div className="relative aspect-video w-full max-w-lg rounded-xl overflow-hidden border border-zinc-800 shadow-2xl mx-auto">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${formData.youtubeId}`}
                title="YouTube Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Video Details & Artist Section */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Video Metadata & Artist Credit</h2>
            <p className="text-xs text-zinc-400">Title, performer credits, runtime, and view counters.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Video Title <span className="text-vexo-red">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Satane Lage Ho (Official Music Video)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          {/* Artist Credit */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center justify-between">
              <span>Artist Credit <span className="text-vexo-red">*</span></span>
              <span className="text-[10px] text-zinc-500 font-mono">Quick select:</span>
            </label>
            <input
              type="text"
              required
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              placeholder="e.g. Rashmi Nishad & Sonu Charan Bhatt"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
            {/* Quick Artist Select Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {allArtists.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, artist: a.name })}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-colors"
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Duration (MM:SS)
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="04:14"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          {/* Views Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Total Views
            </label>
            <input
              type="number"
              min="0"
              value={formData.views}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
              }}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setFormData({
                  ...formData,
                  views: isNaN(val) ? 0 : Math.max(0, val),
                });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          {/* Custom Thumbnail URL */}
          <div>
            <MediaInput
              label="CUSTOM VIDEO THUMBNAIL POSTER"
              value={formData.thumbnailUrl}
              onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
              placeholder="https://... (or select custom poster from Media Library)"
              allowedTypes={['image']}
              helperText="Optional override: auto-generated from YouTube if left empty"
            />
          </div>
        </div>
      </div>

      {/* 3. Description & Searchable Tags */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Editorial Synopsis & Tags</h2>
            <p className="text-xs text-zinc-400">Song production credits, director notes, and search tags.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Tags (Comma-Separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="#RashmiNishad, #LatestSong, #RajasthaniFolk, #VEXOExclusive"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Video Description & Production Credits
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Produced by VEXO Music. Music composition, vocals, and visual choreography credits..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors custom-scrollbar"
            />
          </div>
        </div>
      </div>

      {/* 4. Publishing Controls */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Publishing Controls</h2>
            <p className="text-xs text-zinc-400">Featured hero showcase and live catalogue visibility.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Featured Hero Button */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">Featured Hero</p>
              <p className="text-[11px] text-zinc-500">Spotlight header on videos page</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, featured: !formData.featured })}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                formData.featured
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${formData.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{formData.featured ? 'Featured' : 'Standard'}</span>
            </button>
          </div>

          {/* Published Button */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">Published Status</p>
              <p className="text-[11px] text-zinc-500">{formData.published ? 'Live on website' : 'Draft / Hidden'}</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, published: !formData.published })}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                formData.published
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/30'
              }`}
            >
              {formData.published ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              <span>{formData.published ? 'Published' : 'Draft'}</span>
            </button>
          </div>

          {/* Display Order */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <label className="text-xs font-bold text-white">Display Order</label>
            <input
              type="number"
              min="0"
              value={formData.order}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
              }}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setFormData({
                  ...formData,
                  order: isNaN(val) ? 0 : Math.max(0, val),
                });
              }}
              className="w-full px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => navigate('/admin/videos')}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-7 py-3 rounded-xl bg-vexo-red hover:bg-vexo-red-bright text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(224,0,0,0.5)] transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving Video...' : isEditing ? 'Update Video' : 'Publish Video'}</span>
        </button>
      </div>
    </form>
  );
};

export default VideoForm;
