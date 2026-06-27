import React, { useState, useEffect, useRef } from 'react';
import { Track, VisualizerStyle, ThemeType } from './types';
import { PRELOADED_TRACKS } from './data';
import { audioService } from './synthwaveEngine';
import { saveAudioFile, deleteAudioFile, getAllStoredFiles } from './lib/db';

import TapeDeckPlayer from './components/TapeDeckPlayer';
import Library from './components/Library';

import { Headphones, Sparkles, Cpu, Clock, Palette } from 'lucide-react';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tapedeck_local_tracks');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved tracks', e);
        }
      }
    }
    return PRELOADED_TRACKS;
  });

  const [currentTrack, setCurrentTrack] = useState<Track | null>(() => {
    if (typeof window !== 'undefined') {
      const savedTrack = localStorage.getItem('tapedeck_current_track_id');
      const savedTracks = localStorage.getItem('tapedeck_local_tracks');
      if (savedTrack && savedTracks) {
        try {
          const parsedTracks: Track[] = JSON.parse(savedTracks);
          const found = parsedTracks.find(t => t.id === savedTrack);
          if (found) return found;
        } catch (e) {}
      }
    }
    return PRELOADED_TRACKS[0];
  });

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [queue, setQueue] = useState<Track[]>([]);
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [shuffle, setShuffle] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tapedeck_shuffle') === 'true';
    }
    return false;
  });
  const [repeatMode, setRepeatMode] = useState<'NONE' | 'ONE' | 'ALL'>(() => {
    if (typeof window !== 'undefined') {
      const mode = localStorage.getItem('tapedeck_repeat_mode');
      if (mode === 'NONE' || mode === 'ONE' || mode === 'ALL') return mode;
    }
    return 'ALL';
  });
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeVisualizer, setActiveVisualizer] = useState<VisualizerStyle>('NEON_BARS');
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('tapedeck_theme');
      if (savedTheme) return savedTheme as ThemeType;
    }
    return 'DARK';
  });
  const [disableSystemNotification, setDisableSystemNotification] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tapedeck_disable_system_notification') === 'true';
    }
    return false;
  });
  const [utcTime, setUtcTime] = useState('');

  // Refs for tracking fresh state in callback functions/event handlers (prevents stale closures)
  const tracksRef = useRef(tracks);
  const currentTrackRef = useRef(currentTrack);
  const queueRef = useRef(queue);
  const isPlayingRef = useRef(isPlaying);
  const shuffleRef = useRef(shuffle);
  const repeatModeRef = useRef(repeatMode);
  const uploadedFilesRef = useRef(uploadedFiles);

  // Synchronize state references on every render pass
  tracksRef.current = tracks;
  currentTrackRef.current = currentTrack;
  queueRef.current = queue;
  isPlayingRef.current = isPlaying;
  shuffleRef.current = shuffle;
  repeatModeRef.current = repeatMode;
  uploadedFilesRef.current = uploadedFiles;

  // Persist tracks and settings
  useEffect(() => {
    localStorage.setItem('tapedeck_local_tracks', JSON.stringify(tracks));
  }, [tracks]);

  useEffect(() => {
    if (currentTrack) {
      localStorage.setItem('tapedeck_current_track_id', currentTrack.id);
    }
  }, [currentTrack]);

  useEffect(() => {
    localStorage.setItem('tapedeck_shuffle', String(shuffle));
  }, [shuffle]);

  useEffect(() => {
    localStorage.setItem('tapedeck_repeat_mode', repeatMode);
  }, [repeatMode]);

  useEffect(() => {
    localStorage.setItem('tapedeck_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('tapedeck_disable_system_notification', String(disableSystemNotification));
  }, [disableSystemNotification]);

  // Load offline files on mount
  useEffect(() => {
    const loadCachedFiles = async () => {
      try {
        const cachedFiles = await getAllStoredFiles();
        setUploadedFiles(cachedFiles);
      } catch (err) {
        console.error('Failed to load cached local files', err);
      }
    };
    loadCachedFiles();
  }, []);

  // Maintain the next-up playlist queue reactive updates
  const updateQueue = (currentTrackId: string, isShuffle: boolean, allTracks: Track[]) => {
    if (allTracks.length === 0) {
      setQueue([]);
      return;
    }
    const curIdx = allTracks.findIndex(t => t.id === currentTrackId);
    if (curIdx === -1) {
      setQueue([]);
      return;
    }

    if (isShuffle) {
      // Shuffled queue of other tracks
      const others = allTracks.filter(t => t.id !== currentTrackId);
      const shuffled = [...others].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
    } else {
      // Sequential queue of tracks following the current one
      const upcoming: Track[] = [];
      for (let i = 1; i < allTracks.length; i++) {
        const idx = (curIdx + i) % allTracks.length;
        upcoming.push(allTracks[idx]);
      }
      setQueue(upcoming);
    }
  };

  useEffect(() => {
    if (currentTrack) {
      updateQueue(currentTrack.id, shuffle, tracks);
    } else if (tracks.length > 0) {
      updateQueue(tracks[0].id, shuffle, tracks);
    } else {
      setQueue([]);
    }
  }, [currentTrack, shuffle, tracks]);

  // Local clock loop
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hook up audio time updates from audio service
  useEffect(() => {
    audioService.registerTimeCallback((time) => {
      setCurrentTime(time);
      
      // Auto-advance track when finished
      if (currentTrack && time >= currentTrack.duration - 0.2) {
        handleTrackEnded();
      }
    });
  }, [tracks, currentTrack, shuffle, repeatMode]);

  // Sync OS Web Media Session metadata
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (disableSystemNotification) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
      return;
    }

    if (currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [
          { 
            src: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=256&auto=format&fit=crop&q=80', 
            sizes: '256x256', 
            type: 'image/jpeg' 
          }
        ]
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [currentTrack, isPlaying, disableSystemNotification]);

  // Bind OS/Bluetooth Key Events to standard playback controls
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (disableSystemNotification) {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      return;
    }

    const playTrack = (track: Track) => {
      setCurrentTrack(track);
      setCurrentTime(0);
      const customFile = uploadedFilesRef.current[track.id];
      audioService.play(track, customFile);
      setIsPlaying(true);
    };

    const handlePlayAction = () => {
      if (currentTrackRef.current) {
        audioService.resume();
        setIsPlaying(true);
      }
    };

    const handlePauseAction = () => {
      audioService.pause();
      setIsPlaying(false);
    };

    const handleNextAction = () => {
      const currentTracks = tracksRef.current;
      const currentQueue = queueRef.current;
      if (currentTracks.length === 0) return;
      
      if (currentQueue.length > 0) {
        playTrack(currentQueue[0]);
      } else {
        playTrack(currentTracks[0]);
      }
    };

    const handlePrevAction = () => {
      const currentTracks = tracksRef.current;
      const curTrack = currentTrackRef.current;
      if (currentTracks.length === 0) return;

      let prevIndex = 0;
      if (curTrack) {
        const currentIndex = currentTracks.findIndex(t => t.id === curTrack.id);
        prevIndex = (currentIndex - 1 + currentTracks.length) % currentTracks.length;
      }

      playTrack(currentTracks[prevIndex]);
    };

    navigator.mediaSession.setActionHandler('play', handlePlayAction);
    navigator.mediaSession.setActionHandler('pause', handlePauseAction);
    navigator.mediaSession.setActionHandler('nexttrack', handleNextAction);
    navigator.mediaSession.setActionHandler('previoustrack', handlePrevAction);

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
    };
  }, [disableSystemNotification]);

  const handlePlayPause = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioService.pause();
      setIsPlaying(false);
    } else {
      const customFile = uploadedFiles[currentTrack.id];
      audioService.play(currentTrack, customFile);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    const customFile = uploadedFiles[track.id];
    audioService.play(track, customFile);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (tracks.length === 0) return;
    
    if (queue.length > 0) {
      handleSelectTrack(queue[0]);
    } else {
      handleSelectTrack(tracks[0]);
    }
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;

    let prevIndex = 0;
    if (currentTrack) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    }

    handleSelectTrack(tracks[prevIndex]);
  };

  const handleTrackEnded = () => {
    if (repeatMode === 'ONE' && currentTrack) {
      const customFile = uploadedFiles[currentTrack.id];
      audioService.play(currentTrack, customFile);
    } else if (repeatMode === 'ALL') {
      handleNext();
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    audioService.setSpeed(speed);
  };

  // Upload tracks and local folders parser
  const handleUploadTracks = (files: FileList) => {
    const newTracks: Track[] = [];
    const newFilesMap = { ...uploadedFiles };

    Array.from(files).forEach((file) => {
      const id = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const cleanName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
      const parts = cleanName.split(" - ");
      const title = parts.length > 1 ? parts[1] : parts[0];
      const artist = parts.length > 1 ? parts[0] : "Local File";

      const gradients = [
        'from-pink-500 to-indigo-600',
        'from-blue-600 to-purple-800',
        'from-purple-800 to-red-700',
        'from-emerald-400 to-cyan-600',
        'from-yellow-500 to-orange-600'
      ];
      const coverColor = gradients[Math.floor(Math.random() * gradients.length)];

      newTracks.push({
        id,
        title: title.substring(0, 32),
        artist: artist.substring(0, 32),
        album: "Local Storage",
        duration: 210, // Default fallback, updated below when metadata is loaded
        coverColor,
        folder: "Imported Queue"
      });

      newFilesMap[id] = file;

      // Persist actual file binary in IndexedDB
      saveAudioFile(id, file);

      // Extract exact track duration dynamically from local file
      const url = URL.createObjectURL(file);
      const tempAudio = new Audio(url);
      tempAudio.addEventListener('loadedmetadata', () => {
        if (tempAudio.duration && tempAudio.duration > 0) {
          const durationSecs = Math.round(tempAudio.duration);
          setTracks(prev => prev.map(t => t.id === id ? { ...t, duration: durationSecs } : t));
        }
        URL.revokeObjectURL(url);
      });
    });

    setUploadedFiles(newFilesMap);
    setTracks(prev => [...prev, ...newTracks]);

    if (newTracks.length > 0) {
      handleSelectTrack(newTracks[0]);
    }
  };

  const handleDeleteTrack = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    setUploadedFiles(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    // Delete actual binary from IndexedDB
    deleteAudioFile(id);

    if (currentTrack?.id === id) {
      audioService.pause();
      setIsPlaying(false);
      setCurrentTrack(tracks[0] || null);
      setCurrentTime(0);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
    if (currentTrack?.id === id) {
      setCurrentTrack(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const getPageThemeClasses = () => {
    switch (theme) {
      case 'LIGHT':
        return {
          wrapper: 'bg-stone-100 text-stone-900',
          gridGlow: 'absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:24px_36px] opacity-40 pointer-events-none',
          glowNode: 'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-violet-400/5 rounded-full blur-[160px] pointer-events-none',
          header: 'border-b border-stone-200 bg-stone-50/80',
          brandText: 'from-violet-600 to-indigo-600',
          footer: 'border-t border-stone-200 bg-stone-50/40 text-stone-500'
        };
      case 'HACKER':
        return {
          wrapper: 'bg-black text-green-400 font-mono',
          gridGlow: 'absolute inset-0 bg-[linear-gradient(to_right,#052e16_1px,transparent_1px),linear-gradient(to_bottom,#052e16_1px,transparent_1px)] bg-[size:24px_36px] opacity-35 pointer-events-none',
          glowNode: 'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-green-900/10 rounded-full blur-[160px] pointer-events-none',
          header: 'border-b border-green-950 bg-black/85',
          brandText: 'from-green-500 to-green-300',
          footer: 'border-t border-green-950 bg-black/90 text-green-600'
        };
      case 'SUNSET':
        return {
          wrapper: 'bg-zinc-950 text-orange-200',
          gridGlow: 'absolute inset-0 bg-[linear-gradient(to_right,#291505_1px,transparent_1px),linear-gradient(to_bottom,#291505_1px,transparent_1px)] bg-[size:24px_36px] opacity-35 pointer-events-none',
          glowNode: 'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-orange-900/10 rounded-full blur-[160px] pointer-events-none',
          header: 'border-b border-orange-950 bg-zinc-950/80',
          brandText: 'from-orange-500 to-amber-500',
          footer: 'border-t border-orange-950 bg-zinc-950/40 text-orange-600'
        };
      case 'HATSUNE_MIKU':
        return {
          wrapper: 'bg-[#040b0e] text-[#39C5BB] font-mono',
          gridGlow: 'absolute inset-0 bg-[linear-gradient(to_right,#0a2e33_1px,transparent_1px),linear-gradient(to_bottom,#0a2e33_1px,transparent_1px)] bg-[size:24px_36px] opacity-35 pointer-events-none',
          glowNode: 'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#39C5BB]/10 rounded-full blur-[160px] pointer-events-none',
          header: 'border-b border-[#39C5BB]/20 bg-[#040b0e]/85',
          brandText: 'from-[#39C5BB] to-[#ff4081]',
          footer: 'border-t border-[#39C5BB]/20 bg-[#040b0e]/90 text-[#1c7e77]'
        };
      case 'DARK':
      default:
        return {
          wrapper: 'bg-zinc-950 text-zinc-100',
          gridGlow: 'absolute inset-0 bg-[linear-gradient(to_right,#160b26_1px,transparent_1px),linear-gradient(to_bottom,#160b26_1px,transparent_1px)] bg-[size:24px_36px] opacity-30 pointer-events-none',
          glowNode: 'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none',
          header: 'border-b border-zinc-900 bg-zinc-950/80',
          brandText: 'from-pink-500 to-rose-400',
          footer: 'border-t border-zinc-900 bg-zinc-950/40 text-zinc-500'
        };
    }
  };

  const pageClasses = getPageThemeClasses();

  return (
    <div className={`min-h-screen flex flex-col font-sans relative select-none overflow-x-hidden transition-all duration-300 ${pageClasses.wrapper}`}>
      {/* Background Grids */}
      <div className={pageClasses.gridGlow} />
      <div className={pageClasses.glowNode} />

      {/* COMPACT CLEAN HEADER */}
      <header className={`relative z-10 border-b backdrop-blur-md px-6 py-4 flex items-center justify-between transition-all duration-300 ${pageClasses.header}`}>
        <div className="flex items-center space-x-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-pink-500 animate-pulse" />
          </div>
          <div>
            <h1 className={`text-sm font-black font-mono uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${pageClasses.brandText}`}>
              TAPEDECK
            </h1>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Premium Android Audio Sandbox</p>
          </div>
        </div>

        {/* Custom skins & clock in header */}
        <div className="flex items-center space-x-4 font-mono text-[10px]">
          <div className="flex items-center space-x-1 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 px-2.5 py-1.5 rounded-xl">
            <Palette className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeType)}
              className="bg-transparent text-zinc-300 border-none rounded text-[9px] font-mono focus:ring-0 cursor-pointer outline-none font-bold"
            >
              <option value="DARK">🌌 Dark</option>
              <option value="LIGHT">☀️ Light</option>
              <option value="HACKER">📟 Hacker</option>
              <option value="SUNSET">🌅 Sunset</option>
              <option value="HATSUNE_MIKU">🎤 Miku 01</option>
            </select>
          </div>
          
          <span className="hidden md:inline text-zinc-500">{utcTime}</span>
        </div>
      </header>

      {/* CORE CONTENT LAYOUT */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUMN 1: Active Interactive Player (6 cols) */}
        <section className="md:col-span-6 flex flex-col h-full">
          <TapeDeckPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrev={handlePrev}
            shuffle={shuffle}
            onToggleShuffle={() => setShuffle(!shuffle)}
            repeatMode={repeatMode}
            onToggleRepeat={() => {
              const modes: ('NONE' | 'ONE' | 'ALL')[] = ['NONE', 'ONE', 'ALL'];
              const currentIdx = modes.indexOf(repeatMode);
              setRepeatMode(modes[(currentIdx + 1) % modes.length]);
            }}
            playbackSpeed={playbackSpeed}
            onSpeedChange={handleSpeedChange}
            activeVisualizer={activeVisualizer}
            onVisualizerChange={setActiveVisualizer}
            theme={theme}
            queue={queue}
            onSelectTrack={handleSelectTrack}
            disableSystemNotification={disableSystemNotification}
            onToggleSystemNotification={() => setDisableSystemNotification(!disableSystemNotification)}
          />
        </section>

        {/* COLUMN 2: Playlist & Local Folder Picker (6 cols) */}
        <section className="md:col-span-6 flex flex-col h-full">
          <Library
            tracks={tracks}
            queue={queue}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onSelectTrack={handleSelectTrack}
            onUploadTracks={handleUploadTracks}
            onDeleteTrack={handleDeleteTrack}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>

      </main>

      {/* CLEAN FOOTER */}
      <footer className={`relative z-10 border-t py-4 px-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono gap-2 transition-all duration-300 ${pageClasses.footer}`}>
        <div className="flex items-center space-x-1.5 text-zinc-500">
          <Cpu className="w-3.5 h-3.5 text-zinc-600" />
          <span>Local Engine • WebAudio Integration Active</span>
        </div>
        <div className="flex items-center space-x-4 text-zinc-500">
          <span>Copyright © 2026 TapeDeck</span>
          <span>Crafted for Offline Fidelity</span>
        </div>
      </footer>
    </div>
  );
}
