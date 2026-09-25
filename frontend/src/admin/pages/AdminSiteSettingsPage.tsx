import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { adminSiteSettingsApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';

export const AdminSiteSettingsPage: React.FC = () => {
  const toast = useAdminToast();
  const [formData, setFormData] = useState<any>({
    siteName: '',
    siteDescription: '',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: '',
    contactPhone: '',
    officeAddress: '',
    copyrightText: '',
    socialSpotify: '',
    socialYoutube: '',
    socialInstagram: '',
    socialTwitter: '',
    socialFacebook: '',
    socialAppleMusic: '',
    socialSoundcloud: '',
    maintenanceMode: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await adminSiteSettingsApi.get();
      if (res.success && res.data) {
        setFormData(res.data);
      }
    } catch (err: any) {
      toast.error('Failed to load settings', err.message);
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
        toast.success('Site settings updated', 'Global branding and metadata saved successfully.');
        window.dispatchEvent(new CustomEvent('site-settings-updated', { detail: formData }));
      }
    } catch (err: any) {
      toast.error('Save failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs font-mono text-zinc-500">LOADING SITE CONFIGURATION...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Branding & SEO */}
        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-none">
          <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Brand & Identity</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-500">Global site title, meta descriptions, and legal copyright</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">PLATFORM / SITE NAME</label>
              <input
                type="text"
                value={formData.siteName || ''}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">SITE DESCRIPTION / META SEO</label>
              <textarea
                rows={2}
                value={formData.siteDescription || ''}
                onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none resize-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">COPYRIGHT NOTICE</label>
              <input
                type="text"
                value={formData.copyrightText || ''}
                onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Corporate Contact Coordinates */}
        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-none">
          <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Studio Contact Coordinates</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-500">Headquarters address, official inquiries inbox, and dispatch hotline</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">CONTACT INQUIRIES EMAIL</label>
              <input
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">DISPATCH PHONE NUMBER</label>
              <input
                type="text"
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">OFFICE / STUDIO ADDRESS</label>
              <input
                type="text"
                value={formData.officeAddress || ''}
                onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Navbar & Brand Social Profiles */}
        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-none">
          <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">Navbar & Brand Social Profiles</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-500">
              Configure the social media links displayed in the top Navigation Bar and Footer
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">
                INSTAGRAM PROFILE / HANDLE URL <span className="text-vexo-red font-bold">(NAVBAR)</span>
              </label>
              <input
                type="url"
                value={formData.socialInstagram || ''}
                onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })}
                placeholder="https://www.instagram.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">
                FACEBOOK PAGE URL <span className="text-vexo-red font-bold">(NAVBAR)</span>
              </label>
              <input
                type="url"
                value={formData.socialFacebook || ''}
                onChange={(e) => setFormData({ ...formData, socialFacebook: e.target.value })}
                placeholder="https://www.facebook.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">
                YOUTUBE CHANNEL URL <span className="text-vexo-red font-bold">(NAVBAR)</span>
              </label>
              <input
                type="url"
                value={formData.socialYoutube || ''}
                onChange={(e) => setFormData({ ...formData, socialYoutube: e.target.value })}
                placeholder="https://youtube.com/@..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">
                TWITTER / X PROFILE URL <span className="text-vexo-red font-bold">(NAVBAR)</span>
              </label>
              <input
                type="url"
                value={formData.socialTwitter || ''}
                onChange={(e) => setFormData({ ...formData, socialTwitter: e.target.value })}
                placeholder="https://x.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">SPOTIFY PROFILE URL</label>
              <input
                type="url"
                value={formData.socialSpotify || ''}
                onChange={(e) => setFormData({ ...formData, socialSpotify: e.target.value })}
                placeholder="https://spotify.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-slate-700 dark:text-zinc-300">APPLE MUSIC URL</label>
              <input
                type="url"
                value={formData.socialAppleMusic || ''}
                onChange={(e) => setFormData({ ...formData, socialAppleMusic: e.target.value })}
                placeholder="https://music.apple.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:border-vexo-red focus:ring-1 focus:ring-vexo-red/20 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode Toggle */}
        <div className="bg-white dark:bg-[#0e0e13] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 flex items-center justify-between shadow-sm dark:shadow-none">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Maintenance Mode</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-0.5">Toggle maintenance overlay across public website routes</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.maintenanceMode || false}
              onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vexo-red" />
          </label>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-xl bg-vexo-red hover:bg-red-600 text-white font-semibold text-xs tracking-wide shadow-lg shadow-red-950/40 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Settings...' : 'Update Global Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
