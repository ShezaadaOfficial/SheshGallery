import React, { useState } from 'react';
import { MediaItem } from '../types/gallery';
import { X, FolderPlus, Check } from 'lucide-react';

interface CreateAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePhotos: MediaItem[];
  onCreateAlbum: (title: string, selectedPhotoIds: string[]) => void;
}

export const CreateAlbumModal: React.FC<CreateAlbumModalProps> = ({
  isOpen,
  onClose,
  availablePhotos,
  onCreateAlbum,
}) => {
  const [albumTitle, setAlbumTitle] = useState('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim()) return;
    onCreateAlbum(albumTitle.trim(), selectedPhotoIds);
    setAlbumTitle('');
    setSelectedPhotoIds([]);
    onClose();
  };

  const toggleSelectPhoto = (id: string) => {
    if (selectedPhotoIds.includes(id)) {
      setSelectedPhotoIds(selectedPhotoIds.filter((p) => p !== id));
    } else {
      setSelectedPhotoIds([...selectedPhotoIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1a1c22] text-slate-900 dark:text-white p-5 sm:p-6 shadow-2xl border border-black/[0.06] dark:border-white/[0.08] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-bold">Create New Album</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden pt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Album Name
            </label>
            <input
              type="text"
              value={albumTitle}
              onChange={(e) => setAlbumTitle(e.target.value)}
              placeholder="e.g. Summer Vacation, Tokyo 2026, Architecture..."
              className="w-full px-4 py-2.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              autoFocus
              required
            />
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Select Initial Photos ({selectedPhotoIds.length} selected):
            </label>
            <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 p-1">
              {availablePhotos.map((photo) => {
                const isSelected = selectedPhotoIds.includes(photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={() => toggleSelectPhoto(photo.id)}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${
                      isSelected ? 'ring-3 ring-orange-500 scale-95' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={photo.thumbnailUrl} alt={photo.title} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-orange-500 text-white shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!albumTitle.trim()}
              className="px-5 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm"
            >
              Create Album
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
