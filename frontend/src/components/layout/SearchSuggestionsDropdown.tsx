import React, { useState } from 'react';
import type { SearchSuggestionItem } from '../../lib/api/search';
import { cn, formatNumber, getMediaUrl } from '../../lib/utils';
import { Search, Sparkles, Music, Film, Disc3, ArrowRight, Loader2, Play } from 'lucide-react';

interface SearchSuggestionsDropdownProps {
  suggestions: SearchSuggestionItem[];
  isLoading: boolean;
  searchQuery: string;
  debouncedQuery: string;
  selectedIndex: number;
  onSelect: (item: SearchSuggestionItem) => void;
  onViewAll: (target?: 'music' | 'videos') => void;
  className?: string;
}

export const SearchSuggestionsDropdown: React.FC<SearchSuggestionsDropdownProps> = React.memo(({
  suggestions,
  isLoading,
  searchQuery,
  debouncedQuery,
  selectedIndex,
  onSelect,
  onViewAll,
  className,
}) => {
  const isTypingQuery = Boolean(searchQuery.trim());
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div
      role="listbox"
      id="search-suggestions-listbox"
      className={cn('w-full text-xs select-none', className)}
    >
      {/* Dropdown Header */}
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2 pb-2 border-b border-black/5 dark:border-white/10">
        <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-300">
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-vexo-red animate-spin" />
              <span>Searching music & videos...</span>
            </>
          ) : isTypingQuery ? (
            <>
              <Search className="w-3.5 h-3.5 text-vexo-red" />
              <span className="truncate max-w-[180px] sm:max-w-[220px]">
                Results for "{searchQuery.trim()}"
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-vexo-red" />
              <span>Trending Music & Videos</span>
            </>
          )}
        </span>
        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500">
          <span>↵ to select</span>
        </span>
      </div>

      {/* Loading Skeletons */}
      {isLoading && suggestions.length === 0 ? (
        <div className="space-y-2 py-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 rounded-xl animate-pulse bg-slate-100/70 dark:bg-white/[0.03]"
            >
              <div className="w-12 h-9 rounded-lg bg-slate-200 dark:bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-3/4" />
                <div className="h-2.5 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        /* Suggestions List */
        <div className="space-y-1 max-h-[340px] overflow-y-auto pr-0.5 scrollbar-thin">
          {suggestions.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const hasImgError = imageErrors[item.id];
            const thumbUrl = getMediaUrl(item.imageUrl);

            return (
              <div
                key={item.id || idx}
                role="option"
                aria-selected={isSelected}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(item);
                }}
                className={cn(
                  'group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-150',
                  isSelected
                    ? 'bg-vexo-red/10 dark:bg-vexo-red/20 ring-1 ring-vexo-red/30'
                    : 'hover:bg-slate-100 dark:hover:bg-white/5'
                )}
              >
                {/* Thumbnail / Cover Art */}
                <div className="relative w-12 h-9 sm:w-14 sm:h-9 rounded-lg overflow-hidden bg-slate-200 dark:bg-zinc-800 shrink-0 flex items-center justify-center border border-black/5 dark:border-white/10">
                  {thumbUrl && !hasImgError ? (
                    <img
                      src={thumbUrl}
                      alt={item.title}
                      onError={() => handleImageError(item.id)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : item.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-vexo-red/10 text-vexo-red">
                      <Film className="w-4 h-4" />
                    </div>
                  ) : item.type === 'album' ? (
                    <div className="w-full h-full flex items-center justify-center bg-amber-500/10 text-amber-500">
                      <Disc3 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-violet-500/10 text-violet-500">
                      <Music className="w-4 h-4" />
                    </div>
                  )}

                  {/* Tiny play overlay on hover/select */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-150',
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                  >
                    <Play className="w-3.5 h-3.5 text-white fill-current translate-x-0.5" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'text-xs font-bold truncate transition-colors duration-150',
                        isSelected
                          ? 'text-vexo-red dark:text-vexo-red'
                          : 'text-slate-900 dark:text-white group-hover:text-vexo-red'
                      )}
                    >
                      {item.title}
                    </span>

                    {/* Type Badge */}
                    {item.type === 'video' ? (
                      <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-vexo-red/10 text-vexo-red border border-vexo-red/20 font-mono">
                        Video
                      </span>
                    ) : item.type === 'album' ? (
                      <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                        Album
                      </span>
                    ) : (
                      <span className="shrink-0 text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-mono">
                        Music
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                    <span className="truncate">{item.subtitle}</span>
                    {item.views !== undefined && item.views > 0 && (
                      <>
                        <span className="text-slate-300 dark:text-zinc-600">•</span>
                        <span className="shrink-0 font-mono text-[9px] text-slate-400 dark:text-zinc-400">
                          {formatNumber(item.views)} views
                        </span>
                      </>
                    )}
                    {item.duration && (
                      <>
                        <span className="text-slate-300 dark:text-zinc-600">•</span>
                        <span className="shrink-0 font-mono text-[9px]">
                          {item.duration}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Arrow Icon Indicator */}
                <div className="shrink-0 text-slate-300 dark:text-zinc-600 group-hover:text-vexo-red group-hover:translate-x-0.5 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      ) : isTypingQuery ? (
        /* Empty State */
        <div className="py-6 px-3 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-2.5 text-slate-400 dark:text-zinc-500">
            <Music className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
            No matching music or videos found for "{debouncedQuery.trim() || searchQuery.trim()}"
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 max-w-[260px] mx-auto">
            Try searching for song name like "Moriya", "Satane", artist name, or genre.
          </p>
          <div className="mt-3.5 flex items-center justify-center gap-2">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onViewAll('music');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 cursor-pointer transition-colors"
            >
              <Music className="w-3 h-3" />
              <span>Search Music</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onViewAll('videos');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-vexo-red/10 text-vexo-red hover:bg-vexo-red/20 cursor-pointer transition-colors"
            >
              <Film className="w-3 h-3" />
              <span>Search Videos</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Bottom Footer Action */}
      {isTypingQuery && suggestions.length > 0 && (
        <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-1.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onViewAll('music');
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-violet-500 hover:bg-violet-500/10 transition-all cursor-pointer"
          >
            <Music className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span className="truncate">View in Music</span>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onViewAll('videos');
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-vexo-red hover:bg-vexo-red/10 transition-all cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-vexo-red shrink-0" />
            <span className="truncate">View in Videos</span>
          </button>
        </div>
      )}
    </div>
  );
});
