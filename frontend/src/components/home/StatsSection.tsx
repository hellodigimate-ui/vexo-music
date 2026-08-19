import React, { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { PageSection } from '../ui/PageSection';
import { homepageApi } from '../../lib/api';
import { adminMockStore } from '../../admin/services/adminMockStore';

interface StatItemProps {
  target: number;
  suffix?: string;
  label: string;
}

const parseStatValue = (val: string | number | undefined | null, defaultNum: number, defaultSuffix = '+') => {
  if (val === undefined || val === null) return { target: defaultNum, suffix: defaultSuffix };
  if (typeof val === 'number') return { target: val, suffix: defaultSuffix };
  const str = String(val).trim();
  const numMatch = str.match(/^([0-9.]+)(.*)$/);
  if (numMatch) {
    const num = parseFloat(numMatch[1]);
    const suffix = numMatch[2] || defaultSuffix;
    return { target: isNaN(num) ? defaultNum : num, suffix };
  }
  return { target: defaultNum, suffix: str || defaultSuffix };
};

const StatCounterItem: React.FC<StatItemProps> = ({ target, suffix = '+', label }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // 2 seconds
    const frameTime = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameTime);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Easing out curve
      const currentCount = Math.round(target * (1 - Math.pow(1 - progress, 3)));

      if (frame >= totalFrames) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(currentCount);
      }
    }, frameTime);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div
      ref={ref}
      className="glass-card p-8 sm:p-10 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center hover:border-vexo-red/50 hover:shadow-[0_0_30px_rgba(224,0,0,0.3)] transition-all duration-300 group"
    >
      <div className="font-mono text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-2 group-hover:text-vexo-red-bright transition-colors">
        <span className="text-gradient-red">{count}</span>
        <span className="text-vexo-red-bright">{suffix}</span>
      </div>

      <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-vexo-muted group-hover:text-white transition-colors">
        {label}
      </p>
    </div>
  );
};

export const StatsSection: React.FC = () => {
  const [stats, setStats] = useState(() => {
    const d = adminMockStore.getHomepage().data || {};
    return {
      artistsCount: d.statsArtistsCount !== undefined && d.statsArtistsCount !== null ? String(d.statsArtistsCount) : '10+',
      releasesCount: d.statsReleasesCount !== undefined && d.statsReleasesCount !== null ? String(d.statsReleasesCount) : '50+',
      projectsCount: d.statsProjectsCount !== undefined && d.statsProjectsCount !== null ? String(d.statsProjectsCount) : '100+',
    };
  });

  useEffect(() => {
    let isMounted = true;
    homepageApi.getHomepage().then((res) => {
      if (!isMounted || !res.data) return;
      const data = res.data;
      setStats({
        artistsCount: data.statsArtistsCount !== undefined && data.statsArtistsCount !== null ? String(data.statsArtistsCount) : '10+',
        releasesCount: data.statsReleasesCount !== undefined && data.statsReleasesCount !== null ? String(data.statsReleasesCount) : '50+',
        projectsCount: data.statsProjectsCount !== undefined && data.statsProjectsCount !== null ? String(data.statsProjectsCount) : '100+',
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const artistsParsed = parseStatValue(stats.artistsCount, 10, '+');
  const releasesParsed = parseStatValue(stats.releasesCount, 50, '+');
  const projectsParsed = parseStatValue(stats.projectsCount, 100, '+');

  return (
    <PageSection variant="surface" padding="lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
        <StatCounterItem target={artistsParsed.target} suffix={artistsParsed.suffix} label="ARTISTS" />
        <StatCounterItem target={releasesParsed.target} suffix={releasesParsed.suffix} label="RELEASES" />
        <StatCounterItem target={projectsParsed.target} suffix={projectsParsed.suffix} label="PROJECTS" />
      </div>
    </PageSection>
  );
};

export default StatsSection;
