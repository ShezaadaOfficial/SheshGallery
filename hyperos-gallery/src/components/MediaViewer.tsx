import React, { useState, useEffect } from 'react';
import { MediaItem } from '../types/gallery';
import { 
  X, 
  ChevronLeft, 
  Heart, 
  Share2, 
  Edit3, 
  Info, 
  Trash2, 
  Radio, 
  Sparkles, 
  Scissors, 
  FileText, 
  Check, 
  Download,
  Copy,
  Smartphone
} from 'lucide-react';
import { ExifDrawer } from './ExifDrawer';
import { PhotoEditorModal } from './PhotoEditorModal';
import { VideoPlayer } from './VideoPlayer';
import { VideoEditorModal } from './VideoEditorModal';

interface MediaViewerProps {
  photo: MediaItem;
  photosList: MediaItem[];
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDeletePhoto: (id: string) => void;
  onSaveEditedPhoto: (photo: MediaItem) => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  photo,
  photosList,
  isOpen,
  onClose,
  onToggleFavorite,
  onDeletePhoto,
  onSaveEditedPhoto,
}) => {
  const [currentId, setCurrentId] = useState<string>(photo.id);
  const [isLivePlaying, setIsLivePlaying] = useState<boolean>(false);
  const [isExifOpen, setIsExifOpen] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isVideoEditorOpen, setIsVideoEditorOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [showOcrOverlay, setShowOcrOverlay] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  // Sync current photo when prop changes
  useEffect(() => {
    setCurrentId(photo.id);
    setIsImageLoaded(false);
  }, [photo.id]);

  const currentIndex = photosList.findIndex((p) => p.id === currentId);
  const currentPhoto = photosList[currentIndex] || photo;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isExifOpen) setIsExifOpen(false);
        else if (isEditorOpen) setIsEditorOpen(false);
        else if (isVideoEditorOpen) setIsVideoEditorOpen(false);
        else if (isShareModalOpen) setIsShareModalOpen(false);
        else onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photosList, isExifOpen, isEditorOpen, isVideoEditorOpen, isShareModalOpen]);

  if (!isOpen) return null;

  const goToPrev = () => {
    if (currentIndex > 0) {
      setIsImageLoaded(false);
      setCurrentId(photosList[currentIndex - 1].id);
      setIsLivePlaying(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < photosList.length - 1) {
      setIsImageLoaded(false);
      setCurrentId(photosList[currentIndex + 1].id);
      setIsLivePlaying(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedNotification('Text copied to clipboard!');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col justify-between overflow-hidden select-none animate-fadeIn">
      {/* Top Bar */}
      <div className="p-4 sm:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white">
        {/* Back Button & Details */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/90 hover:text-white"
            title="Back to gallery"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopyText(currentPhoto.title)}
                className="group flex items-center gap-2 px-2 py-1 -ml-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all text-left"
                title="Click to copy image name"
              >
                <span className="text-sm sm:text-base font-bold text-white truncate max-w-[170px] sm:max-w-md select-text group-hover:text-orange-300 transition-colors">
                  {currentPhoto.title}
                </span>
                <span className="p-1 rounded-md bg-white/10 group-hover:bg-white/20 text-white/70 group-hover:text-white shrink-0">
                  <Copy className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>{currentPhoto.dateFormatted}</span>
              <span>·</span>
              <span>{currentPhoto.locationName}</span>
            </div>
          </div>
        </div>

        {/* Top Right Action Tools */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* OCR Text Extraction Trigger */}
          {currentPhoto.detectedText && (
            <button
              onClick={() => setShowOcrOverlay(!showOcrOverlay)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all ${
                showOcrOverlay
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white/10 text-white/90 hover:bg-white/20'
              }`}
              title="Extract text from image"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Extract Text</span>
            </button>
          )}

          {/* Details / EXIF Drawer Trigger */}
          <button
            onClick={() => setIsExifOpen(true)}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            title="View camera & EXIF details"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Media Area */}
      <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6">
        {/* Media Container */}
        <div className="relative max-h-full max-w-full w-full flex items-center justify-center">
          {currentPhoto.type === 'video' ? (
            <div className="w-full max-w-4xl max-h-[75vh] flex items-center justify-center">
              <VideoPlayer
                src={currentPhoto.url}
                poster={currentPhoto.thumbnailUrl}
                title={currentPhoto.title}
                onOpenEditor={() => setIsVideoEditorOpen(true)}
              />
            </div>
          ) : (
            <>
              {!isImageLoaded && (
                <div className="w-72 sm:w-[500px] h-80 sm:h-[450px] skeleton-wave rounded-2xl flex items-center justify-center" />
              )}
              <img
                src={currentPhoto.url}
                alt={currentPhoto.title}
                onLoad={() => setIsImageLoaded(true)}
                className={`max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300 ease-out ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0 absolute'
                } ${isLivePlaying ? 'scale-105 filter saturate-110 brightness-105' : ''}`}
                referrerPolicy="no-referrer"
              />

              {/* Live Photo (Motion Photo) Badge */}
              {currentPhoto.type === 'live' && (
                <button
                  onClick={() => setIsLivePlaying(!isLivePlaying)}
                  onMouseDown={() => setIsLivePlaying(true)}
                  onMouseUp={() => setIsLivePlaying(false)}
                  className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md transition-all z-20 ${
                    isLivePlaying
                      ? 'bg-amber-400 text-slate-900 shadow-lg scale-105'
                      : 'bg-black/60 text-white hover:bg-black/80'
                  }`}
                  title="Motion Live Photo: Click or hold to play motion loop"
                >
                  <Radio className={`w-3.5 h-3.5 ${isLivePlaying ? 'animate-spin' : ''}`} />
                  <span>LIVE</span>
                  {isLivePlaying && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <span className="w-1 h-2.5 bg-slate-900 rounded-full animate-bounce" />
                      <span className="w-1 h-3.5 bg-slate-900 rounded-full animate-bounce delay-75" />
                      <span className="w-1 h-2 bg-slate-900 rounded-full animate-bounce delay-150" />
                    </span>
                  )}
                </button>
              )}
            </>
          )}

          {/* OCR Highlight Overlay */}
          {showOcrOverlay && currentPhoto.detectedText && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-20">
              <div className="max-w-md p-5 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-orange-600">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" /> Text Recognition
                  </span>
                  <button
                    onClick={() => setShowOcrOverlay(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-xs sm:text-sm text-left select-text">
                  {currentPhoto.detectedText}
                </div>
                <button
                  onClick={() => handleCopyText(currentPhoto.detectedText!)}
                  className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Detected Text</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Action Capsule Bar */}
      <div className="p-4 sm:p-6 pb-6 flex items-center justify-center z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <div className="flex items-center gap-2 sm:gap-6 px-4 sm:px-6 py-2.5 rounded-full bg-white/10 dark:bg-black/60 backdrop-blur-2xl border border-white/15 shadow-2xl text-white">
          {/* Share */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex flex-col items-center gap-1 px-2.5 sm:px-3 py-1 rounded-2xl hover:bg-white/10 transition-colors text-white/90 hover:text-white"
            title="Share via Quick Share"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Send</span>
          </button>

          {/* Favorite */}
          <button
            onClick={(e) => onToggleFavorite(currentPhoto.id, e)}
            className="flex flex-col items-center gap-1 px-2.5 sm:px-3 py-1 rounded-2xl hover:bg-white/10 transition-colors text-white/90 hover:text-white"
            title="Toggle Favorite"
          >
            <Heart
              className={`w-5 h-5 transition-transform active:scale-125 ${
                currentPhoto.isFavorite ? 'text-red-500 fill-red-500' : ''
              }`}
            />
            <span className="text-[10px] font-medium tracking-tight">Favorite</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => {
              if (currentPhoto.type === 'video') {
                setIsVideoEditorOpen(true);
              } else {
                setIsEditorOpen(true);
              }
            }}
            className="flex flex-col items-center gap-1 px-2.5 sm:px-3 py-1 rounded-2xl hover:bg-white/10 transition-colors text-white/90 hover:text-white"
            title={currentPhoto.type === 'video' ? 'Video Studio (Cut, Crop, Extract Audio)' : 'Edit Photo'}
          >
            <Edit3 className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Edit</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              onDeletePhoto(currentPhoto.id);
              onClose();
            }}
            className="flex flex-col items-center gap-1 px-2.5 sm:px-3 py-1 rounded-2xl hover:bg-red-500/20 hover:text-red-400 transition-colors text-white/90"
            title="Move to Trash"
          >
            <Trash2 className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Delete</span>
          </button>
        </div>
      </div>

      {/* Slide-up EXIF Drawer */}
      <ExifDrawer
        photo={currentPhoto}
        isOpen={isExifOpen}
        onClose={() => setIsExifOpen(false)}
        onCopyText={handleCopyText}
      />

      {/* Built-in Photo Editor Modal */}
      <PhotoEditorModal
        photo={currentPhoto}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={(updated) => {
          onSaveEditedPhoto(updated);
          setIsEditorOpen(false);
        }}
      />

      {/* Built-in HyperOS Video Studio Modal */}
      {isVideoEditorOpen && (
        <VideoEditorModal
          photo={currentPhoto}
          isOpen={isVideoEditorOpen}
          onClose={() => setIsVideoEditorOpen(false)}
          onSaveEditedVideo={(updated) => {
            onSaveEditedPhoto(updated);
            setIsVideoEditorOpen(false);
          }}
        />
      )}

      {/* Quick Share Sheet Modal */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 sm:p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-sm">Quick Share</h3>
              </div>
              <button onClick={() => setIsShareModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <button
                onClick={() => {
                  setCopiedNotification('Nearby device broadcasting active via Quick Share');
                  setTimeout(() => setCopiedNotification(null), 2500);
                  setIsShareModalOpen(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <span className="font-semibold text-[11px]">Quick Share</span>
              </button>

              <button
                onClick={() => {
                  handleCopyText(window.location.href);
                  setIsShareModalOpen(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center">
                  <Copy className="w-6 h-6" />
                </div>
                <span className="font-semibold text-[11px]">Copy Link</span>
              </button>

              <button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = currentPhoto.url;
                  a.download = `${currentPhoto.title}.jpg`;
                  a.click();
                  setIsShareModalOpen(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Download className="w-6 h-6" />
                </div>
                <span className="font-semibold text-[11px]">Download</span>
              </button>

              <button
                onClick={() => {
                  alert('Set as lockscreen and home wallpaper!');
                  setIsShareModalOpen(false);
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="font-semibold text-[11px]">Wallpaper</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy notification toast */}
      {copiedNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xl border border-white/20 animate-slideDown z-50">
          {copiedNotification}
        </div>
      )}
    </div>
  );
};
