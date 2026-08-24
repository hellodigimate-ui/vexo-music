import React from 'react';
import { cn } from '../../lib/utils';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  align?: 'left' | 'center' | 'right';
  action?: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  subtitle,
  badge,
  align = 'left',
  action,
  className,
  titleClassName,
}) => {
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8',
        className
      )}
    >
      <div className={cn('flex flex-col', alignmentClasses[align])}>
        {badge && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-vexo-red/10 text-vexo-red border border-vexo-red/20 mb-2 w-fit">
            {badge}
          </span>
        )}
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 bg-gradient-to-b from-vexo-red-bright to-vexo-red rounded-full shrink-0" />
          <h2
            className={cn(
              'text-2xl sm:text-3xl font-extrabold tracking-tight text-white',
              titleClassName
            )}
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base text-vexo-muted max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default SectionHeading;
