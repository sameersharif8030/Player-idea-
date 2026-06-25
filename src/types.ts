export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url?: string;
  isFavorite?: boolean;
  folder?: string;
  coverColor?: string;
}

export type VisualizerStyle = 'NEON_BARS' | 'OSCILLOSCOPE' | 'ORBIT_RING' | 'STARBURST' | 'DANCING_PARTICLES';

export type ThemeType = 'DARK' | 'LIGHT' | 'HACKER' | 'SUNSET' | 'NEON_PUB' | 'HATSUNE_MIKU';

export interface StealthModeSettings {
  enabled: boolean;
  hideNotification: boolean; // IMPORTANCE_MIN to minimize notification tray footprint
  hideLockscreenPlayer: boolean; // Set VISIBILITY_SECRET to hide from lock screen
  emptyMediaMetadata: boolean; // Clear OS MediaSession metadata to stay completely anonymous
  keepBluetoothActive: boolean; // Keep MediaButtonReceiver active for earbud controls
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  shuffle: boolean;
  repeatMode: 'NONE' | 'ONE' | 'ALL';
  playbackSpeed: number;
  queue: Track[];
  history: Track[];
  activeVisualizer: VisualizerStyle;
}
