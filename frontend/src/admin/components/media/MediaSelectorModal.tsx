import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  Video,
  Check,
  Link as LinkIcon,
  Play,
  Pause,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import { adminMediaApi } from '../../services/adminApiClient';
import { useAdminToast } from '../../context/AdminToastContext';

export interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, media?: any) => void;
  allowedTypes?: ('image' | 'video' | 'audio' | 'document')[];
  title?: string;
}

export const MediaSelectorModal: React.FC<MediaSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  allowedTypes = ['image', 'video', 'audio'],
  title = 'Select Media Asset',
}) => {
  const toast = useAdminToast();
  const [activeTab, setActiveTab] = useState<'browse' | 'upload' | 'url'>('browse');

  // Media Library State
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // External URL State
  const [customUrl, setCustomUrl] = useState('');

  // Audio Preview State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      toast.error('Failed to load media', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAudioId(null);
      }
    }
  }, [isOpen, selectedCategory, searchQuery]);

  if (!isOpen) return null;

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

  const handleSelectAsset = (asset: any) => {
    onSelect(asset.url, asset);
    onClose();
  };

  const handleSelectCustomUrl = () => {
    if (!customUrl.trim()) return;
    onSelect(customUrl.trim());
    onClose();
  };

  const validateAndUploadFile = async (file: File) => {
    setUploadError(null);

    // Validate category
    let fileCategory: 'image' | 'video' | 'audio' | 'document' = 'document';
    if (file.type.startsWith('image/')) fileCategory = 'image';
    else if (file.type.startsWith('audio/')) fileCategory = 'audio';
    else if (file.type.startsWith('video/')) fileCategory = 'video';

    if (!allowedTypes.includes(fileCategory)) {
      setUploadError(
        `File type "${file.type}" (${fileCategory}) is not allowed in this selector. Permitted: ${allowedTypes.join(', ')}`
      );
      return;
    }

    // Size limit validation
    const maxSizes = {
      image: 10 * 1024 * 1024,
      audio: 25 * 1024 * 1024,
      video: 50 * 1024 * 1024,
      document: 10 * 1024 * 1024,
    };

    if (file.size > maxSizes[fileCategory]) {
      const mb = Math.round(maxSizes[fileCategory] / (1024 * 1024));
      setUploadError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max limit: ${mb} MB.`);
      return;
    }

    try {
      setIsUploading(true);
      const res = await adminMediaApi.upload(file, file.name, fileCategory);
      if (res.success && res.data) {
        toast.success('Asset uploaded', `"${file.name}" uploaded and selected.`);
        onSelect(res.data.url, res.data);
        onClose();
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
      toast.error('Upload failed', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    if (allowedTypes && allowedTypes.length > 0) {
      return allowedTypes.includes(m.category as any);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0e0e13] border border-zinc-800/90 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-vexo-red" />
            <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
              Allowed: {allowedTypes.join(', ').toUpperCase()}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-2 border-b border-zinc-800/80 flex items-center gap-2 bg-[#09090c]">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-vexo-red text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Browse Library ({filteredMedia.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-vexo-red text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-vexo-red text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Direct Link URL</span>
          </button>
        </div>

        {/* Tab 1: Browse Media */}
        {activeTab === 'browse' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-vexo-red"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                {['all', 'image', 'video', 'audio'].map((cat) => {
                  if (cat !== 'all' && !allowedTypes.includes(cat as any)) return null;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Media Grid */}
            {isLoading ? (
              <div className="py-20 text-center text-xs font-mono text-zinc-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-vexo-red animate-spin" />
                <span>Loading media library...</span>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-xs bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800 flex flex-col items-center gap-2">
                <ImageIcon className="w-6 h-6 text-zinc-600" />
                <p>No matching media assets found.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className="px-3 py-1.5 rounded-lg bg-vexo-red text-white text-xs font-bold hover:bg-red-600 transition-colors mt-2 flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Upload Asset</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {filteredMedia.map((asset) => {
                  const isImage = asset.category === 'image';
                  const isAudio = asset.category === 'audio';
                  const isVideo = asset.category === 'video';
                  const isSelected = selectedAsset?.id === asset.id;
                  const isAudioPlaying = playingAudioId === asset.id;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer flex flex-col bg-zinc-900 ${
                        isSelected
                          ? 'border-vexo-red ring-2 ring-vexo-red/30'
                          : 'border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      {/* Asset Preview Thumbnail */}
                      <div className="relative aspect-square w-full bg-black/60 flex items-center justify-center overflow-hidden">
                        {isImage && (
                          <img
                            src={asset.url}
                            alt={asset.altText || asset.originalName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}

                        {isVideo && (
                          <div className="w-full h-full relative flex items-center justify-center">
                            {asset.url.includes('youtube') || asset.url.endsWith('.jpg') || asset.url.endsWith('.png') ? (
                              <img src={asset.url} alt={asset.originalName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                <Video className="w-8 h-8 text-zinc-600" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="p-2 rounded-full bg-vexo-red text-white shadow-lg">
                                <Play className="w-3.5 h-3.5 fill-white" />
                              </div>
                            </div>
                          </div>
                        )}

                        {isAudio && (
                          <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black p-4 flex flex-col items-center justify-center text-center">
                            <button
                              type="button"
                              onClick={(e) => handleAudioToggle(e, asset.id, asset.url)}
                              className="p-3 rounded-full bg-vexo-red/20 text-vexo-red-bright border border-vexo-red/30 hover:scale-110 transition-transform mb-2"
                            >
                              {isAudioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                            </button>
                            <span className="text-[10px] font-mono text-zinc-400">Audio Preview</span>
                          </div>
                        )}

                        {/* Category Badge */}
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-black/70 text-zinc-300 backdrop-blur-sm border border-white/10">
                          {asset.category}
                        </span>

                        {/* Quick Selection Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAsset(asset);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-vexo-red text-white text-xs font-bold hover:bg-red-600 transition-colors shadow-lg flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Select</span>
                          </button>
                        </div>
                      </div>

                      {/* File Details */}
                      <div className="p-2.5 min-w-0">
                        <p className="text-xs font-bold text-white truncate" title={asset.originalName || asset.filename}>
                          {asset.originalName || asset.filename}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {asset.size ? `${(asset.size / 1024).toFixed(0)} KB` : 'CDN Asset'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upload File */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer min-h-[260px] ${
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
                    validateAndUploadFile(e.target.files[0]);
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
                  {isUploading ? 'Uploading file...' : 'Click or Drag & Drop file to upload'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Supported: {allowedTypes.join(', ').toUpperCase()} (Images up to 10MB, Audio up to 25MB, Video up to 50MB)
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
        )}

        {/* Tab 3: Direct URL */}
        {activeTab === 'url' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-zinc-300">
                EXTERNAL ASSET URL (CDN, UNSPLASH, OR STREAMING LINK)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-vexo-red"
                />
                <button
                  type="button"
                  onClick={handleSelectCustomUrl}
                  disabled={!customUrl.trim()}
                  className="px-4 py-2.5 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-bold text-white transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  Use URL
                </button>
              </div>
            </div>

            {customUrl && (
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <p className="text-[11px] font-mono text-zinc-400">URL PREVIEW:</p>
                <div className="h-40 rounded-lg overflow-hidden bg-black/60 flex items-center justify-center border border-zinc-800">
                  <img
                    src={customUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as any).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-[#09090c] flex items-center justify-between">
          <div className="text-xs text-zinc-400 font-mono">
            {selectedAsset ? (
              <span className="text-white font-bold">Selected: {selectedAsset.originalName || selectedAsset.filename}</span>
            ) : (
              <span>Select an asset or upload new media</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {activeTab === 'browse' && selectedAsset && (
              <button
                type="button"
                onClick={() => handleSelectAsset(selectedAsset)}
                className="px-5 py-2 rounded-xl bg-vexo-red hover:bg-red-600 text-xs font-bold text-white shadow-lg shadow-red-950/50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Selection</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
