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
import type { EventItem } from './EventTable';

interface EventCardProps {
  event: EventItem;
  allArtists: Array<{ id: string; name: string }>;
  onToggleFeatured: (event: EventItem) => void;
  onTogglePublished: (event: EventItem) => void;
  onDelete: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  allArtists,
  onToggleFeatured,
  onTogglePublished,
  onDelete,
}) => {
  const isPublished = event.published !== false;
  const isFeatured = Boolean(event.featured);

  const getArtistNames = (): string[] => {
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

  const artistList = getArtistNames();

  return (
    <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col group">
      {/* Poster Media Header */}
      <div className="relative aspect-video bg-zinc-950 overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-1">
            <Calendar className="w-8 h-8" />
            <span className="text-[10px] font-mono uppercase">Event Poster</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`text-[9px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full backdrop-blur-md ${
              event.status === 'live'
                ? 'bg-red-950/80 border border-red-800 text-red-400 animate-pulse'
                : event.status === 'upcoming'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                : event.status === 'sold-out'
                ? 'bg-amber-950/80 border border-amber-800 text-amber-400'
                : 'bg-zinc-800/80 border border-zinc-700 text-zinc-400'
            }`}
          >
            {event.status}
          </span>
          {isFeatured && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 backdrop-blur-md">
              Featured
            </span>
          )}
        </div>

        {/* Date Overlay */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs font-mono">
          <span className="text-white font-bold flex items-center gap-1.5 drop-shadow-md">
            <Calendar className="w-3.5 h-3.5 text-vexo-red-bright" />
            {event.date}
          </span>
          <span className="text-zinc-300 text-[10px] drop-shadow-md">{event.time}</span>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <NavLink
            to={`/admin/events/${event.id}/edit`}
            className="font-bold text-sm text-slate-900 dark:text-white hover:text-vexo-red-bright transition-colors line-clamp-1 block"
          >
            {event.title}
          </NavLink>

          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
            <span className="truncate">{event.venue} &bull; {event.location}</span>
          </div>

          {/* Lineup Badges */}
          <div className="flex flex-wrap items-center gap-1 pt-1">
            {artistList.map((artName, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-mono bg-slate-100 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800"
              >
                <Users className="w-2.5 h-2.5 text-vexo-red-bright" />
                {artName}
              </span>
            ))}
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between gap-2">
          {/* Quick Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleFeatured(event)}
              title={isFeatured ? 'Set Standard' : 'Set Featured'}
              className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center transition-all cursor-pointer ${
                isFeatured
                  ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40'
                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:text-slate-900 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800 dark:hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => onTogglePublished(event)}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
              }`}
            >
              {isPublished ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              <span>{isPublished ? 'Live' : 'Draft'}</span>
            </button>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-1">
            <NavLink
              to={`/admin/events/${event.id}/edit`}
              title="Edit Event"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </NavLink>
            <button
              type="button"
              onClick={() => onDelete(event)}
              title="Delete Event"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-vexo-red dark:hover:text-vexo-red-bright hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
