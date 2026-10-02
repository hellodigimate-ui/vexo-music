import { db } from '../db/index.js';
import type { Video } from '../db/types.js';

export interface YouTubeVideoDetails {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
}

export interface YouTubeVideoStats {
  youtubeId: string;
  title?: string;
  description?: string;
  publishedAt?: string;
  thumbnailUrl?: string;
  viewCount: number | null;
  likeCount: number | null;
  commentCount: number | null;
}

export class YouTubeApiError extends Error {
  code: 'INVALID_VIDEO_ID' | 'MISSING_API_KEY' | 'VIDEO_NOT_FOUND' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'API_ERROR';
  statusCode: number;

  constructor(
    code: 'INVALID_VIDEO_ID' | 'MISSING_API_KEY' | 'VIDEO_NOT_FOUND' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'API_ERROR',
    message: string,
    statusCode: number
  ) {
    super(message);
    this.name = 'YouTubeApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Robust YouTube Video ID extractor.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID (including extra params &t=, &feature=, etc.)
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - Raw 11-character video ID
 */
export function parseYouTubeVideoId(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common URL patterns
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Try URL object parsing
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
      const pathSegments = parsed.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        const last = pathSegments[pathSegments.length - 1];
        if (/^[a-zA-Z0-9_-]{11}$/.test(last)) {
          return last;
        }
      }
    }
  } catch {
    // Ignore URL parse error
  }

  return null;
}

/**
 * Normalizes a YouTube ID into a standard watch URL.
 */
export function buildStandardYouTubeUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

/**
 * Public HTML extraction fallback to retrieve live public YouTube video metadata
 * when YOUTUBE_API_KEY is not configured or when API quotas are exceeded.
 */
export async function fetchPublicYouTubeDetails(videoIdOrUrl: string): Promise<YouTubeVideoDetails> {
  const videoId = parseYouTubeVideoId(videoIdOrUrl);
  if (!videoId) {
    throw new YouTubeApiError(
      'INVALID_VIDEO_ID',
      'Invalid YouTube video ID or URL format. Please provide a valid watch link or 11-character video ID.',
      400
    );
  }

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let html = '';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(watchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    html = await response.text();
  } catch (err: any) {
    throw new YouTubeApiError(
      'NETWORK_ERROR',
      `Failed to connect to YouTube: ${err.message}`,
      504
    );
  }

  if (html.includes('"playabilityStatus":{"status":"ERROR"') || html.includes('This video isn\'t available anymore')) {
    throw new YouTubeApiError(
      'VIDEO_NOT_FOUND',
      `YouTube video '${videoId}' not found. The video may be private, deleted, or unlisted.`,
      404
    );
  }

  const viewsMatch = html.match(/"viewCount":\s*"(\d+)"/);
  const likesMatch =
    html.match(/"likeCount":\s*"(\d+)"/) ||
    html.match(/"label":\s*"([\d,]+)\s+likes"/i) ||
    html.match(/"defaultText":\s*\{\s*"accessibility":\s*\{\s*"accessibilityData":\s*\{\s*"label":\s*"([\d,]+)\s+likes"/i);
  const dateMatch =
    html.match(/"publishDate":\s*"([^"]+)"/) ||
    html.match(/"uploadDate":\s*"([^"]+)"/);
  const titleMatch =
    html.match(/"title":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"([^"]+)"/) ||
    html.match(/<meta\s+name="title"\s+content="([^"]+)"/i) ||
    html.match(/<title>([^<]+)<\/title>/i);
  const descMatch =
    html.match(/"shortDescription":\s*"((?:\\.|[^"\\])*)"/);
  const commentsMatch =
    html.match(/"commentCount":\s*"(\d+)"/) ||
    html.match(/"totalComments":\s*"(\d+)"/);

  const views = viewsMatch ? parseInt(viewsMatch[1], 10) : 0;
  const likes = likesMatch ? parseInt(likesMatch[1].replace(/,/g, ''), 10) : 0;
  const comments = commentsMatch ? parseInt(commentsMatch[1], 10) : 0;

  let title = titleMatch ? titleMatch[1].replace(/ - YouTube$/i, '').trim() : '';
  title = title
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  let description = '';
  if (descMatch) {
    try {
      description = JSON.parse(`"${descMatch[1]}"`);
    } catch {
      description = descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
  }

  const publishedAt = dateMatch ? dateMatch[1] : '';

  return {
    videoId,
    title: title || `YouTube Video (${videoId})`,
    description,
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    publishedAt,
    views: isNaN(views) ? 0 : views,
    likes: isNaN(likes) ? 0 : likes,
    comments: isNaN(comments) ? 0 : comments,
  };
}

