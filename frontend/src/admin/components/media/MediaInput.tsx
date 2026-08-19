import React, { useState } from 'react';
import {
  Video,
  FolderOpen,
  X,
  ExternalLink,
  Play,
  Pause,
} from 'lucide-react';
import { MediaSelectorModal } from './MediaSelectorModal';

export interface MediaInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowedTypes?: ('image' | 'video' | 'audio' | 'document')[];
  helperText?: string;
  required?: boolean;
  className?: string;
}

export const MediaInput: React.FC<MediaInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'https://... or select from media library',
  allowedTypes = ['image', 'video', 'audio'],
  helperText,
  required = false,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  const isImage =
    value &&
    (value.startsWith('data:image') ||
      value.includes('/image/') ||
      value.endsWith('.jpg') ||
      value.endsWith('.jpeg') ||
      value.endsWith('.png') ||
      value.endsWith('.webp') ||
      value.endsWith('.gif') ||
      value.includes('unsplash.com') ||
      value.includes('youtube.com/vi'));

  const isAudio =
    value &&
    (value.startsWith('data:audio') ||
      value.includes('/audio/') ||
      value.endsWith('.mp3') ||
      value.endsWith('.wav') ||
      value.endsWith('.ogg') ||
      value.endsWith('.flac'));

  const handleAudioToggle = () => {
    if (isPlayingAudio) {
      if (audioObj) audioObj.pause();
      setIsPlayingAudio(false);
    } else {
      if (audioObj) audioObj.pause();
      const a = new Audio(value);
      setAudioObj(a);
      a.play();
      setIsPlayingAudio(true);
      a.onended = () => setIsPlayingAudio(false);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-mono font-medium text-zinc-300 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-vexo-red">*</span>}
          </span>
          {value && (
            <button
              type="button"
              onClick={() => {
                if (audioObj) audioObj.pause();
                setIsPlayingAudio(false);
                onChange('');
              }}
              className="text-[10px] text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </label>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-vexo-red transition-colors"
        />

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer border border-zinc-700/60"
        >
          <FolderOpen className="w-3.5 h-3.5 text-vexo-red" />
          <span>Library</span>
        </button>
      </div>

      {helperText && <p className="text-[11px] text-zinc-500">{helperText}</p>}

      {/* Live Preview Thumbnail or Audio Player */}
      {value && (
        <div className="mt-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center gap-3">
          {isImage ? (
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-700 bg-black/60 shrink-0">
              <img
                src={value}
                alt="Selected preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as any).style.display = 'none';
                }}
              />
            </div>
          ) : isAudio ? (
            <button
              type="button"
              onClick={handleAudioToggle}
              className="w-10 h-10 rounded-lg bg-vexo-red/20 text-vexo-red-bright border border-vexo-red/40 flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
              <Video className="w-4 h-4" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate font-mono">
              {value.split('/').pop() || 'Selected Media Asset'}
            </p>
            <p className="text-[10px] text-zinc-400 truncate mt-0.5">{value}</p>
          </div>

          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setIsModalOpen(false);
        }}
        allowedTypes={allowedTypes}
        title={label ? `Select ${label}` : 'Select Media Asset'}
      />
    </div>
  );
};
