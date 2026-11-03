import React from 'react';
import { Album, MediaItem } from '../types/gallery';
import { 
  Camera, 
  Smartphone, 
  Heart, 
  Video, 
  Sparkles, 
  Plus, 
  Trash2, 
  HardDrive, 
  Folder, 
  Users, 
  ChevronRight,
  Compass
} from 'lucide-react';

interface AlbumsViewProps {
  albums: Album[];
  photos: MediaItem[];
  deletedPhotosCount: number;
  onSelectAlbum: (albumId: string, albumTitle: string) => void;
  onOpenTrash: () => void;
  onCreateAlbum: () => void;
  onFilterByPerson: (personId: string, personName: string) => void;
}

export const AlbumsView: React.FC<AlbumsViewProps> = ({
  albums,
  photos,
  deletedPhotosCount,
  onSelectAlbum,
  onOpenTrash,
  onCreateAlbum,
  onFilterByPerson,
}) => {
  // Count real photos per album
  const getAlbumCount = (albumId: string) => {
    if (albumId === 'favorites') {
      return photos.filter((p) => p.isFavorite && !p.isDeleted).length;
    }
    if (albumId === 'videos') {
      return photos.filter((p) => p.type === 'video' && !p.isDeleted).length;
    }
    return photos.filter((p) => p.albumIds.includes(albumId) && !p.isDeleted).length;
  };

  const getAlbumCover = (album: Album) => {
    let matched: MediaItem | undefined;
    if (album.id === 'favorites') {
      matched = photos.find((p) => p.isFavorite && !p.isDeleted);
    } else if (album.id === 'videos') {
      matched = photos.find((p) => p.type === 'video' && !p.isDeleted);
    } else {
      matched = photos.find((p) => p.albumIds.includes(album.id) && !p.isDeleted);
    }
    return matched ? matched.thumbnailUrl : album.coverUrl;
  };

  const systemAlbums = albums.filter((a) => a.type === 'system');
  const customAlbums = albums.filter((a) => a.type === 'custom');

  const getIcon = (name?: string) => {
    switch (name) {
      case 'Camera':
        return <Camera className="w-5 h-5" />;
      case 'Smartphone':
        return <Smartphone className="w-5 h-5" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case 'Video':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-emerald-500" />;
      default:
        return <Folder className="w-5 h-5 text-orange-500" />;
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* 1. Primary System Albums Grid (HyperOS 2x2 Hero Layout) */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {systemAlbums.map((album) => {
            const count = getAlbumCount(album.id);
            const cover = getAlbumCover(album);

            return (
              <div
                key={album.id}
                onClick={() => onSelectAlbum(album.id, album.title)}
                className="group relative h-40 sm:h-52 rounded-3xl overflow-hidden cursor-pointer hyperos-glass-card shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
              >
                {/* Background Image with Blur Overlay and Skeleton Wave */}
                <div className="absolute inset-0 skeleton-wave" />
                <img
                  src={cover}
                  alt={album.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                {/* Top Badge Icon */}
                <div className="absolute top-3 left-3 p-2 rounded-2xl bg-white/20 backdrop-blur-md text-white">
                  {getIcon(album.iconName)}
                </div>

                {/* Bottom Details */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight drop-shadow-sm truncate">
                    {album.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-white/80 mt-0.5">
                    <span>{count} items</span>
                    <span className="text-[11px] text-white/60 font-mono">
                      {album.subtitle}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. People & Pets Row (HyperOS Face Recognition Section) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              People & Pets
            </h2>
          </div>
          <span className="text-xs text-slate-400">AI Facial Recognition</span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          <div
            onClick={() => onFilterByPerson('people_alex', 'Alex Rivera')}
            className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-orange-500 transition-all p-0.5">
              <img
                src="/src/assets/images/hyperos_portrait_leica_1793705200305.jpg"
                alt="Alex"
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Alex
              </div>
              <div className="text-[11px] text-slate-400">4 photos</div>
            </div>
          </div>

          <div
            onClick={() => onFilterByPerson('pet_milo', 'Milo the Cat')}
            className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-orange-500 transition-all p-0.5">
              <img
                src="/src/assets/images/hyperos_pet_cat_1793705203339.jpg"
                alt="Milo"
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Milo 🐾
              </div>
              <div className="text-[11px] text-slate-400">8 photos</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Custom & Smart Albums */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            My Albums & Collections
          </h2>
          <button
            onClick={onCreateAlbum}
            className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Album</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {customAlbums.map((album) => {
            const count = getAlbumCount(album.id);
            const cover = getAlbumCover(album);

            return (
              <div
                key={album.id}
                onClick={() => onSelectAlbum(album.id, album.title)}
                className="p-3 rounded-2xl hyperos-glass-card hover:bg-white/90 dark:hover:bg-slate-800/90 cursor-pointer transition-all active:scale-[0.98] group"
              >
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2.5">
                  <div className="absolute inset-0 skeleton-wave" />
                  <img
                    src={cover}
                    alt={album.title}
                    className="relative w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/40 text-white backdrop-blur-md">
                    {getIcon(album.iconName)}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {album.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {count} {count === 1 ? 'item' : 'items'}
                </p>
              </div>
            );
          })}

          {/* Add New Album Card */}
          <div
            onClick={onCreateAlbum}
            className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group min-h-[140px]"
          >
            <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 group-hover:bg-orange-500/10 text-slate-500 group-hover:text-orange-500 flex items-center justify-center transition-colors mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Create Album
            </span>
          </div>
        </div>
      </section>

      {/* 4. Utilities: Trash Bin & Storage Cleaner */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white px-1">
          Other Albums & Utilities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Trash Bin */}
          <div
            onClick={onOpenTrash}
            className="flex items-center justify-between p-4 rounded-2xl hyperos-glass-card hover:bg-white/90 dark:hover:bg-slate-800/90 cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-red-500/10 dark:bg-red-500/20 text-red-500 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Trash bin
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {deletedPhotosCount} items · Retained for 30 days
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Device Storage Cleaner */}
          <div
            className="flex items-center justify-between p-4 rounded-2xl hyperos-glass-card hover:bg-white/90 dark:hover:bg-slate-800/90 cursor-default transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Gallery Storage
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  128.4 MB used · Local Offline Storage
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              Optimal
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
