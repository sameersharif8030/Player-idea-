import React, { useState, useEffect, useRef } from 'react';
import { Track, StealthModeSettings, VisualizerStyle, ThemeType } from './types';
import { PRELOADED_TRACKS } from './data';
import { audioService } from './synthwaveEngine';

import TapeDeckPlayer from './components/TapeDeckPlayer';
import Library from './components/Library';
import AndroidSimulator from './components/AndroidSimulator';
import Settings from './components/Settings';
import SammyDedication from './components/SammyDedication';

import { 
  Headphones, Settings2, Smartphone, Sparkles, Cpu, Clock, 
  Music, HelpCircle, EyeOff, Info, RefreshCw, Palette
} from 'lucide-react';

export default function App() {
  // Setup local data and state persistence
  const [tracks, setTracks] = useState<Track[]>(PRELOADED_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(PRELOADED_TRACKS[0]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  
  // Playback States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'NONE' | 'ONE' | 'ALL'>('ALL');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [activeVisualizer, setActiveVisualizer] = useState<VisualizerStyle>('NEON_BARS');
  const [theme, setTheme] = useState<ThemeType>('DARK');
  
  // Customization States
  const [accentColor, setAccentColor] = useState('from-pink-500 to-purple-600');
  const [signatureStyle, setSignatureStyle] = useState<'BLUR_MORPH' | 'ORBIT_TEXT' | 'FLASH_STAGGER'>('BLUR_MORPH');
  const [sidebarTab, setSidebarTab] = useState<'SIMULATOR' | 'SETTINGS'>('SIMULATOR');
  
  // Onboarding Splash state
  const [showSplash, setShowSplash] = useState(true);

  // Stealth Settings State
  const [stealthSettings, setStealthSettings] = useState<StealthModeSettings>({
    enabled: false,
    hideNotification: false,
    hideLockscreenPlayer: false,
    emptyMediaMetadata: false,
    keepBluetoothActive: true
  });

  // UTC Clock
  const [utcTime, setUtcTime] = useState('');

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hook up audio time updates from synthwave engine
  useEffect(() => {
    audioService.registerTimeCallback((time) => {
      setCurrentTime(time);
      
      // Auto-advance track on finish
      if (currentTrack && time >= currentTrack.duration - 0.2) {
        handleTrackEnded();
      }
    });
  }, [tracks, currentTrack, shuffle, repeatMode]);

  // Sync real Web Media Session metadata (proving physical Bluetooth and Lockscreen controls)
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (currentTrack) {
      if (stealthSettings.enabled && stealthSettings.emptyMediaMetadata) {
        // Stealth Active: wipe all track data published to the OS / browser status tray
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'Anonymous Stream',
          artist: 'TapeDeck Incognito',
          album: 'Local Player',
          artwork: []
        });
      } else {
        // Normal Mode: publish full metadata to bluetooth devices & lockscreen
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
      }
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [currentTrack, isPlaying, stealthSettings]);

  // Bind OS/Bluetooth Key Events to standard playback controls
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const handlePlayAction = () => {
      audioService.resume();
      setIsPlaying(true);
    };

    const handlePauseAction = () => {
      audioService.pause();
      setIsPlaying(false);
    };

    navigator.mediaSession.setActionHandler('play', handlePlayAction);
    navigator.mediaSession.setActionHandler('pause', handlePauseAction);
    navigator.mediaSession.setActionHandler('nexttrack', handleNext);
    navigator.mediaSession.setActionHandler('previoustrack', handlePrev);

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
    };
  }, [tracks, currentTrack, shuffle, repeatMode]);

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
    
    let nextIndex = 0;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else if (currentTrack) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      nextIndex = (currentIndex + 1) % tracks.length;
    }

    handleSelectTrack(tracks[nextIndex]);
  };

  const handlePrev = () => {
    if (tracks.length === 0) return;

    let prevIndex = 0;
    if (shuffle) {
      prevIndex = Math.floor(Math.random() * tracks.length);
    } else if (currentTrack) {
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

  // Handle uploaded files parsing
  const handleUploadTracks = (files: FileList) => {
    const newTracks: Track[] = [];
    const newFilesMap = { ...uploadedFiles };

    Array.from(files).forEach((file) => {
      const id = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Clean filename into title and artist
      const cleanName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
      const parts = cleanName.split(" - ");
      const title = parts.length > 1 ? parts[1] : parts[0];
      const artist = parts.length > 1 ? parts[0] : "Local Source";

      // Mock random synthwave-themed cover colors
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
        duration: 210, // Simulated duration for local files (actual play handles live time domain)
        coverColor,
        folder: "Imported"
      });

      newFilesMap[id] = file;
    });

    setUploadedFiles(newFilesMap);
    setTracks(prev => [...prev, ...newTracks]);

    // Instantly queue and play the first imported track
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

  // Get theme-specific classes for the main page skeleton
  const getPageThemeClasses = () => {
    switch (theme) {
      case 'LIGHT':
        return {
          wrapper: 'bg-stone-100 text-stone-900 selection:bg-violet-250',
          gridGlow: 'absolute inset-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:24px_36px] opacity-60 pointer-events-none',
          glowNode: 'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-violet-400/5 rounded-full blur-[160px] pointer-events-none',
          header: 'border-b border-stone-200 bg-stone-50/80',
          brandText: 'from-violet-600 to-indigo-600',
          taglineBg: 'bg-stone-200/60 border-stone-300/60 text-stone-700',
          footer: 'border-t border-stone-200 bg-stone-50/40 text-stone-500',
          tabBarBg: 'bg-stone-200 border-stone-300 text-stone-600',
          tabBtnActive: 'bg-violet-600 text-white shadow-sm',
          tabBtnInactive: 'text-stone-500 hover:text-stone-800'
        };
      case 'HACKER':
        return {
          wrapper: 'bg-black text-green-400 font-mono selection:bg-green-950/80',
          gridGlow: 'absolute inset-0 bg-[linear-gradient(to_right,#052e16_1px,transparent_1px),linear-gradient(to_bottom,#052e16_1px,transparent_1px)] bg-[size:24px_36px] opacity-45 pointer-events-none',
          glowNode: 'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-green-900/10 rounded-full blur-[160px] pointer-events-none',
          header: 'border-b border-green-900/40 bg-black/85',
          brandText: 'from-green-500 to-green-300',
          taglineBg: 'bg-green-950/40 border-green-900/30 text-green-400',
          footer: 'border-t border-green-900/40 bg-black/90 text-green-600',
          tabBarBg: 'bg-black border border-green-900/50 text-green-600',
          tabBtnActive: 'bg-green-600 text-black font-extrabold shadow-sm',
          tabBtnInactive: 'text-green-700 hover:text-green-400'
        };
      case 'SUNSET':
        return {
          wrapper: 'bg-zinc-950 text-orange-200 selection:bg-orange-950/50',
          gridGlow: 'absolute inset-0 bg-[linear-gradient(to_right,#291505_1px,transparent_1px),linear-gradient(to_bottom,#291505_1px,transparent_1px)] bg-[size:24px_36px] opacity-40 pointer-events-none',
          glowNode: 'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-orange-900/10 rounded-full blur-[160px] pointer-events-none',
          header: 'border-b border-orange-950 bg-zinc-950/80',
          brandText: 'from-orange-500 to-amber-500',
          taglineBg: 'bg-orange-950/30 border-orange-900/25 text-orange-400',
          footer: 'border-t border-orange-950 bg-zinc-950/40 text-orange-600',
          tabBarBg: 'bg-zinc-900 border border-orange-950 text-orange-500',
          tabBtnActive: 'bg-orange-600 text-white font-bold shadow-sm',
          tabBtnInactive: 'text-orange-600 hover:text-orange-400'
        };
      case 'NEON_PUB':
        return {
          wrapper: 'bg-[#06040c] text-cyan-200 selection:bg-pink-950/50',
          gridGlow: 'absolute inset-0 bg-[linear-gradient(to_right,#250936_1px,transparent_1px),linear-gradient(to_bottom,#250936_1px,transparent_1px)] bg-[size:24px_36px] opacity-40 pointer-events-none',
          glowNode: 'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-pink-900/10 rounded-full blur-[160px] pointer-events-none',
          header: 'border-b border-indigo-950 bg-slate-950/80',
          brandText: 'from-cyan-400 to-pink-500',
          taglineBg: 'bg-indigo-950/40 border-pink-950/30 text-cyan-300',
          footer: 'border-t border-indigo-950 bg-slate-950/40 text-indigo-400',
          tabBarBg: 'bg-slate-900 border border-indigo-950 text-indigo-400',
          tabBtnActive: 'bg-pink-600 text-white font-bold shadow-sm',
          tabBtnInactive: 'text-indigo-400 hover:text-cyan-300'
        };
      case 'HATSUNE_MIKU':
        return {
          wrapper: 'bg-[#040b0e] text-[#39C5BB] font-mono selection:bg-[#ff4081]/30',
          gridGlow: 'absolute inset-0 bg-[linear-gradient(to_right,#0a2e33_1px,transparent_1px),linear-gradient(to_bottom,#0a2e33_1px,transparent_1px)] bg-[size:24px_36px] opacity-40 pointer-events-none',
          glowNode: 'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#39C5BB]/10 rounded-full blur-[160px] pointer-events-none',
          header: 'border-b border-[#39C5BB]/20 bg-[#040b0e]/85',
          brandText: 'from-[#39C5BB] to-[#ff4081]',
          taglineBg: 'bg-[#0a2e33]/50 border-[#39C5BB]/20 text-[#39C5BB]',
          footer: 'border-t border-[#39C5BB]/20 bg-[#040b0e]/90 text-[#1c7e77]',
          tabBarBg: 'bg-[#051417] border border-[#39C5BB]/20 text-[#1c7e77]',
          tabBtnActive: 'bg-[#39c5bb] text-zinc-950 font-extrabold shadow-sm',
          tabBtnInactive: 'text-[#1c7e77] hover:text-[#39c5bb]'
        };
      case 'DARK':
      default:
        return {
          wrapper: 'bg-zinc-950 text-zinc-100 selection:bg-pink-500/30',
          gridGlow: 'absolute inset-0 bg-[linear-gradient(to_right,#160b26_1px,transparent_1px),linear-gradient(to_bottom,#160b26_1px,transparent_1px)] bg-[size:24px_36px] opacity-40 pointer-events-none',
          glowNode: 'absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none',
          header: 'border-b border-zinc-900 bg-zinc-950/80',
          brandText: 'from-pink-500 to-rose-400',
          taglineBg: 'bg-zinc-900/60 border-zinc-800/60 text-zinc-400',
          footer: 'border-t border-zinc-900 bg-zinc-950/40 text-zinc-500',
          tabBarBg: 'bg-zinc-950 border border-zinc-900 text-zinc-500',
          tabBtnActive: 'bg-pink-600 text-white shadow-sm',
          tabBtnInactive: 'text-zinc-500 hover:text-zinc-300'
        };
    }
  };

  const pageClasses = getPageThemeClasses();

  return (
    <div className={`min-h-screen flex flex-col font-sans relative select-none overflow-x-hidden transition-all duration-300 ${pageClasses.wrapper}`}>
      
      {/* Background neon grid grids */}
      <div className={pageClasses.gridGlow} />
      
      {/* Neon purple top radial glow */}
      <div className={pageClasses.glowNode} />

      {/* FIRST LAUNCH INTRO DEDICATION OVERLAY */}
      {showSplash ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 p-6">
          <div className="max-w-md w-full space-y-6 text-center">
            
            {/* Display signature sequence inside overlay */}
            <SammyDedication style={signatureStyle} onComplete={() => setShowSplash(false)} />
            
            <p className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase animate-pulse">
              TapeDeck is spinning up local engines...
            </p>
            
            <button
              onClick={() => setShowSplash(false)}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] text-white text-xs font-mono font-bold uppercase rounded-xl border border-pink-400/20 active:scale-95 transition-all cursor-pointer"
            >
              Skip & Enter Player
            </button>
          </div>
        </div>
      ) : null}

      {/* CORE HEADER */}
      <header className={`relative z-10 border-b backdrop-blur-md px-6 py-3.5 flex items-center justify-between transition-all duration-300 ${pageClasses.header}`}>
        
        {/* Brand */}
        <div className="flex items-center space-x-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center relative">
            <Headphones className="w-4 h-4 text-pink-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-sm font-black font-mono uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${pageClasses.brandText}`}>
                TAPEDECK
              </h1>
              <span className="text-[8px] bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/20 text-purple-300 font-mono">V1.0 LOCAL</span>
            </div>
            <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Android Audio Sandbox & Sound-System</p>
          </div>
        </div>

        {/* Center Tagline: For Sammy, By Sammy */}
        <div className={`hidden md:flex items-center space-x-1.5 px-4 py-1.5 rounded-full border transition-all duration-300 ${pageClasses.taglineBg}`}>
          <Sparkles className="w-3 h-3 text-pink-500" />
          <span className="text-[10px] font-mono">
            For Sammy, <span className="text-pink-500 font-semibold">By Sammy.</span>
          </span>
        </div>

        {/* Right side Metadata & Help info */}
        <div className="flex items-center space-x-3 font-mono text-[10px] text-zinc-500">
          {/* Quick Theme Selector in Header */}
          <div className="flex items-center space-x-1 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 px-2 py-1 rounded-lg">
            <Palette className="w-3 h-3 text-pink-500" />
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeType)}
              className="bg-transparent text-zinc-300 border-none rounded text-[9px] font-mono py-0.5 px-1 focus:ring-0 cursor-pointer outline-none font-bold"
            >
              <option value="DARK" className="bg-zinc-900 text-zinc-200">🌌 Dark</option>
              <option value="LIGHT" className="bg-zinc-900 text-zinc-200">☀️ Light</option>
              <option value="HACKER" className="bg-zinc-900 text-zinc-200">📟 Hacker</option>
              <option value="SUNSET" className="bg-zinc-900 text-zinc-200">🌅 Sunset</option>
              <option value="NEON_PUB" className="bg-zinc-900 text-zinc-200">🍻 Neon Pub</option>
              <option value="HATSUNE_MIKU" className="bg-zinc-900 text-[#39C5BB]">🎤 Miku 01</option>
            </select>
          </div>
          
          <span className="hidden md:inline">{utcTime}</span>
          <button 
            onClick={() => setShowSplash(true)}
            className="flex items-center space-x-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Show signature startup animation"
          >
            <RefreshCw className="w-3 h-3 text-purple-400" />
            <span>Show Splash</span>
          </button>
        </div>

      </header>

      {/* DASHBOARD CONTENT CHASSIS */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1 (4 lg-cols): Interactive Cassette Deck & VU System */}
        <section className="lg:col-span-4 h-full" id="deck-section">
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
          />
        </section>

        {/* COLUMN 2 (4 lg-cols): Local Library Explorer */}
        <section className="lg:col-span-4 h-full" id="library-section">
          <Library
            tracks={tracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onSelectTrack={handleSelectTrack}
            onUploadTracks={handleUploadTracks}
            onDeleteTrack={handleDeleteTrack}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>

        {/* COLUMN 3 (4 lg-cols): Sidebar containing preferences AND the Android system frame */}
        <section className="lg:col-span-4 flex flex-col space-y-6 h-full" id="control-sidebar">
          
          {/* Quick tab switcher for settings vs simulator */}
          <div className={`flex p-1 rounded-xl border text-xs font-mono transition-all duration-300 ${pageClasses.tabBarBg}`}>
            <button
              onClick={() => setSidebarTab('SIMULATOR')}
              className={`flex-1 py-2 rounded-lg text-center font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                sidebarTab === 'SIMULATOR' ? pageClasses.tabBtnActive : pageClasses.tabBtnInactive
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Mock Phone</span>
            </button>
            <button
              onClick={() => setSidebarTab('SETTINGS')}
              className={`flex-1 py-2 rounded-lg text-center font-bold tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                sidebarTab === 'SETTINGS' ? pageClasses.tabBtnActive : pageClasses.tabBtnInactive
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Settings & Code</span>
            </button>
          </div>

          <div className="flex-1">
            {sidebarTab === 'SIMULATOR' ? (
              <AndroidSimulator
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                currentTime={currentTime}
                stealthSettings={stealthSettings}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            ) : (
              <Settings
                settings={stealthSettings}
                setSettings={setStealthSettings}
                accentColor={accentColor}
                setAccentColor={setAccentColor}
                signatureStyle={signatureStyle}
                setSignatureStyle={setSignatureStyle}
                theme={theme}
                setTheme={setTheme}
              />
            )}
          </div>

        </section>

      </main>

      {/* FOOTER credit bar */}
      <footer className={`relative z-10 border-t py-3.5 px-6 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono gap-2 transition-all duration-300 ${pageClasses.footer}`}>
        <div className="flex items-center space-x-1.5">
          <Cpu className="w-3.5 h-3.5 text-zinc-600" />
          <span>Local DSP Node online • WebAudio integration OK</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Copyright © 2026 Sammy</span>
          <span>Crafted for Offline Fidelity</span>
        </div>
      </footer>

    </div>
  );
}
