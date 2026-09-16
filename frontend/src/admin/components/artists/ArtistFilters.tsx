import React from 'react';
import { Search, LayoutGrid, Table, Filter } from 'lucide-react';

export interface ArtistFiltersProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedGenre: string;
  onGenreChange: (val: string) => void;
  availableGenres: string[];
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedFeatured: string;
  onFeaturedChange: (val: string) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  totalResults: number;
}

export const ArtistFilters: React.FC<ArtistFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreChange,
  availableGenres,
  selectedStatus,
  onStatusChange,
  selectedFeatured,
  onFeaturedChange,
  viewMode,
  onViewModeChange,
  totalResults,
}) => {
  return (
    <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Top Row: Search & View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search artists by name, role, genre, or slug..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:outline-none focus:ring-1 focus:ring-vexo-red transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* View Switcher & Result Count */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500 hidden md:inline">
            {totalResults} {totalResults === 1 ? 'artist' : 'artists'}
          </span>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => onViewModeChange('table')}
              title="Table View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-zinc-800 text-vexo-red shadow-xs' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300'
              }`}
            >
              <Table className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              title="Grid Card View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white dark:bg-zinc-800 text-vexo-red shadow-xs' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-100 dark:border-zinc-800/40 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-500 font-mono text-[11px] mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Genre Selector */}
        <select
          value={selectedGenre}
          onChange={(e) => onGenreChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-300 focus:border-vexo-red focus:outline-none focus:ring-1 focus:ring-vexo-red cursor-pointer shadow-xs"
        >
          <option value="ALL">All Genres</option>
          {availableGenres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Status / Published Selector */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-300 focus:border-vexo-red focus:outline-none focus:ring-1 focus:ring-vexo-red cursor-pointer shadow-xs"
        >
          <option value="ALL">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="COMING_SOON">Coming Soon / Unreleased</option>
        </select>

        {/* Featured Selector */}
        <select
          value={selectedFeatured}
          onChange={(e) => onFeaturedChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-300 focus:border-vexo-red focus:outline-none focus:ring-1 focus:ring-vexo-red cursor-pointer shadow-xs"
        >
          <option value="ALL">All Artists</option>
          <option value="FEATURED">Featured Only</option>
          <option value="STANDARD">Standard</option>
        </select>

        {/* Active Filters Reset */}
        {(selectedGenre !== 'ALL' || selectedStatus !== 'ALL' || selectedFeatured !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              onGenreChange('ALL');
              onStatusChange('ALL');
              onFeaturedChange('ALL');
              onSearchChange('');
            }}
            className="ml-auto text-[11px] font-mono text-vexo-red hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ArtistFilters;