/**
 * Retrieves public YouTube video details using YouTube Data API v3.
 * Endpoint: GET https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=<VIDEO_ID>&key=<process.env.YOUTUBE_API_KEY>
 * Falls back safely to public YouTube extraction if API key is not yet configured or quota is exhausted.
 * Never exposes the YOUTUBE_API_KEY in errors, logs, or responses.
 */
export async function fetchYouTubeVideoDetails(videoIdOrUrl: string): Promise<YouTubeVideoDetails> {
  const videoId = parseYouTubeVideoId(videoIdOrUrl);
  if (!videoId) {
    throw new YouTubeApiError(
      'INVALID_VIDEO_ID',
      'Invalid YouTube video ID or URL format. Please provide a valid watch link or 11-character video ID.',
      400
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    // Graceful fallback to live public extraction so the UI never displays broken/stuck states
    return fetchPublicYouTubeDetails(videoId);
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${encodeURIComponent(
    videoId
  )}&key=${encodeURIComponent(apiKey)}`;

  let response: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    response = await fetch(apiUrl, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err: any) {
    // If network fails to Google API, attempt fallback
    try {
      return await fetchPublicYouTubeDetails(videoId);
    } catch {
      if (err.name === 'AbortError') {
        throw new YouTubeApiError('NETWORK_ERROR', 'YouTube API request timed out after 12 seconds.', 504);
      }
      throw new YouTubeApiError('NETWORK_ERROR', `Network error connecting to YouTube API: ${err.message}`, 504);
    }
  }

  if (!response.ok) {
    // If API key is rejected or quota is exceeded, seamlessly fall back to public extraction
    try {
      return await fetchPublicYouTubeDetails(videoId);
    } catch {
      // If public fallback fails, report safe error
      if (response.status === 429) {
        throw new YouTubeApiError(
          'QUOTA_EXCEEDED',
          'YouTube Data API quota exceeded. Please try again later or check your API quota limits.',
          429
        );
      }
      throw new YouTubeApiError(
        'API_ERROR',
        `YouTube Data API responded with status ${response.status}.`,
        502
      );
    }
  }

  const data = (await response.json()) as any;
  const items = Array.isArray(data?.items) ? data.items : [];

  if (items.length === 0) {
    throw new YouTubeApiError(
      'VIDEO_NOT_FOUND',
      `YouTube video '${videoId}' not found. The video may be private, deleted, or unlisted.`,
      404
    );
  }

  const item = items[0];
  const snippet = item.snippet || {};
  const statistics = item.statistics || {};

  const views = statistics.viewCount ? Number(statistics.viewCount) : 0;
  const likes = statistics.likeCount ? Number(statistics.likeCount) : 0;
  const comments = statistics.commentCount ? Number(statistics.commentCount) : 0;

  const thumbs = snippet.thumbnails || {};
  const thumbnail =
    thumbs.maxres?.url ||
    thumbs.standard?.url ||
    thumbs.high?.url ||
    thumbs.medium?.url ||
    thumbs.default?.url ||
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return {
    videoId,
    title: snippet.title || '',
    description: snippet.description || '',
    thumbnail,
    publishedAt: snippet.publishedAt || '',
    views: isNaN(views) ? 0 : views,
    likes: isNaN(likes) ? 0 : likes,
    comments: isNaN(comments) ? 0 : comments,
  };
}

/**
 * Calls the official YouTube Data API v3 in batches of up to 50.
 * Can query part=statistics only (saving quota for periodic sync) or part=snippet,statistics.
 * Falls back safely to public YouTube extraction if API key is missing or quota is exhausted.
 * Never exposes the YOUTUBE_API_KEY.
 */
export async function fetchYouTubeVideoStats(
  videoIds: string[],
  includeSnippet = true
): Promise<Map<string, YouTubeVideoStats>> {
  const validIds = Array.from(new Set(videoIds.map((id) => parseYouTubeVideoId(id)).filter(Boolean))) as string[];
  const resultMap = new Map<string, YouTubeVideoStats>();

  if (validIds.length === 0) {
    return resultMap;
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  let useFallback = !apiKey;

  if (apiKey) {
    const parts = includeSnippet ? 'snippet,statistics' : 'statistics';
    const chunkSize = 50;

    for (let i = 0; i < validIds.length; i += chunkSize) {
      const chunk = validIds.slice(i, i + chunkSize);
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=${parts}&id=${encodeURIComponent(
        chunk.join(',')
      )}&key=${encodeURIComponent(apiKey)}`;

      let response: Response | null = null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        response = await fetch(apiUrl, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch {
        useFallback = true;
        break;
      }

      if (!response || !response.ok) {
        useFallback = true;
        break;
      }

      try {
        const data = (await response.json()) as any;
        const items = Array.isArray(data?.items) ? data.items : [];

        for (const item of items) {
          const id = item.id;
          if (!id) continue;

          const snippet = item.snippet || {};
          const statistics = item.statistics || {};

          const viewCountRaw = statistics.viewCount;
          const likeCountRaw = statistics.likeCount;
          const commentCountRaw = statistics.commentCount;

          const viewCount =
            viewCountRaw !== undefined && viewCountRaw !== null && !isNaN(Number(viewCountRaw))
              ? Number(viewCountRaw)
              : null;

          const likeCount =
            likeCountRaw !== undefined && likeCountRaw !== null && !isNaN(Number(likeCountRaw))
              ? Number(likeCountRaw)
              : null;

          const commentCount =
            commentCountRaw !== undefined && commentCountRaw !== null && !isNaN(Number(commentCountRaw))
              ? Number(commentCountRaw)
              : null;

          const thumbs = snippet.thumbnails || {};
          const thumbUrl =
            thumbs.maxres?.url ||
            thumbs.standard?.url ||
            thumbs.high?.url ||
            thumbs.medium?.url ||
            thumbs.default?.url ||
            `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

          resultMap.set(id, {
            youtubeId: id,
            title: snippet.title || undefined,
            description: snippet.description || undefined,
            publishedAt: snippet.publishedAt || undefined,
            thumbnailUrl: includeSnippet ? thumbUrl : undefined,
            viewCount,
            likeCount,
            commentCount,
          });
        }
      } catch {
        useFallback = true;
        break;
      }
    }
  }

  // If API key is not configured or official API failed, execute live public extraction
  if (useFallback) {
    for (const id of validIds) {
      if (!resultMap.has(id)) {
        try {
          const details = await fetchPublicYouTubeDetails(id);
          resultMap.set(id, {
            youtubeId: id,
            title: details.title,
            description: details.description,
            publishedAt: details.publishedAt,
            thumbnailUrl: details.thumbnail,
            viewCount: details.views,
            likeCount: details.likes,
            commentCount: details.comments,
          });
        } catch {
          // If video could not be fetched, skip
        }
      }
    }
  }

  return resultMap;
}

/**
 * Synchronizes YouTube metadata and statistics for a single video.
 * Preserves last known good data if the YouTube API request fails.
 */
export async function syncVideoWithYouTube(
  videoId: string
): Promise<{ success: boolean; video: Video; message: string }> {
  let existing = db.videos.findById(videoId);
  if (!existing) {
    existing = db.videos.findMany().find((v) => v.youtubeId === videoId || v.id === videoId) || null;
  }
  if (!existing) {
    throw new Error(`Video with id '${videoId}' not found.`);
  }

  const youtubeId = parseYouTubeVideoId(existing.youtubeId || existing.youtubeUrl || '');
  if (!youtubeId) {
    const updated = await db.videos.update(existing.id, {
      youtubeSyncStatus: 'FAILED',
      youtubeLastSyncedAt: new Date().toISOString(),
    });
    return {
      success: false,
      video: updated || existing,
      message: 'Video has no valid YouTube video ID or URL.',
    };
  }

  try {
    const statsMap = await fetchYouTubeVideoStats([youtubeId], true);
    const stats = statsMap.get(youtubeId);

    if (!stats) {
      // Video not returned by YouTube (could be private, deleted, or unlisted without access)
      const updated = await db.videos.update(existing.id, {
        youtubeSyncStatus: 'FAILED',
        youtubeLastSyncedAt: new Date().toISOString(),
      });
      return {
        success: false,
        video: updated || existing,
        message: `YouTube video '${youtubeId}' was not returned by YouTube API (video may be private or deleted).`,
      };
    }

    const updates: Partial<Video> = {
      youtubeId,
      youtubeUrl: buildStandardYouTubeUrl(youtubeId),
      youtubeTitle: stats.title || existing.youtubeTitle || existing.title,
      // Preserve existing if likeCount was hidden by creator on YouTube
      youtubeLikeCount: stats.likeCount !== null ? stats.likeCount : existing.youtubeLikeCount ?? null,
      youtubeViewCount: stats.viewCount !== null ? stats.viewCount : existing.youtubeViewCount ?? null,
      youtubeCommentCount: stats.commentCount !== null ? stats.commentCount : existing.youtubeCommentCount ?? null,
      youtubePublishedAt: stats.publishedAt || existing.youtubePublishedAt || existing.publishedAt,
      youtubeLastSyncedAt: new Date().toISOString(),
      youtubeSyncStatus: 'SYNCED',
    };

    // Auto-update thumbnail if existing is a placeholder
    if (
      stats.thumbnailUrl &&
      (!existing.thumbnailUrl ||
        existing.thumbnailUrl.includes('img.youtube.com') ||
        existing.thumbnailUrl.includes('placeholder'))
    ) {
      updates.thumbnailUrl = stats.thumbnailUrl;
    }

    console.log(`[YouTube Sync] Video ID: ${youtubeId}`);
    console.log(`[YouTube Sync] API returned likes: ${stats.likeCount !== null && stats.likeCount !== undefined ? stats.likeCount : 'N/A'}`);
    const updated = await db.videos.update(existing.id, updates);
    console.log(`[YouTube Sync] Database updated: ${stats.likeCount !== null && stats.likeCount !== undefined ? stats.likeCount : 'N/A'}`);

    return {
      success: true,
      video: updated || { ...existing, ...updates },
      message: 'YouTube video statistics successfully synchronized.',
    };
  } catch (err: any) {
    console.warn(`[YouTube Sync Error] Video "${existing.title}" (${existing.id}):`, err.message);

    // PRESERVE LAST KNOWN GOOD VALUES - DO NOT ZERO OUT OR OVERWRITE VALID STATS
    const updated = await db.videos.update(existing.id, {
      youtubeSyncStatus: 'FAILED',
      youtubeLastSyncedAt: new Date().toISOString(),
    });

    return {
      success: false,
      video: updated || existing,
      message: `YouTube sync failed: ${err.message}`,
    };
  }
}

/**
 * Periodically synchronizes saved YouTube videos.
 * Uses part=statistics to minimize quota consumption (respecting API quota).
 * Preserves last known good data for any failed video.
 */
export async function syncAllVideosWithYouTube(
  refreshFullSnippet = false
): Promise<{
  total: number;
  synced: number;
  failed: number;
  errors: string[];
}> {
  console.log('[YouTube Sync] Starting sync');
  const allVideos = db.videos.findMany();
  const linkedVideos: { video: Video; youtubeId: string }[] = [];

  for (const v of allVideos) {
    const yId = parseYouTubeVideoId(v.youtubeId || v.youtubeUrl || '');
    if (yId) {
      linkedVideos.push({ video: v, youtubeId: yId });
    }
  }

  if (linkedVideos.length === 0) {
    console.log('[YouTube Sync] No linked YouTube videos found to sync.');
    return { total: 0, synced: 0, failed: 0, errors: [] };
  }

  const youtubeIds = linkedVideos.map((l) => l.youtubeId);
  let statsMap: Map<string, YouTubeVideoStats>;
  const errors: string[] = [];

  try {
    // Background refresh uses statistics part only to respect YouTube quota
    statsMap = await fetchYouTubeVideoStats(youtubeIds, refreshFullSnippet);
  } catch (err: any) {
    console.warn('[YouTube Batch Sync Warning]:', err.message);
    errors.push(err.message);
    // Mark all as failed without deleting existing stats
    for (const item of linkedVideos) {
      await db.videos.update(item.video.id, {
        youtubeSyncStatus: 'FAILED',
        youtubeLastSyncedAt: new Date().toISOString(),
      });
    }
    return {
      total: linkedVideos.length,
      synced: 0,
      failed: linkedVideos.length,
      errors,
    };
  }

  let synced = 0;
  let failed = 0;

  for (const item of linkedVideos) {
    const stats = statsMap.get(item.youtubeId);
    if (!stats) {
      failed++;
      await db.videos.update(item.video.id, {
        youtubeSyncStatus: 'FAILED',
        youtubeLastSyncedAt: new Date().toISOString(),
      });
      continue;
    }

    const updates: Partial<Video> = {
      youtubeId: item.youtubeId,
      youtubeUrl: buildStandardYouTubeUrl(item.youtubeId),
      youtubeLikeCount: stats.likeCount !== null ? stats.likeCount : item.video.youtubeLikeCount ?? null,
      youtubeViewCount: stats.viewCount !== null ? stats.viewCount : item.video.youtubeViewCount ?? null,
      youtubeCommentCount: stats.commentCount !== null ? stats.commentCount : item.video.youtubeCommentCount ?? null,
      youtubeLastSyncedAt: new Date().toISOString(),
      youtubeSyncStatus: 'SYNCED',
    };

    if (stats.title && !item.video.youtubeTitle) {
      updates.youtubeTitle = stats.title;
    }
    if (stats.publishedAt && !item.video.youtubePublishedAt) {
      updates.youtubePublishedAt = stats.publishedAt;
    }
    if (
      stats.thumbnailUrl &&
      (!item.video.thumbnailUrl ||
        item.video.thumbnailUrl.includes('img.youtube.com') ||
        item.video.thumbnailUrl.includes('placeholder'))
    ) {
      updates.thumbnailUrl = stats.thumbnailUrl;
    }

    console.log(`[YouTube Sync] Video ID: ${item.youtubeId}`);
    console.log(`[YouTube Sync] API returned likes: ${stats.likeCount !== null && stats.likeCount !== undefined ? stats.likeCount : 'N/A'}`);
    await db.videos.update(item.video.id, updates);
    console.log(`[YouTube Sync] Database updated: ${stats.likeCount !== null && stats.likeCount !== undefined ? stats.likeCount : 'N/A'}`);
    synced++;
  }

  console.log(`[YouTube Sync] Finished syncing ${synced}/${linkedVideos.length} videos.`);
  return {
    total: linkedVideos.length,
    synced,
    failed,
    errors,
  };
}
