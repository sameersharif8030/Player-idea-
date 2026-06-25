import React, { useState } from 'react';
import { StealthModeSettings, VisualizerStyle, ThemeType } from '../types';
import { ANDROID_STEALTH_MODE_KOTLIN_CODE } from '../data';
import { 
  EyeOff, Eye, Palette, Sparkles, Code, Check, 
  ToggleLeft, ToggleRight, Info, Copy, Settings2
} from 'lucide-react';
import SammyDedication from './SammyDedication';

interface SettingsProps {
  settings: StealthModeSettings;
  setSettings: React.Dispatch<React.SetStateAction<StealthModeSettings>>;
  accentColor: string;
  setAccentColor: (color: string) => void;
  signatureStyle: 'BLUR_MORPH' | 'ORBIT_TEXT' | 'FLASH_STAGGER';
  setSignatureStyle: (style: 'BLUR_MORPH' | 'ORBIT_TEXT' | 'FLASH_STAGGER') => void;
  theme?: ThemeType;
  setTheme?: (theme: ThemeType) => void;
}

export default function Settings({
  settings,
  setSettings,
  accentColor,
  setAccentColor,
  signatureStyle,
  setSignatureStyle,
  theme = 'DARK',
  setTheme
}: SettingsProps) {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'CONTROLS' | 'KOTLIN'>('CONTROLS');

  const handleToggleMaster = () => {
    const nextState = !settings.enabled;
    setSettings(prev => ({
      ...prev,
      enabled: nextState,
      hideNotification: nextState,
      hideLockscreenPlayer: nextState,
      emptyMediaMetadata: nextState
    }));
  };

  const toggleSubSetting = (key: keyof StealthModeSettings) => {
    setSettings(prev => {
      const nextSettings = { ...prev, [key]: !prev[key] };
      // If all subsettings are disabled, toggle master off; if any are on, keep master on
      const isAnyOn = nextSettings.hideNotification || nextSettings.hideLockscreenPlayer || nextSettings.emptyMediaMetadata;
      return {
        ...nextSettings,
        enabled: isAnyOn
      };
    });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(ANDROID_STEALTH_MODE_KOTLIN_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const colorOptions = [
    { name: 'Sunset Pink', value: 'from-pink-500 to-purple-600', textClass: 'text-pink-500', bgClass: 'bg-pink-500' },
    { name: 'Cyber Cyan', value: 'from-cyan-400 to-blue-600', textClass: 'text-cyan-400', bgClass: 'bg-cyan-400' },
    { name: 'Laser Orange', value: 'from-orange-500 to-amber-600', textClass: 'text-orange-500', bgClass: 'bg-orange-500' },
    { name: 'Toxic Green', value: 'from-emerald-400 to-teal-600', textClass: 'text-emerald-400', bgClass: 'bg-emerald-400' }
  ];

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-md p-5 flex flex-col h-full">
      
      {/* Sub Tabs */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/60">
        <div className="flex items-center space-x-2">
          <Settings2 className="w-5 h-5 text-pink-500" />
          <h3 className="text-sm font-bold font-mono text-zinc-200 uppercase tracking-wider">TapeDeck Preferences</h3>
        </div>
        
        <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveSubTab('CONTROLS')}
            className={`px-3 py-1 text-xs font-mono rounded transition-all cursor-pointer ${activeSubTab === 'CONTROLS' ? 'bg-pink-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'}`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveSubTab('KOTLIN')}
            className={`px-3 py-1 text-xs font-mono rounded transition-all cursor-pointer ${activeSubTab === 'KOTLIN' ? 'bg-pink-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'}`}
          >
            Kotlin Code
          </button>
        </div>
      </div>

      {activeSubTab === 'CONTROLS' ? (
        <div className="space-y-6 overflow-y-auto max-h-[500px] pr-1.5 scrollbar-thin">
          
          {/* SECTION 1: Stealth Mode */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="text-xs font-bold font-mono text-pink-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Stealth Mode (Incognito Player)</span>
                </h4>
                <p className="text-xs text-zinc-400 pr-4 leading-normal">
                  Hides the playback card from the notification tray and lock screen to prevent visual tracking or onlookers while you stream local audio. Bluetooth earbuds controls remain fully functional.
                </p>
              </div>
              <button 
                onClick={handleToggleMaster}
                className="text-pink-500 hover:text-pink-400 active:scale-95 transition-all cursor-pointer"
              >
                {settings.enabled ? (
                  <ToggleRight className="w-11 h-11" />
                ) : (
                  <ToggleLeft className="w-11 h-11 text-zinc-600" />
                )}
              </button>
            </div>

            {/* Subsettings (indented when enabled) */}
            <div className="pt-2 border-t border-zinc-800/60 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-zinc-300">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  <span>Minimize Notification (IMPORTANCE_MIN)</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.hideNotification}
                  onChange={() => toggleSubSetting('hideNotification')}
                  className="w-4 h-4 text-pink-600 border-zinc-800 bg-zinc-900 rounded focus:ring-pink-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-zinc-300">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  <span>Secret Lockscreen (VISIBILITY_SECRET)</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.hideLockscreenPlayer}
                  onChange={() => toggleSubSetting('hideLockscreenPlayer')}
                  className="w-4 h-4 text-pink-600 border-zinc-800 bg-zinc-900 rounded focus:ring-pink-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-zinc-300">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  <span>Omit Published Track Metadata</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.emptyMediaMetadata}
                  onChange={() => toggleSubSetting('emptyMediaMetadata')}
                  className="w-4 h-4 text-pink-600 border-zinc-800 bg-zinc-900 rounded focus:ring-pink-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Complete Theme Engine (Sound Skins) */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-3 text-left">
            <h4 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-widest flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-pink-500" />
              <span>TapeDeck Themes (Sound Skins)</span>
            </h4>
            <p className="text-[10px] font-mono text-zinc-500 leading-normal">
              Toggle complete system styles including active backgrounds, grids, needles, neon tubes, and physical tape deck cosmetics.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: 'DARK', name: '🌌 Dark Slate' },
                { id: 'LIGHT', name: '☀️ Light Stone' },
                { id: 'HACKER', name: '📟 Hacker Term' },
                { id: 'SUNSET', name: '🌅 Sunset Glow' },
                { id: 'NEON_PUB', name: '🍻 Neon Club' },
                { id: 'HATSUNE_MIKU', name: '🎤 Miku 01' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme && setTheme(t.id as ThemeType)}
                  className={`flex items-center justify-between p-2 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                    theme === t.id 
                      ? 'bg-zinc-900 border-pink-500 text-white shadow-md shadow-pink-500/5 font-extrabold ring-1 ring-pink-500/30' 
                      : 'bg-zinc-950 border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <span>{t.name}</span>
                  {theme === t.id && <Check className="w-3.5 h-3.5 text-pink-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: Sammy Dedication Styles */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 space-y-4">
            <h4 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-widest flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Dedication Splash Experience</span>
            </h4>
            
            <p className="text-xs text-zinc-400 leading-normal">
              Customize the custom loader effect displayed on startup, permission granting, or database library refreshes. Uses the signature stamp: <span className="text-pink-400">“For Sammy, By Sammy.”</span>
            </p>

            <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
              <button
                onClick={() => setSignatureStyle('BLUR_MORPH')}
                className={`flex-1 py-1 px-1.5 rounded text-[10px] font-mono transition-all cursor-pointer ${signatureStyle === 'BLUR_MORPH' ? 'bg-purple-900/40 text-purple-300 font-bold border border-purple-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Blur Morph
              </button>
              <button
                onClick={() => setSignatureStyle('ORBIT_TEXT')}
                className={`flex-1 py-1 px-1.5 rounded text-[10px] font-mono transition-all cursor-pointer ${signatureStyle === 'ORBIT_TEXT' ? 'bg-purple-900/40 text-purple-300 font-bold border border-purple-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Orbit Text
              </button>
              <button
                onClick={() => setSignatureStyle('FLASH_STAGGER')}
                className={`flex-1 py-1 px-1.5 rounded text-[10px] font-mono transition-all cursor-pointer ${signatureStyle === 'FLASH_STAGGER' ? 'bg-purple-900/40 text-purple-300 font-bold border border-purple-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Flash Stagger
              </button>
            </div>

            {/* Live Inline Preview */}
            <div className="pt-2">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2 text-left">Live Splash Preview</div>
              <SammyDedication style={signatureStyle} interactive={true} />
            </div>
          </div>

        </div>
      ) : (
        /* KOTLIN CODE BLOCK PANEL */
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between bg-zinc-950 px-3.5 py-2 border border-zinc-800 rounded-t-xl">
            <span className="text-[10px] font-mono text-purple-400">com.sammy.tapedeck / PlaybackService.kt</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-1.5 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <div className="flex-1 bg-zinc-950 p-4 border-x border-b border-zinc-800 rounded-b-xl overflow-y-auto max-h-[380px] text-left scrollbar-thin">
            <pre className="text-[10px] font-mono text-zinc-300 leading-relaxed overflow-x-auto select-text whitespace-pre">
              {ANDROID_STEALTH_MODE_KOTLIN_CODE}
            </pre>
          </div>
          <div className="mt-3 text-[11px] text-zinc-400 bg-purple-950/20 border border-purple-500/10 p-3 rounded-lg leading-normal text-left">
            💡 <strong>Android Production Note:</strong> Toggling the Android <code className="text-purple-300 font-mono bg-zinc-950 px-1 py-0.5 rounded">MediaSessionService</code>'s notification channel to <code className="text-purple-300 font-mono bg-zinc-950 px-1 py-0.5 rounded">IMPORTANCE_MIN</code> is the only way to hide foreground services without OS task killing.
          </div>
        </div>
      )}

    </div>
  );
}
