import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MediaItem, GridDensity, TimelineMode } from '../types/gallery';
import { Check, Image as ImageIcon } from 'lucide-react';

interface TimelineViewProps {
  photos: MediaItem[];
  gridDensity: GridDensity;
  timelineMode: TimelineMode;
  isSelectMode: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectMultiple: (ids: string[]) => void;
  onEnterSelectMode: (id: string) => void;
  onOpenViewer: (photo: MediaItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

// Individual Photo Card with Glowing Wave Skeleton on loading
const PhotoCard: React.FC<{
  photo: MediaItem;
  isSelected: boolean;
  isSelectMode: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
}> = ({ photo, isSelected, isSelectMode, onPointerDown, onPointerUp }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  return (
    <div
      data-photo-id={photo.id}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
      className={`group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer bg-slate-200 dark:bg-slate-800 transition-all duration-200 select-none ${
        isSelected
          ? 'ring-3 ring-orange-500 scale-[0.96] shadow-sm z-10'
          : isSelectMode
          ? 'opacity-85 hover:opacity-100 hover:scale-[0.99]'
          : 'hover:opacity-95'
      }`}
    >
      {/* Wave Glowing Skeleton while photo is loading */}
      {!isLoaded && (
        <div className="absolute inset-0 skeleton-wave flex items-center justify-center z-0">
          <div className="w-5 h-5 rounded-full bg-black/5 dark:bg-white/5" />
        </div>
      )}

      {/* Media Thumbnail - Pristine image with no bottom title or feature clutter */}
      <img
        src={photo.thumbnailUrl}
        alt=""
        loading="lazy"
        draggable={false}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        referrerPolicy="no-referrer"
      />

      {/* Top Right: Selection Checkbox only in select mode */}
      {isSelectMode && (
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 pointer-events-none">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
              isSelected
                ? 'bg-orange-500 text-white scale-105'
                : 'bg-black/35 border-2 border-white/80 text-transparent'
            }`}
          >
            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
          </div>
        </div>
      )}
    </div>
  );
};

export const TimelineView: React.FC<TimelineViewProps> = ({
  photos,
  gridDensity,
  timelineMode,
  isSelectMode,
  selectedIds,
  onToggleSelect,
  onSelectMultiple,
  onEnterSelectMode,
  onOpenViewer,
}) => {
  // Month accumulation mode (for 'grouped' timeline mode):
  // true = past months (e.g. September onwards) are accumulated together into the whole month header
  // false = separate individual dates (day view)
  const [accumulateMonths, setAccumulateMonths] = useState<boolean>(true);
  const [zoomToast, setZoomToast] = useState<string | null>(null);

  // Drag-to-select and long-press states
  const [isPointerDragging, setIsPointerDragging] = useState<boolean>(false);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const newlySelectedDuringDragRef = useRef<Set<string>>(new Set());

  // Two-finger pinch state
  const pinchStartDistRef = useRef<number | null>(null);
  const isPinchingRef = useRef<boolean>(false);

  // Pop-up subtle slider while scrolling / swiping
  const [isScrollerVisible, setIsScrollerVisible] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [activeSectionTitle, setActiveSectionTitle] = useState<string>('Today');
  const [isDraggingScrubber, setIsDraggingScrubber] = useState<boolean>(false);
  const scrubberHideTimerRef = useRef<number | null>(null);
  const scrubberTrackRef = useRef<HTMLDivElement | null>(null);

  const showZoomToast = (msg: string) => {
    setZoomToast(msg);
    setTimeout(() => setZoomToast(null), 2000);
  };

  // Helper to trigger haptic feedback
  const triggerHaptic = () => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(35);
      }
    } catch (e) {
      // ignore
    }
  };

  // Helper to determine if photo is from a past month
  const getPhotoMonthGroup = (photo: MediaItem): string => {
    const d = new Date(photo.timestamp);
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  };

  // Group photos according to accumulateMonths setting (used when timelineMode === 'grouped'):
  const groupedPhotos = photos.reduce((acc, photo) => {
    let groupKey = photo.dateFormatted;

    const isRecent = photo.dateFormatted === 'Today' || photo.dateFormatted === 'Yesterday';
    if (accumulateMonths && !isRecent) {
      groupKey = getPhotoMonthGroup(photo);
    }

    if (!acc[groupKey]) {
      acc[groupKey] = {
        title: groupKey,
        items: [],
      };
    }
    acc[groupKey].items.push(photo);
    return acc;
  }, {} as Record<string, { title: string; items: MediaItem[] }>);

  const groups = Object.values(groupedPhotos);

  // Grid column styles based on view density
  const getGridColsClass = () => {
    if (accumulateMonths) {
      return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5';
    }
    switch (gridDensity) {
      case 'coarse':
        return 'grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4';
      case 'dense':
        return 'grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-1.5 sm:gap-2';
      case 'month':
        return 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1';
      default:
        return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3';
    }
  };

  // --- SUBTLE POP-UP SIDE SLIDER ON SCROLL / SWIPE ---
  const handleScrollUpdate = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (scrollHeight <= 0) {
      setScrollProgress(0);
      return;
    }

    const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
    setScrollProgress(progress);
    setIsScrollerVisible(true);

    // Identify which section or photo is currently at the top of the viewport
    if (timelineMode === 'grouped') {
      const sectionElements = document.querySelectorAll<HTMLElement>('[data-timeline-section]');
      let currentTitle = groups[0]?.title || 'Today';

      sectionElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.35) {
          const title = el.getAttribute('data-timeline-section');
          if (title) currentTitle = title;
        }
      });
      setActiveSectionTitle(currentTitle);
    } else {
      const photoElements = document.querySelectorAll<HTMLElement>('[data-photo-id]');
      for (let i = 0; i < photoElements.length; i++) {
        const rect = photoElements[i].getBoundingClientRect();
        if (rect.top >= 0 || i === photoElements.length - 1) {
          const photoId = photoElements[i].getAttribute('data-photo-id');
          const found = photos.find(p => p.id === photoId);
          if (found) {
            setActiveSectionTitle(found.dateFormatted || getPhotoMonthGroup(found));
          }
          break;
        }
      }
    }

    // Auto-hide scrubber after 1.2s when user stops scrolling/swiping
    if (scrubberHideTimerRef.current !== null) {
      window.clearTimeout(scrubberHideTimerRef.current);
    }
    scrubberHideTimerRef.current = window.setTimeout(() => {
      if (!isDraggingScrubber) {
        setIsScrollerVisible(false);
      }
    }, 1200);
  }, [groups, photos, timelineMode, isDraggingScrubber]);

  useEffect(() => {
    window.addEventListener('scroll', handleScrollUpdate, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollUpdate);
      if (scrubberHideTimerRef.current !== null) {
        window.clearTimeout(scrubberHideTimerRef.current);
      }
    };
  }, [handleScrollUpdate]);

  // Direct scrubbing on the side slider with fingers
  const handleScrubberPointer = (clientY: number) => {
    const track = scrubberTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const relativeY = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1);
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = relativeY * scrollHeight;

    window.scrollTo({ top: targetScroll, behavior: 'instant' as ScrollBehavior });
    setScrollProgress(relativeY);
    setIsScrollerVisible(true);
  };

  // --- TWO-FINGER PINCH DETECTION ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (timelineMode !== 'grouped') return;
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchStartDistRef.current = dist;
      isPinchingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (timelineMode !== 'grouped') return;
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / pinchStartDistRef.current;

      if (ratio > 1.35) {
        if (!accumulateMonths) {
          setAccumulateMonths(true);
          triggerHaptic();
          showZoomToast('Month View: Photos accumulated by month');
          pinchStartDistRef.current = dist;
        }
      } else if (ratio < 0.72) {
        if (accumulateMonths) {
          setAccumulateMonths(false);
          triggerHaptic();
          showZoomToast('Day View: Separate daily dates');
          pinchStartDistRef.current = dist;
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pinchStartDistRef.current = null;
      isPinchingRef.current = false;
    }
  };

  // Desktop trackpad pinch / Ctrl+Wheel support
  const handleWheel = (e: React.WheelEvent) => {
    if (timelineMode !== 'grouped') return;
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < -15 && accumulateMonths) {
        setAccumulateMonths(false);
        showZoomToast('Day View: Separate daily dates');
      } else if (e.deltaY > 15 && !accumulateMonths) {
        setAccumulateMonths(true);
        showZoomToast('Month View: Photos accumulated by month');
      }
    }
  };

  // --- LONG PRESS & DRAG-TO-SELECT ---
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handlePhotoPointerDown = (photoId: string, e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (isPinchingRef.current) return;

    clearLongPressTimer();
    longPressTriggeredRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    newlySelectedDuringDragRef.current = new Set();

    if (isSelectMode) {
      setIsPointerDragging(true);
      newlySelectedDuringDragRef.current.add(photoId);
      onToggleSelect(photoId);
    } else {
      longPressTimerRef.current = window.setTimeout(() => {
        longPressTriggeredRef.current = true;
        triggerHaptic();
        onEnterSelectMode(photoId);
        setIsPointerDragging(true);
        newlySelectedDuringDragRef.current.add(photoId);
      }, 350);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (pointerStartRef.current && !longPressTriggeredRef.current && !isSelectMode) {
      const dx = Math.abs(e.clientX - pointerStartRef.current.x);
      const dy = Math.abs(e.clientY - pointerStartRef.current.y);
      if (dx > 10 || dy > 10) {
        clearLongPressTimer();
      }
    }

    if (isPointerDragging || (longPressTriggeredRef.current && isSelectMode)) {
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const photoCard = element?.closest('[data-photo-id]') as HTMLElement | null;
      if (photoCard) {
        const hoveredPhotoId = photoCard.getAttribute('data-photo-id');
        if (hoveredPhotoId && !newlySelectedDuringDragRef.current.has(hoveredPhotoId)) {
          newlySelectedDuringDragRef.current.add(hoveredPhotoId);
          triggerHaptic();
          if (!selectedIds.includes(hoveredPhotoId)) {
            onSelectMultiple([hoveredPhotoId]);
          }
        }
      }
    }
  };

  const handlePhotoPointerUp = (photoId: string) => {
    clearLongPressTimer();
    const wasLongPress = longPressTriggeredRef.current;
    longPressTriggeredRef.current = false;
    setIsPointerDragging(false);
    pointerStartRef.current = null;

    if (!wasLongPress && newlySelectedDuringDragRef.current.size <= 1) {
      if (!isSelectMode) {
        const photo = photos.find(p => p.id === photoId);
        if (photo) onOpenViewer(photo);
      }
    }
    newlySelectedDuringDragRef.current.clear();
  };

  const handlePointerCancel = () => {
    clearLongPressTimer();
    longPressTriggeredRef.current = false;
    setIsPointerDragging(false);
    pointerStartRef.current = null;
    newlySelectedDuringDragRef.current.clear();
  };

  useEffect(() => {
    return () => clearLongPressTimer();
  }, [clearLongPressTimer]);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center mb-4">
          <ImageIcon className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          No photos found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          Your gallery is empty.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="relative pb-24 touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerCancel}
      onPointerCancel={handlePointerCancel}
    >
      {/* =========================================================================
          MODE 2: ALL PHOTOS IN 4*4 GRID (ZERO DATE SEGREGATION)
          ========================================================================= */}
      {timelineMode === 'all' ? (
        <div className="select-none">
          <div className="grid grid-cols-4 gap-1 sm:gap-1.5 mt-1">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                isSelected={selectedIds.includes(photo.id)}
                isSelectMode={isSelectMode}
                onPointerDown={(e) => handlePhotoPointerDown(photo.id, e)}
                onPointerUp={() => handlePhotoPointerUp(photo.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* =========================================================================
            MODE 1: DEFAULT GROUPED TIMELINE BY DATES/MONTHS
            ========================================================================= */
        <div className="space-y-5 sm:space-y-7 select-none">
          {groups.map((group) => (
            <section 
              key={group.title} 
              data-timeline-section={group.title}
              className="relative"
            >
              {/* Clean Sticky Header */}
              <div className="sticky top-16 sm:top-20 z-10 py-2 px-0.5 flex items-baseline justify-between hyperos-glass backdrop-blur-md">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  {group.title}
                </h2>
                <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                  {group.items.length} {group.items.length === 1 ? 'photo' : 'photos'}
                </span>
              </div>

              {/* Photos Grid */}
              <div className={`grid ${getGridColsClass()} mt-1.5`}>
                {group.items.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    isSelected={selectedIds.includes(photo.id)}
                    isSelectMode={isSelectMode}
                    onPointerDown={(e) => handlePhotoPointerDown(photo.id, e)}
                    onPointerUp={() => handlePhotoPointerUp(photo.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* =========================================================================
          POP-UP VERTICAL SLIDER ON PHONE SWIPE / SCROLL
          - Very subtle, non-noticeable slider (no dot, extremely slim)
          - Low contrast, gently blending with background
          - Moves directly along with fingers
          - Disappears automatically after scrolling stops
          ========================================================================= */}
      <div
        className={`fixed right-1 sm:right-1.5 top-24 bottom-24 z-40 flex items-center select-none transition-all duration-300 ${
          isScrollerVisible || isDraggingScrubber
            ? isDraggingScrubber
              ? 'opacity-70 translate-x-0 pointer-events-auto'
              : 'opacity-35 translate-x-0 pointer-events-auto'
            : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
      >
        <div
          ref={scrubberTrackRef}
          onPointerDown={(e) => {
            setIsDraggingScrubber(true);
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            handleScrubberPointer(e.clientY);
          }}
          onPointerMove={(e) => {
            if (isDraggingScrubber) {
              handleScrubberPointer(e.clientY);
            }
          }}
          onPointerUp={() => {
            setIsDraggingScrubber(false);
          }}
          className="relative w-4 h-56 sm:h-64 flex items-center justify-center cursor-pointer touch-none"
        >
          {/* Barely noticeable slim track line */}
          <div className="w-[1px] h-full bg-black/[0.06] dark:bg-white/[0.08] rounded-full" />

          {/* Non-noticeable, subtle slim slider handle */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-1 h-5 rounded-full bg-slate-500/40 dark:bg-white/30 backdrop-blur-xs transition-transform active:scale-110"
            style={{
              top: `calc(${scrollProgress * 100}% - 10px)`,
            }}
          >
            {/* Discreet translucent date/month tag attached to slider */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-black/40 dark:bg-white/50 text-white dark:text-black backdrop-blur-md text-[10px] font-medium tracking-tight whitespace-nowrap animate-scaleUp pointer-events-none">
              {activeSectionTitle}
            </div>
          </div>
        </div>
      </div>

      {/* Zoom / Pinch Toast Notification */}
      {zoomToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-2xl border border-white/10 dark:border-black/10 animate-slideDown flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>{zoomToast}</span>
        </div>
      )}
    </div>
  );
};
