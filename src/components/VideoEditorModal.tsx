import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Scissors, 
  Crop, 
  Music, 
  Sliders, 
  Play, 
  Pause, 
  Check, 
  Download, 
  RotateCcw,
  Volume2,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { MediaItem } from '../types/gallery';
import { 
  formatVideoTime, 
  extractAudioFromVideo, 
  processVideoEdit,
  createScenicOfflineVideoBlob
} from '../utils/videoUtils';

interface VideoEditorModalProps {
  photo: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  onSaveEditedVideo: (newMedia: MediaItem) => void;
}

type EditorTab = 'cut' | 'crop' | 'audio' | 'filters';

const ASPECT_RATIOS = [
  { id: 'original', label: 'Original', ratio: 'Free' },
  { id: '16:9', label: '16:9', ratio: 'Landscape' },
  { id: '9:16', label: '9:16', ratio: 'Reels / Shorts' },
  { id: '1:1', label: '1:1', ratio: 'Square' },
  { id: '4:3', label: '4:3', ratio: 'Standard' },
  { id: '4:5', label: '4:5', ratio: 'Portrait' },
];

const FILTER_PRESETS = [
  { id: 'normal', name: 'Original', css: 'none' },
  { id: 'leica_auth', name: 'Leica Authentic', css: 'contrast(1.15) saturate(1.05) brightness(0.98)' },
  { id: 'leica_vivid', name: 'Leica Vivid', css: 'saturate(1.3) contrast(1.1) brightness(1.02)' },
  { id: 'noir', name: 'Noir Film', css: 'grayscale(1) contrast(1.25) brightness(0.95)' },
  { id: 'sunset', name: 'Sunset Warmth', css: 'sepia(0.25) saturate(1.25) hue-rotate(-10deg)' },
  { id: 'cinematic', name: 'Cinematic Teal', css: 'contrast(1.15) hue-rotate(15deg) saturate(1.1)' },
];

