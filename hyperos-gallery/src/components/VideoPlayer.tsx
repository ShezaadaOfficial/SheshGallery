import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SunMedium, 
  Sliders, 
  RotateCcw, 
  FastForward,
  Rewind,
  Scissors
} from 'lucide-react';
import { formatVideoTime, createScenicOfflineVideoBlob } from '../utils/videoUtils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onOpenEditor?: () => void;
  videoRefOut?: (video: HTMLVideoElement | null) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  onOpenEditor,
  videoRefOut,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Video State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [effectiveSrc, setEffectiveSrc] = useState<string>(src);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);

  // VLC Style Brightness & Volume Gestures
  const [brightness, setBrightness] = useState<number>(100); // 20% to 200%
  const [vlcHud, setVlcHud] = useState<{
    type: 'brightness' | 'volume' | 'seek';
    value: number | string;
    icon: 'sun' | 'volume' | 'seek-fwd' | 'seek-bwd';
  } | null>(null);
  const vlcHudTimerRef = useRef<number | null>(null);

  // Gesture tracking
  const pointerStartRef = useRef<{ x: number; y: number; startVal: number; side: 'left' | 'right' } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Pass video element ref to parent if needed
  useEffect(() => {
    videoRefOut?.(videoRef.current);
  }, [videoRefOut, effectiveSrc]);

  // Check if src is valid playable video format, otherwise generate offline video
  useEffect(() => {
    const isVideoExt = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src) || src.startsWith('blob:') || src.startsWith('data:video');
    if (!isVideoExt) {
      // Create high-quality offline synthetic video
      createScenicOfflineVideoBlob().then((offlineUrl) => {
        setEffectiveSrc(offlineUrl);
      });
    } else {
      setEffectiveSrc(src);
    }
  }, [src]);

  const showVlcHud = (type: 'brightness' | 'volume' | 'seek', value: number | string, icon: 'sun' | 'volume' | 'seek-fwd' | 'seek-bwd') => {
    setVlcHud({ type, value, icon });
    if (vlcHudTimerRef.current !== null) {
      window.clearTimeout(vlcHudTimerRef.current);
    }
    vlcHudTimerRef.current = window.setTimeout(() => {
      setVlcHud(null);
    }, 1200);
  };

  const resetControlsTimeout = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current !== null) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setIsControlsVisible(false);
      }, 2500);
    }
  }, [isPlaying]);

  // Play / Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  };

  // Seek
  const handleSeek = (newTime: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Volume & Mute
  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.max(0, Math.min(1, newVolume));
    video.volume = clamped;
    setVolume(clamped);
    if (clamped === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      video.volume = 0.5;
      setVolume(0.5);
    }
  };

  // Playback rate cycle (1x -> 1.25x -> 1.5x -> 2x -> 0.5x -> 1x)
  const cyclePlaybackRate = () => {
    const video = videoRef.current;
    if (!video) return;
    const rates = [1, 1.25, 1.5, 2, 0.5];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    video.playbackRate = nextRate;
    setPlaybackRate(nextRate);
    showVlcHud('seek', `${nextRate}x Speed`, 'seek-fwd');
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // VLC Swiping Gestures (Left = Brightness, Right = Volume)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only trigger on primary pointer
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const side = x < rect.width / 2 ? 'left' : 'right';

    // Check double-tap
    const now = Date.now();
    if (lastTapRef.current && now - lastTapRef.current.time < 300) {
      const isRightSide = x > rect.width / 2;
      const video = videoRef.current;
      if (video) {
        if (isRightSide) {
          video.currentTime = Math.min(video.currentTime + 10, video.duration);
          showVlcHud('seek', '+10s', 'seek-fwd');
        } else {
          video.currentTime = Math.max(video.currentTime - 10, 0);
          showVlcHud('seek', '-10s', 'seek-bwd');
        }
      }
      lastTapRef.current = null;
      pointerStartRef.current = null;
      return;
    }
    lastTapRef.current = { time: now, x };

    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startVal: side === 'left' ? brightness : volume * 100,
      side,
    };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) {
      resetControlsTimeout();
      return;
    }

    const dy = pointerStartRef.current.y - e.clientY; // upward drag increases
    const delta = (dy / 200) * 100; // 200px drag = 100%

    if (pointerStartRef.current.side === 'left') {
      // Brightness (20% to 200%)
      const nextBrightness = Math.round(Math.min(200, Math.max(20, pointerStartRef.current.startVal + delta)));
      setBrightness(nextBrightness);
      showVlcHud('brightness', `${nextBrightness}%`, 'sun');
    } else {
      // Volume (0% to 100%)
      const nextVolumePct = Math.round(Math.min(100, Math.max(0, pointerStartRef.current.startVal + delta)));
      handleVolumeChange(nextVolumePct / 100);
      showVlcHud('volume', `${nextVolumePct}%`, nextVolumePct === 0 ? 'volume' : 'volume');
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerStartRef.current) {
      const dx = Math.abs(e.clientX - pointerStartRef.current.x);
      const dy = Math.abs(e.clientY - pointerStartRef.current.y);
      // If minimal movement, toggle controls or play/pause
      if (dx < 8 && dy < 8) {
        setIsControlsVisible((prev) => !prev);
      }
    }
    pointerStartRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      className="relative w-full h-full max-h-[75vh] flex items-center justify-center bg-black/90 rounded-2xl overflow-hidden select-none group touch-none"
    >
      {/* Video Element with hardware-accelerated brightness filter */}
      <video
        ref={videoRef}
        src={effectiveSrc}
        poster={poster}
        playsInline
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsBuffering(false);
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full object-contain max-h-[75vh] transition-filter duration-75"
        style={{
          filter: `brightness(${brightness}%)`,
        }}
      />

      {/* Touch & Gesture Capture Plane (VLC Swiping Surface) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="absolute inset-0 z-10 cursor-pointer"
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-12 h-12 rounded-full border-3 border-orange-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* VLC Style Gesture HUD Indicator (Brightness / Volume / Seek) */}
      {vlcHud && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center gap-2 p-4 rounded-3xl bg-black/75 backdrop-blur-xl border border-white/10 shadow-2xl animate-scaleUp min-w-[130px]">
          {vlcHud.icon === 'sun' && <SunMedium className="w-8 h-8 text-amber-400" />}
          {vlcHud.icon === 'volume' && (
            isMuted || volume === 0 ? <VolumeX className="w-8 h-8 text-red-400" /> : <Volume2 className="w-8 h-8 text-blue-400" />
          )}
          {vlcHud.icon === 'seek-fwd' && <FastForward className="w-8 h-8 text-orange-400" />}
          {vlcHud.icon === 'seek-bwd' && <Rewind className="w-8 h-8 text-orange-400" />}

          <span className="text-sm font-bold text-white tracking-wider">
            {vlcHud.value}
          </span>

          {/* Vertical progress bar gauge for Brightness and Volume */}
          {(vlcHud.type === 'brightness' || vlcHud.type === 'volume') && (
            <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  vlcHud.type === 'brightness' ? 'bg-amber-400' : 'bg-blue-400'
                }`}
                style={{
                  width: `${vlcHud.type === 'brightness' ? Math.min(100, (brightness / 200) * 100) : volume * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Center Play / Pause Big Button on pause */}
      {!isPlaying && !isBuffering && isControlsVisible && (
        <button
          onClick={togglePlay}
          className="absolute z-20 p-5 rounded-full bg-orange-500/90 hover:bg-orange-500 text-white shadow-2xl backdrop-blur-md hover:scale-110 active:scale-95 transition-all"
          title="Play Video"
        >
          <Play className="w-8 h-8 fill-current ml-1" />
        </button>
      )}

      {/* Native-like Bottom Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
          isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar & Scrubber */}
        <div className="relative flex items-center mb-2.5 group/scrub">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.05}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 hover:h-2.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-orange-500 transition-all"
            title="Seek video position"
          />
        </div>

        {/* Lower Control Actions Row */}
        <div className="flex items-center justify-between gap-2 text-white">
          {/* Left Controls: Play/Pause, Skip, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Time Stamp */}
            <div className="text-xs font-mono font-medium text-white/90 tabular-nums">
              <span>{formatVideoTime(currentTime)}</span>
              <span className="text-white/50 mx-1">/</span>
              <span className="text-white/60">{formatVideoTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Volume, Speed, Edit, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Volume Control */}
            <div className="flex items-center gap-1 group/vol">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/90"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-14 sm:w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-orange-500 opacity-80 group-hover/vol:opacity-100 transition-opacity"
                title="Volume"
              />
            </div>

            {/* Playback Speed */}
            <button
              onClick={cyclePlaybackRate}
              className="px-2 py-1 rounded-lg text-xs font-bold hover:bg-white/10 text-white/90 transition-colors"
              title="Change Playback Speed"
            >
              {playbackRate}x
            </button>

            {/* Edit Video Trigger */}
            {onOpenEditor && (
              <button
                onClick={onOpenEditor}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-500/90 hover:bg-orange-500 text-white text-xs font-semibold shadow-sm active:scale-95 transition-all"
                title="Open Video Studio (Cut, Crop, Extract Audio)"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white/90"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
