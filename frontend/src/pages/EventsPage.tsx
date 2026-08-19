import React, { useState, useEffect } from 'react';
import { PageSection } from '../components/ui/PageSection';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { AnimatedHeroBackground } from '../components/ui/AnimatedHeroBackground';
import { eventsApi } from '../lib/api';
import type { Event } from '../types';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ArrowUpRight, Flame, Music } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    eventsApi.getEvents().then((res) => {
      if (isMounted && res.data) setEvents(res.data);
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
    <div className="pt-24 min-h-screen bg-[#050505] text-white pb-24 selection:bg-vexo-red selection:text-white">
      {/* 1. HERO HEADER SECTION WITH CINEMATIC CONCERT PHOTO BACKGROUND */}
      <div className="relative pt-20 pb-28 border-b border-white/10 overflow-hidden bg-[#050505]">
        <AnimatedHeroBackground bgImage="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=2000&q=80" />

        <Container size="md" className="relative z-10 text-center max-w-4xl mx-auto px-4">
          {/* Animated Glow Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-vexo-red/15 text-vexo-red-bright border border-vexo-red/35 shadow-[0_0_25px_rgba(224,0,0,0.4)] mb-6 animate-pulse">
            <Music className="w-3.5 h-3.5" /> WORLD TOUR 2026 / LIVE SHOWS
          </div>

          {/* BOLD DISPLAY TITLE */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight sm:tracking-[0.08em] text-white mb-6 leading-none drop-shadow-[0_10px_40px_rgba(0,0,0,0.95)]">
            LIVE EXPERIENCE
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-100 font-medium leading-relaxed max-w-2xl mx-auto tracking-wide mb-8 drop-shadow-[0_2px_15px_rgba(0,0,0,0.95)]">
            Experience the raw energy of VEXO's premier artists. Secure your access to the most exclusive cinematic music events globally.
          </p>

          {/* Live Quick Metrics Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-mono text-neutral-300 shadow-inner">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-vexo-red shadow-[0_0_8px_#FF1111]" />
              <strong className="text-white">4 GLOBAL DATES</strong>
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="flex items-center gap-2">
              <strong className="text-white">150K+ AUDIENCE</strong>
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="flex items-center gap-2">
              <strong className="text-white">32-CH SPATIAL AUDIO</strong>
            </span>
          </div>
        </Container>
      </div>

      {/* 2. ALTERNATING TOUR & EVENTS EDITORIAL LIST */}
      <PageSection padding="lg">
        <Container size="lg" className="max-w-6xl mx-auto flex flex-col gap-24 sm:gap-32">
          {events.map((event, idx) => {
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
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-center group"
              >
                {/* Content Column */}
                <div
                  className={`lg:col-span-6 flex flex-col justify-center ${
                    imageFirst ? 'lg:order-2' : 'lg:order-1'
                  }`}
                >
                  {/* Watermark Number & Status Badge */}
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-3xl sm:text-4xl font-mono font-black text-neutral-600 tracking-widest block select-none">
                      {formattedNumber}
                    </span>

                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-vexo-red/20 text-vexo-red-bright border border-vexo-red/40 animate-pulse">
                        <Flame className="w-3 h-3" /> NOW LIVE
                      </span>
                    ) : isSoldOut ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/10">
                        SOLD OUT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-vexo-red/15 text-vexo-red-bright border border-vexo-red/30">
                        <Music className="w-3 h-3" /> UPCOMING TOUR
                      </span>
                    )}
                  </div>

                  {/* Event Title */}
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white mb-2 leading-tight group-hover:text-vexo-red-bright transition-colors duration-300">
                    {event.title}
                  </h2>

                  {/* Artist Lineup */}
                  <p className="text-xs sm:text-sm font-bold tracking-widest text-vexo-red-bright uppercase mb-5">
                    {event.artist}
                  </p>

                  {/* Event Metadata (Date, Time, Venue, Location) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mb-6 font-mono text-xs text-neutral-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-vexo-red shrink-0" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-vexo-red shrink-0" />
                      <span>{event.venue}, {event.location}</span>
                    </div>
                  </div>

                  {/* Editorial Description */}
                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed tracking-wide mb-8 font-normal">
                    {description}
                  </p>

                  {/* Price & CTA Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-0.5">
                        TICKET ADMISSION
                      </span>
                      <span className="text-2xl font-black text-white font-mono">{event.price}</span>
                    </div>

                    {isSoldOut ? (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => navigate(`/contact?service=Live Event Waitlist`)}
                        rightIcon={<ArrowUpRight className="w-4 h-4" />}
                        className="font-bold text-xs uppercase tracking-widest px-7 py-3.5 bg-white/5 border border-white/20 text-white hover:bg-white/10 rounded-sm"
                      >
                        JOIN WAITLIST
                      </Button>
                    ) : imageFirst ? (
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => navigate(`/contact?service=${encodeURIComponent(event.title)}`)}
                        rightIcon={<ArrowUpRight className="w-4 h-4" />}
                        className="font-bold text-xs uppercase tracking-widest px-7 py-3.5 bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white transition-all duration-300 rounded-sm"
                      >
                        RESERVE SEAT
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate(`/contact?service=${encodeURIComponent(event.title)}`)}
                        rightIcon={<Ticket className="w-4 h-4" />}
                        className="font-bold text-xs uppercase tracking-widest px-7 py-3.5 bg-gradient-to-r from-[#FF4D4D] to-[#E00000] text-white hover:shadow-[0_0_30px_rgba(255,77,77,0.5)] transition-all duration-300 border-none rounded-sm"
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
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] group-hover:border-vexo-red/40 transition-all duration-500 bg-neutral-950">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
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
