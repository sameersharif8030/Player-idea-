import React, { useEffect, useState, useRef } from 'react';
import { Track, VisualizerStyle, ThemeType } from '../types';
import { audioService } from '../synthwaveEngine';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, RotateCw, 
  Gauge, Moon, Volume2, Sparkles, Disc, Music
} from 'lucide-react';
import Visualizer from './Visualizer';

interface TapeDeckPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: 'NONE' | 'ONE' | 'ALL';
  onToggleRepeat: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  activeVisualizer: VisualizerStyle;
  onVisualizerChange: (style: VisualizerStyle) => void;
  theme?: ThemeType;
}

export default function TapeDeckPlayer({
  currentTrack,
  isPlaying,
  currentTime,
  onPlayPause,
  onNext,
  onPrev,
  shuffle,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  playbackSpeed,
  onSpeedChange,
  activeVisualizer,
  onVisualizerChange,
  theme = 'DARK'
}: TapeDeckPlayerProps) {
  const [volume, setVolume] = useState(0.5);
  const [isSleepTimerActive, setIsSleepTimerActive] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  // Time formatting helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Sleep Timer logic
  useEffect(() => {
    let interval: any = null;
    if (isSleepTimerActive && sleepMinutes > 0) {
      interval = setInterval(() => {
        setSleepMinutes(prev => {
          if (prev <= 1) {
            audioService.pause();
            setIsSleepTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isSleepTimerActive, sleepMinutes]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    audioService.setVolume(v);
  };

  const handleSetSleepTimer = (mins: number) => {
    setSleepMinutes(mins);
    setIsSleepTimerActive(mins > 0);
    setShowSleepMenu(false);
  };

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentTrack) return;
    const seekTime = parseFloat(e.target.value);
    audioService.seek(seekTime);
  };

  const percentComplete = currentTrack 
    ? (currentTime / currentTrack.duration) * 100 
    : 0;

  const visualizers: { id: VisualizerStyle; label: string }[] = [
    { id: 'NEON_BARS', label: 'Bars' },
    { id: 'OSCILLOSCOPE', label: 'Scope' },
    { id: 'ORBIT_RING', label: 'Orbit' },
    { id: 'STARBURST', label: 'Burst' },
    { id: 'DANCING_PARTICLES', label: 'Particles' }
  ];

  // Theme-Specific Styles
  const getThemeClasses = () => {
    switch (theme) {
      case 'LIGHT':
        return {
          container: 'bg-stone-50 border-stone-200 shadow-stone-200/50 text-stone-900',
          labelSub: 'text-violet-600',
          trackTitle: 'text-stone-900',
          trackArtist: 'text-stone-600',
          timeText: 'text-stone-500',
          controlsText: 'text-stone-600',
          speedBtnActive: 'bg-violet-600 text-white font-bold',
          speedBtnInactive: 'text-stone-400 hover:text-stone-700 hover:bg-stone-100',
          sleepBtnActive: 'bg-violet-100 border-violet-200 text-violet-700 font-bold',
          sleepBtnInactive: 'bg-stone-100 border-stone-300 text-stone-600 hover:border-stone-400',
          shuffleBtnActive: 'bg-violet-100 border-violet-300 text-violet-600',
          shuffleBtnInactive: 'bg-stone-100 border-stone-300 text-stone-500 hover:text-stone-700',
          prevNextBtn: 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-600 hover:text-stone-900',
          playBtn: 'from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-violet-600/20',
          repeatBtnActive: 'bg-violet-100 border-violet-300 text-violet-600',
          repeatBtnInactive: 'bg-stone-100 border-stone-300 text-stone-500 hover:text-stone-700',
          chipBarBg: 'bg-stone-100 border-stone-200',
          chipActive: 'bg-violet-600 text-white shadow-sm',
          chipInactive: 'text-stone-500 hover:text-stone-900'
        };
      case 'HACKER':
        return {
          container: 'bg-black border-green-950 text-green-400 font-mono shadow-[0_0_20px_rgba(34,197,94,0.05)]',
          labelSub: 'text-green-500 uppercase tracking-widest font-bold',
          trackTitle: 'text-green-400 font-bold tracking-tight',
          trackArtist: 'text-green-600',
          timeText: 'text-green-600',
          controlsText: 'text-green-500',
          speedBtnActive: 'bg-green-600 text-black font-extrabold',
          speedBtnInactive: 'text-green-700 hover:text-green-400 hover:bg-green-950/20',
          sleepBtnActive: 'bg-green-950/80 border border-green-500/30 text-green-300 font-bold',
          sleepBtnInactive: 'bg-black border border-green-900/50 text-green-700 hover:border-green-500',
          shuffleBtnActive: 'bg-green-950 border border-green-500/50 text-green-400',
          shuffleBtnInactive: 'bg-black border border-green-900/50 text-green-700 hover:text-green-400',
          prevNextBtn: 'bg-black hover:bg-green-950/40 border-green-900/50 text-green-500 hover:text-green-300',
          playBtn: 'from-green-600 to-green-500 text-black font-bold shadow-[0_0_15px_rgba(34,197,94,0.2)]',
          repeatBtnActive: 'bg-green-950 border border-green-500/50 text-green-400',
          repeatBtnInactive: 'bg-black border border-green-900/50 text-green-700 hover:text-green-400',
          chipBarBg: 'bg-black border border-green-950/80',
          chipActive: 'bg-green-600 text-black font-extrabold',
          chipInactive: 'text-green-700 hover:text-green-400'
        };
      case 'SUNSET':
        return {
          container: 'bg-zinc-950 border-orange-950 text-orange-200 shadow-[0_0_25px_rgba(249,115,22,0.02)]',
          labelSub: 'text-amber-500 uppercase font-extrabold tracking-widest',
          trackTitle: 'text-amber-100 font-black',
          trackArtist: 'text-orange-400',
          timeText: 'text-orange-600',
          controlsText: 'text-orange-500',
          speedBtnActive: 'bg-orange-600 text-white font-bold',
          speedBtnInactive: 'text-orange-700 hover:text-orange-400 hover:bg-orange-950/20',
          sleepBtnActive: 'bg-orange-950/60 border border-orange-500/30 text-orange-300 font-bold',
          sleepBtnInactive: 'bg-zinc-900 border border-orange-950 text-orange-600 hover:border-orange-800',
          shuffleBtnActive: 'bg-orange-600/20 border-orange-500/30 text-orange-400',
          shuffleBtnInactive: 'bg-zinc-900 border border-orange-950 text-orange-600 hover:text-orange-400',
          prevNextBtn: 'bg-zinc-900 hover:bg-orange-950/30 border-orange-950 text-orange-500 hover:text-orange-300',
          playBtn: 'from-orange-500 to-rose-600 text-white shadow-lg hover:shadow-orange-500/20',
          repeatBtnActive: 'bg-orange-600/20 border-orange-500/30 text-orange-400',
          repeatBtnInactive: 'bg-zinc-900 border border-orange-950 text-orange-600 hover:text-orange-400',
          chipBarBg: 'bg-zinc-900 border border-orange-950',
          chipActive: 'bg-orange-600 text-white font-bold',
          chipInactive: 'text-orange-600 hover:text-orange-300'
        };
      case 'HATSUNE_MIKU':
        return {
          container: 'bg-zinc-950 border-[#39C5BB]/40 text-[#39C5BB] shadow-[0_0_25px_rgba(57,197,187,0.1)]',
          labelSub: 'text-[#ff4081] font-extrabold uppercase tracking-widest',
          trackTitle: 'text-white font-bold tracking-tight',
          trackArtist: 'text-[#39C5BB] font-semibold',
          timeText: 'text-[#1c7e77]',
          controlsText: 'text-[#39C5BB]',
          speedBtnActive: 'bg-[#39c5bb] text-zinc-950 font-extrabold',
          speedBtnInactive: 'text-[#1c7e77] hover:text-[#39c5bb] hover:bg-[#39c5bb]/10',
          sleepBtnActive: 'bg-[#ff4081]/25 border border-[#ff4081]/40 text-[#ff4081] font-bold',
          sleepBtnInactive: 'bg-[#051417] border border-[#39C5BB]/20 text-[#1c7e77] hover:text-[#39c5bb]',
          shuffleBtnActive: 'bg-[#ff4081]/25 border border-[#ff4081]/30 text-[#ff4081]',
          shuffleBtnInactive: 'bg-[#051417] border border-[#39C5BB]/20 text-[#1c7e77] hover:text-[#39c5bb]',
          prevNextBtn: 'bg-[#051417] hover:bg-[#0f2a2e] border border-[#39C5BB]/20 text-[#39C5BB] hover:text-white',
          playBtn: 'from-[#39c5bb] to-[#ff4081] text-white shadow-lg hover:shadow-[#39c5bb]/25',
          repeatBtnActive: 'bg-[#ff4081]/25 border border-[#ff4081]/30 text-[#ff4081]',
          repeatBtnInactive: 'bg-[#051417] border border-[#39C5BB]/20 text-[#1c7e77] hover:text-[#39c5bb]',
          chipBarBg: 'bg-[#051417] border border-[#39C5BB]/20',
          chipActive: 'bg-[#39c5bb] text-zinc-950 font-extrabold',
          chipInactive: 'text-[#1c7e77] hover:text-[#39c5bb]'
        };
      case 'DARK':
      default:
        return {
          container: 'bg-zinc-950 border-zinc-900 text-zinc-100 shadow-xl',
          labelSub: 'text-pink-500 uppercase font-extrabold tracking-widest',
          trackTitle: 'text-white',
          trackArtist: 'text-zinc-400',
          timeText: 'text-zinc-500',
          controlsText: 'text-zinc-500',
          speedBtnActive: 'bg-pink-600 text-white font-bold',
          speedBtnInactive: 'text-zinc-500 hover:text-white hover:bg-zinc-900',
          sleepBtnActive: 'bg-purple-950 border border-purple-500/30 text-purple-300 font-bold',
          sleepBtnInactive: 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white',
          shuffleBtnActive: 'bg-pink-600/20 border-pink-500/30 text-pink-400',
          shuffleBtnInactive: 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300',
          prevNextBtn: 'bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white',
          playBtn: 'from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/10 hover:shadow-pink-500/25',
          repeatBtnActive: 'bg-pink-600/20 border-pink-500/30 text-pink-400',
          repeatBtnInactive: 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300',
          chipBarBg: 'bg-zinc-900 border border-zinc-850',
          chipActive: 'bg-pink-600 text-white shadow-sm',
          chipInactive: 'text-zinc-500 hover:text-zinc-300'
        };
    }
  };

  const classes = getThemeClasses();

  return (
    <div className={`${classes.container} border rounded-3xl p-6 shadow-2xl flex flex-col justify-between h-full transition-all duration-300 relative`}>
      {/* Glow Effects */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gradient-to-br ${currentTrack?.coverColor || 'from-pink-500 to-purple-600'} opacity-5 blur-[80px] pointer-events-none`} />

      {/* TOP HEADER */}
      <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/20 pb-4 mb-4">
        <div className="text-left min-w-0 flex-1 pr-4">
          <span className={`text-[9px] font-extrabold font-mono tracking-widest uppercase ${classes.labelSub}`}>
            {isPlaying ? 'Now Streaming' : 'Engine Ready'}
          </span>
          <h1 className={`text-lg font-black tracking-tight truncate mt-0.5 ${classes.trackTitle}`}>
            {currentTrack ? currentTrack.title : 'No Track Queued'}
          </h1>
          <p className="text-xs truncate font-mono mt-0.5">
            {currentTrack ? (
              <span className={classes.trackArtist}>{currentTrack.artist} — {currentTrack.album}</span>
            ) : (
              <span className="text-zinc-500">Pick a folder or file to begin</span>
            )}
          </p>
        </div>

        {/* Dynamic Spinning Music Note Indicator */}
        <div className="flex items-center space-x-1 shrink-0">
          <Disc className={`w-5 h-5 text-zinc-600/80 ${isPlaying ? 'animate-spin-slow text-pink-500' : ''}`} />
        </div>
      </div>

      {/* ALBUM ART WITH VINYL OVERLAY */}
      <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[300px] mx-auto rounded-3xl overflow-hidden shadow-2xl mb-6 bg-zinc-950 border border-zinc-900/60 group flex items-center justify-center p-4">
        {/* Dynamic ambient color flow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentTrack?.coverColor || 'from-pink-500 to-purple-600'} opacity-10`} />

        <div className="relative w-full h-full flex items-center justify-center">
          {/* Main Album Art Disk */}
          <div 
            className={`w-48 h-48 rounded-full bg-zinc-950 border-[6px] border-zinc-900/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center relative transition-transform duration-1000 ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '8s' }}
          >
            {/* Vinyl grooves */}
            <div className="absolute inset-2 border border-zinc-800/10 rounded-full" />
            <div className="absolute inset-4 border border-zinc-800/15 rounded-full" />
            <div className="absolute inset-7 border border-zinc-800/15 rounded-full" />
            <div className="absolute inset-10 border border-zinc-800/15 rounded-full" />
            
            {/* Center Sticker */}
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${currentTrack?.coverColor || 'from-pink-500 to-purple-600'} flex flex-col items-center justify-center relative border-4 border-zinc-950 shadow-inner`}>
              <div className="w-3 h-3 rounded-full bg-zinc-950" />
            </div>
          </div>

          {/* Fallback clean icon label in center */}
          {!currentTrack && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Music className="w-6 h-6 animate-pulse" />
              </div>
            </div>
          )}

          {/* Real-time spectrum analyzer visualizer overlaid on the bottom half of the album cover */}
          <div className="absolute bottom-0 left-0 right-0 h-[68px] bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent flex flex-col justify-end p-2.5">
            <div className="h-10 w-full overflow-hidden rounded-lg">
              <Visualizer style={activeVisualizer} isPlaying={isPlaying} theme={theme} />
            </div>
          </div>
        </div>
      </div>

      {/* SEEK PROGRESS BAR WITH INTERACTIVE RANGE SCRUBBING */}
      <div className="relative z-10 space-y-1 mb-4">
        <input 
          type="range"
          min="0"
          max={currentTrack ? currentTrack.duration : 100}
          value={currentTime}
          onChange={handleScrubChange}
          className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer focus:outline-none transition-all"
          style={{
            background: `linear-gradient(to right, ${theme === 'HACKER' ? '#22c55e' : theme === 'SUNSET' ? '#f97316' : theme === 'HATSUNE_MIKU' ? '#39c5bb' : '#ec4899'} 0%, ${theme === 'HACKER' ? '#22c55e' : theme === 'SUNSET' ? '#f97316' : theme === 'HATSUNE_MIKU' ? '#39c5bb' : '#ec4899'} ${percentComplete}%, #27272a ${percentComplete}%, #27272a 100%)`
          }}
        />
        <div className={`flex justify-between text-[10px] font-mono ${classes.timeText}`}>
          <span>{formatTime(currentTime)}</span>
          <span>{currentTrack ? formatTime(currentTrack.duration) : '0:00'}</span>
        </div>
      </div>

      {/* VOLUME SLIDER, SPEEDS, AND SLEEP TIMERS */}
      <div className="relative z-10 flex flex-wrap gap-4 items-center justify-between border-t border-b border-zinc-800/10 py-3 mb-4">
        
        {/* Volume controls */}
        <div className="flex items-center space-x-2 flex-1 min-w-[140px]">
          <Volume2 className="w-4 h-4 text-zinc-500 shrink-0" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500" 
          />
          <span className={`text-[10px] font-mono w-6 text-right ${classes.controlsText}`}>{Math.round(volume * 100)}%</span>
        </div>

        {/* Speed selectors */}
        <div className="flex items-center space-x-1.5">
          <Gauge className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <div className="flex bg-zinc-900 border border-zinc-800/30 p-0.5 rounded-lg">
            {[0.75, 1.0, 1.25].map(val => (
              <button
                key={val}
                onClick={() => onSpeedChange(val)}
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono cursor-pointer transition-all ${
                  playbackSpeed === val ? classes.speedBtnActive : classes.speedBtnInactive
                }`}
              >
                {val === 1.0 ? '1.0x' : `${val}x`}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep Timer button */}
        <div className="relative">
          <button
            onClick={() => setShowSleepMenu(!showSleepMenu)}
            className={`flex items-center space-x-1 py-1 px-2 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
              isSleepTimerActive ? classes.sleepBtnActive : classes.sleepBtnInactive
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>{isSleepTimerActive ? `${sleepMinutes}m` : 'Sleep'}</span>
          </button>

          {showSleepMenu && (
            <div className="absolute right-0 bottom-8 bg-zinc-950 border border-zinc-800 p-2 rounded-xl shadow-xl z-50 text-left w-36 space-y-1 font-mono text-[10px] text-zinc-200">
              <div className="text-zinc-500 p-1 font-bold uppercase tracking-wider text-[8px]">Set Timer</div>
              {[15, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => handleSetSleepTimer(mins)}
                  className="w-full text-left p-1.5 hover:bg-zinc-900 rounded text-zinc-300 hover:text-pink-400 transition-all cursor-pointer"
                >
                  {mins} Minutes
                </button>
              ))}
              {isSleepTimerActive && (
                <button
                  onClick={() => handleSetSleepTimer(0)}
                  className="w-full text-left p-1.5 bg-red-950/20 hover:bg-red-950/50 rounded text-red-400 transition-all cursor-pointer border border-red-900/20"
                >
                  Cancel Timer
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CORE CONTROLS (SHUFFLE, PREV, PLAY, NEXT, REPEAT) */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        {/* Shuffle Button */}
        <button 
          onClick={onToggleShuffle}
          className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
            shuffle ? classes.shuffleBtnActive : classes.shuffleBtnInactive
          }`}
          title="Shuffle Playlist"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Core Controls */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onPrev}
            className={`p-3 rounded-2xl active:scale-95 transition-all cursor-pointer shadow ${classes.prevNextBtn}`}
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button 
            onClick={onPlayPause}
            className={`p-4 bg-gradient-to-br text-white rounded-full active:scale-95 transition-all cursor-pointer shadow-lg hover:shadow-pink-500/20 ${classes.playBtn}`}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>

          <button 
            onClick={onNext}
            className={`p-3 rounded-2xl active:scale-95 transition-all cursor-pointer shadow ${classes.prevNextBtn}`}
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Repeat Mode Toggle */}
        <button 
          onClick={onToggleRepeat}
          className={`p-2.5 rounded-2xl border transition-all cursor-pointer relative ${
            repeatMode !== 'NONE' ? classes.repeatBtnActive : classes.repeatBtnInactive
          }`}
          title={`Repeat: ${repeatMode}`}
        >
          <RotateCw className="w-4 h-4" />
          {repeatMode === 'ONE' && <span className="absolute -top-1 -right-1 text-[7px] font-bold bg-pink-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center">1</span>}
          {repeatMode === 'ALL' && <span className="absolute -top-1 -right-1 text-[7px] font-bold bg-pink-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center">A</span>}
        </button>
      </div>

      {/* VISUALIZER CONTROLLER CHIPS */}
      <div className={`relative z-10 flex p-0.5 rounded-xl border overflow-x-auto text-[9px] font-mono scrollbar-none transition-all duration-300 ${classes.chipBarBg}`}>
        {visualizers.map(v => (
          <button
            key={v.id}
            onClick={() => onVisualizerChange(v.id)}
            className={`flex-1 py-1.5 px-1 rounded-lg text-center font-bold tracking-wider whitespace-nowrap transition-all cursor-pointer ${
              activeVisualizer === v.id ? classes.chipActive : classes.chipInactive
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
