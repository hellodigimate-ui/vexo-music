import React, { useState, useEffect } from 'react';
import { PageSection } from '../components/ui/PageSection';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { videosApi } from '../lib/api';
import type { Video } from '../types';
import { Play, Eye, Clock, Film, X, Search, Flame } from 'lucide-react';
import { formatNumber } from '../lib/utils';

export const VideosPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const [latestVideos, setLatestVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    Promise.all([
      videosApi.getVideos(),
      videosApi.getFeaturedVideo(),
      videosApi.getLatestVideos(3),
    ])
      .then(([vRes, fRes, lRes]) => {
        if (!isMounted) return;
        if (vRes.data) setVideos(vRes.data);
        if (fRes.data) setFeaturedVideo(fRes.data);
        if (lRes.data) setLatestVideos(lRes.data);
      })
      .catch((err) => {
        console.warn('Error loading videos:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = ['All', 'Official Music Videos', 'Live Performances', 'Behind The Scenes', 'Visualizers'];

  // Filtered video list
  const filteredVideos = videos.filter((video) => {
    const matchesCategory = activeCategory === 'All' || video.category === activeCategory;
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pt-20 min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-white pb-24 transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      {/* 1. FEATURED VIDEO HERO SECTION */}
      <PageSection variant="bg" padding="md" className="border-b border-slate-200 dark:border-white/10">
        <Container>
          <SectionHeading
            badge="4K Visualizers & Music Videos"
            title="OFFICIAL VIDEO PRODUCTIONS"
            subtitle="Watch high-definition 4K music videos, studio recordings, live stadium performances, and audio-reactive visualizers."
          />

          {isLoading ? (
            <div className="relative mt-8 rounded-3xl overflow-hidden bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
                <div className="lg:col-span-7 aspect-video lg:aspect-auto">
                  <Skeleton className="w-full h-full min-h-[320px] rounded-none" />
                </div>
                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-9 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                  <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-9 w-32 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          ) : featuredVideo ? (
            <div className="relative mt-8 rounded-3xl overflow-hidden bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-xl group transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
                {/* Backdrop Video Thumbnail Container */}
                <div className="relative lg:col-span-7 aspect-video lg:aspect-auto overflow-hidden bg-slate-100 dark:bg-neutral-950">
                  <img
                    src={featuredVideo.thumbnailUrl}
                    alt={featuredVideo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Big Pulsing Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setSelectedVideo(featuredVideo)}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-vexo-red text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 cursor-pointer border border-white/20"
                      aria-label={`Play ${featuredVideo.title}`}
                    >
                      <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-current translate-x-0.5" />
                    </button>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-white flex items-center gap-1.5 border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-vexo-red" />
                    <span>{featuredVideo.duration}</span>
                  </div>
                </div>

                {/* Video Info Sidebar */}
                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white dark:bg-[#0c0c10] relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-50 dark:bg-vexo-red/20 text-vexo-red dark:text-vexo-red-bright border border-red-200 dark:border-vexo-red/40 flex items-center gap-1">
                        <Flame className="w-3 h-3" /> FEATURED RELEASE
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 font-bold">{featuredVideo.category}</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white leading-tight mb-2 group-hover:text-vexo-red transition-colors">
                      {featuredVideo.title}
                    </h2>
                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-4">{featuredVideo.artist}</p>

                    <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed line-clamp-3 mb-6 font-normal">
                      {featuredVideo.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-vexo-red" />
                        {formatNumber(featuredVideo.views)} views
                      </span>
                      <span>{featuredVideo.publishedAt}</span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedVideo(featuredVideo)}
                      leftIcon={<Play className="w-4 h-4 fill-current" />}
                      className="font-bold tracking-wider text-xs bg-vexo-red text-white hover:bg-red-700 rounded-xl px-5 py-2.5 shadow-sm cursor-pointer"
                    >
                      WATCH NOW
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Container>
      </PageSection>

      {/* 2. LATEST VIDEOS SECTION */}
      <PageSection padding="md">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono text-vexo-red uppercase tracking-widest block mb-1 font-bold">Fresh Off The Press</span>
              <h3 className="text-2xl font-black text-slate-950 dark:text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-vexo-red" /> LATEST VIDEO RELEASES
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 flex flex-col"
                  >
                    <Skeleton className="aspect-video w-full rounded-none" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))
              : latestVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className="group rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl hover:border-vexo-red/50 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-neutral-900">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-vexo-red text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current translate-x-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-white">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-vexo-red transition-colors line-clamp-1">
                          {video.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">{video.artist}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                        <span>{formatNumber(video.views)} views</span>
                        <span>{video.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </Container>
      </PageSection>

      {/* 3. VIDEO GRID & FILTER SECTION */}
      <PageSection padding="md" className="pt-0">
        <Container>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-vexo-red text-white border-vexo-red shadow-sm'
                      : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-white/10 hover:text-slate-950 dark:hover:text-white shadow-2xs'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none focus:border-vexo-red shadow-2xs transition-colors"
              />
            </div>
          </div>

          {/* Video Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 flex flex-col"
                >
                  <Skeleton className="aspect-video w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-3 w-1/3" />
                    <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0c0c10] rounded-3xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400 shadow-sm">
              <Film className="w-10 h-10 mx-auto text-vexo-red/60 mb-3" />
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">No videos found</p>
              <p className="text-xs">Try adjusting your search query or selecting a different category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="group rounded-2xl overflow-hidden bg-white dark:bg-[#0c0c10] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl hover:border-vexo-red/50 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-neutral-900">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-vexo-red text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-mono text-white border border-white/10">
                      {video.category}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-vexo-red" />
                      {video.duration}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-vexo-red transition-colors line-clamp-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-1">{video.artist}</p>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-white/10 text-xs font-mono text-slate-400 dark:text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-vexo-red" />
                        {formatNumber(video.views)} views
                      </span>
                      <span>{video.publishedAt}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </PageSection>

      {/* YOUTUBE VIDEO EMBED MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-neutral-950 border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-[#0A0A0A]">
              <div>
                <h3 className="text-lg font-black text-white">{selectedVideo.title}</h3>
                <p className="text-xs text-neutral-400 font-medium">{selectedVideo.artist}</p>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-vexo-red transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Responsive Iframe Container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                title={selectedVideo.title}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Modal Footer Description */}
            {selectedVideo.description && (
              <div className="p-4 sm:p-6 bg-[#0A0A0A] border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">{selectedVideo.description}</p>
                <div className="text-xs font-mono text-neutral-400 shrink-0">
                  <span>{formatNumber(selectedVideo.views)} Views</span> • <span>{selectedVideo.duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosPage;
