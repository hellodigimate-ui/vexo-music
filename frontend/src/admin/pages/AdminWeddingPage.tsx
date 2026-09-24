import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Save,
  ExternalLink,
  Crown,
  Sliders,
  Plus,
  Trash2,
  Building,
  Layers,
  Award,
  ChevronRight,
  Camera,
  Film,
  Heart,
} from 'lucide-react';
import { MediaInput } from '../components/media/MediaInput';
import { adminPreWeddingApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { getMediaUrl } from '../../lib/utils';
import { DEFAULT_WEDDING_PLANS, DEFAULT_WEDDING_DAY_STORIES, ADD_ON_SERVICES } from '../../data/weddingData';
import { AdminCmsTabsSlider } from '../components/AdminCmsTabsSlider';

type TabKey =
  | 'plans'
  | 'stories'
  | 'films'
  | 'info'
  | 'gallery'
  | 'addons'
  | 'customServices'
  | 'pillars';

export const AdminWeddingPage: React.FC = () => {
  const toast = useAdminToast();
  const [activeTab, setActiveTab] = useState<TabKey>('plans');


  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchWeddingData = async () => {
    try {
      setIsLoading(true);
      const res = await adminPreWeddingApi.get();
      if (res.success && res.data) {
        const payload = { ...res.data };
        if (!payload.weddingPackages || payload.weddingPackages.length === 0) {
          payload.weddingPackages = DEFAULT_WEDDING_PLANS;
        }
        if (!payload.weddingDayStories || !payload.weddingDayStories.stories || payload.weddingDayStories.stories.length === 0) {
          payload.weddingDayStories = DEFAULT_WEDDING_DAY_STORIES;
        }
        if (!payload.addOns || !Array.isArray(payload.addOns) || payload.addOns.length === 0) {
          payload.addOns = ADD_ON_SERVICES;
        }
        setData(payload);
        setIsDirty(false);
      }
    } catch (err: any) {
      toast.error('Failed to load wedding studio data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeddingData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!data) return;

    setIsSaving(true);
    try {
      const res = await adminPreWeddingApi.update(data);
      if (res.success) {
        toast.success(
          'Wedding Studio Updated',
          'All wedding plans, stories, films, and settings saved successfully.'
        );
        setIsDirty(false);
      }
    } catch (err: any) {
      toast.error('Save failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data]);

  // Form update helpers
  const updateStudioInfo = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      studioInfo: {
        ...prev.studioInfo,
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  // Wedding Plans CRUD
  const addWeddingPlan = () => {
    const newPlan = {
      id: `wedding-plan-${Date.now()}`,
      category: 'WEDDING',
      name: 'NEW WEDDING PLAN',
      tagline: 'For bespoke wedding day celebrations',
      priceINR: 0,
      priceDisplay: 'Custom Quote',
      badge: 'WEDDING DAY',
      isPopular: false,
      highlightText: 'Complete wedding day coverage capturing every ritual and royal ceremony.',
      foodTravel: 'Food, Travel — Paid By Client / Company',
      ctaText: 'Choose Wedding Plan',
      whatsappMessage: 'Hello VEXO Wedding Studio! I am interested in this wedding plan.',
      photography: {
        photographersCount: 'Professional Wedding Photographers',
        cameraSetup: 'Sony Cinema Setup',
        details: ['Traditional & Candid Photography'],
      },
      cinematography: {
        cinematographersCount: 'Professional Cinematographer',
        cameraSetup: 'Sony Cinema Setup',
        details: ['Full Wedding Day Coverage'],
      },
      deliverables: ['Highlight Wedding Film', 'Full Wedding Video', 'Edited High-Res Photos'],
      shoot: {
        days: '1–2 Shoot Days',
        locations: 'Up to 2 Locations',
      },
      bonus: [],
    };

    setData((prev: any) => ({
      ...prev,
      weddingPackages: [...(prev.weddingPackages || DEFAULT_WEDDING_PLANS), newPlan],
    }));
    setIsDirty(true);
  };

  const removeWeddingPlan = (index: number) => {
    if (!window.confirm('Are you sure you want to delete this wedding plan?')) return;
    setData((prev: any) => {
      const list = [...(prev.weddingPackages || DEFAULT_WEDDING_PLANS)];
      list.splice(index, 1);
      return { ...prev, weddingPackages: list };
    });
    setIsDirty(true);
  };

  const updateWeddingPlan = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const list = [...(prev.weddingPackages || DEFAULT_WEDDING_PLANS)];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, weddingPackages: list };
    });
    setIsDirty(true);
  };

  const updateWeddingPlanNested = (index: number, parent: string, field: string, value: any) => {
    setData((prev: any) => {
      const list = [...(prev.weddingPackages || DEFAULT_WEDDING_PLANS)];
      list[index] = {
        ...list[index],
        [parent]: {
          ...(list[index][parent] || {}),
          [field]: value,
        },
      };
      return { ...prev, weddingPackages: list };
    });
    setIsDirty(true);
  };

  const updateWeddingPlanList = (packageIndex: number, listField: 'deliverables' | 'bonus', itemIndex: number, value: string) => {
    setData((prev: any) => {
      const list = [...(prev.weddingPackages || DEFAULT_WEDDING_PLANS)];
      const items = [...(list[packageIndex][listField] || [])];
      items[itemIndex] = value;
      list[packageIndex] = { ...list[packageIndex], [listField]: items };
      return { ...prev, weddingPackages: list };
    });
    setIsDirty(true);
  };

  const addWeddingPlanListItem = (packageIndex: number, listField: 'deliverables' | 'bonus') => {
    setData((prev: any) => {
      const list = [...(prev.weddingPackages || DEFAULT_WEDDING_PLANS)];
      const items = [...(list[packageIndex][listField] || []), 'New Inclusion'];
      list[packageIndex] = { ...list[packageIndex], [listField]: items };
      return { ...prev, weddingPackages: list };
    });
    setIsDirty(true);
  };

  const removeWeddingPlanListItem = (packageIndex: number, listField: 'deliverables' | 'bonus', itemIndex: number) => {
    setData((prev: any) => {
      const list = [...(prev.weddingPackages || DEFAULT_WEDDING_PLANS)];
      const items = [...(list[packageIndex][listField] || [])];
      items.splice(itemIndex, 1);
      list[packageIndex] = { ...list[packageIndex], [listField]: items };
      return { ...prev, weddingPackages: list };
    });
    setIsDirty(true);
  };

  const updateWeddingPlanNestedList = (packageIndex: number, parent: string, itemIndex: number, value: string) => {
    setData((prev: any) => {
      const list = [...(prev.weddingPackages || DEFAULT_WEDDING_PLANS)];
      const parentObj = { ...(list[packageIndex][parent] || {}) };
      const details = [...(parentObj.details || [])];
      details[itemIndex] = value;
      parentObj.details = details;
      list[packageIndex] = { ...list[packageIndex], [parent]: parentObj };
      return { ...prev, weddingPackages: list };
    });
    setIsDirty(true);
  };

  const addWeddingPlanNestedListItem = (packageIndex: number, parent: string) => {
    setData((prev: any) => {
      const list = [...(prev.weddingPackages || DEFAULT_WEDDING_PLANS)];
      const parentObj = { ...(list[packageIndex][parent] || {}) };
      parentObj.details = [...(parentObj.details || []), 'New Crew Feature'];
      list[packageIndex] = { ...list[packageIndex], [parent]: parentObj };
      return { ...prev, weddingPackages: list };
    });
    setIsDirty(true);
  };

  const removeWeddingPlanNestedListItem = (packageIndex: number, parent: string, itemIndex: number) => {
    setData((prev: any) => {
      const list = [...(prev.weddingPackages || DEFAULT_WEDDING_PLANS)];
      const parentObj = { ...(list[packageIndex][parent] || {}) };
      const details = [...(parentObj.details || [])];
      details.splice(itemIndex, 1);
      parentObj.details = details;
      list[packageIndex] = { ...list[packageIndex], [parent]: parentObj };
      return { ...prev, weddingPackages: list };
    });
    setIsDirty(true);
  };

  // Wedding Day Stories helpers
  const updateStoriesConfig = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      weddingDayStories: {
        ...(prev.weddingDayStories || DEFAULT_WEDDING_DAY_STORIES),
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const updateStoryItem = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const currentConfig = prev.weddingDayStories || DEFAULT_WEDDING_DAY_STORIES;
      const list = [...(currentConfig.stories || [])];
      list[index] = { ...list[index], [field]: value };
      return {
        ...prev,
        weddingDayStories: {
          ...currentConfig,
          stories: list,
        },
      };
    });
    setIsDirty(true);
  };

  const addStoryItem = () => {
    setData((prev: any) => {
      const currentConfig = prev.weddingDayStories || DEFAULT_WEDDING_DAY_STORIES;
      const list = [...(currentConfig.stories || [])];
      list.push({
        id: `wds-${Date.now()}`,
        category: 'Wedding Rituals',
        title: 'Sacred Ritual Moment',
        location: 'Jaipur, Rajasthan',
        couple: 'Couple Names',
        imageUrl: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80',
        featured: false,
      });
      return {
        ...prev,
        weddingDayStories: {
          ...currentConfig,
          stories: list,
        },
      };
    });
    setIsDirty(true);
  };

  const removeStoryItem = (index: number) => {
    if (!window.confirm('Delete this wedding story?')) return;
    setData((prev: any) => {
      const currentConfig = prev.weddingDayStories || DEFAULT_WEDDING_DAY_STORIES;
      const list = [...(currentConfig.stories || [])];
      list.splice(index, 1);
      return {
        ...prev,
        weddingDayStories: {
          ...currentConfig,
          stories: list,
        },
      };
    });
    setIsDirty(true);
  };

  // Video Teasers & Films
  const addVideo = () => {
    setData((prev: any) => ({
      ...prev,
      videos: [
        ...(prev.videos || []),
        {
          id: `film-${Date.now()}`,
          title: 'Royal Wedding Day Highlights',
          couple: 'Royal Couple',
          location: 'Jaipur, Rajasthan',
          category: 'Cinematic Film',
          duration: '5:20',
          views: '150K Views',
          thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
          videoUrl: 'https://www.youtube.com/watch?v=HcEcM5AtEZ8',
          aspectRatio: '16:9',
        },
      ],
    }));
    setIsDirty(true);
  };

  const updateVideo = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const list = [...(prev.videos || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, videos: list };
    });
    setIsDirty(true);
  };

  const removeVideo = (index: number) => {
    setData((prev: any) => {
      const list = [...(prev.videos || [])];
      list.splice(index, 1);
      return { ...prev, videos: list };
    });
    setIsDirty(true);
  };

  // Add-Ons
  const updateAddOn = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const list = [...(prev.addOns || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, addOns: list };
    });
    setIsDirty(true);
  };

  const addAddOn = () => {
    setData((prev: any) => {
      const currentList = Array.isArray(prev?.addOns) && prev.addOns.length > 0
        ? [...prev.addOns]
        : [...(ADD_ON_SERVICES || [])];
      const newAddon = {
        id: `addon-${Date.now()}`,
        title: 'New Luxury Wedding Add-On',
        priceDisplay: 'Starting ₹15,000',
        priceINR: 15000,
        description: 'Handcrafted luxury heirloom option for wedding ceremonies and royal captures.',
        badge: 'NEW',
      };
      return {
        ...prev,
        addOns: [newAddon, ...currentList],
      };
    });
    setIsDirty(true);
    toast.success('Service Add-On Created', 'New wedding add-on added at the top.');
  };

  const removeAddOn = (index: number) => {
    setData((prev: any) => {
      const list = [...(prev.addOns || [])];
      list.splice(index, 1);
      return { ...prev, addOns: list };
    });
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-vexo-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono text-zinc-500 tracking-wider uppercase">Loading Wedding Studio CMS...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Unable to load Wedding Studio data</p>
        <button
          type="button"
          onClick={fetchWeddingData}
          className="px-4 py-2 rounded-xl bg-vexo-red text-white text-xs font-bold hover:bg-red-600 transition-all cursor-pointer shadow-md shadow-red-600/20"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    studioInfo = {},
    weddingPackages = DEFAULT_WEDDING_PLANS,
    weddingDayStories = DEFAULT_WEDDING_DAY_STORIES,
    portfolioGallery = [],
    videos = [],
    addOns = [],
    customServices = [],
    whyUsPillars = [],
  } = data;

  const storiesList = weddingDayStories?.stories || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0d] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-500" /> WEDDING CMS
            </span>
            {isDirty && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                UNSAVED CHANGES
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white tracking-tight">
            Wedding Studio Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Control Wedding Plans (Essential, Signature, Royal), editorial wedding day stories, royal films & ceremony coverage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/wedding"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700/80 dark:text-zinc-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>Preview Wedding Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
          </a>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-red-500/20 dark:shadow-red-900/30 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Switcher Banner between Pre-Wedding and Wedding CMS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-xs">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="text-slate-700 dark:text-zinc-300">
            You are currently managing <strong>Wedding Studio</strong> (Wedding Plans & Ceremonies).
          </span>
        </div>
        <Link
          to="/admin/pre-wedding"
          className="inline-flex items-center gap-1.5 font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-mono uppercase tracking-wider text-[11px]"
        >
          <span>Switch to Pre-Wedding Studio CMS</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Unique Animated Tabs Slider */}
      <AdminCmsTabsSlider
        activeTab={activeTab}
        onChangeTab={(tId) => setActiveTab(tId as TabKey)}
        accentColor="amber"
        tabs={[
          { id: 'plans', label: 'Wedding Plans', count: weddingPackages.length, icon: Crown },
          { id: 'stories', label: 'Wedding Day Stories', count: storiesList.length, icon: Heart },
          { id: 'films', label: 'Wedding Films & Reels', count: videos.length, icon: Film },
          { id: 'info', label: 'Studio & Hero Info', icon: Building },
          { id: 'gallery', label: 'Ceremonies Portfolio', count: portfolioGallery.length, icon: Camera },
          { id: 'addons', label: 'Wedding Add-Ons', count: addOns.length, icon: Layers },
          { id: 'customServices', label: 'Custom Rates', count: customServices.length, icon: Sliders },
          { id: 'pillars', label: 'Why VEXO Pillars', count: whyUsPillars.length, icon: Award },
        ]}
      />

      {/* ======================================================== */}
      {/* TAB 1: WEDDING PLANS */}
      {/* ======================================================== */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                Wedding Day Plans ({weddingPackages.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Manage Essential Wedding, Signature Wedding, and Royal Wedding packages. Customize pricing, photo/cinema crews, and deliverables.
              </p>
            </div>

            <button
              type="button"
              onClick={addWeddingPlan}
              className="px-4 py-2 rounded-xl bg-vexo-red text-white text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Wedding Plan</span>
            </button>
          </div>

          <div className="space-y-8">
            {weddingPackages.map((pkg: any, idx: number) => {
              const isFeatured = pkg.isPopular || pkg.id === 'wedding-signature';

              return (
                <div
                  key={pkg.id || idx}
                  className={`bg-white dark:bg-[#0e0e13] border rounded-2xl p-6 space-y-6 shadow-xs transition-colors relative ${
                    isFeatured ? 'border-amber-500/50 shadow-md shadow-amber-500/10' : 'border-slate-200 dark:border-zinc-800/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800/80 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 font-black text-sm flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <span>{pkg.name || 'UNTITLED PLAN'}</span>
                          {isFeatured && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                              FEATURED
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">{pkg.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={pkg.isPopular || false}
                          onChange={(e) => updateWeddingPlan(idx, 'isPopular', e.target.checked)}
                          className="rounded border-slate-300 dark:border-zinc-700 text-vexo-red focus:ring-0"
                        />
                        <span>"Featured / Most Popular" Highlight</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => removeWeddingPlan(idx)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PLAN NAME</label>
                      <input
                        type="text"
                        value={pkg.name || ''}
                        onChange={(e) => updateWeddingPlan(idx, 'name', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PRICE (NUMERIC INR)</label>
                      <input
                        type="number"
                        value={pkg.priceINR || 0}
                        onChange={(e) => {
                          const num = Number(e.target.value);
                          updateWeddingPlan(idx, 'priceINR', num);
                          if (num > 0) {
                            updateWeddingPlan(idx, 'priceDisplay', `₹${num.toLocaleString('en-IN')}`);
                          }
                        }}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PRICE DISPLAY STRING</label>
                      <input
                        type="text"
                        value={pkg.priceDisplay || ''}
                        onChange={(e) => updateWeddingPlan(idx, 'priceDisplay', e.target.value)}
                        placeholder="e.g. Custom Quote or ₹1,50,000"
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">BADGE LABEL</label>
                      <input
                        type="text"
                        value={pkg.badge || ''}
                        onChange={(e) => updateWeddingPlan(idx, 'badge', e.target.value)}
                        placeholder="e.g. MOST POPULAR, ROYAL LUXURY"
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">TAGLINE</label>
                      <input
                        type="text"
                        value={pkg.tagline || ''}
                        onChange={(e) => updateWeddingPlan(idx, 'tagline', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">FOOD & TRAVEL POLICY</label>
                      <input
                        type="text"
                        value={pkg.foodTravel || 'Food, Travel — Paid By Client / Company'}
                        onChange={(e) => updateWeddingPlan(idx, 'foodTravel', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">CTA BUTTON TEXT</label>
                      <input
                        type="text"
                        value={pkg.ctaText || `Choose ${pkg.name}`}
                        onChange={(e) => updateWeddingPlan(idx, 'ctaText', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Photography & Cinematography Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Photography Crew */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <Camera className="w-4 h-4 text-vexo-red" />
                        <span>PHOTOGRAPHY CREW</span>
                      </div>
                      <input
                        type="text"
                        value={pkg.photography?.photographersCount || ''}
                        onChange={(e) => updateWeddingPlanNested(idx, 'photography', 'photographersCount', e.target.value)}
                        placeholder="Photographers count (e.g. 2 Photographers)"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={pkg.photography?.cameraSetup || ''}
                        onChange={(e) => updateWeddingPlanNested(idx, 'photography', 'cameraSetup', e.target.value)}
                        placeholder="Camera Setup (e.g. Sony Cinema Prime Rig)"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                      />
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>BULLET INCLUSIONS</span>
                          <button
                            type="button"
                            onClick={() => addWeddingPlanNestedListItem(idx, 'photography')}
                            className="text-vexo-red hover:underline text-[10px] font-bold"
                          >
                            + Add Inclusions
                          </button>
                        </div>
                        {(pkg.photography?.details || []).map((det: string, dIdx: number) => (
                          <div key={dIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={det}
                              onChange={(e) => updateWeddingPlanNestedList(idx, 'photography', dIdx, e.target.value)}
                              className="w-full px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => removeWeddingPlanNestedListItem(idx, 'photography', dIdx)}
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cinematography Crew */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <Film className="w-4 h-4 text-amber-500" />
                        <span>CINEMATOGRAPHY CREW</span>
                      </div>
                      <input
                        type="text"
                        value={pkg.cinematography?.cinematographersCount || ''}
                        onChange={(e) => updateWeddingPlanNested(idx, 'cinematography', 'cinematographersCount', e.target.value)}
                        placeholder="Cinematographers count (e.g. 2 Cinematographers)"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={pkg.cinematography?.cameraSetup || ''}
                        onChange={(e) => updateWeddingPlanNested(idx, 'cinematography', 'cameraSetup', e.target.value)}
                        placeholder="Camera Setup (e.g. 4K Cinema Rig + Drone)"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                      />
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>BULLET INCLUSIONS</span>
                          <button
                            type="button"
                            onClick={() => addWeddingPlanNestedListItem(idx, 'cinematography')}
                            className="text-vexo-red hover:underline text-[10px] font-bold"
                          >
                            + Add Inclusions
                          </button>
                        </div>
                        {(pkg.cinematography?.details || []).map((det: string, dIdx: number) => (
                          <div key={dIdx} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={det}
                              onChange={(e) => updateWeddingPlanNestedList(idx, 'cinematography', dIdx, e.target.value)}
                              className="w-full px-2.5 py-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                            />
                            <button
                              type="button"
                              onClick={() => removeWeddingPlanNestedListItem(idx, 'cinematography', dIdx)}
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        FINAL DELIVERABLES ({pkg.deliverables?.length || 0})
                      </label>
                      <button
                        type="button"
                        onClick={() => addWeddingPlanListItem(idx, 'deliverables')}
                        className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-vexo-red text-[11px] font-bold cursor-pointer"
                      >
                        + Add Deliverable
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(pkg.deliverables || []).map((del: string, delIdx: number) => (
                        <div key={delIdx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={del}
                            onChange={(e) => updateWeddingPlanList(idx, 'deliverables', delIdx, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeWeddingPlanListItem(idx, 'deliverables', delIdx)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: WEDDING DAY STORIES (EDITORIAL GALLERY) */}
      {/* ======================================================== */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                Wedding Day Stories Editorial Gallery
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Manage the highlighted wedding day stories section featuring rituals, candid emotions, and couple portraits.
              </p>
            </div>

            <button
              type="button"
              onClick={addStoryItem}
              className="px-4 py-2 rounded-xl bg-vexo-red text-white text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Wedding Story</span>
            </button>
          </div>

          {/* Section Heading & Subtitle Configuration */}
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <h4 className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
              Section Header & Narrative Copy
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">EYEBROW BADGE</label>
                <input
                  type="text"
                  value={weddingDayStories.eyebrow || 'WEDDING DAY COVERAGE'}
                  onChange={(e) => updateStoriesConfig('eyebrow', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">MAIN HEADING</label>
                <input
                  type="text"
                  value={weddingDayStories.heading || 'Wedding Day Stories'}
                  onChange={(e) => updateStoriesConfig('heading', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">SUPPORTING TEXT</label>
                <textarea
                  rows={2}
                  value={weddingDayStories.supportingText || ''}
                  onChange={(e) => updateStoriesConfig('supportingText', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {storiesList.map((story: any, sIdx: number) => (
              <div
                key={story.id || sIdx}
                className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xs relative"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-amber-500/10 text-amber-500 font-bold text-xs flex items-center justify-center">
                      {sIdx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                      {story.title || 'Untitled Story'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={story.featured || false}
                        onChange={(e) => updateStoryItem(sIdx, 'featured', e.target.checked)}
                        className="rounded border-slate-300 text-vexo-red"
                      />
                      <span>Featured (Large)</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => removeStoryItem(sIdx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                      title="Delete Story"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-500">CATEGORY</label>
                    <input
                      type="text"
                      value={story.category || ''}
                      onChange={(e) => updateStoryItem(sIdx, 'category', e.target.value)}
                      placeholder="e.g. Wedding Rituals, Candid Moments"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-500">COUPLE NAMES</label>
                    <input
                      type="text"
                      value={story.couple || ''}
                      onChange={(e) => updateStoryItem(sIdx, 'couple', e.target.value)}
                      placeholder="e.g. Kabir & Radhika"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-500">TITLE</label>
                    <input
                      type="text"
                      value={story.title || ''}
                      onChange={(e) => updateStoryItem(sIdx, 'title', e.target.value)}
                      placeholder="e.g. The Sacred Varmala Symphony"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-500">LOCATION</label>
                    <input
                      type="text"
                      value={story.location || ''}
                      onChange={(e) => updateStoryItem(sIdx, 'location', e.target.value)}
                      placeholder="e.g. Rambagh Palace, Jaipur"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-500">PHOTO IMAGE URL</label>
                  <MediaInput
                    value={story.imageUrl || ''}
                    onChange={(url) => updateStoryItem(sIdx, 'imageUrl', url)}
                    placeholder="https://..."
                    allowedTypes={['image']}
                  />
                  {story.imageUrl && (
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 mt-2 bg-black">
                      <img
                        src={getMediaUrl(story.imageUrl)}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: WEDDING FILMS & REELS */}
      {/* ======================================================== */}
      {activeTab === 'films' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                Wedding Films, Teasers & Reels ({videos.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Manage featured wedding films, documentaries, and viral Instagram reels with YouTube embeds.
              </p>
            </div>

            <button
              type="button"
              onClick={addVideo}
              className="px-4 py-2 rounded-xl bg-vexo-red text-white text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Wedding Film</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((vid: any, vIdx: number) => (
              <div
                key={vid.id || vIdx}
                className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-amber-500/10 text-amber-500 font-bold text-xs flex items-center justify-center">
                      {vIdx + 1}
                    </span>
                    <span className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                      {vid.title || 'Untitled Video'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeVideo(vIdx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="Delete Film"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-500">CATEGORY</label>
                    <select
                      value={vid.category || 'Cinematic Film'}
                      onChange={(e) => updateVideo(vIdx, 'category', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Cinematic Film">Cinematic Film</option>
                      <option value="Wedding Film">Wedding Film</option>
                      <option value="Teaser">Teaser</option>
                      <option value="Instagram Reel">Instagram Reel</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-500">DURATION</label>
                    <input
                      type="text"
                      value={vid.duration || ''}
                      onChange={(e) => updateVideo(vIdx, 'duration', e.target.value)}
                      placeholder="e.g. 5:24 or 0:45"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-500">TITLE</label>
                    <input
                      type="text"
                      value={vid.title || ''}
                      onChange={(e) => updateVideo(vIdx, 'title', e.target.value)}
                      placeholder="e.g. Royal Vows in Udaipur"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-500">COUPLE & VENUE</label>
                    <input
                      type="text"
                      value={vid.couple || ''}
                      onChange={(e) => updateVideo(vIdx, 'couple', e.target.value)}
                      placeholder="e.g. Kabir & Radhika"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-500">YOUTUBE VIDEO URL</label>
                  <input
                    type="text"
                    value={vid.videoUrl || ''}
                    onChange={(e) => updateVideo(vIdx, 'videoUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-500">THUMBNAIL IMAGE</label>
                  <MediaInput
                    value={vid.thumbnailUrl || ''}
                    onChange={(url) => updateVideo(vIdx, 'thumbnailUrl', url)}
                    placeholder="https://..."
                    allowedTypes={['image']}
                  />
                  {vid.thumbnailUrl && (
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 mt-2 bg-black">
                      <img
                        src={getMediaUrl(vid.thumbnailUrl)}
                        alt={vid.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: STUDIO INFO & HERO */}
      {/* ======================================================== */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              Wedding Studio Contact & Branding
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">STUDIO NAME</label>
                <input
                  type="text"
                  value={studioInfo.name || ''}
                  onChange={(e) => updateStudioInfo('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">STUDIO TAGLINE</label>
                <input
                  type="text"
                  value={studioInfo.tagline || ''}
                  onChange={(e) => updateStudioInfo('tagline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PHONE NUMBER</label>
                <input
                  type="text"
                  value={studioInfo.phone || ''}
                  onChange={(e) => updateStudioInfo('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">WHATSAPP DISPATCH NUMBER</label>
                <input
                  type="text"
                  value={studioInfo.whatsappNumber || ''}
                  onChange={(e) => updateStudioInfo('whatsappNumber', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">STUDIO EMAIL</label>
                <input
                  type="email"
                  value={studioInfo.email || ''}
                  onChange={(e) => updateStudioInfo('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">OPERATIONAL REGIONS</label>
                <input
                  type="text"
                  value={studioInfo.location || ''}
                  onChange={(e) => updateStudioInfo('location', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: CEREMONIES PORTFOLIO GALLERY */}
      {/* ======================================================== */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                Ceremonies & Moments Portfolio ({portfolioGallery.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Photos displayed in the full-width portfolio gallery on the wedding page.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {portfolioGallery.map((item: any, idx: number) => (
              <div
                key={item.id || idx}
                className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-slate-200 dark:border-zinc-800 aspect-square shadow-xs"
              >
                <img
                  src={getMediaUrl(item.imageUrl)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    {item.category || 'Wedding'}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {item.title || 'Ceremony'}
                  </span>
                  <span className="text-[10px] text-zinc-300 truncate">
                    {item.couple || item.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: WEDDING ADD-ONS */}
      {/* ======================================================== */}
      {activeTab === 'addons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                Wedding Add-Ons & Heirloom Services ({addOns.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Extra options like Italian leather albums, drone coverage, extra camera operators, and rapid reel delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addAddOn();
              }}
              className="px-4 py-2.5 rounded-xl bg-vexo-red text-white text-xs font-bold hover:bg-red-600 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/30 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service Add-On</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addOns.map((addon: any, aIdx: number) => (
              <div
                key={addon.id || aIdx}
                className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                  <input
                    type="text"
                    value={addon.title || ''}
                    onChange={(e) => updateAddOn(aIdx, 'title', e.target.value)}
                    placeholder="Service Title"
                    className="font-bold text-xs text-slate-900 dark:text-white bg-transparent outline-none w-2/3"
                  />
                  <button
                    type="button"
                    onClick={() => removeAddOn(aIdx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-500">PRICE DISPLAY</label>
                    <input
                      type="text"
                      value={addon.priceDisplay || ''}
                      onChange={(e) => updateAddOn(aIdx, 'priceDisplay', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-500">NUMERIC INR</label>
                    <input
                      type="number"
                      value={addon.priceINR || 0}
                      onChange={(e) => updateAddOn(aIdx, 'priceINR', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-500">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={addon.description || ''}
                    onChange={(e) => updateAddOn(aIdx, 'description', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: CUSTOM SERVICES RATES */}
      {/* ======================================================== */}
      {activeTab === 'customServices' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              Custom Wedding Day Service Rates ({customServices.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Rates utilized in the interactive VEXO Signature Package Builder on the public website.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customServices.map((cs: any, csIdx: number) => (
              <div
                key={cs.id || csIdx}
                className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{cs.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 uppercase">
                    {cs.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Starting Rate:</span>
                  <span className="font-bold text-amber-500">₹{Number(cs.startingPriceINR || 0).toLocaleString('en-IN')} {cs.unit}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{cs.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 8: WHY VEXO PILLARS */}
      {/* ======================================================== */}
      {activeTab === 'pillars' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              Why VEXO Wedding Studio Pillars ({whyUsPillars.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              The 5 core cinematic value pillars showcased on the wedding studio page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whyUsPillars.map((pil: any, pIdx: number) => (
              <div
                key={pil.id || pIdx}
                className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-500 uppercase">{pil.tag}</span>
                  <span className="w-6 h-6 rounded bg-amber-500/10 text-amber-500 font-bold text-xs flex items-center justify-center">
                    0{pIdx + 1}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pil.title}</h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400">{pil.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWeddingPage;
