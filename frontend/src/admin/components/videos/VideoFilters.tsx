import React from 'react';
import { Search, LayoutGrid, Table, Filter } from 'lucide-react';

interface VideoFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  featuredFilter: string;
  onFeaturedChange: (featured: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  totalCount: number;
}

export const VideoFilters: React.FC<VideoFiltersProps> = ({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  featuredFilter,
  onFeaturedChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
  totalCount,
}) => {
  return (
    <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 space-y-4 shadow-sm">
      {/* Top row: Search and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search videos by title, artist, YouTube ID, or tags..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:bg-white focus:outline-none focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 transition-all"
          />
        </div>

        {/* Count & View Mode Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-500 hidden sm:inline-block">
            {totalCount} {totalCount === 1 ? 'video' : 'videos'}
          </span>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              title="Table View"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Selectors */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 font-mono">
          <Filter className="w-3.5 h-3.5 text-vexo-red-bright" />
          <span>Filters:</span>
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-vexo-red cursor-pointer shadow-2xs"
        >
          <option value="all">All Categories</option>
          <option value="Official Music Videos">Official Music Videos</option>
          <option value="Live Performances">Live Performances</option>
          <option value="Behind The Scenes">Behind The Scenes</option>
          <option value="Visualizers">Visualizers</option>
        </select>

        {/* Featured Filter */}
        <select
          value={featuredFilter}
          onChange={(e) => onFeaturedChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-vexo-red cursor-pointer shadow-2xs"
        >
          <option value="all">All Videos</option>
          <option value="featured">Featured Hero</option>
          <option value="standard">Standard</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-vexo-red cursor-pointer shadow-2xs"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>
    </div>
  );
};

export default VideoFilters;
