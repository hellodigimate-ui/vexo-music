import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Image,
  Users,
  Save,
  ArrowLeft,
  Eye,
  Star,
  Check,
  Clock,
  Ticket,
  Plus,
  Layers,
} from 'lucide-react';
import { MediaInput } from '../media/MediaInput';

export interface EventFormData {
  title: string;
  slug: string;
  mainArtist: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  city: string;
  country: string;
  ticketUrl: string;
  price: string;
  status: string;
  imageUrl: string;
  gallery: string[];
  description: string;
  featured: boolean;
  published: boolean;
  order: number;
  artistIds: string[];
}

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  allArtists: Array<{ id: string; name: string }>;
  onSubmit: (data: EventFormData) => Promise<void>;
  isEditing?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData,
  allArtists,
  onSubmit,
  isEditing = false,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    slug: '',
    mainArtist: allArtists[0]?.name || '',
    date: '2026-10-24',
    time: '20:00 EST',
    venue: '',
    location: '',
    city: '',
    country: '',
    ticketUrl: '',
    price: 'Free Admission',
    status: 'upcoming',
    imageUrl: '',
    gallery: [],
    description: '',
    featured: false,
    published: true,
    order: 0,
    artistIds: allArtists[0]?.id ? [allArtists[0].id] : [],
  });

  const [galleryInput, setGalleryInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        artistIds: initialData.artistIds || (initialData.mainArtist ? [allArtists.find(a => a.name === initialData.mainArtist)?.id || ''].filter(Boolean) : []),
        gallery: initialData.gallery || [],
      }));
      if (initialData.gallery && initialData.gallery.length > 0) {
        setGalleryInput(initialData.gallery.join('\n'));
      }
    }
  }, [initialData, allArtists]);

  // Auto-generate slug from Title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!isEditing || !formData.slug) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, title, slug: autoSlug }));
    } else {
      setFormData((prev) => ({ ...prev, title }));
    }
  };

  // Toggle Artist in Multi-select Lineup
  const toggleArtist = (artistId: string) => {
    setFormData((prev) => {
      const exists = prev.artistIds.includes(artistId);
      const newIds = exists
        ? prev.artistIds.filter((id) => id !== artistId)
        : [...prev.artistIds, artistId];

      // Update mainArtist display string
      const selectedNames = newIds
        .map((id) => allArtists.find((a) => a.id === id)?.name)
        .filter(Boolean);

      const mainArtist = selectedNames.length > 0 ? selectedNames.join(', ') : prev.mainArtist;

      return {
        ...prev,
        artistIds: newIds,
        mainArtist,
      };
    });
  };

  // Gallery URLs handler
  const handleGalleryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGalleryInput(e.target.value);
    const urls = e.target.value
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
    setFormData((prev) => ({ ...prev, gallery: urls }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Event Name is required.');
      return;
    }
    if (!formData.date.trim()) {
      setError('Event Date is required.');
      return;
    }
    if (!formData.venue.trim()) {
      setError('Venue is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn pb-16 max-w-5xl mx-auto">
      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Core Event Identity Section */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Event Details</h2>
            <p className="text-xs text-zinc-400">Title, slug, schedule, and venue logistics.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Event Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Event Name <span className="text-vexo-red">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="e.g. VEXO Neon Arena: Live in Concert"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Slug Identifier <span className="text-vexo-red">*</span>
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2.5 rounded-l-xl bg-zinc-900 border border-r-0 border-zinc-800 text-zinc-500 text-xs font-mono">
                /events/
              </span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="vexo-neon-arena"
                className="w-full px-3.5 py-2.5 rounded-r-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Event Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none focus:border-vexo-red/50 transition-colors cursor-pointer"
            >
              <option value="upcoming">Upcoming</option>
              <option value="live">Live Now</option>
              <option value="sold-out">Sold Out</option>
              <option value="past">Past / Concluded</option>
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Event Date <span className="text-vexo-red">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              placeholder="e.g. OCT 24, 2026 or 2026-10-24"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Doors / Showtime
            </label>
            <input
              type="text"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="e.g. 20:00 EST"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          {/* Venue */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Venue Name <span className="text-vexo-red">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. Madison Square Garden / JECC Jaipur"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          {/* Location / City */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              City & Location <span className="text-vexo-red">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value, city: e.target.value })}
              placeholder="e.g. Jaipur, Rajasthan, India"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. Artist Lineup Multi-Selection Section */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Performer Lineup</h2>
            <p className="text-xs text-zinc-400">Connect signed roster artists to this event.</p>
          </div>
        </div>

        {/* Selected Artists Chips */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center justify-between">
            <span>Selected Artists ({formData.artistIds.length})</span>
            <span className="text-[10px] text-zinc-500 font-mono">Click to toggle</span>
          </label>

          <div className="flex flex-wrap gap-2.5 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 min-h-[56px] items-center">
            {allArtists.map((artist) => {
              const isSelected = formData.artistIds.includes(artist.id);
              return (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => toggleArtist(artist.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-vexo-red/20 text-white border border-vexo-red/50 shadow-[0_0_15px_rgba(224,0,0,0.35)]'
                      : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {isSelected ? <Check className="w-3 h-3 text-vexo-red-bright" /> : <Plus className="w-3 h-3 text-zinc-500" />}
                  <span>{artist.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Lineup Subtitle Display */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold uppercase text-zinc-300">
            Lineup Header / Headliner Name
          </label>
          <input
            type="text"
            value={formData.mainArtist}
            onChange={(e) => setFormData({ ...formData, mainArtist: e.target.value })}
            placeholder="e.g. Rashmi Nishad, Sonu Charan Bhatt & Special Guests"
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
          />
        </div>
      </div>

      {/* 3. Media & Gallery Section */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Image className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Event Artwork & Gallery</h2>
            <p className="text-xs text-zinc-400">Official poster artwork and stage photo gallery.</p>
          </div>
        </div>

        {/* Cover Image URL */}
        <div>
          <MediaInput
            label="EVENT POSTER / BANNER IMAGE"
            value={formData.imageUrl}
            onChange={(url) => setFormData({ ...formData, imageUrl: url })}
            placeholder="https://... (or select from Media Library)"
            allowedTypes={['image']}
            helperText="Official poster artwork displayed on event cards and detail pages"
            required
          />
        </div>

        {/* Gallery URLs */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold uppercase text-zinc-300 flex items-center justify-between">
            <span>Event Gallery URLs <span className="text-zinc-500 text-[10px] lowercase">(one image link per line)</span></span>
            <span className="text-[10px] text-zinc-500 font-mono">{formData.gallery.length} Images</span>
          </label>
          <textarea
            rows={3}
            value={galleryInput}
            onChange={handleGalleryChange}
            placeholder={`https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2...`}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors custom-scrollbar"
          />
        </div>
      </div>

      {/* 4. Ticketing & Description */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Ticketing & Description</h2>
            <p className="text-xs text-zinc-400">Pass pricing, external booking links, and event overview.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Ticketing URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Ticket Booking URL
            </label>
            <input
              type="url"
              value={formData.ticketUrl}
              onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
              placeholder="https://bookmyshow.com or https://ticketmaster.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          {/* Pricing */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Price Range / Passes
            </label>
            <input
              type="text"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. ₹999 - ₹4,999 or Free Admission"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Event Description & Lineup Summary
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Official event details, special performances, stage timing, and entry instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-vexo-red/50 transition-colors custom-scrollbar"
            />
          </div>
        </div>
      </div>

      {/* 5. Publishing Controls */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Publishing Controls</h2>
            <p className="text-xs text-zinc-400">Featured event spotlight and live website visibility.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Featured Button */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">Featured Event</p>
              <p className="text-[11px] text-zinc-500">Spotlight banner</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, featured: !formData.featured })}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                formData.featured
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${formData.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{formData.featured ? 'Featured' : 'Standard'}</span>
            </button>
          </div>

          {/* Published Button */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">Published Status</p>
              <p className="text-[11px] text-zinc-500">{formData.published ? 'Live on website' : 'Draft / Hidden'}</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, published: !formData.published })}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                formData.published
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500/30'
              }`}
            >
              {formData.published ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              <span>{formData.published ? 'Published' : 'Draft'}</span>
            </button>
          </div>

          {/* Order Index */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
            <label className="text-xs font-bold text-white">Sort Order</label>
            <input
              type="number"
              min="0"
              value={formData.order}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
              }}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setFormData({ ...formData, order: isNaN(val) ? 0 : Math.max(0, val) });
              }}
              className="w-full px-3 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => navigate('/admin/events')}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-7 py-3 rounded-xl bg-vexo-red hover:bg-vexo-red-bright text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_25px_rgba(224,0,0,0.5)] transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving Event...' : isEditing ? 'Update Event' : 'Schedule Event'}</span>
        </button>
      </div>
    </form>
  );
};

export default EventForm;
