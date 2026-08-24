import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Music,
  Video,
  Users,
  Radio,
  TrendingUp,
  Sparkles,
  Camera,
  Disc3,
  Mic2,
  Headphones,
  Layers,
  Flame,
  Award,
  Heart,
  Shield,
  Globe,
  Zap,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Layers3,
} from 'lucide-react';
import { adminServicesApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { Modal } from '../components/Modal';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { MediaInput } from '../components/media/MediaInput';
import { Link } from 'react-router-dom';

// Preset icon definitions with modern labels
export const AVAILABLE_ICONS: { name: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'Music', label: 'Music', icon: Music },
  { name: 'Video', label: 'Video / Cinema', icon: Video },
  { name: 'Users', label: 'Talent / Management', icon: Users },
  { name: 'Radio', label: 'Distribution / DSP', icon: Radio },
  { name: 'TrendingUp', label: 'Marketing / Growth', icon: TrendingUp },
  { name: 'Sparkles', label: 'Brand / Collaboration', icon: Sparkles },
  { name: 'Camera', label: 'Shoot / Photography', icon: Camera },
  { name: 'Disc3', label: 'Disc / Vinyl', icon: Disc3 },
  { name: 'Mic2', label: 'Microphone / Vocals', icon: Mic2 },
  { name: 'Headphones', label: 'Audio / Headphones', icon: Headphones },
  { name: 'Layers', label: 'Layers / Architecture', icon: Layers },
  { name: 'Flame', label: 'Viral / Hot', icon: Flame },
  { name: 'Award', label: 'Award / Prestige', icon: Award },
  { name: 'Heart', label: 'Romance / Wedding', icon: Heart },
  { name: 'Shield', label: 'Security / Rights', icon: Shield },
  { name: 'Globe', label: 'Global / Worldwide', icon: Globe },
  { name: 'Zap', label: 'Energy / Electronic', icon: Zap },
  { name: 'Sliders', label: 'Console / Mixing', icon: Sliders },
];

export const getIconComponent = (iconName?: string) => {
  const match = AVAILABLE_ICONS.find((i) => i.name.toLowerCase() === (iconName || '').toLowerCase());
  return match ? match.icon : Music;
};

