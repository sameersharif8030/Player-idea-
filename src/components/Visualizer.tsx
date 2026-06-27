import React, { useEffect, useRef } from 'react';
import { audioService } from '../synthwaveEngine';
import { VisualizerStyle, ThemeType } from '../types';

interface VisualizerProps {
  style: VisualizerStyle;
  isPlaying: boolean;
  theme?: ThemeType;
}

export default function Visualizer({ style, isPlaying, theme = 'DARK' }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseRadius: number;
    color: string;
    freqIndex: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Get real analyzer
    const analyser = audioService.getAnalyser();
    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    // Peak holds for Neon Bars
    const peaks = new Array(64).fill(0);
    const peakDecay = 0.5;

    let phase = 0; // For simulated wave motion

    // Initialize particles if they don't exist
    if (particlesRef.current.length === 0) {
      const colors = {
        DARK: ['#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e'],
        LIGHT: ['#8b5cf6', '#6366f1', '#ec4899', '#3b82f6'],
        HACKER: ['#22c55e', '#4ade80', '#15803d', '#86efac'],
        SUNSET: ['#ea580c', '#eab308', '#f43f5e', '#f97316'],
        NEON_PUB: ['#00f5ff', '#ff007f', '#d946ef', '#00ff66'],
        HATSUNE_MIKU: ['#39c5bb', '#ffffff', '#00e1d9', '#ff4081'],
      };

      const selectedColors = colors[theme] || colors.DARK;

      for (let i = 0; i < 30; i++) {
        particlesRef.current.push({
          x: Math.random() * 200 + 20,
          y: Math.random() * 100 + 20,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          baseRadius: Math.random() * 3 + 2,
          color: selectedColors[i % selectedColors.length],
          freqIndex: Math.floor(Math.pow(Math.random(), 1.5) * (bufferLength * 0.45)),
        });
      }
    }

    const draw = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      // Determine clear background based on theme
      let bgStyle = 'rgba(9, 9, 11, 0.25)'; // DARK
      if (theme === 'LIGHT') bgStyle = 'rgba(250, 250, 249, 0.25)';
      else if (theme === 'HACKER') bgStyle = 'rgba(0, 0, 0, 0.25)';
      else if (theme === 'SUNSET') bgStyle = 'rgba(12, 10, 9, 0.25)';
      else if (theme === 'NEON_PUB') bgStyle = 'rgba(6, 4, 12, 0.25)';
      else if (theme === 'HATSUNE_MIKU') bgStyle = 'rgba(4, 11, 14, 0.25)';

      // Clear with slight transparency for trails
      ctx.fillStyle = bgStyle;
      ctx.fillRect(0, 0, width, height);

      phase += 0.05;

      // Fetch audio data
      let hasRealData = false;
      if (analyser && isPlaying) {
        if (style === 'OSCILLOSCOPE') {
          analyser.getByteTimeDomainData(dataArray);
          // Check if data is not flat (all 128)
          let diffSum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            diffSum += Math.abs(dataArray[i] - 128);
          }
          if (diffSum > 10) {
            hasRealData = true;
          }
        } else {
          analyser.getByteFrequencyData(dataArray);
          // Check if data is not all 0
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          if (sum > 15) {
            hasRealData = true;
          }
        }
      }

      if (!hasRealData) {
        // Fallback procedural wave generator
        for (let i = 0; i < bufferLength; i++) {
          if (style === 'OSCILLOSCOPE') {
            dataArray[i] = 128 + Math.sin(i * 0.15 + phase) * 25 + Math.cos(i * 0.05 - phase * 1.5) * 10;
          } else {
            const factor = Math.sin(phase + i * 0.08) * 0.5 + 0.5;
            const envelope = Math.max(0, 1 - i / (bufferLength * 0.8));
            dataArray[i] = factor * 80 * envelope + 10;
          }
        }
      }

      // Theme Theme Palette Helpers
      const getThemeColor = (primary: string, secondary: string) => {
        if (theme === 'HACKER') return '#22c55e';
        if (theme === 'SUNSET') return '#f97316';
        if (theme === 'HATSUNE_MIKU') return '#39c5bb';
        if (theme === 'LIGHT') return '#8b5cf6';
        if (theme === 'NEON_PUB') return '#00f5ff';
        return primary; // Standard Neon Pink / Cyan Synthwave default
      };

      const getThemeShadow = () => {
        if (theme === 'HACKER') return '#16a34a';
        if (theme === 'SUNSET') return '#ea580c';
        if (theme === 'HATSUNE_MIKU') return '#39c5bb';
        if (theme === 'LIGHT') return '#6366f1';
        if (theme === 'NEON_PUB') return '#ff007f';
        return '#ec4899';
      };

      // 1. NEON_BARS
      if (style === 'NEON_BARS') {
        const barCount = Math.min(48, bufferLength);
        const barWidth = (width / barCount) - 3;
        
        for (let i = 0; i < barCount; i++) {
          const rawValue = dataArray[i];
          const percent = rawValue / 255;
          const barHeight = percent * height * 0.85;

          // Update peak
          if (barHeight > peaks[i]) {
            peaks[i] = barHeight;
          } else {
            peaks[i] = Math.max(0, peaks[i] - peakDecay);
          }

          const x = i * (barWidth + 3) + 1.5;
          const y = height - barHeight;

          // Create Theme-specific gradient
          const grad = ctx.createLinearGradient(0, height, 0, y - 10);
          if (theme === 'HACKER') {
            grad.addColorStop(0, '#14532d');
            grad.addColorStop(0.5, '#166534');
            grad.addColorStop(1, '#22c55e');
          } else if (theme === 'SUNSET') {
            grad.addColorStop(0, '#7c2d12');
            grad.addColorStop(0.4, '#ea580c');
            grad.addColorStop(1, '#facc15');
          } else if (theme === 'HATSUNE_MIKU') {
            grad.addColorStop(0, '#0f292f');
            grad.addColorStop(0.5, '#39c5bb');
            grad.addColorStop(1, '#ffffff');
          } else if (theme === 'LIGHT') {
            grad.addColorStop(0, '#312e81');
            grad.addColorStop(0.5, '#6366f1');
            grad.addColorStop(1, '#ec4899');
          } else if (theme === 'NEON_PUB') {
            grad.addColorStop(0, '#1e1b4b');
            grad.addColorStop(0.4, '#d946ef');
            grad.addColorStop(1, '#00f5ff');
          } else { // DARK / DEFAULT
            grad.addColorStop(0, '#312e81');
            grad.addColorStop(0.3, '#8b5cf6');
            grad.addColorStop(0.7, '#ec4899');
            grad.addColorStop(1, '#f43f5e');
          }

          ctx.fillStyle = grad;
          
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
          } else {
            ctx.rect(x, y, barWidth, barHeight);
          }
          ctx.fill();

          // Peak dot
          const peakShadow = getThemeShadow();
          ctx.shadowColor = peakShadow;
          ctx.shadowBlur = 8;
          ctx.fillStyle = theme === 'HACKER' ? '#86efac' : theme === 'HATSUNE_MIKU' ? '#ffffff' : '#fda4af';
          ctx.fillRect(x, Math.max(0, height - peaks[i] - 4), barWidth, 2.5);
          ctx.shadowBlur = 0; // reset
        }
      }

      // 2. OSCILLOSCOPE
      else if (style === 'OSCILLOSCOPE') {
        ctx.lineWidth = 2.5;
        const strokeColor = getThemeColor('#06b6d4', '#8b5cf6');
        const shadowColor = getThemeShadow();
        
        ctx.strokeStyle = strokeColor;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      // 3. ORBIT_RING
      else if (style === 'ORBIT_RING') {
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.45;

        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;

        const points = 72;
        ctx.beginPath();
        
        const activeLength = Math.floor(bufferLength * 0.35);
        const quarterPoints = points / 4;

        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          
          // Symmetrical mapping in 4 sectors
          const step = i % quarterPoints;
          const mirroredStep = step < quarterPoints / 2 ? step : quarterPoints - step;
          const dataIndex = Math.floor((mirroredStep / (quarterPoints / 2)) * activeLength);
          
          const audioValue = dataArray[dataIndex] || 0;
          const offsetRadius = baseRadius + (audioValue / 255) * 35;
          const x = centerX + Math.cos(angle) * offsetRadius;
          const y = centerY + Math.sin(angle) * offsetRadius;

          // Theme or rainbow hue shifts
          if (theme === 'HACKER') {
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)';
            ctx.shadowColor = 'rgba(34, 197, 94, 0.5)';
          } else if (theme === 'HATSUNE_MIKU') {
            ctx.strokeStyle = i % 2 === 0 ? 'rgba(57, 197, 187, 0.9)' : 'rgba(255, 64, 129, 0.8)';
            ctx.shadowColor = 'rgba(57, 197, 187, 0.5)';
          } else if (theme === 'SUNSET') {
            ctx.strokeStyle = `rgba(249, 115, 22, ${0.7 + (audioValue / 255) * 0.3})`;
            ctx.shadowColor = '#ea580c';
          } else {
            const hue = (i * (360 / points) + phase * 20) % 360;
            ctx.strokeStyle = `hsla(${hue}, 90%, 65%, 0.85)`;
            ctx.shadowColor = `hsla(${hue}, 90%, 65%, 0.4)`;
          }

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Inner glowing ambient pulse
        const avgStrength = Array.from(dataArray).slice(0, 16).reduce((a, b) => a + b, 0) / 16;
        const pulseScale = 1.0 + (avgStrength / 255) * 0.15;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.85 * pulseScale, 0, Math.PI * 2);
        const ringGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, baseRadius * 0.85 * pulseScale);
        
        if (theme === 'HACKER') {
          ringGrad.addColorStop(0, 'rgba(21, 128, 61, 0.05)');
          ringGrad.addColorStop(0.8, 'rgba(34, 197, 94, 0.15)');
          ringGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
        } else if (theme === 'HATSUNE_MIKU') {
          ringGrad.addColorStop(0, 'rgba(57, 197, 187, 0.05)');
          ringGrad.addColorStop(0.8, 'rgba(57, 197, 187, 0.2)');
          ringGrad.addColorStop(1, 'rgba(57, 197, 187, 0)');
        } else if (theme === 'SUNSET') {
          ringGrad.addColorStop(0, 'rgba(234, 88, 12, 0.05)');
          ringGrad.addColorStop(0.8, 'rgba(249, 115, 22, 0.2)');
          ringGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        } else if (theme === 'LIGHT') {
          ringGrad.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
          ringGrad.addColorStop(0.8, 'rgba(139, 92, 246, 0.2)');
          ringGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        } else {
          ringGrad.addColorStop(0, 'rgba(236, 72, 153, 0.05)');
          ringGrad.addColorStop(0.8, 'rgba(139, 92, 246, 0.2)');
          ringGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        }
        ctx.fillStyle = ringGrad;
        ctx.fill();
      }

      // 4. STARBURST (FIXED Symmetrical Radial Bloom!)
      else if (style === 'STARBURST') {
        const centerX = width / 2;
        const centerY = height / 2;
        const numRays = 48;
        
        ctx.shadowBlur = 8;
        
        const activeLength = Math.floor(bufferLength * 0.35); // Focus on active bass and mids
        const quarterRays = numRays / 4;

        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2;
          
          // Symmetrical mapping: 4-way symmetry so vertical, horizontal, diagonal look identical!
          const step = i % quarterRays;
          const mirroredStep = step < quarterRays / 2 ? step : quarterRays - step;
          const dataIndex = Math.floor((mirroredStep / (quarterRays / 2)) * activeLength);
          
          const val = dataArray[dataIndex] || 0;
          const beamLen = 15 + (val / 255) * height * 0.45;

          const startX = centerX + Math.cos(angle) * 10;
          const startY = centerY + Math.sin(angle) * 10;
          const endX = centerX + Math.cos(angle) * beamLen;
          const endY = centerY + Math.sin(angle) * beamLen;

          if (theme === 'HACKER') {
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.5 + (val / 255) * 0.5})`;
            ctx.shadowColor = '#22c55e';
          } else if (theme === 'HATSUNE_MIKU') {
            ctx.strokeStyle = i % 2 === 0 ? '#39c5bb' : '#ffffff';
            ctx.shadowColor = '#39c5bb';
          } else if (theme === 'SUNSET') {
            ctx.strokeStyle = `rgba(251, 146, 60, ${0.6 + (val / 255) * 0.4})`;
            ctx.shadowColor = '#ea580c';
          } else if (theme === 'LIGHT') {
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.6 + (val / 255) * 0.4})`;
            ctx.shadowColor = '#ec4899';
          } else if (theme === 'NEON_PUB') {
            ctx.strokeStyle = i % 2 === 0 ? '#00f5ff' : '#ff007f';
            ctx.shadowColor = '#ff007f';
          } else { // DARK / DEFAULT
            const hue = (i * (360 / numRays) - phase * 15) % 360;
            ctx.strokeStyle = `hsla(${hue}, 95%, 60%, 0.85)`;
            ctx.shadowColor = `hsla(${hue}, 95%, 60%, 0.5)`;
          }

          ctx.lineWidth = 1.5 + (val / 255) * 3.5;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
        ctx.shadowBlur = 0; // reset
      }

      // 5. DANCING_PARTICLES (The All-New Dynamic Audio-Reactive Neural Constellation!)
      else if (style === 'DANCING_PARTICLES') {
        const particles = particlesRef.current;

        // Draw connections first
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 45) {
              const alpha = (1 - dist / 45) * 0.18;
              ctx.strokeStyle = theme === 'HACKER' 
                ? `rgba(34, 197, 94, ${alpha})`
                : theme === 'HATSUNE_MIKU'
                ? `rgba(57, 197, 187, ${alpha})`
                : theme === 'SUNSET'
                ? `rgba(249, 115, 22, ${alpha})`
                : `rgba(139, 92, 246, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        // Draw and update particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const val = dataArray[p.freqIndex] || 0;
          const energyFactor = val / 255;

          // React to audio beats: increase speed & jitter
          const currentSpeedMultiplier = 1.0 + energyFactor * 3.5;
          const jitterX = (Math.random() - 0.5) * energyFactor * 2;
          const jitterY = (Math.random() - 0.5) * energyFactor * 2;

          // Update positions
          p.x += p.vx * currentSpeedMultiplier + jitterX;
          p.y += p.vy * currentSpeedMultiplier + jitterY;

          // Bounce off boundary walls
          if (p.x < 5) { p.x = 5; p.vx = Math.abs(p.vx); }
          if (p.x > width - 5) { p.x = width - 5; p.vx = -Math.abs(p.vx); }
          if (p.y < 5) { p.y = 5; p.vy = Math.abs(p.vy); }
          if (p.y > height - 5) { p.y = height - 5; p.vy = -Math.abs(p.vy); }

          // Particle radius reacts to energy
          const radius = p.baseRadius + energyFactor * 7;

          // Draw Glowing Particle
          ctx.shadowBlur = 6 + energyFactor * 10;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;

          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0; // reset
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [style, isPlaying, theme]);

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden shadow-inner border transition-all duration-300 ${
      theme === 'HACKER'
        ? 'bg-black border-green-900/60'
        : theme === 'LIGHT'
        ? 'bg-zinc-100 border-zinc-300'
        : theme === 'HATSUNE_MIKU'
        ? 'bg-zinc-950 border-[#39c5bb]/30'
        : theme === 'SUNSET'
        ? 'bg-zinc-950 border-orange-950'
        : theme === 'NEON_PUB'
        ? 'bg-zinc-950 border-[#ff007f]/30'
        : 'bg-zinc-950 border-zinc-800'
    }`}>
      {/* Tape Grid overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] z-10" />
      
      {/* Scanline atmospheric overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] z-10 opacity-35" />

      <canvas 
        ref={canvasRef} 
        className="w-full h-full block"
        style={{ minHeight: '160px' }}
      />
    </div>
  );
}
