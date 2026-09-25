import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Star,
  Check,
  Clock,
  Edit3,
  Trash2,
  Users,
} from 'lucide-react';
import { TableScrollSlider } from '../TableScrollSlider';

export interface EventItem {
  id: string;
  title: string;
  slug?: string;
  mainArtist: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  city?: string;
  country?: string;
  ticketUrl?: string;
  price: string;
  status: string;
  imageUrl: string;
  description?: string;
  featured?: boolean;
  published?: boolean;
  order?: number;
  artists?: Array<{ id: string; name: string }>;
  artistIds?: string[];
}

interface EventTableProps {
  events: EventItem[];
  allArtists: Array<{ id: string; name: string }>;
  onToggleFeatured: (event: EventItem) => void;
  onTogglePublished: (event: EventItem) => void;
  onDelete: (event: EventItem) => void;
}

export const EventTable: React.FC<EventTableProps> = ({
  events,
  allArtists,
  onToggleFeatured,
  onTogglePublished,
  onDelete,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper to resolve artist names
  const getArtistNames = (event: EventItem): string[] => {
    if (event.artists && event.artists.length > 0) {
      return event.artists.map((a) => a.name);
    }
    if (event.artistIds && event.artistIds.length > 0) {
      return event.artistIds
        .map((id) => allArtists.find((a) => a.id === id)?.name)
        .filter(Boolean) as string[];
    }
    return [event.mainArtist];
  };

  return (
    <div className="w-full max-w-full min-w-0 bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl">
      <div
        ref={scrollRef}
        className="w-full max-w-full overflow-x-auto scrollbar-thin touch-pan-x overscroll-x-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <table className="w-full text-left text-xs min-w-[850px]">
          <thead className="bg-slate-50 dark:bg-[#121218] border-b border-slate-200 dark:border-zinc-800/80 text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-zinc-400">
            <tr>
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[200px]">Event & Poster</th>
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[140px]">Date & Schedule</th>
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[170px]">Venue & Location</th>
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[160px]">Performer Lineup</th>
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[100px]">Status</th>
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[110px]">Featured</th>
              <th className="py-3.5 px-4 sm:px-6 whitespace-nowrap min-w-[110px]">Published</th>
              <th className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap min-w-[90px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60">
            {events.map((event) => {
              const isPublished = event.published !== false;
              const isFeatured = Boolean(event.featured);
              const artistList = getArtistNames(event);

              return (
                <tr key={event.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 transition-colors group">
                  {/* Title & Poster */}
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shrink-0">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[200px]">
                        <NavLink
                          to={`/admin/events/${event.id}/edit`}
                          className="font-bold text-slate-900 dark:text-white text-xs hover:text-vexo-red-bright transition-colors truncate block"
                        >
                          {event.title}
                        </NavLink>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800/60 mt-0.5 inline-block">
                          /{event.slug || event.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-vexo-red-bright shrink-0" />
                        {event.date}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5 whitespace-nowrap">
                        {event.time || '20:00 EST'}
                      </span>
                    </div>
                  </td>

                  {/* Venue & Location */}
                  <td className="py-4 px-4 sm:px-6 min-w-[170px]">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-zinc-200 truncate max-w-[180px]">{event.venue}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                        <MapPin className="w-3 h-3 text-slate-400 dark:text-zinc-600 shrink-0" />
                        {event.location}
                      </span>
                    </div>
                  </td>

                  {/* Lineup Chips */}
                  <td className="py-4 px-4 sm:px-6 min-w-[160px]">
                    <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                      {artistList.map((artName, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 dark:bg-vexo-red/10 dark:text-zinc-200 dark:border-vexo-red/20 whitespace-nowrap shrink-0"
                        >
                          <Users className="w-2.5 h-2.5 text-vexo-red-bright shrink-0" />
                          {artName}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full whitespace-nowrap ${
                        event.status === 'live'
                          ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/80 dark:border-red-800 dark:text-red-400 animate-pulse'
                          : event.status === 'upcoming'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-400'
                          : event.status === 'sold-out'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>

                  {/* Featured Button */}
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(event)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        isFeatured
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-200 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800 dark:hover:text-white'
                      }`}
                    >
                      <Star className={`w-3 h-3 shrink-0 ${isFeatured ? 'fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400' : ''}`} />
                      <span>{isFeatured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>

                  {/* Published Button */}
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onTogglePublished(event)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30'
                      }`}
                    >
                      {isPublished ? <Check className="w-3 h-3 shrink-0" /> : <Clock className="w-3 h-3 shrink-0" />}
                      <span>{isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <NavLink
                        to={`/admin/events/${event.id}/edit`}
                        title="Edit Event"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </NavLink>
                      <button
                        type="button"
                        onClick={() => onDelete(event)}
                        title="Delete Event"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-vexo-red dark:hover:text-vexo-red-bright hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-500/10 dark:hover:border-red-500/30 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TableScrollSlider scrollRef={scrollRef} />
    </div>
  );
};

export default EventTable;
