import React from 'react';
import { Share2, Heart, FolderPlus, Trash2, X, Check } from 'lucide-react';

interface MultiSelectBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onFavoriteSelected: () => void;
  onAddToAlbumSelected: () => void;
  onShareSelected: () => void;
}

export const MultiSelectBar: React.FC<MultiSelectBarProps> = ({
  selectedCount,
  onClearSelection,
  onDeleteSelected,
  onFavoriteSelected,
  onAddToAlbumSelected,
  onShareSelected,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto animate-slideUp">
      <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 px-4 sm:px-6 py-2.5 rounded-full bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 backdrop-blur-2xl shadow-2xl border border-white/10 dark:border-black/10">
        <div className="flex items-center gap-2 pr-2 border-r border-white/20 dark:border-black/20 text-xs font-semibold">
          <span>{selectedCount} selected</span>
          <button
            onClick={onClearSelection}
            className="p-1 rounded-full hover:bg-white/10 dark:hover:bg-black/10 text-white/60 dark:text-slate-500 hover:text-white dark:hover:text-slate-900"
            title="Deselect all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={onShareSelected}
            disabled={selectedCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 dark:hover:bg-black/10 disabled:opacity-40 text-xs font-medium transition-colors"
            title="Share selected"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={onFavoriteSelected}
            disabled={selectedCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 dark:hover:bg-black/10 disabled:opacity-40 text-xs font-medium transition-colors"
            title="Favorite selected"
          >
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Favorite</span>
          </button>

          <button
            onClick={onAddToAlbumSelected}
            disabled={selectedCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 dark:hover:bg-black/10 disabled:opacity-40 text-xs font-medium transition-colors"
            title="Add to Album"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Album</span>
          </button>

          <button
            onClick={onDeleteSelected}
            disabled={selectedCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-500/20 text-red-400 dark:text-red-600 disabled:opacity-40 text-xs font-medium transition-colors"
            title="Delete selected"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            onClick={onClearSelection}
            className="ml-1 sm:ml-2 px-3 py-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs transition-colors"
            title="Finish selection"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
