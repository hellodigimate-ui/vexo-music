import React, { useState, useEffect } from 'react';
import {
  Save,
  Disc3,
  Music,
  Users,
  Calendar,
  Video,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Check,
  Trash2,
  Send,
  Eye,
} from 'lucide-react';
import {
  adminHomepageApi,
  adminAlbumsApi,
  adminArtistsApi,
  adminEventsApi,
  adminVideosApi,
} from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { MediaInput } from '../components/media/MediaInput';
import { Link } from 'react-router-dom';

type TabKey =
  | 'hero'
  | 'releases'
  | 'artists'
  | 'events'
  | 'videos'
  | 'stats'
  | 'about'
  | 'finalCta';

export const AdminHomepagePage: React.FC = () => {
  const toast = useAdminToast();
  const [activeTab, setActiveTab] = useState<TabKey>('hero');

  // Available catalog data for selection pickers
  const [allAlbums, setAllAlbums] = useState<any[]>([]);
  const [allArtists, setAllArtists] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    // Hero
    heroTagline: '',
    heroHeadline: '',
    heroSubtitle: '',
    heroBgImage: '',
    heroBgMedia: '',
    featuredVideoId: '',
    heroCtaText: '',
    heroCtaUrl: '',
    heroSecondaryCtaText: '',
    heroSecondaryCtaUrl: '',
    marqueeText: '',

    // Latest Releases
    releasesHeading: 'LATEST RELEASES',
    releasesSubtitle: 'Explore the newest original tracks, singles, and full albums from VEXO Music Entertainment.',
    selectedAlbumIds: [] as string[],
    releasesLimit: 4,

    // Featured Artists
    artistsHeading: 'FEATURED ARTISTS',
    artistsSubtitle: 'Discover the visionary producers, vocalists, and composers driving our sonic movement.',
    featuredArtistIds: [] as string[],

    // Featured Events
    eventsHeading: 'FEATURED EVENTS & TOUR',
    eventsSubtitle: 'Experience the raw energy of VEXO live across premier concert halls and festival stadiums globally.',
    featuredEventIds: [] as string[],

    // Featured Videos
    videosHeading: 'OFFICIAL VIDEO PRODUCTIONS',
    videosSubtitle: 'Watch high-definition 4K music videos, studio recordings, live stadium performances, and visualizers.',
    featuredVideoIds: [] as string[],

    // Stats
    statsArtistsCount: '10+',
    statsReleasesCount: '50+',
    statsProjectsCount: '100+',
    statsTotalStreams: '1.2M+',
    statsGlobalReach: '45+ Countries',

    // About
    aboutBadge: 'ABOUT VEXO',
    aboutHeading: 'VEXO MUSIC ENTERTAINMENT PVT. LTD.',
    aboutDescription: '',
    aboutImage: '',

    // Final CTA
    finalCtaBadge: 'READY TO COLLABORATE?',
    finalCtaHeading: "LET'S CREATE SOMETHING ICONIC.",
    finalCtaDescription: '',
    finalCtaButtonLabel: 'START A PROJECT',
    finalCtaButtonUrl: '/contact',
    finalCtaSecondaryLabel: 'CONTACT VEXO',
    finalCtaSecondaryUrl: '/contact',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [homeRes, albRes, artRes, evtRes, vidRes] = await Promise.all([
        adminHomepageApi.get(),
        adminAlbumsApi.list(),
        adminArtistsApi.list(),
        adminEventsApi.list(),
        adminVideosApi.list(),
      ]);

      if (albRes.success && albRes.data) setAllAlbums(albRes.data);
      if (artRes.success && artRes.data) setAllArtists(artRes.data);
      if (evtRes.success && evtRes.data) setAllEvents(evtRes.data);
      if (vidRes.success && vidRes.data) setAllVideos(vidRes.data);

      if (homeRes.success && homeRes.data) {
        const d = homeRes.data;
        setFormData({
          heroTagline: d.heroTagline || '',
          heroHeadline: d.heroHeadline || '',
          heroSubtitle: d.heroSubtitle || '',
          heroBgImage: d.heroBgImage || d.heroBgMedia || '',
          heroBgMedia: d.heroBgMedia || d.heroBgImage || '',
          featuredVideoId: d.featuredVideoId || '',
          heroCtaText: d.heroCtaText || '',
          heroCtaUrl: d.heroCtaUrl || '',
          heroSecondaryCtaText: d.heroSecondaryCtaText || '',
          heroSecondaryCtaUrl: d.heroSecondaryCtaUrl || '',
          marqueeText: d.marqueeText || '',

          releasesHeading: d.releasesHeading || 'LATEST RELEASES',
          releasesSubtitle: d.releasesSubtitle || 'Explore the newest original tracks, singles, and full albums from VEXO Music Entertainment.',
          selectedAlbumIds: Array.isArray(d.selectedAlbumIds)
            ? d.selectedAlbumIds
            : typeof d.selectedAlbumIds === 'string'
            ? JSON.parse(d.selectedAlbumIds)
            : ['alb-1', 'alb-2', 'alb-3', 'alb-4'],
          releasesLimit: d.releasesLimit || 4,

          artistsHeading: d.artistsHeading || 'FEATURED ARTISTS',
          artistsSubtitle: d.artistsSubtitle || 'Discover the visionary producers, vocalists, and composers driving our sonic movement.',
          featuredArtistIds: Array.isArray(d.featuredArtistIds)
            ? d.featuredArtistIds
            : typeof d.featuredArtistIds === 'string'
            ? JSON.parse(d.featuredArtistIds)
            : ['art-2', 'art-rbeer', 'art-3', 'art-1'],

          eventsHeading: d.eventsHeading || 'FEATURED EVENTS & TOUR',
          eventsSubtitle: d.eventsSubtitle || 'Experience the raw energy of VEXO live across premier concert halls and festival stadiums globally.',
          featuredEventIds: Array.isArray(d.featuredEventIds)
            ? d.featuredEventIds
            : typeof d.featuredEventIds === 'string'
            ? JSON.parse(d.featuredEventIds)
            : ['evt-1', 'evt-2', 'evt-3', 'evt-4'],

          videosHeading: d.videosHeading || 'OFFICIAL VIDEO PRODUCTIONS',
          videosSubtitle: d.videosSubtitle || 'Watch high-definition 4K music videos, studio recordings, live stadium performances, and visualizers.',
          featuredVideoIds: Array.isArray(d.featuredVideoIds)
            ? d.featuredVideoIds
            : typeof d.featuredVideoIds === 'string'
            ? JSON.parse(d.featuredVideoIds)
            : ['vid-1', 'vid-2', 'vid-3', 'vid-4'],

          statsArtistsCount: d.statsArtistsCount || '10+',
          statsReleasesCount: d.statsReleasesCount || '50+',
          statsProjectsCount: d.statsProjectsCount || '100+',
          statsTotalStreams: d.statsTotalStreams || '1.2M+',
          statsGlobalReach: d.statsGlobalReach || '45+ Countries',

          aboutBadge: d.aboutBadge || 'ABOUT VEXO',
          aboutHeading: d.aboutHeading || 'VEXO MUSIC ENTERTAINMENT PVT. LTD.',
          aboutDescription: d.aboutDescription || '',
          aboutImage: d.aboutImage || '',

          finalCtaBadge: d.finalCtaBadge || 'READY TO COLLABORATE?',
          finalCtaHeading: d.finalCtaHeading || "LET'S CREATE SOMETHING ICONIC.",
          finalCtaDescription: d.finalCtaDescription || '',
          finalCtaButtonLabel: d.finalCtaButtonLabel || 'START A PROJECT',
          finalCtaButtonUrl: d.finalCtaButtonUrl || '/contact',
          finalCtaSecondaryLabel: d.finalCtaSecondaryLabel || 'CONTACT VEXO',
          finalCtaSecondaryUrl: d.finalCtaSecondaryUrl || '/contact',
        });
      }
    } catch (err: any) {
      toast.error('Failed to load homepage CMS', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        releasesLimit: Number(formData.releasesLimit) || 4,
      };
      const res = await adminHomepageApi.update(payload);
      if (res.success) {
        toast.success('Homepage CMS Saved', 'Live homepage updated immediately.');
      }
    } catch (err: any) {
      toast.error('Update failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder helper for arrays
  const moveItemInArray = (
    key: 'selectedAlbumIds' | 'featuredArtistIds' | 'featuredEventIds' | 'featuredVideoIds',
    index: number,
    direction: 'up' | 'down'
  ) => {
    const list = [...(formData[key] || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    setFormData({ ...formData, [key]: list });
  };

  const toggleItemIdInArray = (
    key: 'selectedAlbumIds' | 'featuredArtistIds' | 'featuredEventIds' | 'featuredVideoIds',
    id: string
  ) => {
    const list = [...(formData[key] || [])];
    const exists = list.includes(id);
    const updated = exists ? list.filter((item) => item !== id) : [...list, id];
    setFormData({ ...formData, [key]: updated });
  };

  const tabs: { id: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'hero', label: 'Hero Banner', icon: Disc3 },
    { id: 'releases', label: 'Latest Releases', icon: Music },
    { id: 'artists', label: 'Featured Artists', icon: Users },
    { id: 'events', label: 'Featured Events', icon: Calendar },
    { id: 'videos', label: 'Featured Videos', icon: Video },
    { id: 'stats', label: 'Live Statistics', icon: TrendingUp },
    { id: 'about', label: 'About Section', icon: Sparkles },
    { id: 'finalCta', label: 'Final CTA', icon: Send },
  ];

  if (isLoading) {
    return (
      <div className="py-28 text-center text-xs font-mono text-zinc-500 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-vexo-red border-t-transparent rounded-full animate-spin" />
        <span>LOADING HOMEPAGE CMS...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Header & Navigation Banner */}
      <div className="p-6 rounded-2xl bg-[#0e0e13] border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-vexo-red animate-pulse" />
            <h2 className="text-base font-bold text-white tracking-wide">Homepage CMS Editor</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure dynamic content across all landing sections with immediate live reflection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-vexo-red" />
            <span>View Live Site</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </Link>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-950/60 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800/80">
        {tabs.map((t) => {
          const IconComp = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-vexo-red text-white shadow-md shadow-red-950/50'
                  : 'bg-[#0e0e13] text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800/60'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. HERO TAB */}
        {activeTab === 'hero' && (
          <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
            <div className="border-b border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-vexo-red" />
                <span>Hero Visuals, Typography & Call To Actions</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Primary landing viewport displaying the headline, tagline, background media, and main CTA buttons.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">TOP TAGLINE / PILL BADGE</label>
                <input
                  type="text"
                  value={formData.heroTagline || ''}
                  onChange={(e) => setFormData({ ...formData, heroTagline: e.target.value })}
                  placeholder="Pioneering Original Soundscapes & Entertainment"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">HERO HEADING *</label>
                <input
                  type="text"
                  value={formData.heroHeadline || ''}
                  onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
                  placeholder="SONIC ARCHITECTURE FOR THE NEXT ERA"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-black"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">HERO SUBTITLE / PARAGRAPH *</label>
                <textarea
                  rows={3}
                  value={formData.heroSubtitle || ''}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  placeholder="A premier entertainment agency redefining the global sonic landscape..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Background Image / Video URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <MediaInput
                    label="HERO BACKGROUND IMAGE"
                    value={formData.heroBgImage || ''}
                    onChange={(url) => setFormData({ ...formData, heroBgImage: url, heroBgMedia: url })}
                    placeholder="https://... (or select from Media Library)"
                    allowedTypes={['image']}
                    helperText="High-res wallpaper for the main hero splash"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-zinc-300">FEATURED BACKGROUND YOUTUBE ID</label>
                  <input
                    type="text"
                    value={formData.featuredVideoId || ''}
                    onChange={(e) => setFormData({ ...formData, featuredVideoId: e.target.value })}
                    placeholder="e.g. HcEcM5AtEZ8"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                  />
                  {formData.featuredVideoId && (
                    <div className="mt-2 h-20 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                      <img
                        src={`https://img.youtube.com/vi/${formData.featuredVideoId}/mqdefault.jpg`}
                        alt="YouTube preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Call To Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                  <span className="text-[11px] font-mono font-bold text-vexo-red uppercase tracking-wider block">
                    PRIMARY CTA (BUTTON 1)
                  </span>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">LABEL</label>
                    <input
                      type="text"
                      value={formData.heroCtaText || ''}
                      onChange={(e) => setFormData({ ...formData, heroCtaText: e.target.value })}
                      placeholder="LISTEN NOW"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">DESTINATION URL</label>
                    <input
                      type="text"
                      value={formData.heroCtaUrl || ''}
                      onChange={(e) => setFormData({ ...formData, heroCtaUrl: e.target.value })}
                      placeholder="/music"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                  <span className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block">
                    SECONDARY CTA (BUTTON 2)
                  </span>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">LABEL</label>
                    <input
                      type="text"
                      value={formData.heroSecondaryCtaText || ''}
                      onChange={(e) => setFormData({ ...formData, heroSecondaryCtaText: e.target.value })}
                      placeholder="EXPLORE VEXO"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">DESTINATION URL</label>
                    <input
                      type="text"
                      value={formData.heroSecondaryCtaUrl || ''}
                      onChange={(e) => setFormData({ ...formData, heroSecondaryCtaUrl: e.target.value })}
                      placeholder="/about"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Marquee Ticker */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-mono font-medium text-zinc-300">ANNOUNCEMENT MARQUEE TICKER</label>
                <input
                  type="text"
                  value={formData.marqueeText || ''}
                  onChange={(e) => setFormData({ ...formData, marqueeText: e.target.value })}
                  placeholder="LATEST RELEASE: 'SATANE LAGE HO' — STREAMING NOW ON ALL MAJOR DSPS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. LATEST RELEASES TAB */}
        {activeTab === 'releases' && (
          <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
            <div className="border-b border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Music className="w-4 h-4 text-vexo-red" />
                <span>Latest Releases Section Management</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Select which albums/releases appear on the homepage, set their display sequence order, and choose how many items to display.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono font-medium text-zinc-300">SECTION TITLE</label>
                <input
                  type="text"
                  value={formData.releasesHeading || ''}
                  onChange={(e) => setFormData({ ...formData, releasesHeading: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">NUMBER OF ITEMS (LIMIT)</label>
                <select
                  value={formData.releasesLimit || 4}
                  onChange={(e) => setFormData({ ...formData, releasesLimit: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                >
                  <option value={2}>2 Albums</option>
                  <option value={4}>4 Albums (Default)</option>
                  <option value={6}>6 Albums</option>
                  <option value={8}>8 Albums</option>
                  <option value={12}>12 Albums</option>
                </select>
              </div>
            </div>

            {/* Selected Albums Ordered List */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold text-zinc-300 flex items-center justify-between">
                <span>FEATURED ALBUMS DISPLAY SEQUENCE ({formData.selectedAlbumIds?.length || 0} SELECTED):</span>
                <span className="text-zinc-500 text-[11px] font-normal">Use arrows to adjust order</span>
              </label>

              {formData.selectedAlbumIds && formData.selectedAlbumIds.length > 0 ? (
                <div className="space-y-2">
                  {formData.selectedAlbumIds.map((albumId: string, idx: number) => {
                    const album = allAlbums.find((a) => a.id === albumId);
                    const isFirst = idx === 0;
                    const isLast = idx === formData.selectedAlbumIds.length - 1;

                    return (
                      <div
                        key={albumId}
                        className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-zinc-800 text-vexo-red font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          {album?.coverUrl ? (
                            <img
                              src={album.coverUrl}
                              alt={album.title}
                              className="w-10 h-10 rounded-lg object-cover border border-zinc-800 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600 shrink-0 text-[10px]">
                              ALB
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-white truncate">{album?.title || albumId}</p>
                            <p className="text-[11px] text-zinc-400 truncate">{album?.artist || 'Unknown Artist'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveItemInArray('selectedAlbumIds', idx, 'up')}
                            disabled={isFirst}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItemInArray('selectedAlbumIds', idx, 'down')}
                            disabled={isLast}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleItemIdInArray('selectedAlbumIds', albumId)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer ml-1"
                            title="Remove from featured list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                  No albums selected. Check albums below to feature them on the homepage.
                </div>
              )}
            </div>

            {/* Select from catalog grid */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <label className="text-xs font-mono font-bold text-zinc-300">
                CATALOG ALBUMS (CLICK TO SELECT / DESELECT):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {allAlbums.map((album) => {
                  const isSelected = formData.selectedAlbumIds?.includes(album.id);
                  return (
                    <button
                      key={album.id}
                      type="button"
                      onClick={() => toggleItemIdInArray('selectedAlbumIds', album.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-vexo-red/10 border-vexo-red text-white shadow-md'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs truncate text-white">{album.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{album.artist}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          isSelected ? 'bg-vexo-red text-white' : 'border border-zinc-700 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. FEATURED ARTISTS TAB */}
        {activeTab === 'artists' && (
          <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
            <div className="border-b border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-vexo-red" />
                <span>Featured Artists Section Management</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Select which recording artists appear on the homepage roster spotlight and set their display order.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-zinc-300">SECTION TITLE</label>
              <input
                type="text"
                value={formData.artistsHeading || ''}
                onChange={(e) => setFormData({ ...formData, artistsHeading: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
              />
            </div>

            {/* Selected Artists Ordered List */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold text-zinc-300 flex items-center justify-between">
                <span>SPOTLIGHT ARTISTS SEQUENCE ({formData.featuredArtistIds?.length || 0} SELECTED):</span>
                <span className="text-zinc-500 text-[11px] font-normal">Use arrows to adjust order</span>
              </label>

              {formData.featuredArtistIds && formData.featuredArtistIds.length > 0 ? (
                <div className="space-y-2">
                  {formData.featuredArtistIds.map((artistId: string, idx: number) => {
                    const artist = allArtists.find((a) => a.id === artistId);
                    const isFirst = idx === 0;
                    const isLast = idx === formData.featuredArtistIds.length - 1;

                    return (
                      <div
                        key={artistId}
                        className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-zinc-800 text-vexo-red font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <img
                            src={artist?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                            alt={artist?.name}
                            className="w-10 h-10 rounded-full object-cover border border-zinc-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-white truncate">{artist?.name || artistId}</p>
                            <p className="text-[11px] text-zinc-400 truncate">{artist?.role || 'Artist'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveItemInArray('featuredArtistIds', idx, 'up')}
                            disabled={isFirst}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItemInArray('featuredArtistIds', idx, 'down')}
                            disabled={isLast}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleItemIdInArray('featuredArtistIds', artistId)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer ml-1"
                            title="Remove from featured list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                  No artists selected. Check artists below to feature them on the homepage.
                </div>
              )}
            </div>

            {/* Select from roster */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <label className="text-xs font-mono font-bold text-zinc-300">
                ROSTER ARTISTS (CLICK TO SELECT / DESELECT):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {allArtists.map((artist) => {
                  const isSelected = formData.featuredArtistIds?.includes(artist.id);
                  return (
                    <button
                      key={artist.id}
                      type="button"
                      onClick={() => toggleItemIdInArray('featuredArtistIds', artist.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-vexo-red/10 border-vexo-red text-white shadow-md'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs truncate text-white">{artist.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{artist.role}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          isSelected ? 'bg-vexo-red text-white' : 'border border-zinc-700 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. FEATURED EVENTS TAB */}
        {activeTab === 'events' && (
          <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
            <div className="border-b border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Calendar className="w-4 h-4 text-vexo-red" />
                <span>Featured Events & Tour Calendar</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Select live concert dates and world tour stops to spotlight on the homepage and set their display order.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-zinc-300">SECTION TITLE</label>
              <input
                type="text"
                value={formData.eventsHeading || ''}
                onChange={(e) => setFormData({ ...formData, eventsHeading: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
              />
            </div>

            {/* Selected Events Ordered List */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold text-zinc-300 flex items-center justify-between">
                <span>FEATURED EVENTS SEQUENCE ({formData.featuredEventIds?.length || 0} SELECTED):</span>
                <span className="text-zinc-500 text-[11px] font-normal">Use arrows to adjust order</span>
              </label>

              {formData.featuredEventIds && formData.featuredEventIds.length > 0 ? (
                <div className="space-y-2">
                  {formData.featuredEventIds.map((eventId: string, idx: number) => {
                    const event = allEvents.find((e) => e.id === eventId);
                    const isFirst = idx === 0;
                    const isLast = idx === formData.featuredEventIds.length - 1;

                    return (
                      <div
                        key={eventId}
                        className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-zinc-800 text-vexo-red font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <img
                            src={event?.imageUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=200&q=80'}
                            alt={event?.title}
                            className="w-12 h-9 rounded-lg object-cover border border-zinc-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-white truncate">{event?.title || eventId}</p>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {event?.date} • {event?.venue || event?.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveItemInArray('featuredEventIds', idx, 'up')}
                            disabled={isFirst}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItemInArray('featuredEventIds', idx, 'down')}
                            disabled={isLast}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleItemIdInArray('featuredEventIds', eventId)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer ml-1"
                            title="Remove from featured list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                  No events selected. Check events below to feature them on the homepage.
                </div>
              )}
            </div>

            {/* Select from events */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <label className="text-xs font-mono font-bold text-zinc-300">
                ALL EVENTS (CLICK TO SELECT / DESELECT):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {allEvents.map((event) => {
                  const isSelected = formData.featuredEventIds?.includes(event.id);
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => toggleItemIdInArray('featuredEventIds', event.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-vexo-red/10 border-vexo-red text-white shadow-md'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-12 h-9 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs truncate text-white">{event.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{event.date} • {event.location}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          isSelected ? 'bg-vexo-red text-white' : 'border border-zinc-700 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. FEATURED VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
            <div className="border-b border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Video className="w-4 h-4 text-vexo-red" />
                <span>Featured Videos & Visualizers Management</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Select 4K music videos and studio visualizers to spotlight on the homepage and set their display order.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-zinc-300">SECTION TITLE</label>
              <input
                type="text"
                value={formData.videosHeading || ''}
                onChange={(e) => setFormData({ ...formData, videosHeading: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
              />
            </div>

            {/* Selected Videos Ordered List */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold text-zinc-300 flex items-center justify-between">
                <span>FEATURED VIDEOS SEQUENCE ({formData.featuredVideoIds?.length || 0} SELECTED):</span>
                <span className="text-zinc-500 text-[11px] font-normal">Use arrows to adjust order</span>
              </label>

              {formData.featuredVideoIds && formData.featuredVideoIds.length > 0 ? (
                <div className="space-y-2">
                  {formData.featuredVideoIds.map((videoId: string, idx: number) => {
                    const video = allVideos.find((v) => v.id === videoId);
                    const isFirst = idx === 0;
                    const isLast = idx === formData.featuredVideoIds.length - 1;

                    return (
                      <div
                        key={videoId}
                        className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-zinc-800 text-vexo-red font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <img
                            src={video?.thumbnailUrl || `https://img.youtube.com/vi/${video?.youtubeId}/mqdefault.jpg`}
                            alt={video?.title}
                            className="w-14 h-9 rounded-lg object-cover border border-zinc-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-white truncate">{video?.title || videoId}</p>
                            <p className="text-[11px] text-zinc-400 truncate">{video?.artist || video?.category}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveItemInArray('featuredVideoIds', idx, 'up')}
                            disabled={isFirst}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItemInArray('featuredVideoIds', idx, 'down')}
                            disabled={isLast}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleItemIdInArray('featuredVideoIds', videoId)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer ml-1"
                            title="Remove from featured list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-zinc-900/50 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                  No videos selected. Check videos below to feature them on the homepage.
                </div>
              )}
            </div>

            {/* Select from videos */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <label className="text-xs font-mono font-bold text-zinc-300">
                ALL VIDEOS (CLICK TO SELECT / DESELECT):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {allVideos.map((video) => {
                  const isSelected = formData.featuredVideoIds?.includes(video.id);
                  return (
                    <button
                      key={video.id}
                      type="button"
                      onClick={() => toggleItemIdInArray('featuredVideoIds', video.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-vexo-red/10 border-vexo-red text-white shadow-md'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <img
                        src={video.thumbnailUrl || `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-14 h-9 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs truncate text-white">{video.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{video.artist} • {video.category}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          isSelected ? 'bg-vexo-red text-white' : 'border border-zinc-700 text-transparent'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 6. STATISTICS TAB */}
        {activeTab === 'stats' && (
          <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
            <div className="border-b border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-vexo-red" />
                <span>Live Platform Statistics & Counters</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Animated counters displayed in the homepage metrics strip (e.g. Artists, Releases, Projects).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <label className="text-xs font-mono font-bold text-zinc-300 block">
                  1. ARTISTS COUNT *
                </label>
                <input
                  type="text"
                  value={formData.statsArtistsCount || ''}
                  onChange={(e) => setFormData({ ...formData, statsArtistsCount: e.target.value })}
                  placeholder="10+"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:border-vexo-red focus:outline-none font-mono font-bold"
                  required
                />
                <p className="text-[11px] text-zinc-500">Displays animated counter on homepage</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <label className="text-xs font-mono font-bold text-zinc-300 block">
                  2. RELEASES COUNT *
                </label>
                <input
                  type="text"
                  value={formData.statsReleasesCount || ''}
                  onChange={(e) => setFormData({ ...formData, statsReleasesCount: e.target.value })}
                  placeholder="50+"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:border-vexo-red focus:outline-none font-mono font-bold"
                  required
                />
                <p className="text-[11px] text-zinc-500">Displays animated counter on homepage</p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <label className="text-xs font-mono font-bold text-zinc-300 block">
                  3. PROJECTS COUNT *
                </label>
                <input
                  type="text"
                  value={formData.statsProjectsCount || ''}
                  onChange={(e) => setFormData({ ...formData, statsProjectsCount: e.target.value })}
                  placeholder="100+"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:border-vexo-red focus:outline-none font-mono font-bold"
                  required
                />
                <p className="text-[11px] text-zinc-500">Displays animated counter on homepage</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">TOTAL STREAMS</label>
                <input
                  type="text"
                  value={formData.statsTotalStreams || ''}
                  onChange={(e) => setFormData({ ...formData, statsTotalStreams: e.target.value })}
                  placeholder="1.2M+"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">GLOBAL REACH</label>
                <input
                  type="text"
                  value={formData.statsGlobalReach || ''}
                  onChange={(e) => setFormData({ ...formData, statsGlobalReach: e.target.value })}
                  placeholder="45+ Countries"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. ABOUT SECTION TAB */}
        {activeTab === 'about' && (
          <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
            <div className="border-b border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-vexo-red" />
                <span>About VEXO Section Management</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Editorial overview introducing the studio, flagship facility in Jaipur, and corporate capabilities.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-zinc-300">PILL BADGE</label>
                  <input
                    type="text"
                    value={formData.aboutBadge || ''}
                    onChange={(e) => setFormData({ ...formData, aboutBadge: e.target.value })}
                    placeholder="ABOUT VEXO"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-mono font-medium text-zinc-300">HEADING *</label>
                  <input
                    type="text"
                    value={formData.aboutHeading || ''}
                    onChange={(e) => setFormData({ ...formData, aboutHeading: e.target.value })}
                    placeholder="VEXO MUSIC ENTERTAINMENT PVT. LTD."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">EDITORIAL DESCRIPTION *</label>
                <textarea
                  rows={5}
                  value={formData.aboutDescription || ''}
                  onChange={(e) => setFormData({ ...formData, aboutDescription: e.target.value })}
                  placeholder="Pioneering original soundscapes, artist management, and digital distribution for the next generation..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none resize-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <MediaInput
                  label="ABOUT SECTION PHOTO"
                  value={formData.aboutImage || ''}
                  onChange={(url) => setFormData({ ...formData, aboutImage: url })}
                  placeholder="https://... (or select from Media Library)"
                  allowedTypes={['image']}
                  helperText="Primary studio / corporate imagery displayed in the About VEXO section"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* 8. FINAL CTA TAB */}
        {activeTab === 'finalCta' && (
          <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 space-y-6">
            <div className="border-b border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Send className="w-4 h-4 text-vexo-red" />
                <span>Final Call-To-Action Banner</span>
              </h3>
              <p className="text-xs text-zinc-500">
                The high-impact closing section inspiring visionary artists and brands to initiate commercial bookings.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-zinc-300">BADGE</label>
                  <input
                    type="text"
                    value={formData.finalCtaBadge || ''}
                    onChange={(e) => setFormData({ ...formData, finalCtaBadge: e.target.value })}
                    placeholder="READY TO COLLABORATE?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-mono font-medium text-zinc-300">HEADING *</label>
                  <input
                    type="text"
                    value={formData.finalCtaHeading || ''}
                    onChange={(e) => setFormData({ ...formData, finalCtaHeading: e.target.value })}
                    placeholder="LET'S CREATE SOMETHING ICONIC."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-black"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={formData.finalCtaDescription || ''}
                  onChange={(e) => setFormData({ ...formData, finalCtaDescription: e.target.value })}
                  placeholder="Ready to bring your sonic or visual project to life? Collaborate with our team..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Button settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                  <span className="text-[11px] font-mono font-bold text-vexo-red uppercase tracking-wider block">
                    PRIMARY ACTION BUTTON
                  </span>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">BUTTON LABEL *</label>
                    <input
                      type="text"
                      value={formData.finalCtaButtonLabel || ''}
                      onChange={(e) => setFormData({ ...formData, finalCtaButtonLabel: e.target.value })}
                      placeholder="START A PROJECT"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">BUTTON URL *</label>
                    <input
                      type="text"
                      value={formData.finalCtaButtonUrl || ''}
                      onChange={(e) => setFormData({ ...formData, finalCtaButtonUrl: e.target.value })}
                      placeholder="/contact"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                  <span className="text-[11px] font-mono font-bold text-zinc-300 uppercase tracking-wider block">
                    SECONDARY BUTTON
                  </span>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">BUTTON LABEL</label>
                    <input
                      type="text"
                      value={formData.finalCtaSecondaryLabel || ''}
                      onChange={(e) => setFormData({ ...formData, finalCtaSecondaryLabel: e.target.value })}
                      placeholder="CONTACT VEXO"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">BUTTON URL</label>
                    <input
                      type="text"
                      value={formData.finalCtaSecondaryUrl || ''}
                      onChange={(e) => setFormData({ ...formData, finalCtaSecondaryUrl: e.target.value })}
                      placeholder="/contact"
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Bottom Save Bar */}
        <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-[#0e0e13]/95 backdrop-blur-md border border-zinc-800/90 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Changes will apply directly to public homepage</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchInitialData}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Discard Changes
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-950/60 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Homepage...' : 'Save Homepage Configuration'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminHomepagePage;