export const AdminServicesPage: React.FC = () => {
  const toast = useAdminToast();
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Styled Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'preview'>('details');

  const [formData, setFormData] = useState({
    number: '01',
    title: '',
    slug: '',
    icon: 'Music',
    category: 'STUDIO & COMPOSITION',
    shortDesc: '',
    fullDesc: '',
    imageUrl: '',
    features: '',
    ctaText: 'INITIATE PROJECT',
    pricingRange: '',
    order: 1,
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const res = await adminServicesApi.list();
      if (res.success && Array.isArray(res.data)) {
        const sorted = [...res.data].sort((a, b) => (a.order || 0) - (b.order || 0));
        setServices(sorted);
      }
    } catch (err: any) {
      toast.error('Failed to fetch services', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    const nextOrder = services.length + 1;
    const nextNum = nextOrder.toString().padStart(2, '0');
    setFormData({
      number: nextNum,
      title: '',
      slug: '',
      icon: 'Music',
      category: 'STUDIO & COMPOSITION',
      shortDesc: '',
      fullDesc: '',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      features: 'High-Fidelity Stereo Mastering\nAnalog Console Processing\nDolby Atmos Spatial Mix\nCommercial Radio Master Delivery',
      ctaText: 'INITIATE PROJECT',
      pricingRange: 'Starting from $1,200 / ₹95,000',
      order: nextOrder,
      isActive: true,
    });
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const openEditModal = (service: any) => {
    setEditingService(service);
    setFormData({
      number: service.number || (service.order ? (service.order < 10 ? `0${service.order}` : `${service.order}`) : '01'),
      title: service.title || '',
      slug: service.slug || service.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '',
      icon: service.icon || 'Music',
      category: service.category || 'STUDIO & COMPOSITION',
      shortDesc: service.shortDesc || '',
      fullDesc: service.fullDesc || service.shortDesc || '',
      imageUrl: service.imageUrl || '',
      features: Array.isArray(service.features)
        ? service.features.join('\n')
        : typeof service.features === 'string'
        ? service.features
        : '',
      ctaText: service.ctaText || 'INITIATE PROJECT',
      pricingRange: service.pricingRange || '',
      order: service.order || 1,
      isActive: service.isActive !== undefined ? Boolean(service.isActive) : true,
    });
    setActiveTab('details');
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Auto-update slug if it was previously matching or empty
    const currentSlugMatches =
      !formData.slug ||
      formData.slug ===
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

    setFormData({
      ...formData,
      title: val,
      slug: currentSlugMatches ? generatedSlug : formData.slug,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Validation Error', 'Service title is required.');
      return;
    }
    if (!formData.shortDesc.trim()) {
      toast.error('Validation Error', 'Short description is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const slug =
        formData.slug.trim() ||
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      const payload = {
        ...formData,
        slug,
        order: Number(formData.order) || 1,
        features: formData.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
      };

      if (editingService) {
        await adminServicesApi.update(editingService.id, payload);
        toast.success('Service updated', `"${payload.title}" updated successfully.`);
      } else {
        await adminServicesApi.create(payload);
        toast.success('Service launched', `"${payload.title}" added to service offerings.`);
      }

      setIsModalOpen(false);
      fetchServices();
    } catch (err: any) {
      toast.error('Service operation failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (service: any) => {
    const newStatus = !service.isActive;
    try {
      await adminServicesApi.togglePublish(service.id, newStatus);
      toast.success(
        newStatus ? 'Service Published' : 'Service Unpublished',
        `"${service.title}" is now ${newStatus ? 'live on public website' : 'saved as draft'}.`
      );
      // Optimistic update
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isActive: newStatus } : s))
      );
    } catch (err: any) {
      toast.error('Status update failed', err.message);
      fetchServices();
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (isReordering) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const newServices = [...services];
    const [moved] = newServices.splice(index, 1);
    newServices.splice(targetIndex, 0, moved);

    // Update order sequence
    const updatedWithOrder = newServices.map((s, idx) => ({
      ...s,
      order: idx + 1,
      number: (idx + 1).toString().padStart(2, '0'),
    }));

    setServices(updatedWithOrder);
    setIsReordering(true);

    try {
      const ids = updatedWithOrder.map((s) => s.id);
      await adminServicesApi.reorder(ids);
      toast.success('Services Reordered', `"${moved.title}" moved ${direction}.`);
    } catch (err: any) {
      toast.error('Reordering failed', err.message);
      fetchServices();
    } finally {
      setIsReordering(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminServicesApi.delete(deleteTarget.id);
      toast.info('Service removed', `Service "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchServices();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Services
  const filteredServices = services.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.title?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q) ||
      s.slug?.toLowerCase().includes(q) ||
      s.shortDesc?.toLowerCase().includes(q) ||
      s.number?.includes(q);

    if (!matchesSearch) return false;
    if (statusFilter === 'published') return s.isActive !== false;
    if (statusFilter === 'draft') return s.isActive === false;
    return true;
  });

  const publishedCount = services.filter((s) => s.isActive !== false).length;
  const draftCount = services.filter((s) => s.isActive === false).length;

  const SelectedIcon = getIconComponent(formData.icon);

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0e0e13] border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
              Total Services
            </p>
            <p className="text-2xl font-black text-white mt-1 font-mono">{services.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-vexo-red">
            <Layers3 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e13] border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
              Published Live
            </p>
            <p className="text-2xl font-black text-white mt-1 font-mono">{publishedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e13] border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase text-amber-400 font-semibold tracking-wider">
              Drafts / Inactive
            </p>
            <p className="text-2xl font-black text-white mt-1 font-mono">{draftCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-center text-amber-400">
            <EyeOff className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e13] border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
              Public Page
            </p>
            <Link
              to="/services"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-vexo-red hover:text-red-400 mt-2 transition-colors"
            >
              <span>View Live /services</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-900/40 flex items-center justify-center text-vexo-red">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Controls & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, slug, or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0e0e13] border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0e0e13] border border-zinc-800 shrink-0">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({services.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'published'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Live ({publishedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'draft'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Drafts ({draftCount})
            </button>
          </div>
        </div>

        {/* Add Service Button */}
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service Offering</span>
        </button>
      </div>

      {/* Services Table List */}
      <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="py-24 text-center text-xs font-mono text-zinc-500 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-vexo-red border-t-transparent rounded-full animate-spin" />
            <span>SYNCING SERVICES CMS...</span>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-500">
            <p className="font-semibold text-zinc-400 text-sm mb-1">No services found</p>
            <p>Try adjusting your search criteria or add a new service package.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121218] border-b border-zinc-800/80 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                <tr>
                  <th className="py-3.5 px-4 text-center w-16">Order</th>
                  <th className="py-3.5 px-6">Service & Details</th>
                  <th className="py-3.5 px-4">Icon & Slug</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredServices.map((service, index) => {
                  const IconComp = getIconComponent(service.icon);
                  const isFirst = index === 0;
                  const isLast = index === filteredServices.length - 1;

                  return (
                    <tr
                      key={service.id}
                      className={`hover:bg-zinc-900/50 transition-colors ${
                        !service.isActive ? 'opacity-65 hover:opacity-100' : ''
                      }`}
                    >
                      {/* Order Controls */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'up')}
                            disabled={isFirst || isReordering}
                            title="Move Up in sequence"
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 h-7 rounded-lg bg-zinc-800/80 border border-zinc-700/60 font-mono font-bold text-vexo-red flex items-center justify-center text-[11px]">
                            {service.order || index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'down')}
                            disabled={isLast || isReordering}
                            title="Move Down in sequence"
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Service & Image */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                            {service.imageUrl ? (
                              <img
                                src={service.imageUrl}
                                alt={service.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-[9px]">
                                NO IMG
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white text-xs truncate">{service.title}</p>
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                              {service.shortDesc}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Icon & Slug */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-vexo-red shrink-0">
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-mono text-[10px] text-zinc-300 block">
                              {service.icon || 'Music'}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500 block truncate max-w-[130px]">
                              /{service.slug || 'service'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 font-semibold text-zinc-300">
                        <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                          {service.category || 'Production'}
                        </span>
                      </td>

                      {/* Publish / Unpublish Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(service)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                            service.isActive
                              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
                              : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                          }`}
                          title={service.isActive ? 'Click to Unpublish' : 'Click to Publish Live'}
                        >
                          {service.isActive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Live</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/50"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({ id: service.id, title: service.title })
                            }
                            className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 transition-colors cursor-pointer border border-red-900/40"
                            title="Delete Service"
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
        )}
      </div>

      {/* Modal: Create & Edit Service */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? `Edit Service: ${editingService.title}` : 'Create Studio Service'}
        subtitle="Manage commercial service details, icon representation, pricing, and live website visibility."
        maxWidth="3xl"
      >
        {/* Tab switcher inside modal */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'details'
                  ? 'bg-vexo-red text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              Service Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public Live Card Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded accent-vexo-red w-4 h-4 cursor-pointer"
              />
              <span className={formData.isActive ? 'text-emerald-400 font-bold' : 'text-zinc-400'}>
                {formData.isActive ? 'PUBLISHED' : 'DRAFT'}
              </span>
            </label>
          </div>
        </div>

        {activeTab === 'details' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="space-y-1.5 md:col-span-7">
                <label className="text-xs font-mono font-medium text-zinc-300">
                  SERVICE TITLE *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Music Production"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-5">
                <label className="text-xs font-mono font-medium text-zinc-300">
                  URL SLUG *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="music-production"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:border-vexo-red focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            {/* Icon Picker Grid */}
            <div className="space-y-2 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-medium text-zinc-300 flex items-center gap-2">
                  <span>SELECT ICON REPRESENTATION:</span>
                  <span className="text-vexo-red font-bold">{formData.icon}</span>
                </label>
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-vexo-red">
                  <SelectedIcon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 pt-1">
                {AVAILABLE_ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected =
                    formData.icon.toLowerCase() === item.name.toLowerCase();

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: item.name })}
                      title={item.label}
                      className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-vexo-red/20 border-vexo-red text-vexo-red shadow-md shadow-red-950/40'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span className="text-[9px] font-mono truncate max-w-full">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category & Display Order */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono font-medium text-zinc-300">CATEGORY</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="STUDIO & COMPOSITION"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">
                  DISPLAY ORDER
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Banner Image URL */}
            <div>
              <MediaInput
                label="BANNER COVER IMAGE"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                placeholder="https://... (or select from Media Library)"
                allowedTypes={['image']}
                helperText="Primary high-resolution imagery displayed on service card and details"
                required
              />
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono font-medium text-zinc-300">
                  SHORT DESCRIPTION (FOR CARDS) *
                </label>
                <span className="text-[10px] font-mono text-zinc-500">
                  {formData.shortDesc.length} chars
                </span>
              </div>
              <input
                type="text"
                value={formData.shortDesc}
                onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                placeholder="Full-cycle commercial audio production from composition to stem delivery."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                required
              />
            </div>

            {/* Full Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-zinc-300">
                FULL EDITORIAL DESCRIPTION
              </label>
              <textarea
                rows={3}
                value={formData.fullDesc}
                onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                placeholder="High-fidelity sonic architecture. We build tracks from the ground up, blending analog warmth with cutting-edge digital precision..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Features (One per line) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-zinc-300">
                BULLET CAPABILITIES / FEATURES (ONE PER LINE)
              </label>
              <textarea
                rows={3}
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Original Beat Crafting & Composition&#10;Analog Synthesizer & Modular Gear&#10;Vocal Tracking & Stem Processing"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
              />
            </div>

            {/* CTA Text & Pricing Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">
                  CTA BUTTON TEXT
                </label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  placeholder="INITIATE PROJECT"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">
                  PRICING RANGE
                </label>
                <input
                  type="text"
                  value={formData.pricingRange}
                  onChange={(e) => setFormData({ ...formData, pricingRange: e.target.value })}
                  placeholder="Starting from $1,200 / ₹95,000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-950/60 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingService
                  ? 'Update Service'
                  : 'Create Service Offering'}
              </button>
            </div>
          </form>
        ) : (
          /* Live Card Preview */
          <div className="space-y-6 py-2">
            <div className="p-6 rounded-2xl bg-[#08080c] border border-zinc-800 text-white relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-mono font-black text-neutral-600">
                      {formData.order < 10 ? `0${formData.order}` : formData.order}
                    </span>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vexo-red/15 text-vexo-red border border-vexo-red/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                      <SelectedIcon className="w-3.5 h-3.5" />
                      <span>{formData.category || 'Production'}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
                    {formData.title || 'Service Title Preview'}
                  </h3>

                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                    {formData.fullDesc || formData.shortDesc || 'No description entered yet.'}
                  </p>

                  {formData.features && (
                    <div className="space-y-1.5 pt-2">
                      {formData.features
                        .split('\n')
                        .slice(0, 3)
                        .map((f, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs font-mono text-zinc-300"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-vexo-red shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      className="px-6 py-3 rounded-sm bg-gradient-to-r from-[#FF4D4D] to-[#E00000] text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"
                    >
                      <span>{formData.ctaText || 'INITIATE PROJECT'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-5">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden border border-zinc-700/60 bg-neutral-900">
                    <img
                      src={
                        formData.imageUrl ||
                        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                Back to Form Editor
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Styled Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Studio Service"
        itemName={deleteTarget?.title}
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? It will immediately be removed from the public website and client booking inquiries.`}
        confirmText="Delete Service"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
