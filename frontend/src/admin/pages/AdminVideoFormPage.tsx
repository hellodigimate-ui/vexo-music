import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Video, Loader2 } from 'lucide-react';
import { VideoForm, type VideoFormData } from '../components/videos/VideoForm';
import { adminVideosApi, adminArtistsApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';

export const AdminVideoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [initialData, setInitialData] = useState<VideoFormData | undefined>(undefined);
  const [allArtists, setAllArtists] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Fetch all signed artists for credit chips
        const artistsRes = await adminArtistsApi.list();
        if (artistsRes.success && Array.isArray(artistsRes.data)) {
          setAllArtists(artistsRes.data);
        }

        if (id) {
          const videoRes = await adminVideosApi.getById(id);
          if (videoRes.success && videoRes.data) {
            const vid = videoRes.data;
            setInitialData({
              title: vid.title || '',
              artist: vid.artist || '',
              youtubeId: vid.youtubeId || '',
              youtubeUrl: vid.youtubeUrl || (vid.youtubeId ? `https://youtube.com/watch?v=${vid.youtubeId}` : ''),
              thumbnailUrl: vid.thumbnailUrl || (vid.youtubeId ? `https://img.youtube.com/vi/${vid.youtubeId}/maxresdefault.jpg` : ''),
              duration: vid.duration || '04:00',
              views: vid.views || 0,
              publishedAt: vid.publishedAt || '',
              category: vid.category || 'Official Music Videos',
              featured: Boolean(vid.featured),
              published: vid.published !== false,
              description: vid.description || '',
              tags: Array.isArray(vid.tags) ? vid.tags.join(', ') : vid.tags || '',
              order: vid.order || 0,
            });
          } else {
            toast.error('Video not found', `Could not find video with ID '${id}'`);
            navigate('/admin/videos');
          }
        }
      } catch (err: any) {
        toast.error('Failed to load video', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate, toast]);

  const handleSubmit = async (formData: VideoFormData) => {
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        thumbnailUrl: formData.thumbnailUrl || `https://img.youtube.com/vi/${formData.youtubeId}/maxresdefault.jpg`,
      };

      if (isEditing && id) {
        const res = await adminVideosApi.update(id, payload);
        if (res.success) {
          toast.success('Video Updated', `"${formData.title}" has been updated.`);
          navigate('/admin/videos');
        }
      } else {
        const res = await adminVideosApi.create(payload);
        if (res.success) {
          toast.success('Video Published', `"${formData.title}" added to video library.`);
          navigate('/admin/videos');
        }
      }
    } catch (err: any) {
      toast.error('Video Save Failed', err.message);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-8 h-8 text-vexo-red-bright animate-spin" />
        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
          Loading Video Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/videos')}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Video className="w-6 h-6 text-vexo-red-bright" />
              <span>{isEditing ? 'Edit Video Content' : 'Publish Music Video'}</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isEditing
                ? `Updating stream settings and credits for: ${initialData?.title}`
                : 'Connect a new YouTube music video, live arena performance, visualizer, or behind-the-scenes'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Video Form Component */}
      <VideoForm
        initialData={initialData}
        allArtists={allArtists}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </div>
  );
};

export default AdminVideoFormPage;
