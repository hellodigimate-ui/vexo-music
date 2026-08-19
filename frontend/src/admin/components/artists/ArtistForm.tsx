import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Disc3,
  Music,
  Image,
  Share2,
  Save,
  ArrowLeft,
  Eye,
  Star,
  Check,
  Clock,
} from 'lucide-react';
import { MediaInput } from '../media/MediaInput';

export interface ArtistFormData {
  name: string;
  slug: string;
  role: string;
  avatarUrl: string;
  coverUrl: string;
  genres: string;
  bio: string;
  monthlyListeners: number;
  featured: boolean;
  published: boolean;
  order: number;
  spotifyUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  xUrl: string;
}

export interface ArtistFormProps {
  initialData?: Partial<ArtistFormData>;
  isEditing?: boolean;
  onSubmit: (data: ArtistFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ArtistForm: React.FC<ArtistFormProps> = ({
  initialData,
  isEditing = false,
  onSubmit,
  isLoading = false,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ArtistFormData>({
    name: '',
    slug: '',
    role: '',
    avatarUrl: '',
    coverUrl: '',
    genres: '',
    bio: '',
    monthlyListeners: 0,
    featured: false,
    published: true,
    order: 0,
    spotifyUrl: '',
    youtubeUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    xUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        genres: Array.isArray(initialData.genres)
          ? initialData.genres.join(', ')
          : initialData.genres || '',
        published: initialData.published !== undefined ? initialData.published : !initialData['isComingSoon' as keyof typeof initialData],
      }));
      if (initialData.slug) {
        setIsSlugCustomized(true);
      }
    }
  }, [initialData]);

  // Auto-generate slug when name changes unless customized manually
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const updates: Partial<ArtistFormData> = { name: val };
    if (!isSlugCustomized) {
      updates.slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    setFormData((prev) => ({ ...prev, ...updates }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugCustomized(true);
    setFormData((prev) => ({
      ...prev,
      slug: e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '')
        .replace(/--+/g, '-'),
    }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Artist name is required.';
    }
    if (!formData.role.trim()) {
      newErrors.role = 'Artist primary role is required.';
    }
    if (formData.spotifyUrl && !formData.spotifyUrl.startsWith('http')) {
      newErrors.spotifyUrl = 'Please provide a valid URL (starting with http/https).';
    }
    if (formData.youtubeUrl && !formData.youtubeUrl.startsWith('http')) {
      newErrors.youtubeUrl = 'Please provide a valid URL (starting with http/https).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const getInitials = (name: string) => {
    if (!name) return 'VXO';
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Basic Identity Card */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Artist Identity</h2>
            <p className="text-xs text-zinc-400">Core legal name, title, and public routing slug.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Artist Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Artist Name <span className="text-vexo-red-bright">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Rashmi Nishad"
              className={`w-full px-4 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                errors.name ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-vexo-red'
              }`}
            />
            {errors.name && <p className="text-[11px] text-red-400">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              URL Slug <span className="text-zinc-500 text-[10px] lowercase">(auto-generated)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500">/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="rashmi-nishad"
                className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none transition-colors"
              />
            </div>
            {errors.slug && <p className="text-[11px] text-red-400">{errors.slug}</p>}
          </div>

          {/* Primary Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Primary Role / Title <span className="text-vexo-red-bright">*</span>
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => {
                setFormData({ ...formData, role: e.target.value });
                if (errors.role) setErrors({ ...errors, role: '' });
              }}
              placeholder="e.g. Lead Vocalist & Performing Artist"
              className={`w-full px-4 py-2.5 rounded-xl bg-zinc-900 border text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors ${
                errors.role ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-vexo-red'
              }`}
            />
            {errors.role && <p className="text-[11px] text-red-400">{errors.role}</p>}
          </div>

          {/* Monthly Listeners */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Monthly Listeners
            </label>
            <input
              type="number"
              min="0"
              value={formData.monthlyListeners || ''}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
              }}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setFormData({ ...formData, monthlyListeners: isNaN(val) ? 0 : Math.max(0, val) });
              }}
              placeholder="e.g. 245000"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. Media & Imagery Card */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Image className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Media & Imagery</h2>
            <p className="text-xs text-zinc-400">Profile avatar and backdrop imagery. Choose from Media Library or enter URL.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Profile Image */}
          <div>
            <MediaInput
              label="PROFILE AVATAR IMAGE"
              value={formData.avatarUrl}
              onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
              placeholder="https://... (or select from Media Library)"
              allowedTypes={['image']}
              helperText="Leave empty to use automatic audio monogram"
            />
          </div>

          {/* Cover / Backdrop Image URL */}
          <div>
            <MediaInput
              label="COVER BANNER IMAGE"
              value={formData.coverUrl}
              onChange={(url) => setFormData({ ...formData, coverUrl: url })}
              placeholder="https://... (album artwork or banner photo)"
              allowedTypes={['image']}
              helperText="High-res banner displayed on the artist profile header"
            />
          </div>
        </div>
      </div>

      {/* 3. Music Metadata & Bio Card */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Disc3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Music Metadata & Bio</h2>
            <p className="text-xs text-zinc-400">Genres and official biography.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Genres */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Genres <span className="text-zinc-500 text-[10px] lowercase">(comma separated)</span>
            </label>
            <input
              type="text"
              value={formData.genres}
              onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
              placeholder="e.g. Traditional Folk, Contemporary Indian, Sufi / Fusion"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none transition-colors"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">
              Biography & Editorial Profile
            </label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Detailed artist background, accolades, and notable releases..."
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none transition-colors resize-y"
            />
          </div>
        </div>
      </div>

      {/* 4. Streaming & Social URLs Card */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Streaming & Social Platforms</h2>
            <p className="text-xs text-zinc-400">Direct streaming channels and official social handles.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Spotify */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">Spotify Artist URL</label>
            <input
              type="text"
              value={formData.spotifyUrl}
              onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
              placeholder="https://open.spotify.com/artist/..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none transition-colors"
            />
            {errors.spotifyUrl && <p className="text-[11px] text-red-400">{errors.spotifyUrl}</p>}
          </div>

          {/* YouTube */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">YouTube Channel / Release URL</label>
            <input
              type="text"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              placeholder="https://youtube.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none transition-colors"
            />
            {errors.youtubeUrl && <p className="text-[11px] text-red-400">{errors.youtubeUrl}</p>}
          </div>

          {/* Instagram */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">Instagram Profile URL</label>
            <input
              type="text"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none transition-colors"
            />
          </div>

          {/* Facebook */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">Facebook Page URL</label>
            <input
              type="text"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none transition-colors"
            />
          </div>

          {/* X / Twitter */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-mono font-bold uppercase text-zinc-300">X (Twitter) Profile URL</label>
            <input
              type="text"
              value={formData.xUrl}
              onChange={(e) => setFormData({ ...formData, xUrl: e.target.value })}
              placeholder="https://x.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 5. Publishing Controls Card */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
          <div className="w-9 h-9 rounded-xl bg-vexo-red/10 border border-vexo-red/30 flex items-center justify-center text-vexo-red-bright">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Publishing Controls</h2>
            <p className="text-xs text-zinc-400">Featured status on homepage and platform visibility.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Featured Button */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white">Featured Artist</p>
              <p className="text-[11px] text-zinc-500">Show on homepage</p>
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
              <p className="text-[11px] text-zinc-500">{formData.published ? 'Live on website' : 'Coming Soon'}</p>
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
              <span>{formData.published ? 'Published' : 'Coming Soon'}</span>
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

      {/* Form Action Controls */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => navigate('/admin/artists')}
          className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back</span>
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-vexo-red-bright to-vexo-red hover:from-red-500 hover:to-red-700 text-xs font-bold uppercase tracking-wider text-white shadow-xl shadow-red-950/80 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? 'Saving Artist...' : isEditing ? 'Update Artist' : 'Create Artist'}</span>
        </button>
      </div>
    </form>
  );
};

export default ArtistForm;