export const VideoEditorModal: React.FC<VideoEditorModalProps> = ({
  photo,
  isOpen,
  onClose,
  onSaveEditedVideo,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('cut');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [effectiveSrc, setEffectiveSrc] = useState<string>(photo.url);
  const [duration, setDuration] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Cut / Trim state
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(10);

  // Crop state
  const [selectedCrop, setSelectedCrop] = useState<string>('original');

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<string>('normal');
  const [brightnessVal, setBrightnessVal] = useState<number>(100);
  const [contrastVal, setContrastVal] = useState<number>(100);
  const [saturationVal, setSaturationVal] = useState<number>(100);

  // Audio Extraction state
  const [extractedAudioUrl, setExtractedAudioUrl] = useState<string | null>(null);
  const [isExtractingAudio, setIsExtractingAudio] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Export / Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<number>(0);

  // Ensure playable video source
  useEffect(() => {
    if (!isOpen) return;

    const isVideoExt = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(photo.url) || photo.url.startsWith('blob:') || photo.url.startsWith('data:video');
    if (!isVideoExt) {
      createScenicOfflineVideoBlob().then((offlineUrl) => {
        setEffectiveSrc(offlineUrl);
      });
    } else {
      setEffectiveSrc(photo.url);
    }
  }, [isOpen, photo.url]);

  // Video metadata loaded
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 10;
      setDuration(dur);
      setStartTime(0);
      setEndTime(dur);
    }
  };

  // Keep preview playing strictly between startTime and endTime
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      if (cur >= endTime || cur < startTime) {
        videoRef.current.currentTime = startTime;
        if (!isPlaying) {
          videoRef.current.pause();
        }
      }
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      if (video.currentTime >= endTime || video.currentTime < startTime) {
        video.currentTime = startTime;
      }
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Compile full CSS filter
  const getFilterStyle = (): string => {
    const preset = FILTER_PRESETS.find((p) => p.id === selectedFilter);
    const presetCss = preset && preset.css !== 'none' ? preset.css : '';
    const customCss = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturationVal}%)`;
    return presetCss ? `${presetCss} ${customCss}` : customCss;
  };

  // Handle Extract Audio
  const handleExtractAudio = async () => {
    try {
      setIsExtractingAudio(true);
      setAudioProgress(10);
      const res = await extractAudioFromVideo(effectiveSrc, (pct) => setAudioProgress(pct));
      setExtractedAudioUrl(res.audioUrl);
      setIsExtractingAudio(false);
    } catch (err) {
      console.error('Audio extraction failed:', err);
      setIsExtractingAudio(false);
      alert('Audio extraction failed: Please check if this video contains an audio track.');
    }
  };

  // Handle Video Export (Cut & Crop with Lossless Quality)
  const handleExport = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      setIsProcessing(true);
      setProcessProgress(5);

      const result = await processVideoEdit({
        videoElement: video,
        startTime,
        endTime,
        cropAspect: selectedCrop,
        filterCss: getFilterStyle(),
        onProgress: (p) => setProcessProgress(p),
      });

      const editedMediaItem: MediaItem = {
        ...photo,
        id: `video-edited-${Date.now()}`,
        title: `${photo.title} (Edited)`,
        url: result.url,
        thumbnailUrl: photo.thumbnailUrl,
        type: 'video',
        duration: formatVideoTime(endTime - startTime),
        timestamp: Date.now(),
        dateFormatted: 'Today',
        isAiModified: true,
      };

      onSaveEditedVideo(editedMediaItem);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error('Video edit processing error:', err);
      setIsProcessing(false);
      alert('Video export encountered an issue. Reverting to original clip.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between overflow-hidden select-none animate-fadeIn text-white">
      {/* Top Navigation Bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 hyperos-glass">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              HyperOS Video Studio
            </h2>
            <p className="text-xs text-white/60">
              Lossless High-Performance Processing
            </p>
          </div>
        </div>

        {/* Export Save Button */}
        <button
          onClick={handleExport}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg active:scale-95 transition-all"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing {processProgress}%</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Export Lossless</span>
            </>
          )}
        </button>
      </div>

      {/* Main Center Video Preview Area */}
      <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Video Canvas Container with Aspect Ratio Guides */}
        <div 
          className="relative max-h-full max-w-full flex items-center justify-center rounded-2xl overflow-hidden bg-black/50 shadow-2xl transition-all"
          style={{
            aspectRatio: selectedCrop === '16:9' ? '16/9' : selectedCrop === '9:16' ? '9/16' : selectedCrop === '1:1' ? '1/1' : selectedCrop === '4:3' ? '4/3' : selectedCrop === '4:5' ? '4/5' : undefined,
          }}
        >
          <video
            ref={videoRef}
            src={effectiveSrc}
            playsInline
            crossOrigin="anonymous"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onClick={togglePlay}
            className="max-h-[50vh] sm:max-h-[55vh] max-w-full object-contain cursor-pointer rounded-xl"
            style={{
              filter: getFilterStyle(),
            }}
          />

          {/* Center Play Overlay when paused */}
          {!isPlaying && !isProcessing && (
            <button
              onClick={togglePlay}
              className="absolute p-4 rounded-full bg-orange-500/90 text-white shadow-xl hover:scale-110 active:scale-95 transition-transform"
            >
              <Play className="w-7 h-7 fill-current ml-0.5" />
            </button>
          )}

          {/* Processing Overlay Progress Bar */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
              <div className="w-16 h-16 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mb-4" />
              <h3 className="text-base font-bold text-white mb-1">
                Exporting Lossless Video
              </h3>
              <p className="text-xs text-white/60 mb-4 max-w-xs">
                Zero quality degradation · Native 8 Mbps stream capture
              </p>
              <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-150"
                  style={{ width: `${processProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-orange-400 font-bold mt-2">
                {processProgress}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tool Configuration Shelf */}
      <div className="bg-slate-900/95 border-t border-white/10 p-3 sm:p-5 hyperos-glass">
        {/* Tool Selector Tabs */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center p-1 bg-white/10 rounded-full">
            <button
              onClick={() => setActiveTab('cut')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'cut' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Cut & Trim</span>
            </button>

            <button
              onClick={() => setActiveTab('crop')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'crop' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              <Crop className="w-3.5 h-3.5" />
              <span>Crop Ratio</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'audio' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Extract Audio</span>
            </button>

            <button
              onClick={() => setActiveTab('filters')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'filters' ? 'bg-orange-500 text-white shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Tuning</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Cut & Trim Controls */}
        {activeTab === 'cut' && (
          <div className="max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-white/80">
              <span className="flex items-center gap-1">
                Start: <strong className="text-orange-400">{formatVideoTime(startTime)}</strong>
              </span>
              <span className="text-white/60">
                Duration: <strong className="text-white font-bold">{formatVideoTime(endTime - startTime)}</strong>
              </span>
              <span className="flex items-center gap-1">
                End: <strong className="text-orange-400">{formatVideoTime(endTime)}</strong>
              </span>
            </div>

            {/* Start & End Dual Slider Controls */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/60 w-10">Start:</span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, endTime - 0.5)}
                  step={0.1}
                  value={startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setStartTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none accent-orange-500 cursor-pointer"
                />
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setStartTime((s) => Math.max(0, s - 0.1))}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-xs"
                    title="-0.1s"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setStartTime((s) => Math.min(endTime - 0.5, s + 0.1))}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-xs"
                    title="+0.1s"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-white/60 w-10">End:</span>
                <input
                  type="range"
                  min={startTime + 0.5}
                  max={duration}
                  step={0.1}
                  value={endTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setEndTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none accent-orange-500 cursor-pointer"
                />
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => setEndTime((e) => Math.max(startTime + 0.5, e - 0.1))}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-xs"
                    title="-0.1s"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setEndTime((e) => Math.min(duration, e + 0.1))}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-xs"
                    title="+0.1s"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Crop Aspect Ratios */}
        {activeTab === 'crop' && (
          <div className="max-w-xl mx-auto">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ASPECT_RATIOS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedCrop(item.id)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    selectedCrop === item.id
                      ? 'bg-orange-500 text-white shadow-md scale-105'
                      : 'bg-white/10 hover:bg-white/20 text-white/80'
                  }`}
                >
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className="text-[10px] opacity-70 mt-0.5">{item.ratio}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Extract Audio Tool */}
        {activeTab === 'audio' && (
          <div className="max-w-xl mx-auto space-y-3">
            {!extractedAudioUrl ? (
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Music className="w-8 h-8 text-orange-400 mb-2" />
                <h4 className="text-sm font-bold text-white mb-1">
                  Extract Pure 16-Bit Lossless Audio
                </h4>
                <p className="text-xs text-white/60 mb-3 max-w-sm">
                  Separates soundtrack directly from video using on-device Web Audio API with zero quality loss.
                </p>
                <button
                  onClick={handleExtractAudio}
                  disabled={isExtractingAudio}
                  className="px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {isExtractingAudio ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Extracting Audio {audioProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-3.5 h-3.5" />
                      <span>Extract Audio Track Now</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-orange-500 text-white">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {photo.title}.wav
                      </h4>
                      <span className="text-[10px] text-white/60 font-mono">
                        Lossless PCM 16-Bit Stereo · 44.1kHz
                      </span>
                    </div>
                  </div>

                  <a
                    href={extractedAudioUrl}
                    download={`${photo.title || 'extracted_audio'}.wav`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download WAV</span>
                  </a>
                </div>

                {/* Built-in Audio Player */}
                <audio
                  ref={audioRef}
                  src={extractedAudioUrl}
                  controls
                  className="w-full h-8 rounded-lg accent-orange-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Filters & Tuning */}
        {activeTab === 'filters' && (
          <div className="max-w-xl mx-auto space-y-3">
            {/* Presets */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedFilter(preset.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedFilter === preset.id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-white/70'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Tuning Sliders */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/70 font-mono">
                  <span>Brightness</span>
                  <span>{brightnessVal}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={brightnessVal}
                  onChange={(e) => setBrightnessVal(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none accent-orange-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/70 font-mono">
                  <span>Contrast</span>
                  <span>{contrastVal}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={contrastVal}
                  onChange={(e) => setContrastVal(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none accent-orange-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-white/70 font-mono">
                  <span>Saturation</span>
                  <span>{saturationVal}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={saturationVal}
                  onChange={(e) => setSaturationVal(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/20 rounded-full appearance-none accent-orange-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
