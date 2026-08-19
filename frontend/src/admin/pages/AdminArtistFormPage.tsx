import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import { ArtistForm, type ArtistFormData } from '../components/artists/ArtistForm';
import { adminArtistsApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';

export const AdminArtistFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useAdminToast();

  const isEditing = Boolean(id);
  const [initialData, setInitialData] = useState<Partial<ArtistFormData> | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [artistName, setArtistName] = useState('');

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoadingData(true);

    adminArtistsApi
      .getById(id)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          const a = res.data;
          setArtistName(a.name);

          // Extract social links into dedicated fields
          let spotify = '';
          let youtube = '';
          let instagram = '';
          let facebook = '';
          let twitter = '';

          if (Array.isArray(a.socials)) {
            for (const s of a.socials) {
              if (s.platform === 'spotify') spotify = s.url;
              if (s.platform === 'youtube') youtube = s.url;
              if (s.platform === 'instagram') instagram = s.url;
              if (s.platform === 'facebook') facebook = s.url;
              if (s.platform === 'twitter' || s.platform === 'x') twitter = s.url;
            }
          }

          setInitialData({
            name: a.name,
            slug: a.slug || '',
            role: a.role || '',
            avatarUrl: a.avatarUrl || '',
            coverUrl: a.coverUrl || '',
            genres: Array.isArray(a.genres) ? a.genres.join(', ') : a.genres || '',
            bio: a.bio || '',
            monthlyListeners: a.monthlyListeners || 0,
            featured: Boolean(a.featured),
            published: a.isComingSoon !== undefined ? !a.isComingSoon : true,
            order: a.order || 0,
            spotifyUrl: spotify,
            youtubeUrl: youtube,
            instagramUrl: instagram,
            facebookUrl: facebook,
            xUrl: twitter,
          });
        } else {
          toast.error('Artist not found', `Could not find artist with ID "${id}".`);
          navigate('/admin/artists');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        toast.error('Failed to load artist', err.message);
        navigate('/admin/artists');
      })
      .finally(() => {
        if (isMounted) setIsLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleSubmit = async (formData: ArtistFormData) => {
    setIsSubmitting(true);
    try {
      // Build socials array
      const socials: Array<{ platform: string; url: string }> = [];
      if (formData.spotifyUrl.trim()) socials.push({ platform: 'spotify', url: formData.spotifyUrl.trim() });
      if (formData.youtubeUrl.trim()) socials.push({ platform: 'youtube', url: formData.youtubeUrl.trim() });
      if (formData.instagramUrl.trim()) socials.push({ platform: 'instagram', url: formData.instagramUrl.trim() });
      if (formData.facebookUrl.trim()) socials.push({ platform: 'facebook', url: formData.facebookUrl.trim() });
      if (formData.xUrl.trim()) socials.push({ platform: 'twitter', url: formData.xUrl.trim() });

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        role: formData.role.trim(),
        avatarUrl: formData.avatarUrl.trim(),
        coverUrl: formData.coverUrl.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        genres: formData.genres
          .split(',')
          .map((g) => g.trim())
          .filter(Boolean),
        monthlyListeners: Number(formData.monthlyListeners) || 0,
        featured: Boolean(formData.featured),
        isComingSoon: !formData.published,
        published: Boolean(formData.published),
        order: Number(formData.order) || 0,
        socials,
      };

      if (isEditing && id) {
        await adminArtistsApi.update(id, payload);
        toast.success('Artist updated', `"${payload.name}" updated successfully.`);
      } else {
        await adminArtistsApi.create(payload);
        toast.success('Artist signed', `"${payload.name}" added to the VEXO roster.`);
      }

      navigate('/admin/artists');
    } catch (err: any) {
      toast.error(isEditing ? 'Update failed' : 'Creation failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
            <Link to="/admin/artists" className="hover:text-vexo-red-bright transition-colors flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>Artists Roster</span>
            </Link>
            <span>/</span>
            <span className="text-zinc-300">{isEditing ? `Edit: ${artistName || id}` : 'New Artist'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-3">
            <span>{isEditing ? `Edit Artist: ${artistName}` : 'Add New Artist'}</span>
            <span className="text-xs font-mono font-normal normal-case px-2.5 py-1 rounded-full bg-vexo-red/15 text-vexo-red-bright border border-vexo-red/30">
              {isEditing ? 'CMS Editor' : 'CMS Creator'}
            </span>
          </h1>
          <p className="text-xs text-zinc-400">
            {isEditing
              ? 'Modify artist biographical details, social URLs, and platform visibility.'
              : 'Add a new recording artist, vocalist, or sound producer to the VEXO roster.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/artists')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Artists</span>
        </button>
      </div>

      {/* Main Content Area */}
      {isLoadingData ? (
        <div className="py-32 flex flex-col items-center justify-center gap-3 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin text-vexo-red-bright" />
          <p className="text-xs font-mono">LOADING ARTIST DOSSIER...</p>
        </div>
      ) : (
        <ArtistForm
          initialData={initialData}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default AdminArtistFormPage;
