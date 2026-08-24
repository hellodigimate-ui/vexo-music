import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';
import {
  Play,
  Film,
  Disc,
  Radio,
  Volume2,
  Share2,
  ExternalLink,
  ThumbsUp,
  Eye,
  Calendar,
  X,
  Music2,
  VolumeX,
} from 'lucide-react';

import { homepageApi, videosApi } from '../../lib/api';

// YouTube IFrame Player type shim
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const FeaturedSingleBanner: React.FC = () => {
  // Video Details from YouTube link & synced store
  const [videoDetails, setVideoDetails] = useState({
    title: 'BHARTAR',
    artists: 'R Beer & Rashmi Nishad',
    label: 'Vexo Entertainment Pvt. Ltd.',
    youtubeId: 'PsmXAUKjR5Y',
    youtubeUrl: 'https://youtu.be/PsmXAUKjR5Y?si=WpdguDVkiQZkI0j6',
    thumbnailUrl: 'https://img.youtube.com/vi/PsmXAUKjR5Y/maxresdefault.jpg',
    fallbackThumbnail: 'https://img.youtube.com/vi/PsmXAUKjR5Y/hqdefault.jpg',
    likes: '68',
    views: '553',
    releaseDate: '24 Aug 2026',
    hashtags: ['#RajasthaniMusic', '#RashmiNishad', '#NewRajasthaniSong', '#Bhartar', '#VexoMusic'],
    descriptionHeader: '🎵 BHARTAR (Official Music Video)',
    descriptionText:
      'Ajay Sharma & Vexo Entertainment Pvt Ltd Presents "BHARTAR"\nStarring: Mohit Arora & Shivya Arora\nSinger: R Beer & Rashmi Nishad\nLyrics: R Beer | Music: GR Music | Director: R Beer\nArtwork: Poster Factory\n🔥 राजस्थानी रंग, देसी अंदाज़ और धमाकेदार बीट्स के साथ पेश है – “BHARTAR” 💗',
  });

  useEffect(() => {
    let isMounted = true;
    Promise.all([homepageApi.getHomepage(), videosApi.getVideos()]).then(([homeRes, vidRes]) => {
      if (!isMounted) return;
      const homeData = homeRes.data;
      const vids = vidRes.data || [];

      let featured = null;
      if (homeData && homeData.featuredVideoId) {
        featured = vids.find((v: any) => v.youtubeId === homeData.featuredVideoId || v.id === homeData.featuredVideoId);
      }
      if (!featured) {
        featured = vids.find((v: any) => v.youtubeId === 'PsmXAUKjR5Y') || vids.find((v: any) => v.featured) || vids[0];
      }

      if (featured) {
        setVideoDetails({
          title: featured.title,
          artists: featured.artist || 'R Beer & Rashmi Nishad',
          label: 'Vexo Entertainment Pvt. Ltd.',
          youtubeId: featured.youtubeId || 'PsmXAUKjR5Y',
          youtubeUrl: `https://youtu.be/${featured.youtubeId || 'PsmXAUKjR5Y'}`,
          thumbnailUrl: featured.thumbnailUrl || `https://img.youtube.com/vi/${featured.youtubeId || 'PsmXAUKjR5Y'}/maxresdefault.jpg`,
          fallbackThumbnail: `https://img.youtube.com/vi/${featured.youtubeId || 'PsmXAUKjR5Y'}/hqdefault.jpg`,
          likes: String(featured.likes || '68'),
          views: String(featured.views || '553'),
          releaseDate: featured.publishedAt || '24 Aug 2026',
          hashtags: featured.tags && featured.tags.length > 0 ? featured.tags : ['#RajasthaniMusic', '#RashmiNishad', '#Bhartar', '#VexoMusic'],
          descriptionHeader: `🎵 ${featured.title}`,
          descriptionText: featured.description || 'Presenting the Official Song by Vexo Entertainment Pvt. Ltd.',
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Interactive States
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [ytReady, setYtReady] = useState(false);

  // 3D Parallax Mouse Tracking State
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Hidden YouTube IFrame Player refs
  const previewPlayerRef = useRef<any>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYtReady(true);
      return;
    }

    const existingScript = document.getElementById('yt-iframe-api');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'yt-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => {
      setYtReady(true);
    };

    return () => {
      // Cleanup: don't remove the script as it may be shared
    };
  }, []);

  // Initialize hidden preview player once YT API is ready
  useEffect(() => {
    if (!ytReady || !previewContainerRef.current) return;
    if (previewPlayerRef.current) return; // Already initialized

    previewPlayerRef.current = new window.YT.Player(previewContainerRef.current, {
      height: '1',
      width: '1',
      videoId: videoDetails.youtubeId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        playsinline: 1,
      },
      events: {
        onStateChange: (event: any) => {
          // YT.PlayerState.ENDED = 0
          if (event.data === 0) {
            setIsPlayingAudio(false);
          }
        },
        onError: () => {
          setIsPlayingAudio(false);
        },
      },
    });
  }, [ytReady, videoDetails.youtubeId]);

  // Toggle real YouTube audio preview
  const toggleAudioPreview = useCallback(() => {
    const player = previewPlayerRef.current;
    if (!player) return;

    if (!isPlayingAudio) {
      try {
        player.playVideo();
        setIsPlayingAudio(true);
      } catch (e) {
        console.warn('YouTube player error:', e);
      }
    } else {
      try {
        player.pauseVideo();
        setIsPlayingAudio(false);
      } catch (e) {
        setIsPlayingAudio(false);
      }
    }
  }, [isPlayingAudio]);

  // Pause preview audio when the full-screen modal opens
  useEffect(() => {
    if (isVideoModalOpen && isPlayingAudio) {
      try {
        previewPlayerRef.current?.pauseVideo();
        setIsPlayingAudio(false);
      } catch (_) { }
    }
  }, [isVideoModalOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    setRotateY((mouseX / (rect.width / 2)) * 12);
    setRotateX(-(mouseY / (rect.height / 2)) * 12);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section className="cinematic-dark relative py-16 sm:py-24 bg-[#050505] overflow-hidden border-y border-white/10 select-none">
      {/* Hidden YouTube IFrame Audio Player */}
      <div
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none', zIndex: -1 }}
        aria-hidden="true"
      >
        <div ref={previewContainerRef} />
      </div>

      {/* Dynamic Ambient Background Lighting */}
      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none transition-colors duration-700"
        style={{
          backgroundColor: isPlayingAudio || isVideoModalOpen ? 'rgba(255, 0, 50, 0.35)' : 'rgba(224, 0, 0, 0.18)',
        }}
      />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-vexo-red-bright/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Full-Bleed Background Imagery with Dark Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src={videoDetails.thumbnailUrl}
          onError={(e) => {
            (e.target as HTMLImageElement).src = videoDetails.fallbackThumbnail;
          }}
          alt={videoDetails.title}
          className="w-full h-full object-cover opacity-25 filter contrast-125 transition-transform duration-1000 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-[#050505]/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]" />
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Video Meta & Description Details */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-start gap-6"
          >
            {/* Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-vexo-red/10 text-vexo-red border border-vexo-red/30">
                <Radio className="w-3.5 h-3.5 text-vexo-red animate-pulse" />
                FEATURED OFFICIAL BANNER / OUT NOW
              </div>
            </div>

            {/* Editorial Main Title & Creator Subtitle */}
            <div>
              <span className="block text-xs uppercase font-mono tracking-[0.25em] text-zinc-400 mb-1 flex items-center gap-2">
                <Music2 className="w-3.5 h-3.5 text-vexo-red" /> {videoDetails.artists} • {videoDetails.label}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
                {videoDetails.title.includes(' ') ? (
                  <>
                    {videoDetails.title.substring(0, videoDetails.title.lastIndexOf(' '))}{' '}
                    <span className="text-vexo-red">{videoDetails.title.substring(videoDetails.title.lastIndexOf(' ') + 1)}</span>
                  </>
                ) : (
                  <span className="text-vexo-red">{videoDetails.title}</span>
                )}
              </h2>
              <p className="text-sm font-semibold text-zinc-400 mt-1 tracking-wide">
                (Official Music Video)
              </p>
            </div>

            {/* Exact YouTube Metrics Pill Badges */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg">
              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-vexo-red/40 transition-all">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1 font-mono">
                  <ThumbsUp className="w-3.5 h-3.5 text-vexo-red" /> Likes
                </div>
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{videoDetails.likes}</span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-vexo-red/40 transition-all">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1 font-mono">
                  <Eye className="w-3.5 h-3.5 text-vexo-red" /> Views
                </div>
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{videoDetails.views}</span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-vexo-red/40 transition-all">
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-vexo-red" /> Date
                </div>
                <span className="text-sm sm:text-base font-extrabold text-white font-mono">{videoDetails.releaseDate}</span>
              </div>
            </div>

            {/* Hashtag Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {videoDetails.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:border-vexo-red/40 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Exact YouTube Description Box Panel */}
            <div className="w-full max-w-xl p-5 sm:p-6 rounded-2xl bg-[#0e0e13]/90 border border-white/10 shadow-xl space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-vexo-red" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-vexo-red animate-pulse" />
                  <h3 className="text-sm font-extrabold text-white tracking-wide">
                    Description
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10">
                  Official Details
                </span>
              </div>

              <div className="space-y-2 pt-1 border-t border-white/10">
                <p className="text-xs font-bold text-vexo-red flex items-center gap-1.5">
                  {videoDetails.descriptionHeader}
                </p>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal whitespace-pre-line">
                  {videoDetails.descriptionText}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-400 border-t border-white/5">
                <span>Vexo Entertainment Pvt. Ltd.</span>
                <a
                  href={videoDetails.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-vexo-red hover:underline font-semibold"
                >
                  See more on YouTube <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Real-time Audio Equalizer Visualizer when preview is playing */}
            {isPlayingAudio && (
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-vexo-red/10 border border-vexo-red/30 backdrop-blur-md">
                <Volume2 className="w-5 h-5 text-vexo-red-bright animate-bounce shrink-0" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider shrink-0">
                  NOW PLAYING AUDIO
                </span>
                <div className="flex items-end gap-1 h-6 ml-2">
                  {[40, 90, 60, 100, 70, 45, 85, 95, 50, 80, 65, 90].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [`${h}%`, `${100 - h}%`, `${h}%`] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.5 + (i % 4) * 0.12,
                        ease: 'easeInOut',
                      }}
                      className="w-1 rounded-full bg-vexo-red-bright"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 w-full">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsVideoModalOpen(true)}
                className="w-full sm:w-auto shadow-[0_0_30px_rgba(224,0,0,0.6)] group relative overflow-hidden font-extrabold tracking-wider justify-center"
              >
                <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                WATCH OFFICIAL VIDEO
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={toggleAudioPreview}
                className="w-full sm:w-auto border-white/20 hover:border-vexo-red/60 text-white backdrop-blur-md justify-center"
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-4 h-4 text-vexo-red-bright" />
                    STOP AUDIO
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4 text-vexo-red-bright" />
                    PREVIEW AUDIO
                  </>
                )}
              </Button>

              <button
                onClick={() => setShowShareModal(!showShareModal)}
                className="self-center sm:self-auto p-3.5 rounded-full bg-white/5 border border-white/10 hover:border-vexo-red/50 text-vexo-muted hover:text-white transition-all backdrop-blur-md shadow-lg"
                title="Share & Watch on Platforms"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Streaming Platform Popover Modal */}
            <AnimatePresence>
              {showShareModal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-black/90 border border-white/15 backdrop-blur-2xl shadow-2xl mt-2"
                >
                  <span className="text-xs font-mono font-semibold text-vexo-muted mr-1">Stream On:</span>
                  {[
                    { name: 'YouTube Video', url: videoDetails.youtubeUrl },
                    { name: 'YouTube Music', url: 'https://music.youtube.com' },
                    { name: 'Spotify', url: 'https://spotify.com' },
                    { name: 'Apple Music', url: 'https://apple.com' },
                  ].map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-vexo-red text-white transition-colors"
                    >
                      {platform.name} <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column: 3D Parallax Tilt YouTube Cover Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex justify-center perspective-1000"
          >
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              animate={{ rotateX, rotateY }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-full max-w-md aspect-video sm:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden border border-white/15 bg-neutral-900 shadow-[0_25px_60px_rgba(0,0,0,0.9)] group hover:border-vexo-red/60 transition-colors duration-500 cursor-pointer"
              onClick={() => setIsVideoModalOpen(true)}
            >
              {/* YouTube Thumbnail Artwork */}
              <img
                src={videoDetails.thumbnailUrl}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = videoDetails.fallbackThumbnail;
                }}
                alt={videoDetails.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Pulsing ring when audio is playing */}
              {isPlayingAudio && (
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    className="absolute inset-0 rounded-3xl border-2 border-vexo-red"
                    animate={{ opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              )}

              {/* Dynamic Interactive Play Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-[2px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-vexo-red to-vexo-red-bright text-white flex items-center justify-center shadow-[0_0_35px_rgba(224,0,0,0.9)] scale-90 group-hover:scale-100 transition-transform duration-300 border border-white/20">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
                <span className="mt-3 text-xs font-mono font-bold tracking-widest text-white uppercase bg-black/60 px-3 py-1 rounded-full border border-white/10">
                  PLAY YOUTUBE VIDEO
                </span>
              </div>

              {/* Glassmorphic Live Details Footer Overlay */}
              <div
                style={{ transform: 'translateZ(30px)' }}
                className="absolute inset-x-4 bottom-4 p-4 sm:p-5 rounded-2xl bg-[#050505]/90 backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-2xl"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 ${isPlayingAudio
                    ? 'bg-vexo-red border-vexo-red-bright text-white shadow-[0_0_15px_rgba(224,0,0,0.8)]'
                    : 'bg-vexo-red/20 border-vexo-red/40 text-vexo-red-bright'
                    }`}>
                    <Disc className={`w-5 h-5 ${isPlayingAudio ? 'animate-spin' : 'animate-spin-slow'}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                      {videoDetails.title}
                    </h4>
                    <p className="text-[11px] text-vexo-muted truncate">{videoDetails.artists}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-vexo-red/20 text-vexo-red-bright border border-vexo-red/30 shrink-0 ml-2">
                  {isPlayingAudio ? '▶ LIVE' : '4K OFFICIAL'}
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>

      {/* YOUTUBE EMBED PLAYER MODAL */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-neutral-950 border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-[#0A0A0A]">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">{videoDetails.title}</h3>
                  <p className="text-xs text-vexo-muted font-medium">{videoDetails.artists} • {videoDetails.label}</p>
                </div>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-vexo-muted hover:text-white hover:bg-vexo-red transition-all cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* YouTube Responsive Embed Iframe */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoDetails.youtubeId}?autoplay=1&rel=0`}
                  title={videoDetails.title}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Modal Description Footer */}
              <div className="p-4 sm:p-6 bg-[#0A0A0A] border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-xs text-vexo-red-bright font-bold mb-1">
                    {videoDetails.descriptionHeader}
                  </p>
                  <p className="text-xs text-vexo-muted leading-relaxed">
                    {videoDetails.descriptionText}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-vexo-muted shrink-0">
                  <span>{videoDetails.views} Views</span> • <span>{videoDetails.likes} Likes</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FeaturedSingleBanner;
