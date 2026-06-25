import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface SammyDedicationProps {
  style: 'BLUR_MORPH' | 'ORBIT_TEXT' | 'FLASH_STAGGER';
  onComplete?: () => void;
  interactive?: boolean;
}

export default function SammyDedication({ style, onComplete, interactive = false }: SammyDedicationProps) {
  const [triggerKey, setTriggerKey] = useState(0);

  useEffect(() => {
    if (!interactive && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [style, triggerKey, interactive, onComplete]);

  const handleReplay = () => {
    setTriggerKey(prev => prev + 1);
  };

  const line1 = "For Sammy,";
  const line2 = "By Sammy.";

  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-zinc-950/85 border border-purple-500/20 rounded-2xl overflow-hidden backdrop-blur-md min-h-[220px]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1235_1px,transparent_1px),linear-gradient(to_bottom,#1f1235_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      <AnimatePresence mode="wait">
        <div key={triggerKey} className="relative z-10 flex flex-col items-center justify-center">
          
          {/* Style 1: Blur Morph */}
          {style === 'BLUR_MORPH' && (
            <div className="text-center space-y-3 py-6">
              <motion.h2 
                className="text-4xl md:text-5xl font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-sans"
                initial={{ filter: 'blur(16px)', opacity: 0, y: 15 }}
                animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                exit={{ filter: 'blur(12px)', opacity: 0 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
              >
                {line1}
              </motion.h2>
              <motion.h3 
                className="text-2xl md:text-3xl font-bold tracking-widest text-purple-300 font-mono"
                initial={{ filter: 'blur(12px)', opacity: 0, y: 10 }}
                animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                exit={{ filter: 'blur(12px)', opacity: 0 }}
                transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
              >
                {line2}
              </motion.h3>
              
              <motion.div
                className="w-16 h-0.5 mx-auto bg-gradient-to-r from-pink-500 to-purple-500"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.8 }}
              />
            </div>
          )}

          {/* Style 2: Orbit Text */}
          {style === 'ORBIT_TEXT' && (
            <div className="flex flex-col items-center justify-center py-4 relative w-64 h-64">
              {/* Spinning circular container */}
              <motion.div 
                className="absolute w-full h-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              >
                <svg className="w-56 h-56" viewBox="0 0 200 200">
                  <path 
                    id="circlePath" 
                    d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0" 
                    fill="none"
                  />
                  <text className="fill-purple-400/90 text-[10px] uppercase font-mono tracking-[4.5px]">
                    <textPath href="#circlePath" startOffset="0%">
                      ✨ FOR SAMMY • BY SAMMY • RETRO TAPEDECK • SYNTHWAVE •
                    </textPath>
                  </text>
                </svg>
              </motion.div>

              {/* Central Core cassette hub */}
              <motion.div 
                className="w-24 h-24 rounded-full border-4 border-dashed border-pink-500/60 bg-zinc-900 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                animate={{ scale: [1, 1.05, 1], rotate: -180 }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              >
                <div className="w-16 h-16 rounded-full border border-purple-500/40 bg-zinc-950 flex flex-col items-center justify-center">
                  <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
                  <span className="text-[8px] font-mono tracking-tighter text-zinc-400 mt-1">TAPEDECK</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Style 3: Flash Stagger */}
          {style === 'FLASH_STAGGER' && (
            <div className="text-center font-mono py-8 space-y-4">
              <div className="flex justify-center space-x-1.5 md:space-x-2">
                {line1.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    className="text-4xl md:text-5xl font-extrabold text-pink-500 text-glow-pink"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: [0, 0.4, 0.2, 1], 
                      scale: [0.8, 1.1, 0.9, 1] 
                    }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.08,
                      ease: 'easeInOut' 
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </div>

              <div className="flex justify-center space-x-1.5 md:space-x-2">
                {line2.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    className="text-3xl md:text-4xl font-bold text-purple-400 text-glow-purple"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: [0, 0.5, 0.1, 1], 
                      scale: [0.8, 1.1, 0.9, 1] 
                    }}
                    transition={{ 
                      duration: 0.4, 
                      delay: (line1.length * 0.08) + (index * 0.08),
                      ease: 'easeInOut' 
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </div>

              {/* Cyber cursor bar blink */}
              <motion.div 
                className="w-4 h-6 bg-purple-500 inline-block mt-2"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'steps(2)' }}
              />
            </div>
          )}

        </div>
      </AnimatePresence>

      {/* Manual Trigger Overlay for interactive testing */}
      {interactive && (
        <button
          onClick={handleReplay}
          className="absolute bottom-3 right-3 flex items-center space-x-1 bg-zinc-900 hover:bg-purple-900/30 text-zinc-400 hover:text-purple-300 text-xs py-1 px-2.5 rounded-lg border border-zinc-800 hover:border-purple-500/30 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Replay</span>
        </button>
      )}
    </div>
  );
}
