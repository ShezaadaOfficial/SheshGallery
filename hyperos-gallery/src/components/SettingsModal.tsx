import React, { useState } from 'react';
import { 
  X, 
  User, 
  Moon, 
  Sun, 
  Monitor, 
  HardDrive, 
  RotateCcw, 
  ShieldCheck, 
  Volume2, 
  Radio, 
  Check, 
  Smartphone,
  Eye
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUpdateUserName: (name: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  totalPhotosCount: number;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userName,
  onUpdateUserName,
  isDarkMode,
  onToggleDarkMode,
  totalPhotosCount,
  onResetData,
}) => {
  const [nameInput, setNameInput] = useState(userName);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [autoPlayMotion, setAutoPlayMotion] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gallery_autoplay_motion') !== 'false';
    } catch {
      return true;
    }
  });
  const [highQualityPreview, setHighQualityPreview] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gallery_hq_preview') !== 'false';
    } catch {
      return true;
    }
  });

  if (!isOpen) return null;

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim() || 'Sheshant';
    onUpdateUserName(trimmed);
    setNameInput(trimmed);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetToDefaultName = () => {
    setNameInput('Sheshant');
    onUpdateUserName('Sheshant');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const toggleAutoPlayMotion = () => {
    const next = !autoPlayMotion;
    setAutoPlayMotion(next);
    try {
      localStorage.setItem('gallery_autoplay_motion', String(next));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleHighQuality = () => {
    const next = !highQualityPreview;
    setHighQualityPreview(next);
    try {
      localStorage.setItem('gallery_hq_preview', String(next));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
          <div>
            <h2 className="text-lg font-bold">Gallery Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalization, themes & privacy controls
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          
          {/* Section 1: Gallery Personalization & Name */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <User className="w-4 h-4" />
              <span>Gallery Title & Owner</span>
            </div>

            <form onSubmit={handleSaveName} className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.05] space-y-3">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Gallery Owner Name
              </label>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name (e.g. Sheshant)"
                  maxLength={30}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-black/10 dark:border-white/10 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                >
                  {savedSuccess ? <Check className="w-4 h-4" /> : null}
                  <span>{savedSuccess ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>Header preview: <strong className="text-slate-900 dark:text-white font-medium">{nameInput.trim() || 'Sheshant'}&apos;s Gallery</strong></span>
                {nameInput.trim().toLowerCase() !== 'sheshant' && (
                  <button
                    type="button"
                    onClick={handleResetToDefaultName}
                    className="text-orange-500 hover:underline font-medium"
                  >
                    Reset to Sheshant
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Section 2: Appearance & Theme */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <Sun className="w-4 h-4" />
              <span>Appearance</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-500'}`}>
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold">{isDarkMode ? 'Dark Theme' : 'Light Theme'}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Switch between clean light and deep dark visual styles
                  </p>
                </div>
              </div>

              <button
                onClick={onToggleDarkMode}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isDarkMode ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                title="Toggle Dark Mode"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 3: Media & Viewer Preferences */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <Radio className="w-4 h-4" />
              <span>Media Playback</span>
            </div>

            <div className="divide-y divide-black/5 dark:divide-white/5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.05] overflow-hidden">
              {/* Auto play motion */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Motion Photos</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Play live motion loops on hold/click in viewer
                  </p>
                </div>
                <button
                  onClick={toggleAutoPlayMotion}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    autoPlayMotion ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      autoPlayMotion ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* High Quality */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">Lossless Quality Media</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Always render full resolution without compression
                  </p>
                </div>
                <button
                  onClick={toggleHighQuality}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    highQualityPreview ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      highQualityPreview ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Privacy & Storage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy & Local Storage</span>
            </div>

            <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.05] space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    100% Offline & Private
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    All images, videos, audio extracts, and custom albums are kept strictly on your local browser storage. No cloud uploads, telemetry, or remote tracking.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <HardDrive className="w-4 h-4 text-slate-400" />
                  Stored Items: {totalPhotosCount} photos & videos
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Offline Ready</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset gallery data and restore original sample items?')) {
                      onResetData();
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Gallery & Clear Local Cache</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>{userName}&apos;s Gallery · v2.4</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
