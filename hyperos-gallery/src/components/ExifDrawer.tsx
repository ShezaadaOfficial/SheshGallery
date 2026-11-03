import React from 'react';
import { MediaItem } from '../types/gallery';
import { 
  X, 
  Camera, 
  MapPin, 
  Calendar, 
  Layers, 
  FileText, 
  Sparkles, 
  Copy, 
  Check 
} from 'lucide-react';

interface ExifDrawerProps {
  photo: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  onCopyText: (text: string) => void;
}

export const ExifDrawer: React.FC<ExifDrawerProps> = ({
  photo,
  isOpen,
  onClose,
  onCopyText,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (photo.detectedText) {
      onCopyText(photo.detectedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#1a1c22] text-slate-900 dark:text-white p-5 sm:p-6 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] max-h-[85vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Grab Handle for mobile */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-bold">Details & EXIF</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 pt-3 text-xs sm:text-sm">
          {/* File Title & Timestamp */}
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-900 dark:text-white text-base">
              {photo.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{photo.dateFormatted} · {new Date(photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>·</span>
              <span>{photo.exif.size}</span>
            </div>
          </div>

          {/* Camera & Lens Specs (HyperOS Leica signature card) */}
          <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {photo.exif.camera}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-600/10 text-red-600 font-mono">
                LEICA OPTICS
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {photo.exif.lens}
            </div>

            {/* 4-Box Technical Parameters */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
              <div className="p-2 rounded-xl bg-white dark:bg-black/30 shadow-xs">
                <div className="text-[10px] text-slate-400">FOCAL</div>
                <div className="font-semibold text-xs mt-0.5 text-slate-800 dark:text-slate-200">
                  {photo.exif.focalLength}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-black/30 shadow-xs">
                <div className="text-[10px] text-slate-400">APERTURE</div>
                <div className="font-semibold text-xs mt-0.5 text-slate-800 dark:text-slate-200">
                  {photo.exif.aperture}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-black/30 shadow-xs">
                <div className="text-[10px] text-slate-400">SHUTTER</div>
                <div className="font-semibold text-xs mt-0.5 text-slate-800 dark:text-slate-200">
                  {photo.exif.shutter}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-black/30 shadow-xs">
                <div className="text-[10px] text-slate-400">ISO</div>
                <div className="font-semibold text-xs mt-0.5 text-slate-800 dark:text-slate-200">
                  {photo.exif.iso}
                </div>
              </div>
            </div>
          </div>

          {/* Location & Map Mini Card */}
          <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>{photo.locationName}</span>
            </div>
            {photo.exif.coords && (
              <div className="text-[11px] text-slate-400 font-mono">
                GPS: {photo.exif.coords[0].toFixed(4)}° N, {photo.exif.coords[1].toFixed(4)}° W
              </div>
            )}
          </div>

          {/* OCR Extracted Text (HyperOS intelligent text recognition) */}
          {photo.detectedText && (
            <div className="p-3.5 rounded-2xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Text Recognized in Image (OCR)</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500 text-white text-[11px] font-semibold hover:bg-orange-600 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 font-mono bg-white/70 dark:bg-black/40 p-2.5 rounded-xl">
                "{photo.detectedText}"
              </p>
            </div>
          )}

          {/* File Storage Details */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Dimensions: {photo.exif.resolution}</span>
            <span>Format: JPEG / HEIF HDR</span>
          </div>
        </div>
      </div>
    </div>
  );
};
