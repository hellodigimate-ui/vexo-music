import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminPreWeddingApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';

type TabKey = 'info' | 'packages' | 'addons' | 'customServices' | 'pillars';

export const AdminPreWeddingPage: React.FC = () => {
  const toast = useAdminToast();
  const [activeTab, setActiveTab] = useState<TabKey>('info');

  // Tabs Slider ref and scroll state
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabsScroll = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkTabsScroll();
    const el = tabsContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkTabsScroll, { passive: true });
    window.addEventListener('resize', checkTabsScroll);
    return () => {
      el.removeEventListener('scroll', checkTabsScroll);
      window.removeEventListener('resize', checkTabsScroll);
    };
  }, [checkTabsScroll]);

  const slideTabs = (direction: 'left' | 'right') => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const distance = 260;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [data, setData] = useState<any>(null);

  const fetchPreWeddingData = async () => {
    try {
      setIsLoading(true);
      const res = await adminPreWeddingApi.get();
      if (res.success && res.data) {
        setData(res.data);
        setIsDirty(false);
      }
    } catch (err: any) {
      toast.error('Failed to load pre-wedding data', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreWeddingData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!data) return;

    setIsSaving(true);
    try {
      const res = await adminPreWeddingApi.update(data);
      if (res.success) {
        toast.success(
          'Pre-Wedding Studio Updated',
          'All packages, pricing tiers, and studio settings saved successfully.'
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

  const updatePackage = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const newPackages = [...prev.packages];
      newPackages[index] = { ...newPackages[index], [field]: value };
      return { ...prev, packages: newPackages };
    });
    setIsDirty(true);
  };

  const updatePackageNested = (index: number, parent: string, field: string, value: any) => {
    setData((prev: any) => {
      const newPackages = [...prev.packages];
      newPackages[index] = {
        ...newPackages[index],
        [parent]: {
          ...newPackages[index][parent],
          [field]: value,
        },
      };
      return { ...prev, packages: newPackages };
    });
    setIsDirty(true);
  };

  const updatePackageList = (packageIndex: number, listField: 'deliverables' | 'bonus' | 'platinumExperience', itemIndex: number, value: string) => {
    setData((prev: any) => {
      const newPackages = [...prev.packages];
      const list = [...(newPackages[packageIndex][listField] || [])];
      list[itemIndex] = value;
      newPackages[packageIndex] = { ...newPackages[packageIndex], [listField]: list };
      return { ...prev, packages: newPackages };
    });
    setIsDirty(true);
  };

  const addPackageListItem = (packageIndex: number, listField: 'deliverables' | 'bonus' | 'platinumExperience') => {
    setData((prev: any) => {
      const newPackages = [...prev.packages];
      const list = [...(newPackages[packageIndex][listField] || []), 'New Deliverable'];
      newPackages[packageIndex] = { ...newPackages[packageIndex], [listField]: list };
      return { ...prev, packages: newPackages };
    });
    setIsDirty(true);
  };

  const removePackageListItem = (packageIndex: number, listField: 'deliverables' | 'bonus' | 'platinumExperience', itemIndex: number) => {
    setData((prev: any) => {
      const newPackages = [...prev.packages];
      const list = [...(newPackages[packageIndex][listField] || [])];
      list.splice(itemIndex, 1);
      newPackages[packageIndex] = { ...newPackages[packageIndex], [listField]: list };
      return { ...prev, packages: newPackages };
    });
    setIsDirty(true);
  };

  const updateAddOn = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const newAddOns = [...prev.addOns];
      newAddOns[index] = { ...newAddOns[index], [field]: value };
      return { ...prev, addOns: newAddOns };
    });
    setIsDirty(true);
  };

  const addAddOn = () => {
    setData((prev: any) => ({
      ...prev,
      addOns: [
        ...prev.addOns,
        {
          id: `addon-${Date.now()}`,
          title: 'New Add-On Service',
          priceDisplay: 'Starting ₹5,000',
          priceINR: 5000,
          description: 'Description of the add-on service.',
          badge: '',
        },
      ],
    }));
    setIsDirty(true);
  };

  const removeAddOn = (index: number) => {
    setData((prev: any) => {
      const newAddOns = [...prev.addOns];
      newAddOns.splice(index, 1);
      return { ...prev, addOns: newAddOns };
    });
    setIsDirty(true);
  };

  const updateCustomService = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const newServices = [...prev.customServices];
      newServices[index] = { ...newServices[index], [field]: value };
      return { ...prev, customServices: newServices };
    });
    setIsDirty(true);
  };

  const updatePillar = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const newPillars = [...prev.whyUsPillars];
      newPillars[index] = { ...newPillars[index], [field]: value };
      return { ...prev, whyUsPillars: newPillars };
    });
    setIsDirty(true);
  };

  if (isLoading || !data) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-2 border-vexo-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono text-zinc-500 tracking-wider uppercase">Loading Pre-Wedding Studio CMS...</p>
      </div>
    );
  }

  const { studioInfo, packages = [], addOns = [], customServices = [], whyUsPillars = [] } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0d] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-vexo-red/10 border border-vexo-red/30 text-vexo-red text-[10px] font-mono font-bold uppercase tracking-wider">
              STUDIO CMS
            </span>
            {isDirty && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                UNSAVED CHANGES
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white tracking-tight">Pre-Wedding Studio Management</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Control pricing tiers, deliverables, bespoke builder services, and studio coordinates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/packages"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700/80 dark:text-zinc-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>Preview Page</span>
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

      {/* Navigation Tabs Slider with Left/Right Arrows */}
      <div className="relative flex items-center gap-2">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => slideTabs('left')}
          disabled={!canScrollLeft}
          title="Scroll Left"
          aria-label="Scroll tabs left"
          className="w-8 h-8 rounded-xl bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:text-white hover:bg-vexo-red hover:border-vexo-red dark:hover:bg-vexo-red dark:hover:border-vexo-red transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#0e0e13] disabled:hover:text-slate-400 dark:disabled:hover:text-zinc-600 disabled:hover:border-slate-200 dark:disabled:hover:border-zinc-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Tabs Row */}
        <div
          ref={tabsContainerRef}
          className="flex-1 flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800/80 overflow-x-auto pb-px scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button
            type="button"
            data-tab-id="info"
            onClick={() => {
              setActiveTab('info');
              const el = tabsContainerRef.current?.querySelector('[data-tab-id="info"]') as HTMLElement;
              if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'info'
                ? 'bg-red-50/80 text-vexo-red border-vexo-red dark:bg-vexo-red/10 dark:text-white dark:border-vexo-red shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white border-transparent'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Studio Info & Hero</span>
          </button>

          <button
            type="button"
            data-tab-id="packages"
            onClick={() => {
              setActiveTab('packages');
              const el = tabsContainerRef.current?.querySelector('[data-tab-id="packages"]') as HTMLElement;
              if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'packages'
                ? 'bg-red-50/80 text-vexo-red border-vexo-red dark:bg-vexo-red/10 dark:text-white dark:border-vexo-red shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white border-transparent'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Packages (Silver, Gold, Platinum)</span>
          </button>

          <button
            type="button"
            data-tab-id="addons"
            onClick={() => {
              setActiveTab('addons');
              const el = tabsContainerRef.current?.querySelector('[data-tab-id="addons"]') as HTMLElement;
              if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'addons'
                ? 'bg-red-50/80 text-vexo-red border-vexo-red dark:bg-vexo-red/10 dark:text-white dark:border-vexo-red shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Add-On Services ({addOns.length})</span>
          </button>

          <button
            type="button"
            data-tab-id="customServices"
            onClick={() => {
              setActiveTab('customServices');
              const el = tabsContainerRef.current?.querySelector('[data-tab-id="customServices"]') as HTMLElement;
              if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'customServices'
                ? 'bg-red-50/80 text-vexo-red border-vexo-red dark:bg-vexo-red/10 dark:text-white dark:border-vexo-red shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Signature Builder ({customServices.length})</span>
          </button>

          <button
            type="button"
            data-tab-id="pillars"
            onClick={() => {
              setActiveTab('pillars');
              const el = tabsContainerRef.current?.querySelector('[data-tab-id="pillars"]') as HTMLElement;
              if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
            }}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              activeTab === 'pillars'
                ? 'bg-red-50/80 text-vexo-red border-vexo-red dark:bg-vexo-red/10 dark:text-white dark:border-vexo-red shadow-2xs'
                : 'text-slate-600 hover:text-slate-950 dark:text-zinc-400 dark:hover:text-white border-transparent'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Why VEXO Pillars</span>
          </button>
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => slideTabs('right')}
          disabled={!canScrollRight}
          title="Scroll Right"
          aria-label="Scroll tabs right"
          className="w-8 h-8 rounded-xl bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 hover:text-white hover:bg-vexo-red hover:border-vexo-red dark:hover:bg-vexo-red dark:hover:border-vexo-red transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-[#0e0e13] disabled:hover:text-slate-400 dark:disabled:hover:text-zinc-600 disabled:hover:border-slate-200 dark:disabled:hover:border-zinc-800"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Studio Info & Hero */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-xs transition-colors">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Brand & Hero Headlines</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">The primary brand name, tagline, and emotional hook quotes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">STUDIO NAME</label>
                <input
                  type="text"
                  value={studioInfo.name || ''}
                  onChange={(e) => updateStudioInfo('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">TAGLINE</label>
                <input
                  type="text"
                  value={studioInfo.tagline || ''}
                  onChange={(e) => updateStudioInfo('tagline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">HERO HEADLINE</label>
                <input
                  type="text"
                  value={studioInfo.headline || ''}
                  onChange={(e) => updateStudioInfo('headline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">HINDI PHILOSOPHY HOOK QUOTE</label>
                <textarea
                  rows={2}
                  value={studioInfo.subHeadlineHindi || ''}
                  onChange={(e) => {
                    updateStudioInfo('subHeadlineHindi', e.target.value);
                    updateStudioInfo('storyHook', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none resize-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">CUSTOM PACKAGE INTRO HINDI</label>
                <textarea
                  rows={2}
                  value={studioInfo.signatureIntro || ''}
                  onChange={(e) => updateStudioInfo('signatureIntro', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none resize-none transition-colors shadow-2xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-xs transition-colors">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Studio Booking Coordinates</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Contact phone, WhatsApp dispatch, official studio email, and shoot locations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">PHONE NUMBER</label>
                <input
                  type="text"
                  value={studioInfo.displayPhone || studioInfo.phone || ''}
                  onChange={(e) => {
                    updateStudioInfo('phone', e.target.value);
                    updateStudioInfo('displayPhone', e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">WHATSAPP DISPATCH NUMBER (NO SPACES/PLUS)</label>
                <input
                  type="text"
                  value={studioInfo.whatsappNumber || ''}
                  onChange={(e) => updateStudioInfo('whatsappNumber', e.target.value)}
                  placeholder="e.g. 917239999966"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">STUDIO EMAIL</label>
                <input
                  type="email"
                  value={studioInfo.email || ''}
                  onChange={(e) => updateStudioInfo('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">SHOOT BASE LOCATIONS</label>
                <input
                  type="text"
                  value={studioInfo.location || ''}
                  onChange={(e) => updateStudioInfo('location', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">INSTAGRAM HANDLE</label>
                <input
                  type="text"
                  value={studioInfo.instagramHandle || ''}
                  onChange={(e) => updateStudioInfo('instagramHandle', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">EXPERIENCE BADGE</label>
                <input
                  type="text"
                  value={studioInfo.experienceYears || ''}
                  onChange={(e) => updateStudioInfo('experienceYears', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Packages (Silver, Gold, Platinum) */}
      {activeTab === 'packages' && (
        <div className="space-y-8">
          {packages.map((pkg: any, idx: number) => {
            const isGold = pkg.id === 'gold';
            return (
              <div
                key={pkg.id}
                className={`bg-white dark:bg-[#0e0e13] border rounded-2xl p-6 space-y-6 shadow-xs transition-colors ${
                  isGold ? 'border-vexo-red/50 shadow-md shadow-red-500/10 dark:shadow-red-950/20' : 'border-slate-200 dark:border-zinc-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800/80 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-red-50 dark:bg-vexo-red/20 text-vexo-red flex items-center justify-center font-black text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">{pkg.name} TIER</h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">{pkg.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pkg.isPopular || false}
                        onChange={(e) => updatePackage(idx, 'isPopular', e.target.checked)}
                        className="rounded border-slate-300 dark:border-zinc-700 text-vexo-red focus:ring-0"
                      />
                      <span>Highlight as "Most Popular"</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PACKAGE NAME</label>
                    <input
                      type="text"
                      value={pkg.name || ''}
                      onChange={(e) => updatePackage(idx, 'name', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PRICE (NUMERIC INR)</label>
                    <input
                      type="number"
                      value={pkg.priceINR || 0}
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        updatePackage(idx, 'priceINR', num);
                        updatePackage(idx, 'priceDisplay', `₹${num.toLocaleString('en-IN')}`);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PRICE DISPLAY STRING</label>
                    <input
                      type="text"
                      value={pkg.priceDisplay || ''}
                      onChange={(e) => updatePackage(idx, 'priceDisplay', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">BADGE LABEL</label>
                    <input
                      type="text"
                      value={pkg.badge || ''}
                      onChange={(e) => updatePackage(idx, 'badge', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PACKAGE TAGLINE</label>
                    <input
                      type="text"
                      value={pkg.tagline || ''}
                      onChange={(e) => updatePackage(idx, 'tagline', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">SHOOT DURATION</label>
                    <input
                      type="text"
                      value={pkg.shoot?.days || ''}
                      onChange={(e) => updatePackageNested(idx, 'shoot', 'days', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">SHOOT LOCATIONS</label>
                    <input
                      type="text"
                      value={pkg.shoot?.locations || ''}
                      onChange={(e) => updatePackageNested(idx, 'shoot', 'locations', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">PHOTOGRAPHY CREW & SETUP</label>
                    <input
                      type="text"
                      value={pkg.photography?.cameraSetup || ''}
                      onChange={(e) => updatePackageNested(idx, 'photography', 'cameraSetup', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-mono text-slate-600 dark:text-zinc-400">CINEMATOGRAPHY SETUP</label>
                    <input
                      type="text"
                      value={pkg.cinematography?.cameraSetup || ''}
                      onChange={(e) => updatePackageNested(idx, 'cinematography', 'cameraSetup', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                {/* Deliverables List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-zinc-300">DELIVERABLES ({pkg.deliverables?.length || 0})</span>
                    <button
                      type="button"
                      onClick={() => addPackageListItem(idx, 'deliverables')}
                      className="text-xs text-vexo-red hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Deliverable</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(pkg.deliverables || []).map((del: string, delIdx: number) => (
                      <div key={delIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={del}
                          onChange={(e) => updatePackageList(idx, 'deliverables', delIdx, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => removePackageListItem(idx, 'deliverables', delIdx)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 dark:hover:bg-red-500/10 dark:text-zinc-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bonus Perks (for Gold/Platinum) */}
                {pkg.bonus && (
                  <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-vexo-red">BONUS PERKS ({pkg.bonus.length})</span>
                      <button
                        type="button"
                        onClick={() => addPackageListItem(idx, 'bonus')}
                        className="text-xs text-vexo-red hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Bonus</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pkg.bonus.map((b: string, bIdx: number) => (
                        <div key={bIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={b}
                            onChange={(e) => updatePackageList(idx, 'bonus', bIdx, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => removePackageListItem(idx, 'bonus', bIdx)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 dark:hover:bg-red-500/10 dark:text-zinc-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Add-On Services */}
      {activeTab === 'addons' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xs transition-colors">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add-On Services Pricing</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">A-la-carte upgrades couples can attach to their reservation.</p>
            </div>
            <button
              type="button"
              onClick={addAddOn}
              className="px-4 py-2 rounded-xl bg-red-50 dark:bg-vexo-red/10 border border-red-200 dark:border-vexo-red/30 text-vexo-red text-xs font-bold hover:bg-red-100 dark:hover:bg-vexo-red/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Add-On</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {addOns.map((addon: any, idx: number) => (
              <div key={addon.id || idx} className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-3.5 relative shadow-xs transition-colors">
                <button
                  type="button"
                  onClick={() => removeAddOn(idx)}
                  className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-zinc-500 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Remove add-on"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="space-y-1.5 pr-8">
                  <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 font-medium">SERVICE TITLE</label>
                  <input
                    type="text"
                    value={addon.title || ''}
                    onChange={(e) => updateAddOn(idx, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-bold transition-colors shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">PRICE (INR)</label>
                    <input
                      type="number"
                      value={addon.priceINR || 0}
                      onChange={(e) => {
                        const num = Number(e.target.value);
                        updateAddOn(idx, 'priceINR', num);
                        updateAddOn(idx, 'priceDisplay', num > 0 ? `Starting ₹${num.toLocaleString('en-IN')}` : 'As per requirement');
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">PRICE DISPLAY</label>
                    <input
                      type="text"
                      value={addon.priceDisplay || ''}
                      onChange={(e) => updateAddOn(idx, 'priceDisplay', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">BADGE</label>
                  <input
                    type="text"
                    value={addon.badge || ''}
                    onChange={(e) => updateAddOn(idx, 'badge', e.target.value)}
                    placeholder="e.g. POPULAR, KEEPSAKE"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={addon.description || ''}
                    onChange={(e) => updateAddOn(idx, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none resize-none transition-colors shadow-2xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Signature Custom Builder Services */}
      {activeTab === 'customServices' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">VEXO Signature Package Builder Services</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Configure starting rates and descriptions for the 11 custom services in the interactive builder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customServices.map((service: any, idx: number) => (
              <div key={service.id || idx} className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-3.5 shadow-xs transition-colors">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800/60">
                  <span className="text-xs font-mono font-bold text-vexo-red uppercase">{service.category}</span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500">{service.id}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 font-medium">SERVICE NAME</label>
                  <input
                    type="text"
                    value={service.name || ''}
                    onChange={(e) => updateCustomService(idx, 'name', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-bold transition-colors shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">STARTING PRICE (INR)</label>
                    <input
                      type="number"
                      value={service.startingPriceINR || 0}
                      onChange={(e) => updateCustomService(idx, 'startingPriceINR', Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">UNIT / RATE BASIS</label>
                    <input
                      type="text"
                      value={service.unit || ''}
                      onChange={(e) => updateCustomService(idx, 'unit', e.target.value)}
                      placeholder="per day / per reel"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={service.description || ''}
                    onChange={(e) => updateCustomService(idx, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none resize-none transition-colors shadow-2xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Why VEXO Pillars */}
      {activeTab === 'pillars' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Why VEXO Studio Pillars</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Edit the 5 USP trust cards displayed on the Pre-Wedding page.</p>
          </div>

          <div className="space-y-4">
            {whyUsPillars.map((pillar: any, idx: number) => (
              <div key={pillar.id || idx} className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-5 space-y-3 shadow-xs transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-red-50 dark:bg-vexo-red/20 text-vexo-red flex items-center justify-center text-xs font-bold font-mono">
                    {idx + 1}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 font-medium">PILLAR TITLE</label>
                      <input
                        type="text"
                        value={pillar.title || ''}
                        onChange={(e) => updatePillar(idx, 'title', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-bold uppercase transition-colors shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 font-medium">TAG BADGE</label>
                      <input
                        type="text"
                        value={pillar.tag || ''}
                        onChange={(e) => updatePillar(idx, 'tag', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono transition-colors shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 font-medium">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={pillar.description || ''}
                    onChange={(e) => updatePillar(idx, 'description', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none resize-none transition-colors shadow-2xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sticky Save Bar on Mobile/Bottom */}
      {isDirty && (
        <div className="fixed bottom-6 right-6 z-40 bg-white/95 dark:bg-[#120708]/95 backdrop-blur-md border border-slate-200 dark:border-vexo-red/50 shadow-xl dark:shadow-2xl rounded-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Unsaved Changes</p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">Remember to save before leaving.</p>
          </div>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-red-500/25 dark:shadow-red-900/40 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Now'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPreWeddingPage;
