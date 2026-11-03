import React, { useState } from 'react';
import { MediaItem } from '../types/gallery';
import { 
  X, 
  Check, 
  RotateCw, 
  Sliders, 
  Wand2, 
  Crop, 
  Sun, 
  Contrast, 
  Droplet, 
  ThermometerSun 
} from 'lucide-react';

interface PhotoEditorModalProps {
  photo: MediaItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPhoto: MediaItem) => void;
}

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  photo,
  isOpen,
  onClose,
  onSave,
}) => {
  const [editorTab, setEditorTab] = useState<'filters' | 'adjust' | 'crop'>('filters');
  const [activeFilter, setActiveFilter] = useState<string>('leica_authentic');
  const [rotation, setRotation] = useState<number>(0);

  // Adjustment values
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [warmth, setWarmth] = useState<number>(0);

  if (!isOpen) return null;

  const filters = [
    { id: 'original', name: 'Original', style: 'none', desc: 'No filter' },
    { id: 'leica_authentic', name: 'Leica Authentic', style: 'contrast(1.12) saturate(1.08)', desc: 'Classic contrast & deep shadow' },
    { id: 'leica_vibrant', name: 'Leica Vibrant', style: 'contrast(1.18) saturate(1.35) brightness(1.04)', desc: 'Luminous vivid tones' },
    { id: 'leica_mono', name: 'Leica B&W', style: 'grayscale(1) contrast(1.3) brightness(0.96)', desc: 'Master black and white' },
    { id: 'film_warm', name: 'Film Warmth', style: 'sepia(0.3) saturate(1.2) contrast(1.08)', desc: 'Golden analogue film' },
    { id: 'cyberpunk', name: 'Cyberpunk', style: 'hue-rotate(185deg) saturate(1.4) contrast(1.2)', desc: 'Neon blue-cyan tones' },
  ];

  const currentFilter = filters.find(f => f.id === activeFilter) || filters[0];

  const handleApplySave = () => {
    const updated: MediaItem = {
      ...photo,
      id: `edited-${Date.now()}`,
      title: `${photo.title} (Edited)`,
      isAiModified: true,
      aiTag: currentFilter.name,
    };
    onSave(updated);
    onClose();
  };

  const getCombinedFilterStyle = () => {
    let base = currentFilter.style === 'none' ? '' : currentFilter.style;
    const adjustments = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${
      warmth > 0 ? `sepia(${warmth * 0.4}%)` : `hue-rotate(${warmth * 0.5}deg)`
    }`;
    return `${base} ${adjustments}`.trim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 text-white animate-fadeIn">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-20 hyperos-glass backdrop-blur-md border-b border-white/10">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">HyperOS Photo Editor</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 font-mono font-bold">
            LEICA
          </span>
        </div>

        <button
          onClick={handleApplySave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange-500 text-white font-semibold text-xs hover:bg-orange-600 active:scale-95 transition-all shadow-md"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>Save Copy</span>
        </button>
      </div>

      {/* Main Canvas View */}
      <div className="relative w-full max-w-4xl h-[60vh] flex items-center justify-center p-4">
        <img
          src={photo.url}
          alt={photo.title}
          style={{
            transform: `rotate(${rotation}deg)`,
            filter: getCombinedFilterStyle(),
          }}
          className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-200"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Bottom Tool Panels */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 hyperos-glass backdrop-blur-md border-t border-white/10 space-y-4">
        {/* Sub-tool panels */}
        {editorTab === 'filters' && (
          <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-2xl mx-auto scrollbar-none">
            {filters.map((f) => {
              const isSelected = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl shrink-0 transition-all ${
                    isSelected ? 'bg-orange-500 text-white shadow-md scale-105' : 'hover:bg-white/10 text-white/80'
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/20 bg-slate-800">
                    <img
                      src={photo.thumbnailUrl}
                      alt={f.name}
                      style={{ filter: f.style }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-semibold tracking-tight">{f.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {editorTab === 'adjust' && (
          <div className="max-w-xl mx-auto grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-white/70">
                <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> Brightness</span>
                <span className="font-mono">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-white/70">
                <span className="flex items-center gap-1"><Contrast className="w-3.5 h-3.5" /> Contrast</span>
                <span className="font-mono">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-white/70">
                <span className="flex items-center gap-1"><Droplet className="w-3.5 h-3.5" /> Saturation</span>
                <span className="font-mono">{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-white/70">
                <span className="flex items-center gap-1"><ThermometerSun className="w-3.5 h-3.5" /> Warmth</span>
                <span className="font-mono">{warmth}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={warmth}
                onChange={(e) => setWarmth(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>
        )}

        {editorTab === 'crop' && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold"
            >
              <RotateCw className="w-4 h-4" />
              <span>Rotate 90° ({rotation}°)</span>
            </button>
            <button
              onClick={() => setRotation(0)}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/70"
            >
              Reset Rotation
            </button>
          </div>
        )}

        {/* Tab Navigator */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
          <button
            onClick={() => setEditorTab('filters')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              editorTab === 'filters' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Leica Filters</span>
          </button>

          <button
            onClick={() => setEditorTab('adjust')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              editorTab === 'adjust' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Adjustments</span>
          </button>

          <button
            onClick={() => setEditorTab('crop')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              editorTab === 'crop' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white'
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            <span>Rotate & Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
};
