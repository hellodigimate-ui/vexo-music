import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { EventForm, type EventFormData } from '../components/events/EventForm';
import { adminEventsApi, adminArtistsApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';

export const AdminEventFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useAdminToast();

  const [initialData, setInitialData] = useState<EventFormData | undefined>(undefined);
  const [allArtists, setAllArtists] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Fetch all signed artists for lineup selector
        const artistsRes = await adminArtistsApi.list();
        if (artistsRes.success && Array.isArray(artistsRes.data)) {
          setAllArtists(artistsRes.data);
        }

        if (id) {
          const eventRes = await adminEventsApi.getById(id);
          if (eventRes.success && eventRes.data) {
            const ev = eventRes.data;
            setInitialData({
              title: ev.title || '',
              slug: ev.slug || '',
              mainArtist: ev.mainArtist || '',
              date: ev.date || '',
              time: ev.time || '20:00 EST',
              venue: ev.venue || '',
              location: ev.location || '',
              city: ev.city || '',
              country: ev.country || '',
              ticketUrl: ev.ticketUrl || '',
              price: ev.price || 'Free Admission',
              status: ev.status || 'upcoming',
              imageUrl: ev.imageUrl || '',
              gallery: ev.gallery || [],
              description: ev.description || '',
              featured: Boolean(ev.featured),
              published: ev.published !== false,
              order: ev.order || 0,
              artistIds: ev.artistIds || [],
            });
          } else {
            toast.error('Event not found', `Could not find event with ID '${id}'`);
            navigate('/admin/events');
          }
        }
      } catch (err: any) {
        toast.error('Failed to load event', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate, toast]);

  const handleSubmit = async (formData: EventFormData) => {
    try {
      if (isEditing && id) {
        const res = await adminEventsApi.update(id, formData);
        if (res.success) {
          toast.success('Live Event Updated', `"${formData.title}" has been updated.`);
          navigate('/admin/events');
        }
      } else {
        const res = await adminEventsApi.create(formData);
        if (res.success) {
          toast.success('Live Event Scheduled', `"${formData.title}" scheduled on tour itinerary.`);
          navigate('/admin/events');
        }
      }
    } catch (err: any) {
      toast.error('Event Save Failed', err.message);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-8 h-8 text-vexo-red-bright animate-spin" />
        <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
          Loading Event Profile...
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
            onClick={() => navigate('/admin/events')}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-vexo-red-bright" />
              <span>{isEditing ? 'Edit Live Event' : 'Schedule Live Event'}</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isEditing
                ? `Updating event profile and artist lineup for: ${initialData?.title}`
                : 'Schedule a new live tour, arena show, festival, or album release concert'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Event Form Component */}
      <EventForm
        initialData={initialData}
        allArtists={allArtists}
        onSubmit={handleSubmit}
        isEditing={isEditing}
      />
    </div>
  );
};

export default AdminEventFormPage;
