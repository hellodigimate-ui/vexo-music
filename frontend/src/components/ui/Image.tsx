import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide' | 'auto';
  hoverEffect?: 'zoom' | 'glow' | 'opacity' | 'none';
  overlay?: boolean;
  fallbackSrc?: string;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  className,
  aspectRatio = 'auto',
  hoverEffect = 'none',
  overlay = false,
  fallbackSrc = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[21/9]',
    auto: '',
  };

  const hoverClasses = {
    zoom: 'transition-transform duration-500 group-hover:scale-105',
    glow: 'transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(224,0,0,0.3)]',
    opacity: 'transition-opacity duration-300 group-hover:opacity-80',
    none: '',
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden group bg-vexo-surface select-none',
        aspectClasses[aspectRatio],
        className
      )}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse flex items-center justify-center text-vexo-muted text-xs">
          Loading...
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover',
          hoverClasses[hoverEffect],
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        {...props}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90 pointer-events-none" />
      )}
    </div>
  );
};

export default Image;
