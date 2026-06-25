import React, { useState } from 'react';
import { Track, StealthModeSettings } from '../types';
import { 
  Play, Pause, SkipForward, SkipBack, EyeOff, Eye, 
  Smartphone, Lock, Bell, BellOff, Bluetooth, Headphones, 
  BatteryCharging, Wifi, Signal, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AndroidSimulatorProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  stealthSettings: StealthModeSettings;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function AndroidSimulator({
  currentTrack,
  isPlaying,
  currentTime,
  stealthSettings,
  onPlayPause,
  onNext,
  onPrev
}: AndroidSimulatorProps) {
  const [activeTab, setActiveTab] = useState<'LOCKSCREEN' | 'NOTIFICATIONS' | 'EARBUDS'>('LOCKSCREEN');
  const [isPhoneLocked, setIsPhoneLocked] = useState(true);

  // Formatting song time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const percentComplete = currentTrack 
    ? (currentTime / currentTrack.duration) * 100 
    : 0;

  return (
    <div className="flex flex-col h-full bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden p-5 backdrop-blur-md">
      
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-pink-500 animate-pulse" />
          <h3 className="text-sm font-bold font-mono text-zinc-200 uppercase tracking-wider">Android System Simulator</h3>
        </div>
        <span className="flex items-center space-x-1 bg-zinc-950 px-2.5 py-1 rounded-full text-[10px] font-mono text-pink-400 border border-pink-500/10">
          <Bluetooth className="w-3 h-3 text-blue-400" />
          <span>Active Connection</span>
        </span>
      </div>

      <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
        Test how TapeDeck's foreground service and <span className="text-purple-300 font-semibold">MediaSession API</span> behaves. Toggle Stealth Mode in settings, and watch the system lockscreen and notification drawer react.
      </p>

      {/* Simulator Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
        
        {/* LEFT: The Smartphone graphic */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative w-64 h-[440px] rounded-[36px] border-8 border-zinc-800 bg-zinc-950 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col">
            
            {/* Phone Camera Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-800 rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 ml-auto mr-4" />
            </div>

            {/* Simulated Android Status Bar */}
            <div className="relative z-20 px-5 pt-7 pb-1 flex justify-between items-center text-[9px] font-sans text-zinc-300 select-none bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center space-x-1.5 font-medium">
                <span>07:41</span>
                {stealthSettings.enabled && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center text-purple-400"
                    title="Stealth Mode active in status bar"
                  >
                    <EyeOff className="w-2.5 h-2.5" />
                  </motion.div>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <Headphones className="w-2.5 h-2.5 text-blue-400" />
                <Wifi className="w-2.5 h-2.5" />
                <Signal className="w-2.5 h-2.5" />
                <span className="text-[8px] font-bold">100%</span>
              </div>
            </div>

            {/* SCREEN CONTENT */}
            <div className="flex-1 relative overflow-hidden flex flex-col justify-between p-4 pb-6 bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(15, 12, 30, 0.9), rgba(5, 5, 15, 0.95))' }}>
              
              {/* Top half: Lock icon / Clock */}
              <div className="text-center mt-3 relative z-10">
                <div className="flex justify-center mb-1">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <h1 className="text-3xl font-extralight tracking-tight text-zinc-100">07:41</h1>
                <p className="text-[9px] text-zinc-400 tracking-widest uppercase mt-0.5">Thursday, June 25</p>
              </div>

              {/* CENTER: Tab Switcher inside phone */}
              <div className="flex-1 flex flex-col justify-center py-4 relative z-10">
                
                {/* CASE A: LOCKSCREEN VIEW */}
                {activeTab === 'LOCKSCREEN' && (
                  <div className="space-y-3">
                    <AnimatePresence mode="wait">
                      {!stealthSettings.enabled || !stealthSettings.hideLockscreenPlayer ? (
                        <motion.div
                          key="normal-player"
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -15, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-2xl shadow-lg"
                        >
                          {currentTrack ? (
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2.5">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentTrack.coverColor || 'from-pink-500 to-purple-600'} flex items-center justify-center text-[10px] font-bold text-white shadow`}>
                                  TD
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <h4 className="text-[11px] font-bold text-zinc-100 truncate">{currentTrack.title}</h4>
                                  <p className="text-[9px] text-zinc-400 truncate">{currentTrack.artist}</p>
                                </div>
                                <span className="text-[8px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-mono">Media</span>
                              </div>
                              
                              {/* Small Seek Line */}
                              <div className="space-y-0.5">
                                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-pink-500 rounded-full" style={{ width: `${percentComplete}%` }} />
                                </div>
                                <div className="flex justify-between text-[7px] text-zinc-500 font-mono">
                                  <span>{formatTime(currentTime)}</span>
                                  <span>{formatTime(currentTrack.duration)}</span>
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex justify-center items-center space-x-4 pt-1">
                                <button onClick={onPrev} className="text-zinc-400 hover:text-white p-1">
                                  <SkipBack className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={onPlayPause} className="w-7 h-7 bg-pink-600 rounded-full flex items-center justify-center text-white p-1">
                                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />}
                                </button>
                                <button onClick={onNext} className="text-zinc-400 hover:text-white p-1">
                                  <SkipForward className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[10px] text-zinc-500 text-center py-2">No audio playing</p>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="stealth-locked"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center p-4 bg-zinc-950/20 border border-zinc-800/10 rounded-2xl"
                        >
                          <EyeOff className="w-8 h-8 text-purple-500/40 mb-1.5 animate-pulse" />
                          <p className="text-[9px] font-mono text-zinc-500 text-center uppercase tracking-wider">Lockscreen Stealth Active</p>
                          <p className="text-[8px] text-zinc-600 text-center mt-1">Player widget fully omitted for privacy</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* CASE B: NOTIFICATION SHADE VIEW */}
                {activeTab === 'NOTIFICATIONS' && (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                    <div className="text-[8px] font-mono uppercase text-zinc-500 text-left px-1 mb-1 tracking-wider">System Notifications</div>
                    
                    <AnimatePresence mode="wait">
                      {!stealthSettings.enabled || !stealthSettings.hideNotification ? (
                        <motion.div
                          key="normal-notif"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="bg-zinc-900 border-l-2 border-pink-500 p-2.5 rounded-lg text-left"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] font-bold text-pink-400 flex items-center space-x-1">
                              <Bell className="w-2 h-2 mr-1" /> TapeDeck Player
                            </span>
                            <span className="text-[7px] text-zinc-500">Active Service</span>
                          </div>
                          {currentTrack ? (
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold text-zinc-200 truncate">{currentTrack.title}</p>
                                <p className="text-[8px] text-zinc-400 truncate">{currentTrack.artist}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button onClick={onPlayPause} className="p-1 bg-zinc-800 rounded hover:bg-zinc-700">
                                  {isPlaying ? <Pause className="w-2.5 h-2.5 text-zinc-300" /> : <Play className="w-2.5 h-2.5 text-zinc-300" />}
                                </button>
                                <button onClick={onNext} className="p-1 bg-zinc-800 rounded hover:bg-zinc-700">
                                  <SkipForward className="w-2.5 h-2.5 text-zinc-300" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[9px] text-zinc-500">No active track</p>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="stealth-notif"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-3 bg-zinc-950/40 border border-zinc-900/40 rounded-lg flex items-center justify-start space-x-2.5 text-left"
                        >
                          <BellOff className="w-5 h-5 text-purple-600/50" />
                          <div>
                            <span className="text-[8px] font-bold text-purple-400 flex items-center uppercase tracking-wide">Stealth Mode (IMPORTANCE_MIN)</span>
                            <p className="text-[8px] text-zinc-600 leading-tight mt-0.5">Background service hidden entirely from notification tray footprint.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Dummy System Notification */}
                    <div className="bg-zinc-900/40 border border-zinc-800/20 p-2 rounded-lg text-left opacity-40">
                      <div className="flex justify-between text-[7px] text-zinc-500 mb-0.5">
                        <span>Google System</span>
                        <span>10m ago</span>
                      </div>
                      <p className="text-[9px] text-zinc-300">System storage optimal</p>
                    </div>
                  </div>
                )}

                {/* CASE C: BLUETOOTH EARBUDS CONTROL */}
                {activeTab === 'EARBUDS' && (
                  <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl text-center space-y-3">
                    <div className="flex justify-center">
                      <Headphones className="w-8 h-8 text-blue-400 animate-pulse" />
                    </div>
                    <span className="text-[9px] font-mono text-blue-300 block uppercase tracking-widest">Bluetooth Earbuds Controller</span>
                    
                    <p className="text-[8px] text-zinc-400 leading-normal">
                      Press virtual earbuds controls below. Because TapeDeck keeps the `MediaButtonReceiver` registered, these operate playback flawlessly even during stealth.
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                      <button 
                        onClick={onPlayPause}
                        className="py-1 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/20 rounded text-[9px] font-mono text-zinc-300 active:scale-95 transition-all cursor-pointer"
                      >
                        Single Tap (Play/Pause)
                      </button>
                      <button 
                        onClick={onNext}
                        className="py-1 px-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500/20 rounded text-[9px] font-mono text-zinc-300 active:scale-95 transition-all cursor-pointer"
                      >
                        Double Tap (Skip Next)
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* BOTTOM: Android Navigation Gestures */}
              <div className="flex justify-center space-x-12 pt-3 border-t border-zinc-900/40 relative z-20">
                <div className="w-3 h-3 border border-zinc-500 rounded-sm opacity-50" />
                <div className="w-3.5 h-3.5 border border-zinc-500 rounded-full opacity-50" />
                <div className="w-3 h-3 border-b-2 border-l-2 border-zinc-500 transform rotate-45 translate-y-0.5 opacity-50" />
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT: Simulator Controls / Legend */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
          
          {/* Simulator Tabs */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest block">Select Simulated View</span>
            <div className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setActiveTab('LOCKSCREEN')}
                className={`py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${activeTab === 'LOCKSCREEN' ? 'bg-pink-600 text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              >
                Lockscreen
              </button>
              <button
                onClick={() => setActiveTab('NOTIFICATIONS')}
                className={`py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${activeTab === 'NOTIFICATIONS' ? 'bg-pink-600 text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('EARBUDS')}
                className={`py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${activeTab === 'EARBUDS' ? 'bg-pink-600 text-white font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
              >
                Earbuds
              </button>
            </div>
          </div>

          {/* Educational Legend depending on active tab & stealth settings */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 p-3.5 rounded-xl space-y-3 flex-1">
            <h4 className="text-xs font-bold font-mono text-zinc-300 flex items-center space-x-1">
              <span>Status Check:</span>
              {stealthSettings.enabled ? (
                <span className="text-purple-400 font-bold ml-1 uppercase text-[10px] tracking-wider">Stealth Engaged</span>
              ) : (
                <span className="text-pink-500 font-bold ml-1 uppercase text-[10px] tracking-wider">Normal Mode</span>
              )}
            </h4>

            {activeTab === 'LOCKSCREEN' && (
              <p className="text-xs text-zinc-400 leading-normal">
                {stealthSettings.enabled && stealthSettings.hideLockscreenPlayer ? (
                  <span className="text-purple-300 font-semibold">🔒 Secret Lockscreen:</span>
                ) : (
                  <span className="text-zinc-300 font-semibold">ℹ️ Standard Lockscreen:</span>
                )}{' '}
                {stealthSettings.enabled && stealthSettings.hideLockscreenPlayer 
                  ? "The media player widget is entirely omitted from your Android lock screen. No album titles, artists, or media action controls are drawn, making it completely private to onlookers while you walk, run, or travel."
                  : "Displays a full-width interactive media control bar allowing any lock screen user to skip tracks, see song details, and view current playback progress."}
              </p>
            )}

            {activeTab === 'NOTIFICATIONS' && (
              <p className="text-xs text-zinc-400 leading-normal">
                {stealthSettings.enabled && stealthSettings.hideNotification ? (
                  <span className="text-purple-300 font-semibold">🤫 Silent Low-Priority Shade:</span>
                ) : (
                  <span className="text-zinc-300 font-semibold">🔊 Standard Notification Card:</span>
                )}{' '}
                {stealthSettings.enabled && stealthSettings.hideNotification 
                  ? "Using Android Channel Importance MIN, TapeDeck minimizes its persistent tray footprint. No constant status icon is visible, keeping your status bar clean and private."
                  : "Keeps a prominent media notification in the status bar, standard for regular players but fully visible to anyone glancing at your unlocked screen."}
              </p>
            )}

            {activeTab === 'EARBUDS' && (
              <p className="text-xs text-zinc-400 leading-normal">
                <span className="text-blue-300 font-semibold">🎧 Bluetooth Earbud Integrity:</span>{' '}
                Even with all visual references hidden, our app is registered with Android's active <code className="text-[10px] bg-zinc-900 px-1 py-0.5 rounded text-zinc-300">MediaSession</code> system. This guarantees earbud buttons work perfectly to play/pause and skip!
              </p>
            )}

            {/* Simulated Bluetooth earbud buttons for hands-on control */}
            <div className="border-t border-zinc-800/80 pt-3 mt-2">
              <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest block mb-2">Simulated Earbud Hardware</span>
              <div className="flex space-x-2">
                <button 
                  onClick={onPrev}
                  className="flex-1 py-1 px-1.5 bg-zinc-900 hover:bg-blue-900/20 text-[9px] font-mono text-zinc-400 hover:text-blue-300 rounded border border-zinc-800 hover:border-blue-500/20 transition-all cursor-pointer"
                >
                  ⏮ Prev Track
                </button>
                <button 
                  onClick={onPlayPause}
                  className="flex-1 py-1 px-1.5 bg-zinc-900 hover:bg-blue-900/20 text-[9px] font-mono text-zinc-400 hover:text-blue-300 rounded border border-zinc-800 hover:border-blue-500/20 transition-all cursor-pointer"
                >
                  {isPlaying ? '⏸ Pause' : '▶️ Play'}
                </button>
                <button 
                  onClick={onNext}
                  className="flex-1 py-1 px-1.5 bg-zinc-900 hover:bg-blue-900/20 text-[9px] font-mono text-zinc-400 hover:text-blue-300 rounded border border-zinc-800 hover:border-blue-500/20 transition-all cursor-pointer"
                >
                  Next Track ⏭
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
