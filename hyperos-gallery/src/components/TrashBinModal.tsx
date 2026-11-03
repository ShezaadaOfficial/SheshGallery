import React from 'react';
import { MediaItem } from '../types/gallery';
import { X, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

interface TrashBinModalProps {
  deletedPhotos: MediaItem[];
  isOpen: boolean;
  onClose: () => void;
  onRestorePhoto: (id: string) => void;
  onRestoreAll: () => void;
  onEmptyTrash: () => void;
}

export const TrashBinModal: React.FC<TrashBinModalProps> = ({
  deletedPhotos,
  isOpen,
  onClose,
  onRestorePhoto,
  onRestoreAll,
  onEmptyTrash,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#181a20] text-slate-900 dark:text-white p-5 sm:p-6 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Trash Bin
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Items are retained for 30 days before permanent deletion
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4">
          {deletedPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
              <Trash2 className="w-10 h-10 stroke-1 opacity-50 mb-2" />
              <p className="text-sm font-medium">Trash bin is empty</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Photos you delete will appear here for 30 days
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {deletedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-black/5 dark:border-white/5"
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                    <span className="truncate text-[11px] max-w-[65%]">
                      {photo.title}
                    </span>
                    <button
                      onClick={() => onRestorePhoto(photo.id)}
                      className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-colors"
                      title="Restore photo"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {deletedPhotos.length > 0 && (
          <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between shrink-0">
            <button
              onClick={onEmptyTrash}
              className="px-4 py-2 rounded-full text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Empty Trash ({deletedPhotos.length})</span>
            </button>

            <button
              onClick={onRestoreAll}
              className="px-4 py-2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore All</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
