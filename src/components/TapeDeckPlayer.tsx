import React, { useEffect, useState, useRef } from 'react';
import { Track, VisualizerStyle, ThemeType } from '../types';
import { audioService } from '../synthwaveEngine';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, RotateCw, 
  Gauge, Moon, Volume2, RefreshCw
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
  const [vuLeft, setVuLeft] = useState(0);
  const [vuRight, setVuRight] = useState(0);
  const vuRequestRef = useRef<number | null>(null);

  // Time formatting helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Sleep Timer calculation
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

  // Hook up dynamic left/right VU needle sweeps connected to the Web Audio Analyser
  useEffect(() => {
    const analyser = audioService.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 0;
    const dataArray = new Uint8Array(bufferLength);

    const updateVU = () => {
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
        // Calculate average frequencies for left (low-mid) and right (mid-high) simulated stereo split
        const leftArr = Array.from(dataArray).slice(0, Math.floor(bufferLength / 2));
        const rightArr = Array.from(dataArray).slice(Math.floor(bufferLength / 2));

        const avgLeft = leftArr.length > 0 ? leftArr.reduce((a, b) => a + b, 0) / leftArr.length : 0;
        const avgRight = rightArr.length > 0 ? rightArr.reduce((a, b) => a + b, 0) / rightArr.length : 0;

        // Smooth bouncing with gravity
        setVuLeft(prev => prev * 0.4 + (avgLeft / 255) * 110 * 0.6);
        setVuRight(prev => prev * 0.4 + (avgRight / 255) * 110 * 0.6);
      } else if (isPlaying) {
        // Mock physical bouncing if audio service isn't active but playing
        setVuLeft(30 + Math.sin(Date.now() * 0.015) * 20 + Math.random() * 10);
        setVuRight(35 + Math.cos(Date.now() * 0.012) * 20 + Math.random() * 10);
      } else {
        // Return needles slowly to rest
        setVuLeft(prev => Math.max(0, prev * 0.8));
        setVuRight(prev => Math.max(0, prev * 0.8));
      }
      vuRequestRef.current = requestAnimationFrame(updateVU);
    };

    updateVU();

    return () => {
      if (vuRequestRef.current) {
        cancelAnimationFrame(vuRequestRef.current);
      }
    };
  }, [isPlaying]);

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

  const percentComplete = currentTrack 
    ? (currentTime / currentTrack.duration) * 100 
    : 0;

  // Visualizer selection swappable list (including our DANCING_PARTICLES!)
  const visualizers: { id: VisualizerStyle; label: string }[] = [
    { id: 'NEON_BARS', label: 'Neon Bars' },
    { id: 'OSCILLOSCOPE', label: 'Oscilloscope' },
    { id: 'ORBIT_RING', label: 'Orbit Ring' },
    { id: 'STARBURST', label: 'Starburst' },
    { id: 'DANCING_PARTICLES', label: 'Particles ✦' }
  ];

  // Retrieve Theme-Specific Tailored CSS Classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'LIGHT':
        return {
          container: 'bg-stone-50 border-stone-200 shadow-stone-200/50 text-stone-950',
          meshOpacity: 'opacity-5',
          labelSub: 'text-violet-600',
          trackTitle: 'text-stone-900',
          trackArtist: 'text-stone-600',
          cassetteBg: 'bg-stone-100 border-stone-300 shadow-stone-400/30',
          reelBorder: 'border-stone-300 bg-stone-50',
          reelCenter: 'bg-violet-600',
          screwClass: 'bg-stone-300 border-stone-400 text-stone-600',
          levelMeterBg: 'bg-stone-100 border-stone-300',
          levelMeterText: 'text-stone-600',
          levelMeterDbText: 'text-stone-500',
          levelMeterNeedle: 'bg-violet-600',
          scrubTrack: 'bg-stone-200 border-stone-300',
          scrubBar: 'bg-gradient-to-r from-violet-600 to-indigo-500',
          timeText: 'text-stone-500',
          controlsText: 'text-stone-600',
          speedBtnActive: 'bg-violet-600 text-white',
          speedBtnInactive: 'text-stone-400 hover:text-stone-700',
          sleepBtnActive: 'bg-violet-100 border-violet-200 text-violet-700',
          sleepBtnInactive: 'bg-stone-100 border-stone-300 text-stone-600 hover:border-stone-400',
          shuffleBtnActive: 'bg-violet-600/15 border-violet-500/30 text-violet-600',
          shuffleBtnInactive: 'bg-stone-100 border-stone-300 text-stone-500 hover:text-stone-700',
          prevNextBtn: 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-600 hover:text-stone-950',
          playBtn: 'from-violet-600 to-indigo-600 text-white hover:shadow-[0_0_15px_rgba(109,40,217,0.3)]',
          repeatBtnActive: 'bg-violet-600/15 border-violet-500/30 text-violet-600',
          repeatBtnInactive: 'bg-stone-100 border-stone-300 text-stone-500 hover:text-stone-700',
          chipBarBg: 'bg-stone-100 border-stone-300',
          chipActive: 'bg-violet-600 text-white',
          chipInactive: 'text-stone-500 hover:text-stone-800'
        };
      case 'HACKER':
        return {
          container: 'bg-black border-green-900/60 text-green-400 font-mono shadow-[0_0_15px_rgba(34,197,94,0.1)]',
          meshOpacity: 'opacity-10',
          labelSub: 'text-green-500 uppercase tracking-widest font-bold',
          trackTitle: 'text-green-400 font-mono font-bold tracking-tight',
          trackArtist: 'text-green-600 font-mono',
          cassetteBg: 'bg-black border-2 border-green-900/80 shadow-inner',
          reelBorder: 'border-green-900/60 bg-black',
          reelCenter: 'bg-green-500',
          screwClass: 'bg-green-950 border-green-900 text-green-500',
          levelMeterBg: 'bg-black border border-green-900/60',
          levelMeterText: 'text-green-600',
          levelMeterDbText: 'text-green-700',
          levelMeterNeedle: 'bg-green-500',
          scrubTrack: 'bg-black border border-green-950',
          scrubBar: 'bg-green-500',
          timeText: 'text-green-600',
          controlsText: 'text-green-500',
          speedBtnActive: 'bg-green-600 text-black font-extrabold',
          speedBtnInactive: 'text-green-700 hover:text-green-400',
          sleepBtnActive: 'bg-green-950/80 border border-green-500/30 text-green-300',
          sleepBtnInactive: 'bg-black border border-green-900/50 text-green-600 hover:border-green-500',
          shuffleBtnActive: 'bg-green-950 border border-green-500/50 text-green-400',
          shuffleBtnInactive: 'bg-black border border-green-900/50 text-green-700 hover:text-green-400',
          prevNextBtn: 'bg-black hover:bg-green-950/40 border-green-900/50 text-green-500 hover:text-green-300',
          playBtn: 'from-green-600 to-green-500 text-black hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]',
          repeatBtnActive: 'bg-green-950 border border-green-500/50 text-green-400',
          repeatBtnInactive: 'bg-black border border-green-900/50 text-green-700 hover:text-green-400',
          chipBarBg: 'bg-black border border-green-950',
          chipActive: 'bg-green-600 text-black font-bold',
          chipInactive: 'text-green-700 hover:text-green-400'
        };
      case 'SUNSET':
        return {
          container: 'bg-zinc-950 border-orange-950/80 text-orange-200',
          meshOpacity: 'opacity-25',
          labelSub: 'text-amber-500 uppercase font-extrabold tracking-widest',
          trackTitle: 'text-amber-100 font-sans font-black',
          trackArtist: 'text-orange-400 font-mono',
          cassetteBg: 'bg-orange-950/20 border-orange-900/60 shadow-black/90',
          reelBorder: 'border-orange-900/50 bg-zinc-950',
          reelCenter: 'bg-amber-500',
          screwClass: 'bg-orange-950 border-orange-900 text-orange-500',
          levelMeterBg: 'bg-orange-950/10 border-orange-900/40',
          levelMeterText: 'text-orange-500',
          levelMeterDbText: 'text-orange-700',
          levelMeterNeedle: 'bg-orange-500',
          scrubTrack: 'bg-zinc-950 border border-orange-950',
          scrubBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500',
          timeText: 'text-orange-600',
          controlsText: 'text-orange-500',
          speedBtnActive: 'bg-orange-600 text-white font-bold',
          speedBtnInactive: 'text-orange-700 hover:text-orange-400',
          sleepBtnActive: 'bg-orange-950/60 border border-orange-500/30 text-orange-300',
          sleepBtnInactive: 'bg-zinc-900 border border-orange-950 text-orange-600 hover:border-orange-800',
          shuffleBtnActive: 'bg-orange-600/15 border-orange-500/30 text-orange-400',
          shuffleBtnInactive: 'bg-zinc-900 border border-orange-950 text-orange-600 hover:text-orange-400',
          prevNextBtn: 'bg-zinc-900 hover:bg-orange-950/30 border-orange-950 text-orange-500 hover:text-orange-300',
          playBtn: 'from-orange-500 to-rose-600 text-white hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]',
          repeatBtnActive: 'bg-orange-600/15 border-orange-500/30 text-orange-400',
          repeatBtnInactive: 'bg-zinc-900 border border-orange-950 text-orange-600 hover:text-orange-400',
          chipBarBg: 'bg-zinc-900 border border-orange-950',
          chipActive: 'bg-orange-600 text-white font-bold',
          chipInactive: 'text-orange-600 hover:text-orange-300'
        };
      case 'NEON_PUB':
        return {
          container: 'bg-slate-950 border-pink-950 text-cyan-200',
          meshOpacity: 'opacity-15',
          labelSub: 'text-pink-500 uppercase tracking-widest font-extrabold',
          trackTitle: 'text-cyan-100 font-extrabold',
          trackArtist: 'text-pink-400 font-mono',
          cassetteBg: 'bg-indigo-950/20 border-cyan-900/60 shadow-lg',
          reelBorder: 'border-cyan-900/40 bg-indigo-950/65',
          reelCenter: 'bg-pink-500',
          screwClass: 'bg-slate-800 border-slate-700 text-zinc-500',
          levelMeterBg: 'bg-indigo-950/15 border border-pink-900/40',
          levelMeterText: 'text-cyan-500',
          levelMeterDbText: 'text-indigo-600',
          levelMeterNeedle: 'bg-pink-500',
          scrubTrack: 'bg-slate-950 border border-indigo-950',
          scrubBar: 'bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-pink-500',
          timeText: 'text-indigo-400',
          controlsText: 'text-cyan-500',
          speedBtnActive: 'bg-pink-600 text-white',
          speedBtnInactive: 'text-indigo-400 hover:text-cyan-300',
          sleepBtnActive: 'bg-pink-950/40 border border-pink-500/30 text-pink-300',
          sleepBtnInactive: 'bg-slate-900 border border-indigo-950 text-indigo-400 hover:border-cyan-900',
          shuffleBtnActive: 'bg-pink-600/15 border-pink-500/30 text-pink-400',
          shuffleBtnInactive: 'bg-slate-900 border border-indigo-950 text-indigo-400 hover:text-cyan-300',
          prevNextBtn: 'bg-slate-900 hover:bg-indigo-950/30 border border-indigo-950 text-cyan-400 hover:text-cyan-250',
          playBtn: 'from-pink-500 to-indigo-600 text-white hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]',
          repeatBtnActive: 'bg-pink-600/15 border-pink-500/30 text-pink-400',
          repeatBtnInactive: 'bg-slate-900 border border-indigo-950 text-indigo-400 hover:text-cyan-300',
          chipBarBg: 'bg-slate-900 border border-indigo-950',
          chipActive: 'bg-pink-600 text-white font-bold',
          chipInactive: 'text-indigo-400 hover:text-cyan-300'
        };
      case 'HATSUNE_MIKU':
        return {
          container: 'bg-zinc-950 border-[#39C5BB]/40 text-[#39C5BB] shadow-[0_0_25px_rgba(57,197,187,0.15)] font-mono',
          meshOpacity: 'opacity-20',
          labelSub: 'text-[#ff4081] font-extrabold uppercase tracking-widest',
          trackTitle: 'text-white font-bold tracking-tight',
          trackArtist: 'text-[#39C5BB] font-semibold',
          cassetteBg: 'bg-zinc-900/90 border-2 border-[#39C5BB]/60 shadow-[0_0_15px_rgba(57,197,187,0.08)]',
          reelBorder: 'border-[#39C5BB]/40 bg-[#0f2a2e]',
          reelCenter: 'bg-[#ff4081]',
          screwClass: 'bg-[#0f2a2e] border-[#39C5BB]/30 text-[#39C5BB]',
          levelMeterBg: 'bg-[#0a1e22] border border-[#39C5BB]/30',
          levelMeterText: 'text-[#39C5BB]',
          levelMeterDbText: 'text-[#0f444c]',
          levelMeterNeedle: 'bg-[#ff4081]',
          scrubTrack: 'bg-[#051417] border border-[#39C5BB]/20',
          scrubBar: 'bg-gradient-to-r from-[#39c5bb] via-[#00ffcc] to-[#ff4081]',
          timeText: 'text-[#1c7e77]',
          controlsText: 'text-[#39C5BB]',
          speedBtnActive: 'bg-[#39c5bb] text-zinc-950 font-extrabold',
          speedBtnInactive: 'text-[#1c7e77] hover:text-[#39c5bb]',
          sleepBtnActive: 'bg-[#ff4081]/25 border border-[#ff4081]/40 text-[#ff4081] animate-pulse',
          sleepBtnInactive: 'bg-[#051417] border border-[#39C5BB]/20 text-[#1c7e77] hover:text-[#39c5bb]',
          shuffleBtnActive: 'bg-[#ff4081]/25 border border-[#ff4081]/30 text-[#ff4081]',
          shuffleBtnInactive: 'bg-[#051417] border border-[#39C5BB]/20 text-[#1c7e77] hover:text-[#39c5bb]',
          prevNextBtn: 'bg-[#051417] hover:bg-[#0f2a2e] border border-[#39C5BB]/20 text-[#39C5BB] hover:text-white',
          playBtn: 'from-[#39c5bb] to-[#ff4081] text-white hover:shadow-[0_0_18px_rgba(57,197,187,0.35)]',
          repeatBtnActive: 'bg-[#ff4081]/25 border border-[#ff4081]/30 text-[#ff4081]',
          repeatBtnInactive: 'bg-[#051417] border border-[#39C5BB]/20 text-[#1c7e77] hover:text-[#39c5bb]',
          chipBarBg: 'bg-[#051417] border border-[#39C5BB]/20',
          chipActive: 'bg-[#39c5bb] text-zinc-950 font-bold',
          chipInactive: 'text-[#1c7e77] hover:text-[#39c5bb]'
        };
      case 'DARK':
      default:
        return {
          container: 'bg-zinc-950 border-zinc-800 text-zinc-100',
          meshOpacity: 'opacity-20',
          labelSub: 'text-pink-500 uppercase font-extrabold tracking-widest',
          trackTitle: 'text-white',
          trackArtist: 'text-zinc-400',
          cassetteBg: 'bg-zinc-900 border-2 border-zinc-800 shadow-lg shadow-black/80',
          reelBorder: 'border-zinc-800 bg-zinc-950',
          reelCenter: 'bg-pink-500',
          screwClass: 'bg-zinc-800 border-zinc-700 text-zinc-900',
          levelMeterBg: 'bg-zinc-900 border border-zinc-800/80',
          levelMeterText: 'text-zinc-500',
          levelMeterDbText: 'text-zinc-600',
          levelMeterNeedle: 'bg-pink-500',
          scrubTrack: 'bg-zinc-900 border border-zinc-800',
          scrubBar: 'bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400',
          timeText: 'text-zinc-500',
          controlsText: 'text-zinc-500',
          speedBtnActive: 'bg-pink-600 text-white',
          speedBtnInactive: 'text-zinc-500 hover:text-white',
          sleepBtnActive: 'bg-purple-900/40 border border-purple-500/30 text-purple-300',
          sleepBtnInactive: 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white',
          shuffleBtnActive: 'bg-pink-600/15 border-pink-500/30 text-pink-400',
          shuffleBtnInactive: 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300',
          prevNextBtn: 'bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white',
          playBtn: 'from-pink-500 to-rose-600 text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]',
          repeatBtnActive: 'bg-pink-600/15 border-pink-500/30 text-pink-400',
          repeatBtnInactive: 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300',
          chipBarBg: 'bg-zinc-900 border border-zinc-850',
          chipActive: 'bg-pink-600 text-white shadow',
          chipInactive: 'text-zinc-500 hover:text-zinc-300'
        };
    }
  };

  const classes = getThemeClasses();

  return (
    <div className={`${classes.container} border rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full transition-all duration-300`}>
      {/* Visual background deck mesh */}
      <div className={`absolute inset-0 bg-[radial-gradient(#1c0926_1px,transparent_1px)] [background-size:16px_16px] ${classes.meshOpacity} pointer-events-none`} />

      {/* TOP HEADER: Now Playing metadata */}
      <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/40 pb-4 mb-4">
        <div className="text-left min-w-0 flex-1 pr-4">
          <span className={`text-[9px] font-extrabold font-mono tracking-widest uppercase ${classes.labelSub}`}>
            {theme === 'HATSUNE_MIKU' ? 'Vocaloid Active' : 'Now Spinning'}
          </span>
          <h1 className={`text-lg font-black tracking-tight truncate ${classes.trackTitle}`}>
            {currentTrack ? currentTrack.title : 'Deck Empty'}
          </h1>
          <p className="text-xs truncate font-mono mt-0.5">
            {currentTrack ? (
              <span className={classes.trackArtist}>{currentTrack.artist} — {currentTrack.album}</span>
            ) : (
              <span className="text-zinc-500">Select a track in local list</span>
            )}
          </p>
        </div>

        {/* Tactile Screws */}
        <div className="flex space-x-1">
          <div className={`w-2.5 h-2.5 rounded-full shadow-inner flex items-center justify-center text-[5px] font-bold select-none border ${classes.screwClass}`}>+</div>
          <div className={`w-2.5 h-2.5 rounded-full shadow-inner flex items-center justify-center text-[5px] font-bold select-none border ${classes.screwClass}`}>+</div>
        </div>
      </div>

      {/* CASSETTE TAPE BODY CHASSIS */}
      <div className={`relative z-10 p-4 rounded-xl shadow-lg mb-5 flex flex-col justify-between aspect-[1.75/1] min-h-[220px] transition-all duration-300 ${classes.cassetteBg}`}>
        {/* Tape outer label graphic */}
        <div className="absolute top-2 left-6 right-6 h-4 bg-gradient-to-r from-[#39c5bb]/10 via-[#ff4081]/10 to-indigo-950/15 opacity-30 rounded border border-zinc-800/25 pointer-events-none" />

        {/* Custom Easter Eggs based on theme */}
        {theme === 'HATSUNE_MIKU' && (
          <div className="absolute top-1.5 left-6 bg-[#ff4081]/15 border border-[#ff4081]/40 px-1.5 py-0.5 rounded text-[7px] text-[#ff4081] font-bold tracking-widest uppercase pointer-events-none select-none">
            01 MIKU DIVA
          </div>
        )}
        {theme === 'HACKER' && (
          <div className="absolute top-1.5 left-6 bg-green-950 border border-green-800 px-1.5 py-0.5 rounded text-[7px] text-green-400 font-bold tracking-widest uppercase pointer-events-none select-none">
            SYS_ROOT_PLAY
          </div>
        )}

        {/* CASSETTE CORE: Dual Reels */}
        <div className="flex justify-between items-center px-10 py-5 flex-1 relative">
          
          {/* Reel LEFT */}
          <div className="relative flex flex-col items-center">
            <div 
              className={`w-20 h-20 rounded-full border-[6px] flex items-center justify-center relative shadow-md shadow-black/80 transition-all duration-300 ${classes.reelBorder} ${isPlaying ? 'animate-spin' : ''}`} 
              style={{ animationDuration: `${20 / playbackSpeed}s` }}
            >
              {/* Teeth */}
              <div className="absolute inset-0 border-4 border-dashed border-zinc-700/60 rounded-full scale-75" />
              <div className="w-8 h-8 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${classes.reelCenter}`} />
              </div>
            </div>
            <span className="text-[8px] font-mono text-zinc-500/60 mt-1 select-none">REEL-L</span>
          </div>

          {/* VIEWPORT WINDOW IN TAPE (Houses the actual visualizer) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-[84px] rounded-lg overflow-hidden shadow-inner flex flex-col justify-center bg-black/40 border border-zinc-800/30">
            {/* Visualizer output with injected Theme */}
            <Visualizer style={activeVisualizer} isPlaying={isPlaying} theme={theme} />
          </div>

          {/* Reel RIGHT */}
          <div className="relative flex flex-col items-center">
            <div 
              className={`w-20 h-20 rounded-full border-[6px] flex items-center justify-center relative shadow-md shadow-black/80 transition-all duration-300 ${classes.reelBorder} ${isPlaying ? 'animate-spin' : ''}`} 
              style={{ animationDuration: `${20 / playbackSpeed}s` }}
            >
              {/* Teeth */}
              <div className="absolute inset-0 border-4 border-dashed border-zinc-700/60 rounded-full scale-75" />
              <div className="w-8 h-8 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full transition-all duration-300 ${classes.reelCenter}`} />
              </div>
            </div>
            <span className="text-[8px] font-mono text-zinc-500/60 mt-1 select-none">REEL-R</span>
          </div>

        </div>

        {/* BOTTOM CASSETTE DETAILS */}
        <div className="flex justify-between items-center text-[7px] font-mono px-2 pt-1 border-t border-zinc-800/10 text-zinc-500">
          <span>{theme === 'HATSUNE_MIKU' ? 'MIKU DIGITAL COMPACT DECK' : theme === 'HACKER' ? 'MATRIX MAINFRAME V.2' : 'TDK-90 CR-02 CHROME TYPE'}</span>
          <div className="flex space-x-1 bg-black/40 px-2 py-0.5 rounded border border-zinc-800/20">
            <span className="text-[8px] text-zinc-400 font-bold font-mono">COUNTER: {formatTime(currentTime)}</span>
          </div>
          <span>{theme === 'HATSUNE_MIKU' ? 'MADE IN CRYS-01' : 'MADE IN JAPAN • SAMMY INC.'}</span>
        </div>
      </div>

      {/* METERS SECTION: Dual VU meters & Slider controls */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mb-4">
        
        {/* ANALOG VU METER LEFT */}
        <div className={`border p-2.5 rounded-xl text-center relative overflow-hidden h-[54px] flex flex-col justify-between transition-all duration-300 ${classes.levelMeterBg}`}>
          <div className="absolute inset-x-2 bottom-1 h-0.5 bg-black/25" />
          
          {/* Needle pivot */}
          <div 
            className={`absolute bottom-1 left-1/2 w-0.5 h-10 origin-bottom transition-transform duration-75 ${classes.levelMeterNeedle}`}
            style={{ transform: `translateX(-50%) rotate(${Math.min(45, Math.max(-45, vuLeft - 45))}deg)` }}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zinc-400" />

          <span className={`text-[7px] font-mono block uppercase tracking-widest ${classes.levelMeterText}`}>Level L (dB)</span>
          <div className={`flex justify-between text-[7px] font-mono px-3 select-none ${classes.levelMeterDbText}`}>
            <span>-20</span>
            <span>-10</span>
            <span>-3</span>
            <span>0</span>
            <span className="text-red-500 font-bold">+3</span>
          </div>
        </div>

        {/* ANALOG VU METER RIGHT */}
        <div className={`border p-2.5 rounded-xl text-center relative overflow-hidden h-[54px] flex flex-col justify-between transition-all duration-300 ${classes.levelMeterBg}`}>
          <div className="absolute inset-x-2 bottom-1 h-0.5 bg-black/25" />
          
          {/* Needle pivot */}
          <div 
            className={`absolute bottom-1 left-1/2 w-0.5 h-10 origin-bottom transition-transform duration-75 ${classes.levelMeterNeedle}`}
            style={{ transform: `translateX(-50%) rotate(${Math.min(45, Math.max(-45, vuRight - 45))}deg)` }}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-zinc-400" />

          <span className={`text-[7px] font-mono block uppercase tracking-widest ${classes.levelMeterText}`}>Level R (dB)</span>
          <div className={`flex justify-between text-[7px] font-mono px-3 select-none ${classes.levelMeterDbText}`}>
            <span>-20</span>
            <span>-10</span>
            <span>-3</span>
            <span>0</span>
            <span className="text-red-500 font-bold">+3</span>
          </div>
        </div>

      </div>

      {/* TRACKBAR SCRUBBER */}
      <div className="relative z-10 space-y-1 mb-4">
        <div className={`w-full h-1.5 rounded-full overflow-hidden relative border transition-all duration-300 ${classes.scrubTrack}`}>
          <div className={`h-full rounded-full transition-all duration-300 ${classes.scrubBar}`} style={{ width: `${percentComplete}%` }} />
        </div>
        <div className={`flex justify-between text-[10px] font-mono ${classes.timeText}`}>
          <span>{formatTime(currentTime)}</span>
          <span>{currentTrack ? formatTime(currentTrack.duration) : '0:00'}</span>
        </div>
      </div>

      {/* VOLUMES, SPEED & SLEEP CONTROLS */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center mb-5 border-t border-b border-zinc-800/10 py-3.5">
        
        {/* Volume slider */}
        <div className="md:col-span-5 flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-zinc-400 shrink-0" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className={`w-full h-1 bg-black/20 hover:bg-black/40 rounded-lg appearance-none cursor-pointer accent-pink-500`} 
          />
          <span className={`text-[10px] font-mono w-6 text-right ${classes.controlsText}`}>{Math.round(volume * 100)}%</span>
        </div>

        {/* Speed presets */}
        <div className="md:col-span-4 flex items-center justify-end space-x-2 text-xs font-mono">
          <Gauge className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <div className="flex bg-black/10 border border-zinc-800/10 p-0.5 rounded-lg">
            {[0.75, 1.0, 1.25].map(val => (
              <button
                key={val}
                onClick={() => onSpeedChange(val)}
                className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-all ${
                  playbackSpeed === val ? classes.speedBtnActive : classes.speedBtnInactive
                }`}
              >
                {val === 1.0 ? '1.0x' : `${val}x`}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep Timer */}
        <div className="md:col-span-3 flex justify-end relative">
          <button
            onClick={() => setShowSleepMenu(!showSleepMenu)}
            className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
              isSleepTimerActive ? classes.sleepBtnActive : classes.sleepBtnInactive
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>{isSleepTimerActive ? `${sleepMinutes}m` : 'Sleep Timer'}</span>
          </button>

          {/* Sleep Timer popover */}
          {showSleepMenu && (
            <div className="absolute right-0 bottom-7 bg-zinc-950 border border-zinc-800/80 p-2 rounded-xl shadow-xl z-50 text-left w-36 space-y-1 font-mono text-[10px] text-zinc-200">
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
                  className="w-full text-left p-1.5 hover:bg-red-950 rounded text-red-400 transition-all cursor-pointer"
                >
                  Cancel Timer
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* CORE ACTION DECK BUTTONS */}
      <div className="relative z-10 flex items-center justify-between">
        
        {/* Shuffle */}
        <button 
          onClick={onToggleShuffle}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            shuffle ? classes.shuffleBtnActive : classes.shuffleBtnInactive
          }`}
          title="Shuffle Queue"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Prev / Play / Next controls */}
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={onPrev}
            className={`p-3 rounded-xl active:scale-95 transition-all cursor-pointer shadow-md ${classes.prevNextBtn}`}
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button 
            onClick={onPlayPause}
            className={`p-4 bg-gradient-to-br text-white rounded-full active:scale-95 transition-all cursor-pointer shadow-lg ${classes.playBtn}`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          <button 
            onClick={onNext}
            className={`p-3 rounded-xl active:scale-95 transition-all cursor-pointer shadow-md ${classes.prevNextBtn}`}
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Repeat Toggle */}
        <button 
          onClick={onToggleRepeat}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            repeatMode !== 'NONE' ? classes.repeatBtnActive : classes.repeatBtnInactive
          }`}
          title={`Repeat: ${repeatMode}`}
        >
          <div className="relative">
            <RotateCw className="w-4 h-4" />
            {repeatMode === 'ONE' && <span className="absolute -top-1.5 -right-1.5 text-[8px] font-extrabold bg-pink-500 text-white w-3 h-3 rounded-full flex items-center justify-center">1</span>}
            {repeatMode === 'ALL' && <span className="absolute -top-1.5 -right-1.5 text-[8px] font-extrabold bg-pink-500 text-white w-3 h-3 rounded-full flex items-center justify-center">A</span>}
          </div>
        </button>

      </div>

      {/* SWAPPABLE VISUALIZER BAR CHIPS */}
      <div className={`relative z-10 flex p-0.5 rounded-xl border mt-4 overflow-x-auto text-[9px] font-mono scrollbar-none transition-all duration-300 ${classes.chipBarBg}`}>
        {visualizers.map(v => (
          <button
            key={v.id}
            onClick={() => onVisualizerChange(v.id)}
            className={`flex-1 py-1.5 px-1.5 rounded-lg text-center font-bold tracking-widest whitespace-nowrap transition-all cursor-pointer ${
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
