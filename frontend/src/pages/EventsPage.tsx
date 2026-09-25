import React, { useState, useEffect } from 'react';
import { PageSection } from '../components/ui/PageSection';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { eventsApi } from '../lib/api';
import type { Event } from '../types';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ArrowUpRight, Flame, Music } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    eventsApi
      .getEvents()
      .then((res) => {
        if (isMounted && res.data) setEvents(res.data);
      })
      .catch((err) => {
        console.warn('Error loading events:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const eventDescriptions: Record<string, string> = {
    'e-1': 'The flagship audio-visual world tour. Featuring 32-channel spatial audio, 3D laser projection arrays, and unreleased synthwave tracks from the upcoming album.',
    'e-2': 'An all-night dark electro odyssey inside Tokyo Dome. Custom acoustic stage geometry with real-time visual synth synthesis and guest producer sets.',
    'e-3': 'VEXO Entertainment homecoming stadium concert in Jaipur. Blending Indian classical instrumentalists with modular synthesizer walls and fireworks display.',
    'e-4': 'An intimate vocal and analog synth recital showcasing Aria Thorne’s critically acclaimed Nocturne project live at The O2 Arena.',
  };

  return (
    <div className="pt-20 min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-white pb-24 transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      {/* 1. HERO HEADER SECTION */}
      <div className="relative pt-16 pb-20 border-b border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#07070a] transition-colors duration-300">
        {/* Ambient Red Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-vexo-red/5 dark:bg-vexo-red/10 rounded-full blur-[140px] pointer-events-none" />

        <Container size="md" className="relative z-10 text-center max-w-4xl mx-auto px-4">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-red-50 dark:bg-vexo-red/10 text-vexo-red border border-red-200 dark:border-vexo-red/30 mb-6">
            <Music className="w-3.5 h-3.5 text-vexo-red" /> WORLD TOUR 2026 / LIVE SHOWS
          </div>

          {/* BOLD DISPLAY TITLE */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-5 leading-none select-none">
            LIVE <span className="text-vexo-red">EXPERIENCE</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-300 font-normal leading-relaxed max-w-2xl mx-auto tracking-wide mb-8">
            Experience the raw energy of VEXO's premier artists. Secure your access to the most exclusive cinematic music events globally.
          </p>

          {/* Live Quick Metrics Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-6 py-2.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-neutral-300 shadow-2xs">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-vexo-red" />
              <strong className="text-slate-900 dark:text-white">4 GLOBAL DATES</strong>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-white/20">•</span>
            <span className="flex items-center gap-2">
              <strong className="text-slate-900 dark:text-white">150K+ AUDIENCE</strong>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-white/20">•</span>
            <span className="flex items-center gap-2">
              <strong className="text-slate-900 dark:text-white">32-CH SPATIAL AUDIO</strong>
            </span>
          </div>
        </Container>
      </div>

      {/* 2. ALTERNATING TOUR & EVENTS EDITORIAL LIST */}
      <PageSection padding="lg">
        <Container size="lg" className="max-w-6xl mx-auto flex flex-col gap-20 sm:gap-28">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
              >
                <div className={`lg:col-span-6 space-y-4 ${idx % 2 !== 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                  <Skeleton className="h-6 w-28 rounded-full" />
                  <Skeleton className="h-10 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-12 w-44 rounded-xl" />
                </div>
                <div className={`lg:col-span-6 ${idx % 2 !== 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                  <Skeleton className="aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl" />
                </div>
              </div>
            ))
          ) : events.map((event, idx) => {
            const formattedNumber = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
            const imageFirst = idx % 2 !== 0;
            const description =
              event.description ||
              eventDescriptions[event.id] ||
              'High-octane live production featuring state-of-the-art spatial sound design, lighting choreography, and exclusive live arrangements.';
            const isSoldOut = event.status === 'sold-out';
            const isLive = event.status === 'live';

            return (
              <div
                key={event.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center group"
              >
                {/* Content Column */}
                <div
                  className={`lg:col-span-6 flex flex-col justify-center ${
                    imageFirst ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  {/* Watermark Number & Status Badge */}
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl sm:text-4xl font-mono font-black text-slate-300 dark:text-neutral-700 tracking-widest block select-none">
                      {formattedNumber}
                    </span>

                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-vexo-red/20 text-vexo-red border border-red-200 dark:border-vexo-red/40 animate-pulse">
                        <Flame className="w-3 h-3" /> NOW LIVE
                      </span>
                    ) : isSoldOut ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-400 border border-slate-200 dark:border-white/10">
                        SOLD OUT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-vexo-red/15 text-vexo-red border border-red-200 dark:border-vexo-red/30">
                        <Music className="w-3 h-3" /> UPCOMING TOUR
                      </span>
                    )}
                  </div>

                  {/* Event Title */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-vexo-red transition-colors duration-200">
                    {event.title}
                  </h2>

                  {/* Artist Lineup */}
                  <p className="text-xs sm:text-sm font-bold tracking-wider text-vexo-red uppercase mb-5">
                    {event.artist}
                  </p>

                  {/* Event Metadata (Date, Time, Venue, Location) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6 font-mono text-xs text-slate-700 dark:text-neutral-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-vexo-red shrink-0" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-vexo-red shrink-0" />
                      <span className="truncate">{event.venue}, {event.location}</span>
                    </div>
                  </div>

                  {/* Editorial Description */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 leading-relaxed tracking-wide mb-8 font-normal">
                    {description}
                  </p>

                  {/* Price & CTA Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-widest block mb-0.5">
                        TICKET ADMISSION
                      </span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{event.price}</span>
                    </div>

                    {isSoldOut ? (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => navigate(`/contact?service=Live Event Waitlist`)}
                        rightIcon={<ArrowUpRight className="w-4 h-4" />}
                        className="font-bold text-xs uppercase tracking-wider px-7 py-3.5 border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl"
                      >
                        JOIN WAITLIST
                      </Button>
                    ) : imageFirst ? (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => navigate(`/contact?service=${encodeURIComponent(event.title)}`)}
                        rightIcon={<ArrowUpRight className="w-4 h-4" />}
                        className="font-bold text-xs uppercase tracking-wider px-7 py-3.5 border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors rounded-xl"
                      >
                        RESERVE SEAT
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate(`/contact?service=${encodeURIComponent(event.title)}`)}
                        rightIcon={<Ticket className="w-4 h-4" />}
                        className="font-bold text-xs uppercase tracking-wider px-7 py-3.5 bg-vexo-red text-white hover:bg-red-700 transition-colors shadow-sm rounded-xl"
                      >
                        SECURE TICKETS
                      </Button>
                    )}
                  </div>
                </div>

                {/* Framed Live Concert Image Column */}
                <div
                  className={`lg:col-span-6 ${
                    imageFirst ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl group-hover:border-vexo-red/40 transition-all duration-300 bg-slate-100 dark:bg-neutral-950">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95 contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            );
          })}
        </Container>
      </PageSection>
    </div>
  );
};

export default EventsPage;
