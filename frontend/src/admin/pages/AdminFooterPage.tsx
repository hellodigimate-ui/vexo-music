import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  PanelBottom,
  Briefcase,
  Link as LinkIcon,
  Share2,
  Eye,
} from 'lucide-react';
import { adminSiteSettingsApi, adminServicesApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { useSearchParams } from 'react-router-dom';
import type { FooterLink, SiteSettings } from '../../types';

const DEFAULT_SERVICES: FooterLink[] = [
  { id: 'fs-1', label: 'Music Production', path: '/services' },
  { id: 'fs-2', label: 'Audio & Video Production', path: '/services' },
  { id: 'fs-3', label: 'Artist Management', path: '/services' },
  { id: 'fs-4', label: 'Music Distribution', path: '/services' },
  { id: 'fs-5', label: 'Digital Marketing', path: '/services' },
  { id: 'fs-6', label: 'Brand Collaborations', path: '/services' },
  { id: 'fs-7', label: 'Pre-Wedding Shoot', path: '/pre-wedding' },
];

const DEFAULT_NAV_LINKS: FooterLink[] = [
  { id: 'fn-1', label: 'Home', path: '/' },
  { id: 'fn-2', label: 'Music', path: '/music' },
  { id: 'fn-3', label: 'Artists', path: '/artists' },
  { id: 'fn-4', label: 'Services', path: '/services' },
  { id: 'fn-5', label: 'Events', path: '/events' },
  { id: 'fn-6', label: 'Videos', path: '/videos' },
  { id: 'fn-7', label: 'About', path: '/about' },
  { id: 'fn-8', label: 'Contact', path: '/contact' },
];

type TabKey = 'services' | 'quickLinks' | 'contact' | 'brandSocials' | 'bottomBar';

export const AdminFooterPage: React.FC = () => {
  const toast = useAdminToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabKey | null;
  const validTabs: TabKey[] = ['services', 'quickLinks', 'contact', 'brandSocials', 'bottomBar'];

  const [activeTab, setActiveTabState] = useState<TabKey>(() => {
    return tabParam && validTabs.includes(tabParam) ? tabParam : 'services';
  });

  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam) && tabParam !== activeTab) {
      setActiveTabState(tabParam);
    }
  }, [tabParam]);

  const setActiveTab = (tab: TabKey) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [formData, setFormData] = useState<SiteSettings>({
    siteName: 'VEXO Music Entertainment',
    siteDescription: '',
    footerBio:
      'Premier record label, studio production house, and artist management company.',
    contactEmail: 'contact@vexomusic.com',
    contactPhone: '+91 72399 99966',
    officeAddress:
      'SKY CROWN, Office No. 205, Chordiya City, Kamla Nehru Nagar, Ajmer Road, Jaipur, Pin Code- 302021, Rajasthan, India',
    copyrightText: '© 2026 VEXO Music Entertainment Pvt. Ltd. All rights reserved.',
    socialSpotify: 'https://spotify.com',
    socialYoutube: 'https://youtube.com/@vexomusicentertainment',
    socialInstagram: 'https://www.instagram.com/vexomusicentertainment',
    socialTwitter: 'https://x.com/vexomusicentertainment',
    socialAppleMusic: '',
    socialFacebook: '',
    socialSoundcloud: '',
    footerQuickLinksHeading: 'QUICK LINKS',
    footerQuickLinks: DEFAULT_NAV_LINKS,
    footerServicesHeading: 'SERVICES',
    footerServicesLinks: DEFAULT_SERVICES,
    footerContactHeading: 'CONTACT US',
    footerStatusText: 'STUDIO ACTIVE • JAIPUR',
    footerStatusEnabled: true,
    footerBackToTopEnabled: true,
    footerAdminLinkEnabled: true,
  });

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await adminSiteSettingsApi.get();
      if (res.success && res.data) {
        const d = res.data;
        setFormData({
          ...d,
          footerBio: d.footerBio || d.siteDescription || '',
          footerQuickLinksHeading: d.footerQuickLinksHeading || 'QUICK LINKS',
          footerQuickLinks:
            Array.isArray(d.footerQuickLinks) && d.footerQuickLinks.length > 0
              ? d.footerQuickLinks
              : DEFAULT_NAV_LINKS,
          footerServicesHeading: d.footerServicesHeading || 'SERVICES',
          footerServicesLinks:
            Array.isArray(d.footerServicesLinks) && d.footerServicesLinks.length > 0
              ? d.footerServicesLinks
              : DEFAULT_SERVICES,
          footerContactHeading: d.footerContactHeading || 'CONTACT US',
          footerStatusText: d.footerStatusText || 'STUDIO ACTIVE • JAIPUR',
          footerStatusEnabled: d.footerStatusEnabled !== undefined ? d.footerStatusEnabled : true,
          footerBackToTopEnabled:
            d.footerBackToTopEnabled !== undefined ? d.footerBackToTopEnabled : true,
          footerAdminLinkEnabled:
            d.footerAdminLinkEnabled !== undefined ? d.footerAdminLinkEnabled : true,
        });
      }
    } catch (err: any) {
      toast.error('Failed to load footer settings', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await adminSiteSettingsApi.update(formData);
      if (res.success) {
        toast.success(
          'Footer Configuration Saved',
          'Global footer updated immediately across public website.'
        );
        window.dispatchEvent(new CustomEvent('site-settings-updated', { detail: formData }));
      }
    } catch (err: any) {
      toast.error('Save failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Sync from Live Services Catalog
  const handleSyncFromServices = async () => {
    try {
      setIsSyncing(true);
      const res = await adminServicesApi.list();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const syncedLinks: FooterLink[] = res.data
          .filter((s: any) => s.isActive !== false)
          .map((s: any) => ({
            id: `fs-sync-${s.id}`,
            label: s.title || s.name,
            path: s.slug ? `/services/${s.slug}` : '/services',
            isExternal: false,
          }));

        // Always ensure pre-wedding is represented if not in services list
        if (!syncedLinks.some((l) => l.label.toLowerCase().includes('pre-wedding'))) {
          syncedLinks.push({
            id: 'fs-prewedding',
            label: 'Pre-Wedding Shoot',
            path: '/pre-wedding',
            isExternal: false,
          });
        }

        setFormData((prev) => ({
          ...prev,
          footerServicesLinks: syncedLinks,
        }));
        toast.success(
          'Services Synced',
          `Imported ${syncedLinks.length} active services into footer.`
        );
      } else {
        toast.info('Catalog check', 'No active services found in catalog.');
      }
    } catch (err: any) {
      toast.error('Sync failed', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Service Links Helpers
  const addServiceLink = () => {
    setFormData((prev) => ({
      ...prev,
      footerServicesLinks: [
        ...(prev.footerServicesLinks || []),
        {
          id: `fs-${Date.now()}`,
          label: 'New Service',
          path: '/services',
          isExternal: false,
        },
      ],
    }));
  };

  const updateServiceLink = (index: number, field: keyof FooterLink, value: any) => {
    setFormData((prev) => {
      const list = [...(prev.footerServicesLinks || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, footerServicesLinks: list };
    });
  };

  const removeServiceLink = (index: number) => {
    setFormData((prev) => {
      const list = [...(prev.footerServicesLinks || [])];
      list.splice(index, 1);
      return { ...prev, footerServicesLinks: list };
    });
  };

  const moveServiceLink = (index: number, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const list = [...(prev.footerServicesLinks || [])];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return prev;
      const [item] = list.splice(index, 1);
      list.splice(target, 0, item);
      return { ...prev, footerServicesLinks: list };
    });
  };

  // Quick Links Helpers
  const addQuickLink = () => {
    setFormData((prev) => ({
      ...prev,
      footerQuickLinks: [
        ...(prev.footerQuickLinks || []),
        {
          id: `fn-${Date.now()}`,
          label: 'New Page',
          path: '/',
          isExternal: false,
        },
      ],
    }));
  };

  const updateQuickLink = (index: number, field: keyof FooterLink, value: any) => {
    setFormData((prev) => {
      const list = [...(prev.footerQuickLinks || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, footerQuickLinks: list };
    });
  };

  const removeQuickLink = (index: number) => {
    setFormData((prev) => {
      const list = [...(prev.footerQuickLinks || [])];
      list.splice(index, 1);
      return { ...prev, footerQuickLinks: list };
    });
  };

  const moveQuickLink = (index: number, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const list = [...(prev.footerQuickLinks || [])];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= list.length) return prev;
      const [item] = list.splice(index, 1);
      list.splice(target, 0, item);
      return { ...prev, footerQuickLinks: list };
    });
  };

  const tabs: { id: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'services', label: 'Column 3: Services', icon: Briefcase },
    { id: 'quickLinks', label: 'Column 2: Quick Links', icon: LinkIcon },
    { id: 'contact', label: 'Column 4: Contact & Status', icon: MapPin },
    { id: 'brandSocials', label: 'Column 1: Bio & Socials', icon: Share2 },
    { id: 'bottomBar', label: 'Bottom Bar & Copyright', icon: PanelBottom },
  ];

  if (isLoading) {
    return (
      <div className="py-28 text-center text-xs font-mono text-zinc-500 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-vexo-red border-t-transparent rounded-full animate-spin" />
        <span>LOADING FOOTER CONFIGURATION...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto min-w-0 space-y-6 pb-24">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-vexo-red" />
            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Footer Customization CMS
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Manage all 4 columns, navigation links, services directory, contact details, and social channels displayed on the website footer.
          </p>
        </div>

        <a
          href="/#footer"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-xs font-mono text-slate-700 dark:text-zinc-300 flex items-center gap-2 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer w-fit"
        >
          <Eye className="w-3.5 h-3.5 text-vexo-red" />
          <span>View Live Footer</span>
        </a>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-vexo-red text-white shadow-lg shadow-red-950/30'
                  : 'bg-white dark:bg-[#0e0e13] text-slate-600 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-zinc-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. SERVICES COLUMN TAB */}
        {activeTab === 'services' && (
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-sm transition-colors">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-vexo-red" />
                  <span>Column 3: Services Directory Links</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                  Customize the list of services shown under the Services column in the footer.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncFromServices}
                  disabled={isSyncing}
                  title="Import from active services catalog"
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync from Catalog</span>
                </button>

                <button
                  type="button"
                  onClick={addServiceLink}
                  className="px-4 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-950/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>
            </div>

            {/* Heading input */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 space-y-2">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
                COLUMN HEADING TITLE *
              </label>
              <input
                type="text"
                value={formData.footerServicesHeading || ''}
                onChange={(e) => setFormData({ ...formData, footerServicesHeading: e.target.value })}
                placeholder="SERVICES"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-bold"
                required
              />
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
                Displays above the services list with the signature red accent bar
              </p>
            </div>

            {/* List of Services */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-zinc-400 px-1">
                <span>SERVICES LIST ({formData.footerServicesLinks?.length || 0})</span>
                <span>Reorder with arrows</span>
              </div>

              {(!formData.footerServicesLinks || formData.footerServicesLinks.length === 0) ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-zinc-800 text-center space-y-2">
                  <p className="text-xs text-zinc-500 font-mono">No services configured for footer.</p>
                  <button
                    type="button"
                    onClick={addServiceLink}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Service</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {formData.footerServicesLinks.map((service, idx) => (
                    <div
                      key={service.id || idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-vexo-red/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-vexo-red/10 text-vexo-red text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                          <input
                            type="text"
                            value={service.label}
                            onChange={(e) => updateServiceLink(idx, 'label', e.target.value)}
                            placeholder="Service Name (e.g. Music Production)"
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-medium"
                            required
                          />

                          <input
                            type="text"
                            value={service.path}
                            onChange={(e) => updateServiceLink(idx, 'path', e.target.value)}
                            placeholder="/services or URL"
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => moveServiceLink(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveServiceLink(idx, 'down')}
                          disabled={idx === (formData.footerServicesLinks?.length || 0) - 1}
                          className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeServiceLink(idx)}
                          className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. QUICK LINKS COLUMN TAB */}
        {activeTab === 'quickLinks' && (
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-sm transition-colors">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-vexo-red" />
                  <span>Column 2: Quick Navigation Links</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                  Customize the primary navigation pages linked in the Quick Links footer column.
                </p>
              </div>

              <button
                type="button"
                onClick={addQuickLink}
                className="px-4 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-950/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Add Quick Link</span>
              </button>
            </div>

            {/* Heading input */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 space-y-2">
              <label className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
                COLUMN HEADING TITLE *
              </label>
              <input
                type="text"
                value={formData.footerQuickLinksHeading || ''}
                onChange={(e) => setFormData({ ...formData, footerQuickLinksHeading: e.target.value })}
                placeholder="QUICK LINKS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-bold"
                required
              />
            </div>

            {/* List of Quick Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-600 dark:text-zinc-400 px-1">
                <span>LINKS LIST ({formData.footerQuickLinks?.length || 0})</span>
                <span>Reorder with arrows</span>
              </div>

              <div className="space-y-2.5">
                {(formData.footerQuickLinks || []).map((link, idx) => (
                  <div
                    key={link.id || idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-vexo-red/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-vexo-red/10 text-vexo-red text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => updateQuickLink(idx, 'label', e.target.value)}
                          placeholder="Link Label (e.g. Music)"
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-medium"
                          required
                        />

                        <input
                          type="text"
                          value={link.path}
                          onChange={(e) => updateQuickLink(idx, 'path', e.target.value)}
                          placeholder="/music"
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => moveQuickLink(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => moveQuickLink(idx, 'down')}
                        disabled={idx === (formData.footerQuickLinks?.length || 0) - 1}
                        className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => removeQuickLink(idx)}
                        className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. CONTACT & STATUS COLUMN TAB */}
        {activeTab === 'contact' && (
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-sm transition-colors">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                <MapPin className="w-4 h-4 text-vexo-red" />
                <span>Column 4: Contact Coordinates & Live Status</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                Studio headquarters address, dispatch hotline, official inquiries inbox, and live status badge.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">
                  COLUMN HEADING TITLE
                </label>
                <input
                  type="text"
                  value={formData.footerContactHeading || ''}
                  onChange={(e) => setFormData({ ...formData, footerContactHeading: e.target.value })}
                  placeholder="CONTACT US"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-vexo-red" />
                  <span>OFFICE / STUDIO ADDRESS</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.officeAddress || ''}
                  onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                  placeholder="SKY CROWN, Office No. 205..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-vexo-red" />
                    <span>PHONE NUMBER</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+91 72399 99966"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-vexo-red" />
                    <span>INQUIRIES EMAIL</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contact@vexomusic.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Live Studio Status Badge Settings */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Live Studio Status Indicator
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
                      Pulsing green live beacon displayed beneath contact info
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.footerStatusEnabled !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, footerStatusEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                    STATUS TEXT
                  </label>
                  <input
                    type="text"
                    value={formData.footerStatusText || ''}
                    onChange={(e) => setFormData({ ...formData, footerStatusText: e.target.value })}
                    placeholder="STUDIO ACTIVE • JAIPUR"
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. BIO & SOCIALS TAB */}
        {activeTab === 'brandSocials' && (
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-sm transition-colors">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                <Share2 className="w-4 h-4 text-vexo-red" />
                <span>Column 1: Brand Bio & Social Profiles</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                Paragraph description displayed under the VEXO logo and brand channels.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">
                  FOOTER BIO / EDITORIAL SUMMARY
                </label>
                <textarea
                  rows={3}
                  value={formData.footerBio || ''}
                  onChange={(e) => setFormData({ ...formData, footerBio: e.target.value })}
                  placeholder="Premier record label, studio production house, and artist management company..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 space-y-4">
                <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                  SOCIAL MEDIA CHANNEL URLS
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                      INSTAGRAM URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialInstagram || ''}
                      onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                      YOUTUBE URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialYoutube || ''}
                      onChange={(e) => setFormData({ ...formData, socialYoutube: e.target.value })}
                      placeholder="https://youtube.com/@..."
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                      SPOTIFY URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialSpotify || ''}
                      onChange={(e) => setFormData({ ...formData, socialSpotify: e.target.value })}
                      placeholder="https://spotify.com/..."
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                      TWITTER / X URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialTwitter || ''}
                      onChange={(e) => setFormData({ ...formData, socialTwitter: e.target.value })}
                      placeholder="https://x.com/..."
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                      APPLE MUSIC URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialAppleMusic || ''}
                      onChange={(e) => setFormData({ ...formData, socialAppleMusic: e.target.value })}
                      placeholder="https://music.apple.com/..."
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400">
                      FACEBOOK URL
                    </label>
                    <input
                      type="url"
                      value={formData.socialFacebook || ''}
                      onChange={(e) => setFormData({ ...formData, socialFacebook: e.target.value })}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. BOTTOM BAR TAB */}
        {activeTab === 'bottomBar' && (
          <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-sm transition-colors">
            <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                <PanelBottom className="w-4 h-4 text-vexo-red" />
                <span>Footer Bottom Strip & Utilities</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                Configure copyright legal statement, Back-To-Top button, and admin shortcut visibility.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">
                  COPYRIGHT NOTICE
                </label>
                <input
                  type="text"
                  value={formData.copyrightText || ''}
                  onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                  placeholder="© 2026 VEXO Music Entertainment Pvt. Ltd. All rights reserved."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white focus:border-vexo-red focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      "Back to Top" Button
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
                      Smooth scrolling pill on bottom right
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.footerBackToTopEnabled !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, footerBackToTopEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-vexo-red" />
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      "Admin CMS" Shortcut Link
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
                      Link in bottom bar for authorized admins
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.footerAdminLinkEnabled !== false}
                      onChange={(e) =>
                        setFormData({ ...formData, footerAdminLinkEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-vexo-red" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Visual Preview Mirror */}
        <div className="bg-black border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-mono font-bold text-zinc-400 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-vexo-red" />
              <span>LIVE FOOTER PREVIEW (REAL-TIME MIRROR)</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-600">Public appearance preview</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs pt-2">
            {/* Col 1 */}
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase text-zinc-500">Column 1 (Bio)</p>
              <p className="text-zinc-300 text-xs leading-relaxed line-clamp-3">
                {formData.footerBio || formData.siteDescription}
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <p className="font-bold text-xs uppercase text-white border-l-2 border-vexo-red pl-2">
                {formData.footerQuickLinksHeading || 'QUICK LINKS'}
              </p>
              <ul className="space-y-1 text-zinc-400 text-xs">
                {(formData.footerQuickLinks || []).slice(0, 5).map((l, i) => (
                  <li key={i} className="truncate">• {l.label}</li>
                ))}
                {(formData.footerQuickLinks?.length || 0) > 5 && (
                  <li className="text-[10px] text-zinc-600">+{(formData.footerQuickLinks?.length || 0) - 5} more</li>
                )}
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <p className="font-bold text-xs uppercase text-white border-l-2 border-vexo-red pl-2">
                {formData.footerServicesHeading || 'SERVICES'}
              </p>
              <ul className="space-y-1 text-zinc-400 text-xs">
                {(formData.footerServicesLinks || []).slice(0, 5).map((s, i) => (
                  <li key={i} className="truncate">• {s.label}</li>
                ))}
                {(formData.footerServicesLinks?.length || 0) > 5 && (
                  <li className="text-[10px] text-zinc-600">+{(formData.footerServicesLinks?.length || 0) - 5} more</li>
                )}
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <p className="font-bold text-xs uppercase text-white border-l-2 border-vexo-red pl-2">
                {formData.footerContactHeading || 'CONTACT US'}
              </p>
              <p className="text-zinc-400 truncate">{formData.officeAddress}</p>
              <p className="text-zinc-400 font-mono">{formData.contactPhone}</p>
              <p className="text-zinc-400 font-mono">{formData.contactEmail}</p>
              {formData.footerStatusEnabled !== false && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{formData.footerStatusText}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Save Bar */}
        <div className="sticky bottom-4 z-20 p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#0e0e13]/95 backdrop-blur-md border border-slate-200 dark:border-zinc-800/90 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 font-mono min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">Changes will apply directly to the website footer</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={fetchSettings}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-xs text-slate-700 dark:text-zinc-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer border border-slate-200 dark:border-transparent text-center whitespace-nowrap shrink-0"
            >
              Discard Changes
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <Save className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{isSaving ? 'Saving Footer...' : 'Save Footer Configuration'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminFooterPage;
