export type MediaType = 'photo' | 'video' | 'live';

export type PhotoCategory =
  | 'camera'
  | 'portrait'
  | 'night'
  | 'nature'
  | 'pet'
  | 'architecture'
  | 'document'
  | 'screenshot';

export interface ExifData {
  camera: string;
  lens: string;
  focalLength: string;
  aperture: string;
  shutter: string;
  iso: string;
  resolution: string;
  size: string;
  coords?: [number, number];
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  timestamp: number;
  dateFormatted: string;
  locationName: string;
  type: MediaType;
  duration?: string;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedTimestamp?: number;
  albumIds: string[];
  category: PhotoCategory;
  exif: ExifData;
  detectedText?: string;
  isAiModified?: boolean;
  aiTag?: string;
  motionVideoUrl?: string; // Optional motion clip for Live Photo
}

export interface Album {
  id: string;
  title: string;
  count: number;
  coverUrl: string;
  type: 'system' | 'custom' | 'people' | 'location';
  subtitle?: string;
  iconName?: string;
  personName?: string;
}

export type GridDensity = 'dense' | 'normal' | 'coarse' | 'month';

export type TimelineMode = 'grouped' | 'all';

export type GalleryTab = 'photos' | 'albums';

export type CreativityTool = 'sky' | 'eraser' | 'cutout' | 'collage' | 'leica_frame';

export interface SkyPreset {
  id: string;
  name: string;
  filterStyle: string;
  overlayGradient: string;
  ambientTint: string;
  badge: string;
  previewColor: string;
}
