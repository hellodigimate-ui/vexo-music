import React from 'react';
import { Search, LayoutGrid, Table, Filter } from 'lucide-react';

interface EventFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  featuredFilter: string;
  onFeaturedChange: (featured: string) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  totalCount: number;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  featuredFilter,
  onFeaturedChange,
  viewMode,
  onViewModeChange,
  totalCount,
}) => {
  return (
    <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 space-y-4 shadow-sm dark:shadow-xl">
      {/* Top row: Search and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events by title, lineup artists, venue, or location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 transition-all"
          />
        </div>

        {/* Count & View Mode Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <span className="text-xs font-mono text-slate-500 dark:text-zinc-500 hidden sm:inline-block">
            {totalCount} {totalCount === 1 ? 'event' : 'events'}
          </span>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              title="Table View"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
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
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold'
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

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-vexo-red cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="live">Live Now</option>
          <option value="sold-out">Sold Out</option>
          <option value="past">Past</option>
        </select>

        {/* Featured Filter */}
        <select
          value={featuredFilter}
          onChange={(e) => onFeaturedChange(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-vexo-red cursor-pointer"
        >
          <option value="all">All Events</option>
          <option value="featured">Featured Only</option>
          <option value="standard">Standard</option>
        </select>
      </div>
    </div>
  );
};

export default EventFilters;
