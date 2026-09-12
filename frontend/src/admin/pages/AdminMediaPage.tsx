import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  LayoutGrid,
  List,
  Play,
  Pause,
  AlertCircle,
  Loader2,
  HardDrive,
  Eye,
} from 'lucide-react';
import { adminMediaApi } from '../services/adminApiClient';
import { useAdminToast } from '../context/AdminToastContext';
import { Modal } from '../components/Modal';
import { AdminConfirmModal } from '../components/AdminConfirmModal';
import { getMediaUrl } from '../../lib/utils';

export const AdminMediaPage: React.FC = () => {
  const toast = useAdminToast();
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Audio Playback Preview State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Styled Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail / Preview Modal State
  const [previewAsset, setPreviewAsset] = useState<any | null>(null);

  // Upload / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Direct URL Form State
  const [urlFormData, setUrlFormData] = useState({
    filename: '',
    originalName: '',
    url: '',
    mimeType: 'image/jpeg',
    size: 500000,
    altText: '',
    category: 'image',
  });

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const res = await adminMediaApi.list({
        category: selectedCategory,
        search: searchQuery,
      });
      if (res.success && res.data) {
        setMediaList(res.data);
      }
    } catch (err: any) {
      toast.error('Failed to fetch media assets', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [selectedCategory, searchQuery]);

  const handleAudioToggle = (e: React.MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    if (playingAudioId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      setPlayingAudioId(id);
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  const openCreateModal = () => {
    setUrlFormData({
      filename: `asset-${Date.now()}.jpg`,
      originalName: '',
      url: '',
      mimeType: 'image/jpeg',
      size: 500000,
      altText: '',
      category: 'image',
    });
    setUploadError(null);
    setUploadTab('file');
    setIsModalOpen(true);
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL Copied', 'Asset CDN URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);

    // Validation
    let category: 'image' | 'video' | 'audio' | 'document' = 'document';
    if (file.type.startsWith('image/')) category = 'image';
    else if (file.type.startsWith('audio/')) category = 'audio';
    else if (file.type.startsWith('video/')) category = 'video';

    const maxSizes = {
      image: 10 * 1024 * 1024,
      audio: 25 * 1024 * 1024,
      video: 50 * 1024 * 1024,
      document: 10 * 1024 * 1024,
    };

    if (file.size > maxSizes[category]) {
      const mb = Math.round(maxSizes[category] / (1024 * 1024));
      setUploadError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum limit is ${mb} MB for ${category} assets.`);
      return;
    }

    try {
      setIsUploading(true);
      const res = await adminMediaApi.upload(file, file.name, category);
      if (res.success) {
        toast.success('Asset Uploaded', `"${file.name}" added to media library.`);
        setIsModalOpen(false);
        fetchMedia();
      }
    } catch (err: any) {
      setUploadError(err.message || 'File upload failed');
      toast.error('Upload failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await adminMediaApi.create(urlFormData);
      toast.success('Asset registered', `"${urlFormData.originalName || urlFormData.filename}" added to media library.`);
      setIsModalOpen(false);
      fetchMedia();
    } catch (err: any) {
      toast.error('Asset registration failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminMediaApi.delete(deleteTarget.id);
      toast.info('Asset deleted', `"${deleteTarget.name}" removed from library.`);
      setDeleteTarget(null);
      fetchMedia();
    } catch (err: any) {
      toast.error('Delete failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Stats calculation
  const totalAssets = mediaList.length;
  const imageCount = mediaList.filter((m) => m.category === 'image').length;
  const audioCount = mediaList.filter((m) => m.category === 'audio').length;
  const videoCount = mediaList.filter((m) => m.category === 'video').length;
  const totalBytes = mediaList.reduce((acc, m) => acc + (Number(m.size) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0e0e13] border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Total Assets</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalAssets}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-800/60 text-zinc-300">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e13] border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Images</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{imageCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-900/40">
            <ImageIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e13] border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Audio Masters</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{audioCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-900/40">
            <Music className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0e0e13] border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Videos & Clips</p>
            <p className="text-xl font-bold text-purple-400 mt-0.5">{videoCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-950/40 text-purple-400 border border-purple-900/40">
            <Video className="w-4 h-4" />
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-[#0e0e13] border border-zinc-800/80 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Storage Used</p>
            <p className="text-xl font-bold text-vexo-red-bright mt-0.5">{formatBytes(totalBytes)}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-vexo-red/10 text-vexo-red border border-vexo-red/20">
            <HardDrive className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Action Bar (Search, Category Filters, View Switcher, Upload Button) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#0e0e13] p-4 rounded-2xl border border-zinc-800/80">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media files by name, type, or alt text..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:border-vexo-red focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {[
              { key: 'all', label: 'All' },
              { key: 'image', label: 'Images' },
              { key: 'audio', label: 'Audio' },
              { key: 'video', label: 'Videos' },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-vexo-red text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Media Button */}
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-semibold text-white shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-24 text-center text-xs font-mono text-zinc-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-vexo-red animate-spin" />
          <span>LOADING MEDIA CATALOG...</span>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl p-16 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-600">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-300">No media assets found</p>
            <p className="text-xs text-zinc-500 mt-1">
              Upload images, audio stems, or video clips to build your media library.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="mt-2 px-4 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload First Asset</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map((media) => {
            const isImage = media.category === 'image';
            const isAudio = media.category === 'audio';
            const isVideo = media.category === 'video';
            const isAudioPlaying = playingAudioId === media.id;

            return (
              <div
                key={media.id}
                className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl overflow-hidden group hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                {/* Media Thumbnail */}
                <div className="relative aspect-video bg-black/60 overflow-hidden flex items-center justify-center">
                  {isImage ? (
                    <img
                      src={getMediaUrl(media.url)}
                      alt={media.altText || media.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : isVideo ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-zinc-900">
                      {media.url.includes('youtube') || media.url.endsWith('.jpg') || media.url.endsWith('.png') ? (
                        <img src={getMediaUrl(media.url)} alt={media.filename} className="w-full h-full object-cover" />
                      ) : (
                        <Video className="w-10 h-10 text-purple-400" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="p-2.5 rounded-full bg-purple-600 text-white shadow-lg">
                          <Play className="w-4 h-4 fill-white" />
                        </div>
                      </div>
                    </div>
                  ) : isAudio ? (
                    <div className="w-full h-full bg-gradient-to-br from-amber-950/30 to-black p-4 flex flex-col items-center justify-center text-center">
                      <button
                        type="button"
                        onClick={(e) => handleAudioToggle(e, media.id, media.url)}
                        className="p-3 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:scale-110 transition-transform mb-2 cursor-pointer shadow-lg"
                      >
                        {isAudioPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                      </button>
                      <span className="text-[10px] font-mono text-amber-300/80">Audio Master</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <FileText className="w-12 h-12" />
                    </div>
                  )}

                  {/* Category Pill */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase bg-black/75 text-zinc-300 backdrop-blur-sm border border-white/10">
                    {media.category}
                  </span>

                  {/* Hover Quick Actions */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPreviewAsset(media)}
                      className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-white transition-colors cursor-pointer"
                      title="Inspect Asset"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={media.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-white transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => setDeleteTarget({ id: media.id, name: media.originalName || media.filename })}
                      className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 transition-colors cursor-pointer"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Media Details & Copy Button */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-semibold text-xs text-white truncate" title={media.originalName || media.filename}>
                      {media.originalName || media.filename}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                      {formatBytes(media.size)} &bull; {media.mimeType}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopyUrl(media.url, media.id)}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      copiedId === media.id
                        ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                        : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {copiedId === media.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>COPIED URL!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>COPY ASSET URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / TABLE VIEW */
        <div className="bg-[#0e0e13] border border-zinc-800/80 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 bg-zinc-900/50 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4">Type / Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">MIME Type</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {mediaList.map((media) => {
                  const isImage = media.category === 'image';
                  const isAudio = media.category === 'audio';
                  const isVideo = media.category === 'video';

                  return (
                    <tr key={media.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/60 shrink-0 border border-zinc-800 flex items-center justify-center">
                            {isImage ? (
                              <img src={getMediaUrl(media.url)} alt="" className="w-full h-full object-cover" />
                            ) : isAudio ? (
                              <Music className="w-4 h-4 text-amber-400" />
                            ) : isVideo ? (
                              <Video className="w-4 h-4 text-purple-400" />
                            ) : (
                              <FileText className="w-4 h-4 text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-xs sm:max-w-sm">
                              {media.originalName || media.filename}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono truncate">{media.url}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {media.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-400">
                        {formatBytes(media.size)}
                      </td>

                      <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                        {media.mimeType}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyUrl(media.url, media.id)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            title="Copy URL"
                          >
                            {copiedId === media.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setPreviewAsset(media)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            title="Inspect Asset"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={media.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => setDeleteTarget({ id: media.id, name: media.originalName || media.filename })}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 transition-colors cursor-pointer"
                            title="Delete Asset"
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
        </div>
      )}

      {/* Upload Asset Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Media Asset"
        subtitle="Upload image, video clip, or audio preview to the VEXO Media Library"
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <button
              type="button"
              onClick={() => setUploadTab('file')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                uploadTab === 'file' ? 'bg-vexo-red text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Local File</span>
            </button>
            <button
              type="button"
              onClick={() => setUploadTab('url')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                uploadTab === 'url' ? 'bg-vexo-red text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Direct Link URL</span>
            </button>
          </div>

          {uploadTab === 'file' ? (
            /* File Upload Tab */
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer min-h-[220px] ${
                  isDragOver
                    ? 'border-vexo-red bg-vexo-red/5'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="p-4 rounded-full bg-zinc-800 text-vexo-red-bright border border-zinc-700">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    {isUploading ? 'Uploading file to storage...' : 'Click or Drag & Drop file to upload'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Images (JPG, PNG, WebP ≤ 10MB) &bull; Audio (MP3, WAV ≤ 25MB) &bull; Video (MP4 ≤ 50MB)
                  </p>
                </div>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-900 text-red-300 text-xs flex items-center gap-2 text-left max-w-md mt-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* External URL Tab */
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">ASSET / FILE URL *</label>
                <input
                  type="url"
                  value={urlFormData.url}
                  onChange={(e) => setUrlFormData({ ...urlFormData, url: e.target.value })}
                  placeholder="https://images.unsplash.com/... or CDN link"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">FILENAME / LABEL *</label>
                <input
                  type="text"
                  value={urlFormData.filename}
                  onChange={(e) => setUrlFormData({ ...urlFormData, filename: e.target.value, originalName: e.target.value })}
                  placeholder="e.g. tour-poster-2026.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-zinc-300">CATEGORY</label>
                  <select
                    value={urlFormData.category}
                    onChange={(e) => setUrlFormData({ ...urlFormData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                  >
                    <option value="image">Image (Cover / Banner)</option>
                    <option value="audio">Audio (Master / Stem)</option>
                    <option value="video">Video (4K / Clip)</option>
                    <option value="document">Document (Rider / Contract)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-medium text-zinc-300">MIME TYPE</label>
                  <input
                    type="text"
                    value={urlFormData.mimeType}
                    onChange={(e) => setUrlFormData({ ...urlFormData, mimeType: e.target.value })}
                    placeholder="image/jpeg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-zinc-300">ALT / ACCESSIBILITY TEXT</label>
                <input
                  type="text"
                  value={urlFormData.altText}
                  onChange={(e) => setUrlFormData({ ...urlFormData, altText: e.target.value })}
                  placeholder="Description of visual asset"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-vexo-red focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-semibold text-white cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Registering...' : 'Add to Media Library'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Asset Preview Modal */}
      {previewAsset && (
        <Modal
          isOpen={Boolean(previewAsset)}
          onClose={() => setPreviewAsset(null)}
          title={previewAsset.originalName || previewAsset.filename}
          subtitle={`Type: ${previewAsset.category.toUpperCase()} • Size: ${formatBytes(previewAsset.size)}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="max-h-80 rounded-xl overflow-hidden bg-black/80 flex items-center justify-center border border-zinc-800">
              {previewAsset.category === 'image' ? (
                <img src={getMediaUrl(previewAsset.url)} alt="" className="max-h-80 w-auto object-contain" />
              ) : previewAsset.category === 'audio' ? (
                <div className="p-8 flex flex-col items-center gap-3">
                  <Music className="w-12 h-12 text-amber-400" />
                  <audio controls src={previewAsset.url} className="w-full max-w-md mt-2" />
                </div>
              ) : previewAsset.category === 'video' ? (
                <div className="p-8 flex flex-col items-center gap-3">
                  <Video className="w-12 h-12 text-purple-400" />
                  <a
                    href={previewAsset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Watch Video Stream</span>
                  </a>
                </div>
              ) : (
                <FileText className="w-12 h-12 text-zinc-500" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80 font-mono">
              <div>
                <span className="text-zinc-500 block text-[10px]">MIME TYPE</span>
                <span className="text-zinc-200">{previewAsset.mimeType}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">FILE SIZE</span>
                <span className="text-zinc-200">{formatBytes(previewAsset.size)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-500 block text-[10px]">PUBLIC URL</span>
                <span className="text-zinc-300 break-all text-[11px]">{previewAsset.url}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => handleCopyUrl(previewAsset.url, previewAsset.id)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="px-4 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-bold text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Styled Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Media Asset"
        itemName={deleteTarget?.name}
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? Any public pages embedding this media URL will no longer be able to load it.`}
        confirmText="Delete Asset"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
