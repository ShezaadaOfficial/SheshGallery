import React from 'react';
import { X, ShieldCheck, HardDrive, WifiOff, Cpu, Lock } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  photosCount: number;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  photosCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1a1c22] text-slate-900 dark:text-white p-5 sm:p-6 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold">Privacy & Offline Vault</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% On-Device · Zero Cloud Uploads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Badges */}
        <div className="py-4 space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 flex items-start gap-3">
            <WifiOff className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-800 dark:text-emerald-300">
                Guaranteed Offline Operation
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Your photos, videos, and albums never leave your device. No telemetry, no external API calls, and no cloud servers.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] flex items-start gap-3">
            <Cpu className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                On-Device Canvas & Neural Engine
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Creative tools (Sky Replacement, Magic Eraser, Subject Cutout, Leica Frames, OCR) run strictly inside your browser's local sandbox.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] flex items-start gap-3">
            <HardDrive className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Local Device Storage
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Currently managing {photosCount} media items in local browser storage. You retain complete control over your files.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
