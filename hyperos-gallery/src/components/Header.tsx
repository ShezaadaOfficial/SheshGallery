import React, { useState, useRef, useEffect } from 'react';
import { 
  GalleryTab, 
  TimelineMode 
} from '../types/gallery';
import { 
  Sun, 
  Moon, 
  Grid2X2, 
  Grid3X3, 
  MoreVertical,
  RotateCcw,
  Settings
} from 'lucide-react';

interface HeaderProps {
  activeTab: GalleryTab;
  onTabChange: (tab: GalleryTab) => void;
  timelineMode: TimelineMode;
  onToggleTimelineMode: () => void;
  totalPhotosCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onResetDemoData: () => void;
  activeAlbumTitle?: string;
  onBackFromAlbum?: () => void;
  userName?: string;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  timelineMode,
  onToggleTimelineMode,
  totalPhotosCount,
  isDarkMode,
  onToggleDarkMode,
  onResetDemoData,
  activeAlbumTitle,
  onBackFromAlbum,
  userName = 'Sheshant',
  onOpenSettings,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-30 w-full hyperos-glass border-b border-black/[0.04] dark:border-white/[0.06] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Left Zone: Title & Photo Count */}
          <div className="flex items-center gap-3 shrink-0">
            {activeAlbumTitle ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onBackFromAlbum}
                  className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-700 dark:text-slate-200"
                  title="Back to albums"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-xs">
                    {activeAlbumTitle}
                  </h1>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Album items
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  {userName}&apos;s Gallery
                </h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {totalPhotosCount} {totalPhotosCount === 1 ? 'item' : 'items'}
                </div>
              </div>
            )}
          </div>

          {/* Center Zone: HyperOS Iconic Pill Tab Bar */}
          {!activeAlbumTitle && (
            <div className="flex items-center p-1 bg-black/[0.05] dark:bg-white/[0.08] rounded-full border border-black/[0.03] dark:border-white/[0.04] backdrop-blur-md">
              <button
                onClick={() => onTabChange('photos')}
                className={`relative px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'photos'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Photos
              </button>
              <button
                onClick={() => onTabChange('albums')}
                className={`relative px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'albums'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Albums
              </button>
            </div>
          )}

          {/* Right Zone: Timeline Mode Switcher (Left of Three Dots) & Three-Dot Menu */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Timeline View Switcher Button (2x2 vs 3x3 icons) */}
            {activeTab === 'photos' && !activeAlbumTitle && (
              <button
                onClick={onToggleTimelineMode}
                className={`p-2 sm:p-2.5 rounded-full transition-all active:scale-95 flex items-center justify-center ${
                  timelineMode === 'all'
                    ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
                title={
                  timelineMode === 'grouped'
                    ? 'Current: Grouped Timeline (2×2). Tap to show All Photos in 4×4 grid'
                    : 'Current: All Photos 4×4 (3×3). Tap to switch to Grouped Timeline'
                }
                aria-label="Toggle timeline view mode"
              >
                {timelineMode === 'grouped' ? (
                  <Grid2X2 className="w-5 h-5 text-slate-800 dark:text-white" />
                ) : (
                  <Grid3X3 className="w-5 h-5 text-orange-500" />
                )}
              </button>
            )}

            {/* Three-Dot Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 sm:p-2.5 rounded-full transition-all ${
                  isMenuOpen
                    ? 'bg-black/10 dark:bg-white/15 text-slate-900 dark:text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
                title="More options"
                aria-label="Menu options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* HyperOS Three-Dot Popover Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl hyperos-glass-card shadow-2xl py-2 z-50 text-slate-800 dark:text-slate-200 animate-scaleUp text-xs font-medium border border-black/10 dark:border-white/10 divide-y divide-black/[0.06] dark:divide-white/[0.06]">
                  {/* Settings Item */}
                  <div className="pb-1">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-black/5 dark:hover:bg-white/10 text-left text-slate-800 dark:text-slate-200 transition-colors font-semibold"
                    >
                      <div className="p-1 rounded-lg bg-orange-500/15 text-orange-500">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">Settings</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Change name, theme & preferences</div>
                      </div>
                    </button>
                  </div>

                  {/* Theme Switch Section */}
                  <div className="px-3.5 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isDarkMode ? (
                          <Moon className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Sun className="w-4 h-4 text-amber-500" />
                        )}
                        <span className="font-semibold text-slate-900 dark:text-white">
                          Dark Mode
                        </span>
                      </div>
                      <button
                        onClick={onToggleDarkMode}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                          isDarkMode ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        title="Toggle dark theme"
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            isDarkMode ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Reset Demo Data */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onResetDemoData();
                      }}
                      className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-black/5 dark:hover:bg-white/10 text-left text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                      <span>Reset Sample Photos</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
