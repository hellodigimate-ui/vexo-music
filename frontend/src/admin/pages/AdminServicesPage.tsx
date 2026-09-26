import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
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
  HelpCircle,
  FileCheck,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import { adminServicesApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { Modal } from '../components/Modal';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { MediaInput } from '../components/media/MediaInput';
import { mockServicesList } from '../../data/services';
import type { ServicePlan, ServiceProcessStep } from '../../types/service';
import { getMediaUrl } from '../../lib/utils';

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

interface PlanFormState {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  priceUSD: string;
  priceINR: string;
  duration: string;
  revisions: string;
  isPopular: boolean;
  features: string;
  deliverables: string;
  ctaText: string;
}

const DEFAULT_PLANS: PlanFormState[] = [
  {
    id: 'plan-1',
    name: 'Starter / Essential',
    badge: 'ESSENTIAL',
    tagline: 'Ideal for independent artists seeking foundational production.',
    priceUSD: '$450',
    priceINR: '₹35,000',
    duration: '',
    revisions: '3 Free Revisions Included',
    isPopular: false,
    features: 'Vocal Tuning & Stem Alignment\nStereo Stem Mixdown\n24-bit 96kHz Radio Master\nStandard Streaming Target',
    deliverables: 'Master WAV\nMaster MP3\nInstrumental Track',
    ctaText: 'BOOK STARTER',
  },
  {
    id: 'plan-2',
    name: 'Commercial Standard Single',
    badge: 'MOST POPULAR',
    tagline: 'Full analog SSL tracking, custom arrangement, and Dolby Atmos.',
    priceUSD: '$1,200',
    priceINR: '₹95,000',
    duration: '',
    revisions: 'Unlimited Mix Revisions',
    isPopular: true,
    features: 'Custom Beat Composition\nAnalog SSL 4000E Console Mixdown\nDolby Atmos Spatial Master\nFull Multi-track Stems Archive\nDedicated Producer Support',
    deliverables: 'Master Stereo WAV\nDolby Atmos ADM BWF\nFull Stems Archive\nInstrumental & Acapella',
    ctaText: 'BOOK COMMERCIAL',
  },
  {
    id: 'plan-3',
    name: 'Studio Master / Full EP',
    badge: 'FLAGSHIP',
    tagline: 'Comprehensive multi-track executive production with VIP priority.',
    priceUSD: '$3,500',
    priceINR: '₹2,80,000',
    duration: '',
    revisions: 'VIP Priority Unlimited',
    isPopular: false,
    features: 'Up to 5 Tracks Written & Produced\nLive Session Musicians\nNeve & Telefunken Outboard Chain\nDolby Atmos Spatial for All Tracks\nVinyl DDP & Broadcast Sync Licensing',
    deliverables: 'Complete Album Multi-Tracks\nDolby Atmos Master Suite\nVinyl Master Files\n100% Commercial Rights Certificate',
    ctaText: 'BOOK STUDIO EP',
  },
];

const DEFAULT_STEPS: ServiceProcessStep[] = [
  { step: '01', title: 'Creative Brief & Concept', desc: 'Discovery session to map out sonic vibe, references, and milestones.' },
  { step: '02', title: 'Tracking & Composition', desc: 'Arranging hooks, beats, instrumentation, and tracking vocal stems.' },
  { step: '03', title: 'Stem Mixing & Processing', desc: 'Routing audio through analog gear, hardware EQs, and spatial summing.' },
  { step: '04', title: 'Dolby Atmos & Master Release', desc: 'Final loudness mastering and delivering pristine broadcast assets.' },
];

export const AdminServicesPage: React.FC = () => {
  const toast = useAdminToast();
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [viewPreference, setViewPreference] = useState<'auto' | 'cards' | 'table'>('auto');

  // Styled Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'plans' | 'process' | 'specs' | 'faqs' | 'preview'>('details');
  const [activePlanTab, setActivePlanTab] = useState<number>(0);

  // Comprehensive Form State
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
    plans: DEFAULT_PLANS,
    processSteps: DEFAULT_STEPS,
    specs: 'Solid State Logic 4000E Analog Console\nNeve 1073 Preamps & Pultec EQs\nTelefunken U47 Tube Microphone\nGenelec 8351B SAM Spatial Monitors\nDolby Atmos Certified 7.1.4 Suite',
    deliverables: '24-bit 96kHz Master WAV\nDolby Atmos ADM BWF Master\nFull Multi-Track Stems Archive\nInstrumental, Acapella & TV Mixes\n100% Commercial Master Rights Certificate',
    faqs: [
      { q: 'Do I retain 100% of my master rights?', a: 'Yes. You receive full commercial ownership and all master rights upon final delivery.' },
      { q: 'Can I record in-person or remotely?', a: 'Both! You can visit our Jaipur studio or collaborate live via high-resolution remote streaming.' },
      { q: 'How are revisions handled?', a: 'We provide structured revision rounds until you are completely satisfied with the result.' },
    ],
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
      pricingRange: 'Starting from $450 / ₹35,000',
      order: nextOrder,
      isActive: true,
      plans: DEFAULT_PLANS,
      processSteps: DEFAULT_STEPS,
      specs: 'Solid State Logic 4000E Analog Console\nNeve 1073 Preamps\nDolby Atmos 7.1.4 Monitoring',
      deliverables: 'Master WAV (24-bit)\nMulti-Track Stems\nCommercial Rights Certificate',
      faqs: [
        { q: 'Do I retain 100% of my master rights?', a: 'Yes, you keep 100% of master royalties and rights.' },
      ],
    });
    setActiveTab('details');
    setActivePlanTab(0);
    setIsModalOpen(true);
  };

  const openEditModal = (service: any) => {
    setEditingService(service);

    // Check mockServicesList for rich defaults if editing a service without plans
    const fallback = mockServicesList.find(
      (m) =>
        m.id === service.id ||
        m.slug === service.slug ||
        m.title?.toLowerCase() === service.title?.toLowerCase()
    );

    // Map plans to form state
    const rawPlans = (service.plans && service.plans.length > 0)
      ? service.plans
      : (fallback?.plans || DEFAULT_PLANS);

    const mappedPlans: PlanFormState[] = rawPlans.map((p: any, idx: number) => ({
      id: p.id || `plan-${idx + 1}`,
      name: p.name || `Plan ${idx + 1}`,
      badge: p.badge || (idx === 1 ? 'MOST POPULAR' : idx === 2 ? 'FLAGSHIP' : 'ESSENTIAL'),
      tagline: p.tagline || '',
      priceUSD: p.priceUSD || '$500',
      priceINR: p.priceINR || '₹40,000',
      duration: p.duration || '',
      revisions: p.revisions || '3 Revisions Included',
      isPopular: Boolean(p.isPopular),
      features: Array.isArray(p.features) ? p.features.join('\n') : (p.features || ''),
      deliverables: Array.isArray(p.deliverables) ? p.deliverables.join('\n') : (p.deliverables || ''),
      ctaText: p.ctaText || 'SELECT PLAN',
    }));

    // Map process steps
    const rawSteps = (service.processSteps && service.processSteps.length > 0)
      ? service.processSteps
      : (fallback?.processSteps || DEFAULT_STEPS);

    // Map specs
    const rawSpecs = Array.isArray(service.specs)
      ? service.specs.join('\n')
      : (service.specifications && Array.isArray(service.specifications))
      ? service.specifications.join('\n')
      : (fallback?.specs ? fallback.specs.join('\n') : '');

    // Map deliverables
    const rawDeliverables = Array.isArray(service.deliverables)
      ? service.deliverables.join('\n')
      : (fallback?.deliverables ? fallback.deliverables.join('\n') : '');

    // Map FAQs
    const rawFaqs = (service.faqs && service.faqs.length > 0)
      ? service.faqs
      : (fallback?.faqs || [
          { q: 'Do I retain 100% of my master rights?', a: 'Yes, full commercial ownership.' },
        ]);

    setFormData({
      number: service.number || (service.order ? (service.order < 10 ? `0${service.order}` : `${service.order}`) : '01'),
      title: service.title || '',
      slug: service.slug || service.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '',
      icon: service.icon || fallback?.icon || 'Music',
      category: service.category || fallback?.category || 'STUDIO & COMPOSITION',
      shortDesc: service.shortDesc || fallback?.shortDesc || '',
      fullDesc: service.fullDesc || fallback?.fullDesc || service.shortDesc || '',
      imageUrl: service.imageUrl || fallback?.imageUrl || '',
      features: Array.isArray(service.features)
        ? service.features.join('\n')
        : typeof service.features === 'string'
        ? service.features
        : (fallback?.features ? fallback.features.join('\n') : ''),
      ctaText: service.ctaText || fallback?.ctaText || 'INITIATE PROJECT',
      pricingRange: service.pricingRange || fallback?.pricingRange || '',
      order: service.order || 1,
      isActive: service.isActive !== undefined ? Boolean(service.isActive) : true,
      plans: mappedPlans,
      processSteps: rawSteps,
      specs: rawSpecs,
      deliverables: rawDeliverables,
      faqs: rawFaqs,
    });

    setActiveTab('details');
    setActivePlanTab(0);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

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

  // Plan field updater helper
  const handleUpdatePlan = (index: number, field: keyof PlanFormState, value: any) => {
    setFormData((prev) => {
      const updatedPlans = [...prev.plans];
      if (field === 'isPopular' && value === true) {
        // Only one plan can be most popular
        updatedPlans.forEach((p, idx) => {
          p.isPopular = idx === index;
        });
      } else {
        updatedPlans[index] = { ...updatedPlans[index], [field]: value };
      }
      return { ...prev, plans: updatedPlans };
    });
  };

  // Process Step updater helper
  const handleUpdateStep = (index: number, field: keyof ServiceProcessStep, value: string) => {
    setFormData((prev) => {
      const updatedSteps = [...prev.processSteps];
      updatedSteps[index] = { ...updatedSteps[index], [field]: value };
      return { ...prev, processSteps: updatedSteps };
    });
  };

  // FAQ updater helper
  const handleUpdateFaq = (index: number, field: 'q' | 'a', value: string) => {
    setFormData((prev) => {
      const updatedFaqs = [...prev.faqs];
      updatedFaqs[index] = { ...updatedFaqs[index], [field]: value };
      return { ...prev, faqs: updatedFaqs };
    });
  };

  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { q: 'New Question?', a: 'Detailed answer explanation here.' }],
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, idx) => idx !== index),
    }));
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

      // Format plans
      const formattedPlans: ServicePlan[] = formData.plans.map((p, idx) => ({
        id: p.id || `plan-${idx + 1}`,
        name: p.name.trim() || `Plan ${idx + 1}`,
        badge: p.badge.trim() || undefined,
        tagline: p.tagline.trim(),
        priceUSD: p.priceUSD.trim(),
        priceINR: p.priceINR.trim(),
        duration: p.duration.trim() || undefined,
        revisions: p.revisions.trim() || undefined,
        isPopular: Boolean(p.isPopular),
        features: p.features.split('\n').map((f) => f.trim()).filter(Boolean),
        deliverables: p.deliverables.split('\n').map((d) => d.trim()).filter(Boolean),
        ctaText: p.ctaText.trim() || undefined,
      }));

      // Format specs & deliverables
      const formattedSpecs = formData.specs.split('\n').map((s) => s.trim()).filter(Boolean);
      const formattedDeliverables = formData.deliverables.split('\n').map((d) => d.trim()).filter(Boolean);

      const payload = {
        ...formData,
        slug,
        order: Number(formData.order) || 1,
        features: formData.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        plans: formattedPlans,
        specs: formattedSpecs,
        specifications: formattedSpecs,
        processSteps: formData.processSteps,
        deliverables: formattedDeliverables,
        faqs: formData.faqs.filter((f) => f.q.trim() && f.a.trim()),
      };

      if (editingService) {
        await adminServicesApi.update(editingService.id, payload);
        toast.success('Service updated', `"${payload.title}" and its 3 pricing plans saved successfully.`);
      } else {
        await adminServicesApi.create(payload);
        toast.success('Service launched', `"${payload.title}" added with 3 pricing tiers.`);
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
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, isActive: newStatus } : s))
      );
    } catch (err: any) {
      toast.error('Toggle Failed', err.message);
    }
  };

  const handleMove = async (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const newServices = [...services];
    const temp = newServices[currentIndex];
    newServices[currentIndex] = newServices[targetIndex];
    newServices[targetIndex] = temp;

    // Update order numbers
    newServices.forEach((s, idx) => {
      s.order = idx + 1;
      s.number = (idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`);
    });

    setServices(newServices);
    setIsReordering(true);

    try {
      await adminServicesApi.reorder(newServices.map((s) => s.id));
      toast.success('Reordered', 'Services order updated.');
    } catch (err: any) {
      toast.error('Reorder Failed', err.message);
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
      toast.success('Service Removed', `"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
      fetchServices();
    } catch (err: any) {
      toast.error('Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.slug && s.slug.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'published') return matchesSearch && s.isActive;
    if (statusFilter === 'draft') return matchesSearch && !s.isActive;
    return matchesSearch;
  });

  const SelectedIcon = getIconComponent(formData.icon);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Studio Services & Pricing CMS</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Manage your service capabilities, edit 3 pricing plans per service, tech specs, and production roadmaps.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-vexo-red hover:bg-[#c50000] active:scale-[0.98] text-xs font-bold font-mono uppercase tracking-wider text-white shadow-xs hover:shadow-md hover:shadow-red-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Studio Service</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900/70 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, slug, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/80 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-vexo-red focus:ring-1 focus:ring-vexo-red"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-slate-200 text-slate-900 border border-slate-300 shadow-2xs font-bold dark:bg-zinc-800 dark:text-white dark:border-zinc-600'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              All ({services.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'published'
                  ? 'bg-slate-200 text-slate-900 border border-slate-300 shadow-2xs font-bold dark:bg-zinc-800 dark:text-white dark:border-zinc-600'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              Live ({services.filter((s) => s.isActive).length})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === 'draft'
                  ? 'bg-slate-200 text-slate-900 border border-slate-300 shadow-2xs font-bold dark:bg-zinc-800 dark:text-white dark:border-zinc-600'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              Drafts ({services.filter((s) => !s.isActive).length})
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-slate-200 dark:border-zinc-700/60 shrink-0 ml-auto sm:ml-2">
            <button
              type="button"
              onClick={() => setViewPreference(viewPreference === 'cards' ? 'auto' : 'cards')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewPreference === 'cards'
                  ? 'bg-white dark:bg-zinc-700 text-vexo-red shadow-xs font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewPreference(viewPreference === 'table' ? 'auto' : 'table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewPreference === 'table'
                  ? 'bg-white dark:bg-zinc-700 text-vexo-red shadow-xs font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="w-full max-w-full min-w-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c10] overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-16 text-center text-xs sm:text-sm font-mono text-slate-500 dark:text-zinc-400">
            LOADING SERVICES...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-14 text-center text-xs sm:text-sm font-mono text-slate-500 dark:text-zinc-400">
            No services found matching current filters.
          </div>
        ) : (
          <>
            {/* 1. Mobile & Tablet Cards View (shown on mobile/tablet <lg when auto, or forced when viewPreference is 'cards') */}
            {(viewPreference === 'cards' || viewPreference === 'auto') && (
              <div className={`divide-y divide-slate-100 dark:divide-zinc-800/70 ${viewPreference === 'auto' ? 'block lg:hidden' : 'block'}`}>
                {filteredServices.map((service, index) => {
                  const IconComp = getIconComponent(service.icon);
                  const isFirst = index === 0;
                  const isLast = index === filteredServices.length - 1;

                  return (
                    <div key={service.id} className="p-4 space-y-3.5 hover:bg-slate-50/60 dark:hover:bg-zinc-900/30 transition-colors">
                      {/* Top Row: Sequence reorder + Category pill + Live/Draft status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'up')}
                            disabled={isFirst || isReordering}
                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-300">
                            #{service.number || (index + 1 < 10 ? `0${index + 1}` : index + 1)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'down')}
                            disabled={isLast || isReordering}
                            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[10px] uppercase font-mono font-semibold text-slate-700 dark:text-zinc-300 truncate max-w-[150px]">
                          {service.category || 'Production'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleTogglePublish(service)}
                          className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            service.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-200 dark:border-emerald-600/70 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          {service.isActive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
                              <span>Live</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500 shrink-0" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Middle: Thumbnail + Title + Badge + Overview */}
                      <div className="flex items-start gap-3.5">
                        <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 shrink-0 shadow-xs">
                          {service.imageUrl ? (
                            <img src={getMediaUrl(service.imageUrl)} alt={service.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-500 font-mono text-[10px]">
                              NO IMG
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <IconComp className="w-4 h-4 text-vexo-red shrink-0" />
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                              {service.title}
                            </h3>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 dark:bg-red-500/15 text-vexo-red border border-red-200 dark:border-red-500/30 shrink-0">
                              3 PLANS
                            </span>
                          </div>
                          {service.shortDesc && (
                            <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                              {service.shortDesc}
                            </p>
                          )}
                          <div className="mt-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-400">Pricing:</span>
                            <span className="text-slate-900 dark:text-white font-bold">{service.pricingRange || 'Tiered Milestone Pricing'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom: Action buttons */}
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800/60">
                        <button
                          onClick={() => openEditModal(service)}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:hover:bg-vexo-red dark:text-zinc-200 dark:hover:text-white transition-all text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-zinc-700 shadow-2xs cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Service & 3 Plans</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: service.id, title: service.title })}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 dark:bg-zinc-800 dark:hover:bg-red-950 dark:text-zinc-400 dark:hover:text-red-400 transition-colors shadow-2xs cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Desktop Table View (shown on lg+ when auto, or forced when viewPreference is 'table') */}
            {(viewPreference === 'table' || viewPreference === 'auto') && (
              <div className={`w-full max-w-full overflow-x-auto scrollbar-thin ${viewPreference === 'auto' ? 'hidden lg:block' : 'block'}`}>
                <table className="w-full min-w-[760px] text-left text-xs sm:text-sm text-slate-800 dark:text-zinc-200">
                  <thead className="bg-slate-50 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-3 w-14 text-center">Seq</th>
                      <th className="py-3 px-4 min-w-[220px]">Capability & Cover</th>
                      <th className="py-3 px-3 min-w-[110px]">Category</th>
                      <th className="py-3 px-4 min-w-[150px]">3 Plans Pricing</th>
                      <th className="py-3 px-3 text-center min-w-[90px]">Status</th>
                      <th className="py-3 px-4 text-right min-w-[130px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70 font-sans">
                    {filteredServices.map((service, index) => {
                      const IconComp = getIconComponent(service.icon);
                      const isFirst = index === 0;
                      const isLast = index === filteredServices.length - 1;

                      return (
                        <tr key={service.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                          {/* Reorder Buttons */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleMove(index, 'up')}
                                disabled={isFirst || isReordering}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono text-xs font-bold text-slate-700 dark:text-zinc-400">
                                {service.number || (index + 1 < 10 ? `0${index + 1}` : index + 1)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleMove(index, 'down')}
                                disabled={isLast || isReordering}
                                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Service Info */}
                          <td className="py-3.5 px-4 min-w-[220px]">
                            <div className="flex items-center gap-3.5">
                              <div className="relative w-16 h-11 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700/80 bg-slate-100 dark:bg-zinc-900 shrink-0 shadow-xs">
                                {service.imageUrl ? (
                                  <img src={getMediaUrl(service.imageUrl)} alt={service.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-zinc-500 font-mono text-[10px]">
                                    NO IMG
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <IconComp className="w-4 h-4 text-vexo-red shrink-0" />
                                  <span className="font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">{service.title}</span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 dark:bg-red-500/15 text-vexo-red border border-red-200 dark:border-red-500/30 shrink-0">
                                    3 PLANS
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5 leading-normal">
                                  {service.shortDesc}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-3 font-mono text-xs min-w-[110px]">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700/70 text-[11px] uppercase font-semibold text-slate-700 dark:text-zinc-200 whitespace-nowrap shadow-xs">
                              {service.category || 'Production'}
                            </span>
                          </td>

                          {/* Pricing Range */}
                          <td className="py-3.5 px-4 min-w-[150px]">
                            <div className="flex flex-col whitespace-nowrap">
                              <span className="text-slate-900 dark:text-white text-sm font-bold tracking-tight">
                                {service.pricingRange || 'Tiered Milestone Pricing'}
                              </span>
                              <span className="text-[11px] text-slate-400 dark:text-zinc-400 font-mono mt-1">
                                Tiered Pricing Active
                              </span>
                            </div>
                          </td>

                          {/* Status Toggle */}
                          <td className="py-3.5 px-3 text-center min-w-[90px]">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(service)}
                              className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap shrink-0 min-w-[76px] shadow-xs ${
                                service.isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-200 dark:border-emerald-600/70 text-emerald-700 dark:text-emerald-300 hover:border-emerald-300'
                                  : 'bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:border-slate-300'
                              }`}
                            >
                              {service.isActive ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse shrink-0" />
                                  <span>Live</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500 shrink-0" />
                                  <span>Draft</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right min-w-[130px]">
                            <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                              <button
                                onClick={() => openEditModal(service)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-vexo-red dark:text-zinc-200 dark:hover:text-white transition-all cursor-pointer dark:border-zinc-700 hover:border-slate-300 dark:hover:border-red-600 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                                title="Edit Service & 3 Plans"
                              >
                                <Edit2 className="w-3.5 h-3.5 shrink-0" />
                                <span>Edit Plans</span>
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ id: service.id, title: service.title })}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 dark:bg-zinc-800 dark:hover:bg-red-950 dark:text-zinc-400 dark:hover:text-red-400 transition-colors cursor-pointer dark:border-zinc-700/60 shadow-2xs"
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
          </>
        )}
      </div>

      {/* COMPREHENSIVE EDIT / CREATE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? `Edit Service & 3 Plans: ${editingService.title}` : 'Create Studio Service'}
        subtitle="Manage service capabilities, three distinct pricing plans, technical specifications, and production roadmaps."
        maxWidth="6xl"
      >
        {/* Navigation Tabs Inside Modal */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4 mb-6 gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'details'
                  ? 'bg-vexo-red text-white shadow-md shadow-red-500/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>1. General Info</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'plans'
                  ? 'bg-vexo-red text-white shadow-md shadow-red-500/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>2. 3 Pricing Plans</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('process')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'process'
                  ? 'bg-vexo-red text-white shadow-md shadow-red-500/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>3. Roadmap</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'specs'
                  ? 'bg-vexo-red text-white shadow-md shadow-red-500/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>4. Specs & Assets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('faqs')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'faqs'
                  ? 'bg-vexo-red text-white shadow-md shadow-red-500/25'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>5. FAQs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'bg-slate-200 text-slate-900 border border-slate-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-600'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white dark:border-zinc-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Live Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 text-sm font-mono text-zinc-200 cursor-pointer bg-zinc-900/80 px-3.5 py-2 rounded-xl border border-zinc-800">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded accent-vexo-red w-4 h-4 cursor-pointer"
              />
              <span className={formData.isActive ? 'text-emerald-400 font-bold' : 'text-zinc-400 font-semibold'}>
                {formData.isActive ? 'PUBLISHED LIVE' : 'SAVED AS DRAFT'}
              </span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB 1: GENERAL INFO */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="space-y-2 md:col-span-7">
                  <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">SERVICE TITLE *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Music Production"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-5">
                  <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">URL SLUG *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="music-production"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-zinc-200 focus:border-vexo-red focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              {/* Icon Picker Grid */}
              <div className="space-y-2.5 p-4 rounded-xl bg-zinc-900/80 border border-zinc-700/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200 flex items-center gap-2">
                    <span>ICON IDENTITY:</span>
                    <span className="text-vexo-red">{formData.icon}</span>
                  </label>
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-vexo-red">
                    <SelectedIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 pt-1">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = formData.icon.toLowerCase() === item.name.toLowerCase();

                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: item.name })}
                        className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-vexo-red/20 border-vexo-red text-vexo-red shadow-md'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span className="text-[10px] font-mono truncate max-w-full font-semibold">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category, Sequence Number & Display Order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">CATEGORY BADGE</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="STUDIO & COMPOSITION"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">DISPLAY ORDER (NUMERIC)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">NUMBER LABEL (e.g. 01)</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="01"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Banner Image URL */}
              <MediaInput
                label="HERO COVER IMAGE URL"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                placeholder="https://... (or choose from Media Library)"
                allowedTypes={['image']}
                required
              />

              {/* Short Description */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">
                  SHORT OVERVIEW (FOR SUMMARY CARDS) *
                </label>
                <input
                  type="text"
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  placeholder="Full-cycle commercial audio production from composition to stem delivery."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none"
                  required
                />
              </div>

              {/* Full Editorial Description */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">
                  FULL EDITORIAL DESCRIPTION
                </label>
                <textarea
                  rows={3}
                  value={formData.fullDesc}
                  onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                  placeholder="High-fidelity sonic architecture. We build tracks from the ground up..."
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Pricing Range String & CTA text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">
                    PRICING RANGE LABEL (PUBLIC CARD DISPLAY)
                  </label>
                  <input
                    type="text"
                    value={formData.pricingRange}
                    onChange={(e) => setFormData({ ...formData, pricingRange: e.target.value })}
                    placeholder="Starting from $450 / ₹35,000"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">
                    CARD CTA BUTTON LABEL
                  </label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="INITIATE PROJECT"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3 PRICING PLANS */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-700/80">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-vexo-red" />
                    <span>3 Tailored Pricing Tiers</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Customize the pricing, turnaround, revisions, deliverables, and features for each plan.
                  </p>
                </div>

                {/* Plan Switcher Pills */}
                <div className="flex items-center gap-2">
                  {formData.plans.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePlanTab(idx)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer ${
                        activePlanTab === idx
                          ? 'bg-vexo-red text-white shadow-md shadow-red-950/40'
                          : 'bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700'
                      }`}
                    >
                      Plan {idx + 1}: {p.name || `Tier ${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Plan Editor Form */}
              {formData.plans[activePlanTab] && (
                <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-700/80 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono font-black text-vexo-red">
                        0{activePlanTab + 1}
                      </span>
                      <span className="text-base font-bold text-white uppercase">
                        Editing: {formData.plans[activePlanTab].name}
                      </span>
                    </div>

                    <label className="flex items-center gap-2.5 text-sm font-mono cursor-pointer px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80">
                      <input
                        type="checkbox"
                        checked={formData.plans[activePlanTab].isPopular}
                        onChange={(e) => handleUpdatePlan(activePlanTab, 'isPopular', e.target.checked)}
                        className="rounded accent-vexo-red w-4 h-4 cursor-pointer"
                      />
                      <span className={formData.plans[activePlanTab].isPopular ? 'text-vexo-red font-bold' : 'text-zinc-300 font-semibold'}>
                        ★ Mark as "Recommended / Most Popular"
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">PLAN NAME *</label>
                      <input
                        type="text"
                        value={formData.plans[activePlanTab].name}
                        onChange={(e) => handleUpdatePlan(activePlanTab, 'name', e.target.value)}
                        placeholder="e.g. Commercial Master Single"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">TIER BADGE</label>
                      <input
                        type="text"
                        value={formData.plans[activePlanTab].badge}
                        onChange={(e) => handleUpdatePlan(activePlanTab, 'badge', e.target.value)}
                        placeholder="e.g. MOST POPULAR, ESSENTIAL, FLAGSHIP"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Dual Currency Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-xl bg-black/50 border border-zinc-700/80">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                        <span>PRICE IN INR (₹) *</span>
                      </label>
                      <input
                        type="text"
                        value={formData.plans[activePlanTab].priceINR}
                        onChange={(e) => handleUpdatePlan(activePlanTab, 'priceINR', e.target.value)}
                        placeholder="₹95,000"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-base font-mono font-bold text-white focus:border-vexo-red focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-mono font-bold text-blue-400 flex items-center gap-1.5">
                        <span>PRICE IN USD ($) *</span>
                      </label>
                      <input
                        type="text"
                        value={formData.plans[activePlanTab].priceUSD}
                        onChange={(e) => handleUpdatePlan(activePlanTab, 'priceUSD', e.target.value)}
                        placeholder="$1,200"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-base font-mono font-bold text-white focus:border-vexo-red focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Turnaround & Revisions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">TURNAROUND TIMELINE</label>
                      <input
                        type="text"
                        value={formData.plans[activePlanTab].duration}
                        onChange={(e) => handleUpdatePlan(activePlanTab, 'duration', e.target.value)}
                        placeholder="5–7 Days Turnaround"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">REVISIONS INCLUDED</label>
                      <input
                        type="text"
                        value={formData.plans[activePlanTab].revisions}
                        onChange={(e) => handleUpdatePlan(activePlanTab, 'revisions', e.target.value)}
                        placeholder="Unlimited Mix Revisions"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">BUTTON CTA TEXT</label>
                      <input
                        type="text"
                        value={formData.plans[activePlanTab].ctaText}
                        onChange={(e) => handleUpdatePlan(activePlanTab, 'ctaText', e.target.value)}
                        placeholder="BOOK COMMERCIAL"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Tagline */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">PLAN TAGLINE / SUMMARY</label>
                    <input
                      type="text"
                      value={formData.plans[activePlanTab].tagline}
                      onChange={(e) => handleUpdatePlan(activePlanTab, 'tagline', e.target.value)}
                      placeholder="Full-scale custom arrangement, live analog instruments, SSL console mix..."
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none"
                    />
                  </div>

                  {/* Features List (One per line) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">
                        WHAT'S INCLUDED IN THIS PLAN (ONE PER LINE) *
                      </label>
                      <span className="text-xs font-mono text-zinc-400">
                        {formData.plans[activePlanTab].features.split('\n').filter(Boolean).length} features
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={formData.plans[activePlanTab].features}
                      onChange={(e) => handleUpdatePlan(activePlanTab, 'features', e.target.value)}
                      placeholder="Vocal Pitch Correction & Tuning&#10;Full Multi-track Stems Mixdown&#10;Dolby Atmos Spatial Master&#10;Streaming Loudness Target"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none font-mono leading-relaxed"
                      required
                    />
                  </div>

                  {/* Deliverables for this plan */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">
                      DELIVERABLES HANDED OVER (ONE PER LINE)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.plans[activePlanTab].deliverables}
                      onChange={(e) => handleUpdatePlan(activePlanTab, 'deliverables', e.target.value)}
                      placeholder="Master Stereo WAV&#10;Dolby Atmos ADM File&#10;Multi-Track Stems Archive"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none font-mono leading-relaxed"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WORKFLOW ROADMAP */}
          {activeTab === 'process' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-700/80">
                <h3 className="text-base font-bold uppercase tracking-wider text-white">
                  4-Stage Production Roadmap
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Define the step-by-step methodology displayed on the service details modal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {formData.processSteps.map((step, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-700/80 space-y-3.5">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center font-mono font-black text-base text-vexo-red shrink-0">
                        {step.step || `0${idx + 1}`}
                      </span>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                        placeholder={`Stage 0${idx + 1} Title`}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm font-bold text-white focus:border-vexo-red focus:outline-none"
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={step.desc}
                      onChange={(e) => handleUpdateStep(idx, 'desc', e.target.value)}
                      placeholder="Brief description of what occurs during this production phase..."
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-zinc-300 focus:border-vexo-red focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TECH SPECS & ASSETS */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">
                  STUDIO ARSENAL & HARDWARE SPECIFICATIONS (ONE PER LINE)
                </label>
                <textarea
                  rows={6}
                  value={formData.specs}
                  onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                  placeholder="Solid State Logic 4000E Analog Console&#10;Neve 1073 Preamps&#10;Telefunken U47 Tube Microphone&#10;Genelec 8351B SAM Spatial Monitors"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none font-mono leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-mono font-bold text-zinc-200">
                  GENERAL HANDOVER ASSETS / DELIVERABLES (ONE PER LINE)
                </label>
                <textarea
                  rows={5}
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  placeholder="24-bit 96kHz Master WAV&#10;Dolby Atmos ADM BWF Master&#10;Full Stems Archive&#10;Commercial Master Rights Certificate"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-white focus:border-vexo-red focus:outline-none font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 5: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-white">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                    Add specific answers for clients booking this service.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs sm:text-sm font-mono font-bold text-white flex items-center gap-2 transition-all cursor-pointer border border-zinc-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.faqs.map((faq, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-zinc-900/70 border border-zinc-700/80 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                        placeholder="Question title..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm font-bold text-white focus:border-vexo-red focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="p-2 rounded-xl hover:bg-red-950/80 text-zinc-400 hover:text-red-400 transition-colors"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={faq.a}
                      onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                      placeholder="Detailed answer..."
                      className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-sm text-zinc-300 focus:border-vexo-red focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: LIVE PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* Card Preview */}
              <div className="p-6 rounded-2xl bg-[#08080c] border border-zinc-700/80 text-white relative overflow-hidden shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7 space-y-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-mono font-black text-neutral-500">
                        {formData.number}
                      </span>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vexo-red/15 text-vexo-red border border-vexo-red/30 text-xs font-mono font-bold uppercase">
                        <SelectedIcon className="w-4 h-4" />
                        <span>{formData.category || 'Production'}</span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-black uppercase text-white">
                      {formData.title || 'Service Title Preview'}
                    </h3>

                    <p className="text-sm text-neutral-300 leading-relaxed">
                      {formData.shortDesc || 'No overview text provided.'}
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-xs sm:text-sm font-mono font-bold text-white bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-xl">
                        {formData.pricingRange || 'Starting from $450 / ₹35,000'}
                      </span>
                      <span className="text-xs sm:text-sm font-mono text-vexo-red font-bold">
                        {formData.plans.length} Custom Plans Configured
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-5">
                    <div className="aspect-[16/10] rounded-xl overflow-hidden border border-zinc-700/80 bg-neutral-900 shadow-md">
                      <img
                        src={getMediaUrl(formData.imageUrl) || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Plans Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {formData.plans.map((p, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border ${
                      p.isPopular ? 'border-vexo-red bg-vexo-red/10 shadow-lg shadow-red-950/30' : 'border-zinc-700/80 bg-zinc-900/70'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-300 mb-2.5">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10">{p.badge}</span>
                      <span className="text-zinc-400">{p.duration}</span>
                    </div>
                    <h4 className="font-bold text-base text-white uppercase mb-2">{p.name}</h4>
                    <div className="text-2xl font-black font-mono text-white mb-2">
                      {p.priceINR} <span className="text-sm text-zinc-300 font-normal">/ {p.priceUSD}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 mb-4 leading-relaxed">{p.tagline}</p>
                    <div className="text-xs font-mono text-zinc-300 space-y-1.5">
                      {p.features.split('\n').filter(Boolean).slice(0, 3).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-vexo-red shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Bottom Submission Actions */}
          <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-zinc-800">
            <div className="text-xs sm:text-sm font-mono text-slate-500 dark:text-zinc-400 hidden sm:block">
              {editingService ? `Editing ID: ${editingService.id}` : 'Creating New Service'}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-sm font-semibold text-slate-700 hover:text-slate-900 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-vexo-red hover:bg-red-600 text-sm font-mono font-bold uppercase tracking-wider text-white shadow-md shadow-red-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2.5"
              >
                <span>{isSubmitting ? 'Saving Service...' : editingService ? 'Save Service & 3 Plans' : 'Create Service & Plans'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Styled Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Studio Service"
        itemName={deleteTarget?.title}
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? It will immediately be removed from the public website.`}
        confirmText="Delete Service"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
