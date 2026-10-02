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
  RefreshCw,
  Eye,
  ThumbsUp,
  MessageSquare,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
} from 'lucide-react';
import { MediaInput } from '../media/MediaInput';
import { adminVideosApi } from '../../services/adminApiClient';

export interface VideoFormData {
  id?: string;
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
  youtubeTitle?: string | null;
  youtubeViewCount?: number | null;
  youtubeLikeCount?: number | null;
  youtubeCommentCount?: number | null;
  youtubePublishedAt?: string | null;
  youtubeLastSyncedAt?: string | null;
  youtubeSyncStatus?: 'SYNCED' | 'FAILED' | 'PENDING' | string | null;
}

interface VideoFormProps {
  initialData?: Partial<VideoFormData>;
  allArtists: Array<{ id: string; name: string }>;
  onSubmit: (data: VideoFormData) => Promise<void>;
  isEditing?: boolean;
}

function formatMetricsCount(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return val.toLocaleString();
}

function formatPublishedDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'Never';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    }
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return 'Recently';
  }
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
    youtubeTitle: null,
    youtubeViewCount: null,
    youtubeLikeCount: null,
    youtubeCommentCount: null,
    youtubePublishedAt: null,
    youtubeLastSyncedAt: null,
    youtubeSyncStatus: 'PENDING',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFetchingYouTube, setIsFetchingYouTube] = useState(false);
  const [youtubeFetchError, setYoutubeFetchError] = useState<string | null>(null);
  const [youtubePreviewData, setYoutubePreviewData] = useState<{
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    views: number;
    likes: number;
    comments: number;
  } | null>(null);

  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    timestamp?: string;
  } | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        youtubeUrl:
          initialData.youtubeUrl ||
          (initialData.youtubeId ? `https://youtube.com/watch?v=${initialData.youtubeId}` : ''),
        thumbnailUrl:
          initialData.thumbnailUrl ||
          (initialData.youtubeId ? `https://img.youtube.com/vi/${initialData.youtubeId}/maxresdefault.jpg` : ''),
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : initialData.tags || '',
        published: initialData.published !== false,
      }));
    }
  }, [initialData]);

  // YouTube Video ID Extractor function
  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const cleanUrl = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      return cleanUrl;
    }
    const match = cleanUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  // Automatically retrieve public YouTube video information via backend endpoint
  const handleFetchYouTubeDetails = async (urlOrId?: string) => {
    const rawInput = urlOrId || formData.youtubeUrl || formData.youtubeId;
    const extractedId = extractYoutubeId(rawInput);

    if (!extractedId) {
      setYoutubeFetchError('Please enter a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...) or 11-char video ID.');
      return;
    }

    try {
      setIsFetchingYouTube(true);
      setYoutubeFetchError(null);
      const res = await adminVideosApi.getYoutubeVideoDetails(extractedId);

      if (res && res.success && res.data) {
        const d = res.data;
        setYoutubePreviewData(d);

        setFormData((prev) => ({
          ...prev,
          title: prev.title.trim() ? prev.title : d.title,
          description: prev.description.trim() ? prev.description : d.description,
          thumbnailUrl: d.thumbnail || prev.thumbnailUrl,
          youtubeId: d.videoId,
          youtubeUrl: `https://www.youtube.com/watch?v=${d.videoId}`,
          youtubeTitle: d.title,
          youtubeViewCount: d.views,
          youtubeLikeCount: d.likes,
          youtubeCommentCount: d.comments,
          youtubePublishedAt: d.publishedAt,
          youtubeLastSyncedAt: new Date().toISOString(),
          youtubeSyncStatus: 'SYNCED',
        }));

        setSyncFeedback({
          type: 'success',
          message: `YouTube info retrieved! Title, thumbnail, views (${formatMetricsCount(d.views)}), likes (${formatMetricsCount(d.likes)}), and comments (${formatMetricsCount(d.comments)}) loaded.`,
          timestamp: new Date().toISOString(),
        });
      } else {
        setYoutubeFetchError(res?.message || 'Failed to retrieve YouTube details.');
      }
    } catch (err: any) {
      setYoutubeFetchError(err.message || 'Error connecting to YouTube Data API.');
    } finally {
      setIsFetchingYouTube(false);
    }
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
        thumbnailUrl:
          prev.thumbnailUrl && !prev.thumbnailUrl.includes('img.youtube.com')
            ? prev.thumbnailUrl
            : autoThumb,
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
      thumbnailUrl:
        prev.thumbnailUrl && !prev.thumbnailUrl.includes('img.youtube.com')
          ? prev.thumbnailUrl
          : autoThumb,
    }));
  };

  // Force YouTube Sync Now
  const handleSyncNow = async () => {
    const targetId = initialData?.id || formData.id;
    if (!targetId) {
      if (formData.youtubeId || formData.youtubeUrl) {
        await handleFetchYouTubeDetails();
      } else {
        setSyncFeedback({
          type: 'error',
          message: 'Please provide a YouTube URL or save the video first to establish the database record.',
        });
      }
      return;
    }

    try {
      setIsSyncing(true);
      setSyncFeedback(null);
      const res = await adminVideosApi.syncYouTube(targetId);

      if (res && res.success && res.data) {
        const synced = res.data;
        setFormData((prev) => ({
          ...prev,
          title: prev.title || synced.title,
          youtubeTitle: synced.youtubeTitle,
          youtubeViewCount: synced.youtubeViewCount,
          youtubeLikeCount: synced.youtubeLikeCount,
          youtubeCommentCount: synced.youtubeCommentCount,
          youtubePublishedAt: synced.youtubePublishedAt,
          youtubeLastSyncedAt: synced.youtubeLastSyncedAt || new Date().toISOString(),
          youtubeSyncStatus: synced.youtubeSyncStatus || 'SYNCED',
          thumbnailUrl: prev.thumbnailUrl || synced.thumbnailUrl,
        }));
        setSyncFeedback({
          type: 'success',
          message: 'Sync successful! Latest views, likes, and published date fetched from YouTube.',
          timestamp: new Date().toISOString(),
        });
      } else {
        setSyncFeedback({
          type: 'error',
          message: res?.message || 'YouTube sync failed. Existing statistics were preserved safely.',
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: err.message || 'Network failure while calling backend YouTube synchronization endpoint.',
      });
    } finally {
      setIsSyncing(false);
    }
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
    const extractedId = extractYoutubeId(formData.youtubeUrl || formData.youtubeId);
    if (!extractedId) {
      setError('A valid YouTube Video URL or 11-character Video ID is required.');
      return;
    }
    if (formData.order < 0) {
      setError('Display Order cannot be negative.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        ...formData,
        youtubeId: extractedId,
        youtubeUrl: formData.youtubeUrl || `https://youtube.com/watch?v=${extractedId}`,
      });
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
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. YouTube Source & Auto-Sync Section */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              YouTube Stream & Automatic Statistics Sync
            </h2>
            <p className="text-xs text-zinc-400">
              Provide the YouTube video URL. Views, likes, and published date will automatically synchronize from YouTube to PostgreSQL.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* YouTube Full URL with Retrieve Action */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-vexo-red-bright" />
                <span>YouTube Video URL or Video ID</span>
                <span className="text-vexo-red">*</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                Paste YouTube URL & Click Retrieve
              </span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                value={formData.youtubeUrl}
                onChange={handleYoutubeUrlChange}
                placeholder="e.g. https://www.youtube.com/watch?v=7GJy_1S0-c0 or https://youtu.be/7GJy_1S0-c0"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => handleFetchYouTubeDetails()}
                disabled={isFetchingYouTube || (!formData.youtubeUrl && !formData.youtubeId)}
                className="px-4 py-2.5 rounded-xl bg-vexo-red text-white text-xs font-mono font-bold hover:bg-vexo-red-bright transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 shadow-lg"
              >
                {isFetchingYouTube ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Retrieving...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Retrieve YouTube Info</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Supports standard YouTube URLs, short URLs (youtu.be), Shorts, embed links, and direct 11-char IDs.
            </p>
          </div>

          {/* YouTube API Loading State */}
          {isFetchingYouTube && (
            <div className="sm:col-span-2 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-vexo-red-bright animate-spin shrink-0" />
              <div className="text-xs font-mono">
                <p className="text-white font-bold">Querying YouTube Data API v3...</p>
                <p className="text-zinc-400">Retrieving video title, description, thumbnail, views, likes, and comments.</p>
              </div>
            </div>
          )}

          {/* YouTube API Error State */}
          {youtubeFetchError && (
            <div className="sm:col-span-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs font-mono space-y-1">
                <p className="text-rose-400 font-bold">YouTube API Error</p>
                <p className="text-rose-300/80">{youtubeFetchError}</p>
              </div>
            </div>
          )}

          {/* YouTube Retrieved Public Information Card */}
          {(youtubePreviewData || formData.youtubeTitle || formData.youtubeViewCount !== null) && (
            <div className="sm:col-span-2 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  YouTube Information Retrieved
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  ID: {formData.youtubeId || youtubePreviewData?.videoId}
                </span>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start">
                {/* YouTube Thumbnail */}
                <div className="relative aspect-video w-full md:w-56 rounded-xl overflow-hidden bg-black border border-zinc-800 shrink-0">
                  <img
                    src={youtubePreviewData?.thumbnail || formData.thumbnailUrl || `https://img.youtube.com/vi/${formData.youtubeId}/hqdefault.jpg`}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white border border-white/10">
                    YouTube
                  </div>
                </div>

                {/* Video Info Details */}
                <div className="flex-1 space-y-2 min-w-0">
                  <h3 className="text-sm font-bold text-white line-clamp-2">
                    {youtubePreviewData?.title || formData.youtubeTitle || formData.title}
                  </h3>

                  {/* Public Stats: Views, Likes, Comments, Published date */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                    <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                        <Eye className="w-3 h-3 text-vexo-red-bright" /> Views
                      </span>
                      <span className="font-bold text-white">
                        {formatMetricsCount(youtubePreviewData?.views ?? formData.youtubeViewCount)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-vexo-red-bright" /> Likes
                      </span>
                      <span className="font-bold text-white">
                        {formatMetricsCount(youtubePreviewData?.likes ?? formData.youtubeLikeCount)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-vexo-red-bright" /> Comments
                      </span>
                      <span className="font-bold text-white">
                        {formatMetricsCount(youtubePreviewData?.comments ?? formData.youtubeCommentCount)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-vexo-red-bright" /> Published
                      </span>
                      <span className="font-bold text-white truncate block">
                        {formatPublishedDate(youtubePreviewData?.publishedAt ?? formData.youtubePublishedAt)}
                      </span>
                    </div>
                  </div>

                  {(youtubePreviewData?.description || formData.description) && (
                    <p className="text-[11px] text-zinc-400 line-clamp-2 pt-1 font-mono">
                      {youtubePreviewData?.description || formData.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* YouTube Video ID (Normalized Read-Only / Helper) */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center justify-between">
              <span>Normalized Video ID</span>
              <span className="text-[10px] text-zinc-500 font-mono">Auto-extracted</span>
            </label>
            <input
              type="text"
              value={formData.youtubeId}
              onChange={handleYoutubeIdChange}
              placeholder="e.g. 7GJy_1S0-c0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono font-bold text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
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
          {/* YouTube Video Title notice */}
          {formData.youtubeTitle && (
            <div className="pt-2 text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 border-t border-zinc-800/40">
              <span className="text-zinc-500">YouTube Video Title:</span>
              <span className="text-white font-semibold truncate">{formData.youtubeTitle}</span>
            </div>
          )}
        </div>

        {/* Dedicated YouTube Synchronization & Statistics Dashboard Panel */}
        <div className="p-5 rounded-2xl bg-[#09090d] border border-zinc-800/90 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
                YouTube Sync Status:
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                  formData.youtubeSyncStatus === 'SYNCED'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : formData.youtubeSyncStatus === 'FAILED'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    formData.youtubeSyncStatus === 'SYNCED'
                      ? 'bg-emerald-400 animate-pulse'
                      : formData.youtubeSyncStatus === 'FAILED'
                      ? 'bg-rose-400'
                      : 'bg-amber-400'
                  }`}
                />
                {formData.youtubeSyncStatus === 'SYNCED'
                  ? 'Synced'
                  : formData.youtubeSyncStatus === 'FAILED'
                  ? 'Sync Failed'
                  : 'Pending Sync'}
              </span>
            </div>

            {/* Sync Now Action */}
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={isSyncing || isFetchingYouTube}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-vexo-red/20 text-vexo-red-bright border border-vexo-red/40 hover:bg-vexo-red hover:text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || isFetchingYouTube ? 'animate-spin' : ''}`} />
              <span>{isSyncing || isFetchingYouTube ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          {/* Sync Feedback Message */}
          {syncFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
                syncFeedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}
            >
              {syncFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="font-mono">{syncFeedback.message}</span>
            </div>
          )}

          {/* Read-Only YouTube Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Views */}
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                <Eye className="w-3.5 h-3.5 text-vexo-red-bright" />
                <span>Views</span>
              </div>
              <span className="text-base sm:text-lg font-black font-mono text-white tracking-tight">
                {formatMetricsCount(formData.youtubeViewCount)}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                YouTube
              </span>
            </div>

            {/* Likes */}
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                <ThumbsUp className="w-3.5 h-3.5 text-vexo-red-bright" />
                <span>Likes</span>
              </div>
              <span className="text-base sm:text-lg font-black font-mono text-white tracking-tight">
                {formatMetricsCount(formData.youtubeLikeCount)}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                YouTube
              </span>
            </div>

            {/* Comments */}
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-vexo-red-bright" />
                <span>Comments</span>
              </div>
              <span className="text-base sm:text-lg font-black font-mono text-white tracking-tight">
                {formatMetricsCount(formData.youtubeCommentCount)}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                YouTube
              </span>
            </div>

            {/* Published Date */}
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                <Calendar className="w-3.5 h-3.5 text-vexo-red-bright" />
                <span>Published</span>
              </div>
              <span className="text-xs sm:text-sm font-bold font-mono text-white truncate block">
                {formatPublishedDate(formData.youtubePublishedAt)}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                YouTube
              </span>
            </div>

            {/* Last Synced */}
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono mb-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Last Synced</span>
              </div>
              <span className="text-xs sm:text-sm font-bold font-mono text-zinc-300 truncate block">
                {formatRelativeTime(formData.youtubeLastSyncedAt)}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">
                Database
              </span>
            </div>
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

      {/* 2. Video Details & Artist Section (NO MANUAL VIEWS / LIKES INPUT) */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Video Metadata & Artist Credit
            </h2>
            <p className="text-xs text-zinc-400">
              Title, performer credits, runtime duration, and custom thumbnail poster.
            </p>
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
              placeholder="e.g. AYA SAJAN (Official Music Video)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          {/* Artist Credit */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center justify-between">
              <span>
                Artist Credit <span className="text-vexo-red">*</span>
              </span>
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

          {/* Custom Thumbnail URL */}
          <div className="sm:col-span-2">
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
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Editorial Synopsis & Tags
            </h2>
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
              <p className="text-[11px] text-zinc-500">Visible to public audiences</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, published: !formData.published })}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                formData.published
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {formData.published ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              <span>{formData.published ? 'Published' : 'Draft'}</span>
            </button>
          </div>

          {/* Display Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Display Sequence Order
            </label>
            <input
              type="number"
              min="0"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Form Bottom Actions Bar */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
        <button
          type="button"
          onClick={() => navigate('/admin/videos')}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-bold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-vexo-red to-vexo-red-bright hover:from-vexo-red-bright hover:to-vexo-red text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(224,0,0,0.4)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Video' : 'Save & Link Video'}</span>
        </button>
      </div>
    </form>
  );
};

export default VideoForm;
