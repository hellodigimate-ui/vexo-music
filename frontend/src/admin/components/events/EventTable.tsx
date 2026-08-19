import React from 'react';
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
    <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#121218] border-b border-zinc-800/80 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <tr>
              <th className="py-3.5 px-6">Event & Poster</th>
              <th className="py-3.5 px-6">Date & Schedule</th>
              <th className="py-3.5 px-6">Venue & Location</th>
              <th className="py-3.5 px-6">Performer Lineup</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Featured</th>
              <th className="py-3.5 px-6">Published</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {events.map((event) => {
              const isPublished = event.published !== false;
              const isFeatured = Boolean(event.featured);
              const artistList = getArtistNames(event);

              return (
                <tr key={event.id} className="hover:bg-zinc-900/40 transition-colors group">
                  {/* Title & Poster */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[200px]">
                        <NavLink
                          to={`/admin/events/${event.id}/edit`}
                          className="font-bold text-white text-xs hover:text-vexo-red-bright transition-colors truncate block"
                        >
                          {event.title}
                        </NavLink>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800/60 mt-0.5 inline-block">
                          /{event.slug || event.id}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-vexo-red-bright" />
                        {event.date}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 mt-0.5">
                        {event.time || '20:00 EST'}
                      </span>
                    </div>
                  </td>

                  {/* Venue & Location */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-200">{event.venue}</span>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-zinc-600 shrink-0" />
                        {event.location}
                      </span>
                    </div>
                  </td>

                  {/* Lineup Chips */}
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                      {artistList.map((artName, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono bg-vexo-red/10 text-zinc-200 border border-vexo-red/20"
                        >
                          <Users className="w-2.5 h-2.5 text-vexo-red-bright" />
                          {artName}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-6">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full ${
                        event.status === 'live'
                          ? 'bg-red-950/80 border border-red-800 text-red-400 animate-pulse'
                          : event.status === 'upcoming'
                          ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                          : event.status === 'sold-out'
                          ? 'bg-amber-950/80 border border-amber-800 text-amber-400'
                          : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>

                  {/* Featured Button */}
                  <td className="py-4 px-6">
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(event)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isFeatured
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:text-white'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${isFeatured ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span>{isFeatured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>

                  {/* Published Button */}
                  <td className="py-4 px-6">
                    <button
                      type="button"
                      onClick={() => onTogglePublished(event)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isPublished
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {isPublished ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      <span>{isPublished ? 'Published' : 'Draft'}</span>
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <NavLink
                        to={`/admin/events/${event.id}/edit`}
                        title="Edit Event"
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </NavLink>
                      <button
                        type="button"
                        onClick={() => onDelete(event)}
                        title="Delete Event"
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-vexo-red-bright hover:bg-red-500/10 hover:border-red-500/30 transition-colors cursor-pointer"
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
    </div>
  );
};

export default EventTable;
