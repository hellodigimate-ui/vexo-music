import React, { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { PageSection } from '../ui/PageSection';
import { homepageApi } from '../../lib/api';
import { Skeleton } from '../ui/Skeleton';

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
    const frameTime = 1000 / 60;
    const totalFrames = Math.round(duration / frameTime);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
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
      className="relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-vexo-red/50 transition-all duration-300 group shadow-xs"
    >
      <div className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-slate-950 dark:text-white mb-2 flex items-baseline">
        <span>{count}</span>
        <span className="text-vexo-red font-sans">{suffix}</span>
      </div>

      <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-slate-600 dark:text-zinc-400 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
        {label}
      </p>
    </div>
  );
};

export const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<{
    artistsCount: string;
    releasesCount: string;
    projectsCount: string;
  } | null>(null);

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

  if (!stats) {
    return (
      <PageSection variant="surface" padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </PageSection>
    );
  }

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
