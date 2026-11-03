import React, { useState, useEffect } from 'react';
import { 
  MediaItem, 
  Album, 
  GalleryTab, 
  GridDensity,
  TimelineMode
} from './types/gallery';
import { INITIAL_PHOTOS, INITIAL_ALBUMS } from './data/initialPhotos';
import { Header } from './components/Header';
import { TimelineView } from './components/TimelineView';
import { AlbumsView } from './components/AlbumsView';
import { MediaViewer } from './components/MediaViewer';
import { MultiSelectBar } from './components/MultiSelectBar';
import { TrashBinModal } from './components/TrashBinModal';
import { CreateAlbumModal } from './components/CreateAlbumModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Gallery user name state with persistence (default: Sheshant)
  const [galleryUserName, setGalleryUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('gallery_user_name') || 'Sheshant';
    } catch {
      return 'Sheshant';
    }
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark class to documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Gallery Data States with localStorage persistence
  const [photos, setPhotos] = useState<MediaItem[]>(() => {
    try {
      const saved = localStorage.getItem('hyperos_gallery_photos');
      if (saved) {
        const parsed = JSON.parse(saved) as MediaItem[];
        return parsed.map((p) => {
          if (p.id === 'photo-7' && !p.url.includes('.mp4')) {
            const init = INITIAL_PHOTOS.find((i) => i.id === 'photo-7');
            if (init) return { ...p, url: init.url };
          }
          if (p.exif?.camera && p.exif.camera.toLowerCase().includes('xiaomi')) {
            return {
              ...p,
              exif: {
                ...p.exif,
                camera: p.exif.camera.replace(/xiaomi\s*/i, 'Pro '),
              },
            };
          }
          return p;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PHOTOS;
  });

  const [albums, setAlbums] = useState<Album[]>(() => {
    try {
      const saved = localStorage.getItem('hyperos_gallery_albums');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ALBUMS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hyperos_gallery_photos', JSON.stringify(photos));
    } catch (e) {
      console.error(e);
    }
  }, [photos]);

  useEffect(() => {
    try {
      localStorage.setItem('hyperos_gallery_albums', JSON.stringify(albums));
    } catch (e) {
      console.error(e);
    }
  }, [albums]);

  // Navigation & View States
  const [activeTab, setActiveTab] = useState<GalleryTab>('photos');
  const [gridDensity, setGridDensity] = useState<GridDensity>('normal');
  const [timelineMode, setTimelineMode] = useState<TimelineMode>('grouped');
  const [activeAlbum, setActiveAlbum] = useState<{ id: string; title: string } | null>(null);

  // Selection Mode State (activated by holding or dragging across photos)
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [viewerPhoto, setViewerPhoto] = useState<MediaItem | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState<boolean>(false);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Filter Active (Non-Deleted) Photos
  const activePhotos = photos.filter((p) => !p.isDeleted);
  const deletedPhotos = photos.filter((p) => p.isDeleted);

  // Filter based on active album
  const displayedPhotos = activePhotos.filter((p) => {
    if (activeAlbum) {
      if (activeAlbum.id === 'favorites') {
        if (!p.isFavorite) return false;
      } else if (activeAlbum.id === 'videos') {
        if (p.type !== 'video') return false;
      } else {
        if (!p.albumIds.includes(activeAlbum.id)) return false;
      }
    }
    return true;
  });

  // Toggle Favorite
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.isFavorite;
          showToast(next ? 'Added to Favorites' : 'Removed from Favorites');
          return { ...p, isFavorite: next };
        }
        return p;
      })
    );
  };

  // Move photo to trash
  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isDeleted: true, deletedTimestamp: Date.now() } : p))
    );
    showToast('Moved to Trash bin');
  };

  // Selection actions: activated by holding or dragging
  const handleEnterSelectMode = (id: string) => {
    setIsSelectMode(true);
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleSelectMultiple = (ids: string[]) => {
    setIsSelectMode(true);
    setSelectedIds((prev) => {
      const set = new Set([...prev, ...ids]);
      return Array.from(set);
    });
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      const remaining = selectedIds.filter((item) => item !== id);
      setSelectedIds(remaining);
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setIsSelectMode(false);
  };

  const handleDeleteSelected = () => {
    setPhotos((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.id) ? { ...p, isDeleted: true, deletedTimestamp: Date.now() } : p
      )
    );
    showToast(`Moved ${selectedIds.length} items to Trash`);
    handleClearSelection();
  };

  const handleFavoriteSelected = () => {
    setPhotos((prev) =>
      prev.map((p) => (selectedIds.includes(p.id) ? { ...p, isFavorite: true } : p))
    );
    showToast(`Added ${selectedIds.length} items to Favorites`);
    handleClearSelection();
  };

  const handleAddToAlbumSelected = () => {
    setIsCreateAlbumOpen(true);
  };

  // Trash actions
  const handleRestorePhoto = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isDeleted: false, deletedTimestamp: undefined } : p))
    );
    showToast('Restored photo to gallery');
  };

  const handleRestoreAll = () => {
    setPhotos((prev) =>
      prev.map((p) => ({ ...p, isDeleted: false, deletedTimestamp: undefined }))
    );
    showToast('Restored all photos');
    setIsTrashOpen(false);
  };

  const handleEmptyTrash = () => {
    if (confirm('Permanently delete all items in trash? This cannot be undone.')) {
      setPhotos((prev) => prev.filter((p) => !p.isDeleted));
      showToast('Trash bin emptied');
      setIsTrashOpen(false);
    }
  };

  // Create Album
  const handleCreateAlbum = (title: string, selectedPhotoIds: string[]) => {
    const newAlbumId = `album-${Date.now()}`;
    const newAlbum: Album = {
      id: newAlbumId,
      title,
      count: selectedPhotoIds.length,
      coverUrl:
        photos.find((p) => selectedPhotoIds.includes(p.id))?.thumbnailUrl ||
        photos[0]?.thumbnailUrl ||
        '',
      type: 'custom',
      subtitle: 'Custom Album',
    };

    setAlbums((prev) => [...prev, newAlbum]);

    // Tag selected photos with new album ID
    if (selectedPhotoIds.length > 0) {
      setPhotos((prev) =>
        prev.map((p) =>
          selectedPhotoIds.includes(p.id)
            ? { ...p, albumIds: [...p.albumIds, newAlbumId] }
            : p
        )
      );
    }

    showToast(`Album "${title}" created`);
    handleClearSelection();
  };

  // Reset Demo Media Data
  const handleResetDemoData = () => {
    if (confirm('Reset gallery to default sample photos? This will restore original photos.')) {
      setPhotos(INITIAL_PHOTOS);
      setAlbums(INITIAL_ALBUMS);
      localStorage.removeItem('hyperos_gallery_photos');
      localStorage.removeItem('hyperos_gallery_albums');
      showToast('Gallery restored to default demo state');
    }
  };

  // Filter by Person (Facial Recognition)
  const handleFilterByPerson = (personId: string, personName: string) => {
    setActiveAlbum({ id: personId, title: personName });
    setActiveTab('photos');
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0c0d0f] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-orange-500/30">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setActiveAlbum(null);
        }}
        timelineMode={timelineMode}
        onToggleTimelineMode={() => setTimelineMode((m) => (m === 'grouped' ? 'all' : 'grouped'))}
        totalPhotosCount={activePhotos.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onResetDemoData={handleResetDemoData}
        activeAlbumTitle={activeAlbum?.title}
        onBackFromAlbum={() => setActiveAlbum(null)}
        userName={galleryUserName}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-4">
        {/* Tab 1: Photos Timeline */}
        {activeTab === 'photos' && (
          <TimelineView
            photos={displayedPhotos}
            gridDensity={gridDensity}
            timelineMode={timelineMode}
            isSelectMode={isSelectMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectMultiple={handleSelectMultiple}
            onEnterSelectMode={handleEnterSelectMode}
            onOpenViewer={(photo) => setViewerPhoto(photo)}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Tab 2: Albums Grid */}
        {activeTab === 'albums' && (
          <AlbumsView
            albums={albums}
            photos={photos}
            deletedPhotosCount={deletedPhotos.length}
            onSelectAlbum={(albumId, albumTitle) => {
              setActiveAlbum({ id: albumId, title: albumTitle });
              setActiveTab('photos');
            }}
            onOpenTrash={() => setIsTrashOpen(true)}
            onCreateAlbum={() => setIsCreateAlbumOpen(true)}
            onFilterByPerson={handleFilterByPerson}
          />
        )}
      </main>

      {/* Multi-Selection Bottom Dock */}
      {isSelectMode && (
        <MultiSelectBar
          selectedCount={selectedIds.length}
          onClearSelection={handleClearSelection}
          onDeleteSelected={handleDeleteSelected}
          onFavoriteSelected={handleFavoriteSelected}
          onAddToAlbumSelected={handleAddToAlbumSelected}
          onShareSelected={() => {
            showToast(`Shared ${selectedIds.length} items via Quick Share`);
          }}
        />
      )}

      {/* Fullscreen Media Viewer */}
      {viewerPhoto && (
        <MediaViewer
          photo={viewerPhoto}
          photosList={displayedPhotos}
          isOpen={true}
          onClose={() => setViewerPhoto(null)}
          onToggleFavorite={handleToggleFavorite}
          onDeletePhoto={handleDeletePhoto}
          onSaveEditedPhoto={(edited) => {
            setPhotos((prev) => [edited, ...prev]);
            showToast('Saved edited photo');
          }}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={galleryUserName}
        onUpdateUserName={(name) => {
          const trimmed = name.trim() || 'Sheshant';
          setGalleryUserName(trimmed);
          try {
            localStorage.setItem('gallery_user_name', trimmed);
          } catch (e) {
            console.error(e);
          }
          showToast(`Gallery title updated to ${trimmed}'s Gallery`);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        totalPhotosCount={activePhotos.length}
        onResetData={handleResetDemoData}
      />

      {/* Trash Bin Modal */}
      <TrashBinModal
        deletedPhotos={deletedPhotos}
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        onRestorePhoto={handleRestorePhoto}
        onRestoreAll={handleRestoreAll}
        onEmptyTrash={handleEmptyTrash}
      />

      {/* Create Album Modal */}
      <CreateAlbumModal
        isOpen={isCreateAlbumOpen}
        onClose={() => setIsCreateAlbumOpen(false)}
        availablePhotos={activePhotos}
        onCreateAlbum={handleCreateAlbum}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-2xl border border-white/10 dark:border-black/10 animate-slideDown flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
