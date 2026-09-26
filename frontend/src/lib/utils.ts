import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_BASE_URL } from './api/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

const BACKEND_HOST = API_BASE_URL.replace(/\/api\/?$/, '');

export function getMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return `${BACKEND_HOST}${url}`;
  }
  if (url.startsWith('uploads/')) {
    return `${BACKEND_HOST}/${url}`;
  }
  return url;
}

export function isTrackRepresentedInAlbums(
  track: {
    id?: string;
    title?: string;
    albumId?: string | null;
    album?: string | null;
    youtubeUrl?: string | null;
    audioUrl?: string | null;
    coverUrl?: string | null;
  },
  albums: {
    id?: string;
    title?: string;
    youtubeUrl?: string | null;
    coverUrl?: string | null;
    trackCount?: number;
  }[]
): boolean {
  if (!albums || albums.length === 0) return false;

  const extractYtId = (url?: string | null) => {
    if (!url) return '';
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return m ? m[1] : '';
  };

  const clean = (s?: string) =>
    (s || '')
      .toLowerCase()
      .replace(/\(official\s*(single|video|audio|music\s*video)?\)/gi, '')
      .replace(/\[official\s*(single|video|audio|music\s*video)?\]/gi, '')
      .replace(/\(single\)/gi, '')
      .replace(/\(video\)/gi, '')
      .replace(/[^a-z0-9]/gi, '')
      .trim();

  const trackYt = extractYtId(track.youtubeUrl || track.audioUrl || track.coverUrl);
  const trackCleanTitle = clean(track.title);

  return albums.some((album) => {
    // 1. Exact YouTube video ID match
    const albumYt = extractYtId(album.youtubeUrl || album.coverUrl);
    if (trackYt && albumYt && trackYt === albumYt) {
      return true;
    }

    // 2. Normalized Title match
    const albumCleanTitle = clean(album.title);
    if (trackCleanTitle && albumCleanTitle) {
      if (trackCleanTitle === albumCleanTitle) return true;
      if (trackCleanTitle.startsWith(albumCleanTitle) || albumCleanTitle.startsWith(trackCleanTitle)) {
        return true;
      }
    }

    // 3. Album ID match for single-track releases
    if ((track.albumId === album.id || track.album === album.id) && (album.trackCount === 1 || !album.trackCount)) {
      return true;
    }

    return false;
  });
}

