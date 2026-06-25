import { Track } from './types';

class SynthwaveEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  
  // Synth Node References
  private synthIntervalId: any = null;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private filterNode: BiquadFilterNode | null = null;
  
  // Media element references for custom file uploads
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;

  // Track state
  private currentTrack: Track | null = null;
  private isPlaying: boolean = false;
  private onTimeUpdate: ((time: number) => void) | null = null;
  private timerInterval: any = null;
  private synthTime = 0;
  private tempo = 115; // BPM
  private playbackSpeed = 1.0;

  constructor() {
    // AudioElement created for custom files
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
    }
  }

  public init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    
    // Create Analyser
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    
    // Create Master Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.value = 0.5; // Default volume 50%
    
    // Setup Filter for a cool analog synth sound
    this.filterNode = this.audioCtx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 1200;
    this.filterNode.Q.value = 3;

    // Connect nodes: Synth -> Filter -> Master Gain -> Analyser -> Destination
    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    // Also connect AudioElement source to analyser
    if (this.audioElement && !this.mediaSource) {
      try {
        this.mediaSource = this.audioCtx.createMediaElementSource(this.audioElement);
        // Direct media element also goes through the master gain and analyser
        this.mediaSource.connect(this.masterGain);
      } catch (err) {
        console.warn('Error creating media element source:', err);
      }
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.init();
    return this.analyser;
  }

  public setVolume(volume: number) {
    this.init();
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    }
  }

  public setSpeed(speed: number) {
    this.playbackSpeed = speed;
    if (this.audioElement) {
      this.audioElement.playbackRate = speed;
    }
    // Update synth tempo based on speed
    this.tempo = 115 * speed;
  }

  public registerTimeCallback(callback: (time: number) => void) {
    this.onTimeUpdate = callback;
  }

  public play(track: Track, localFile?: File) {
    this.init();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.stopCurrentPlayback();
    this.currentTrack = track;
    this.isPlaying = true;

    if (localFile) {
      this.playLocalFile(localFile);
    } else {
      this.playProceduralSynth(track);
    }
  }

  private playLocalFile(file: File) {
    if (!this.audioElement) return;

    const url = URL.createObjectURL(file);
    this.audioElement.src = url;
    this.audioElement.playbackRate = this.playbackSpeed;
    this.audioElement.play().catch(e => console.error('Audio playback error', e));

    // Time update listener
    const updateHandler = () => {
      if (this.onTimeUpdate && this.audioElement) {
        this.onTimeUpdate(this.audioElement.currentTime);
      }
    };

    this.audioElement.ontimeupdate = updateHandler;
    this.audioElement.onended = () => {
      this.isPlaying = false;
      if (this.onTimeUpdate) this.onTimeUpdate(0);
    };
  }

  private playProceduralSynth(track: Track) {
    this.synthTime = 0;
    this.tempo = 115 * this.playbackSpeed;
    
    const intervalMs = (60 / this.tempo) * 1000 / 2; // Eighth notes
    let step = 0;

    // Define sequences for our retro tracks
    const trackMelodies: Record<string, { bass: number[]; lead: number[] }> = {
      'sunset-cruise': {
        // Mellow warm minor chords (frequencies)
        bass: [110, 110, 130.81, 130.81, 146.83, 146.83, 164.81, 164.81], // A2, C3, D3, E3
        lead: [220, 261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 261.63] // Arp
      },
      'neon-horizon': {
        // Fast outrun drive
        bass: [73.42, 73.42, 73.42, 73.42, 98.00, 98.00, 110.00, 110.00], // D2, G2, A2
        lead: [293.66, 329.63, 369.99, 440.00, 587.33, 440.00, 369.99, 329.63]
      },
      'cyberpunk-grid': {
        // Moody dark cyber track
        bass: [55.00, 55.00, 65.41, 65.41, 51.91, 51.91, 58.27, 58.27], // A1, C2, G#1, A#1
        lead: [220, 220, 311.13, 311.13, 207.65, 207.65, 233.08, 233.08]
      },
      'sammys-jam': {
        // Bright major positive vibe
        bass: [130.81, 130.81, 164.81, 164.81, 196.00, 196.00, 220.00, 220.00], // C3, E3, G3, A3
        lead: [523.25, 659.25, 783.99, 880.00, 1046.50, 880.00, 783.99, 659.25]
      }
    };

    const currentMelody = trackMelodies[track.id] || trackMelodies['sunset-cruise'];

    this.timerInterval = setInterval(() => {
      if (!this.isPlaying) return;
      this.synthTime += intervalMs / 1000;
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.synthTime % track.duration);
      }

      // Play synthesized notes
      this.triggerSynthNotes(step, currentMelody);
      step = (step + 1) % 16;
    }, intervalMs);
  }

  private triggerSynthNotes(step: number, melody: { bass: number[]; lead: number[] }) {
    if (!this.audioCtx || !this.filterNode) return;

    const time = this.audioCtx.currentTime;

    // 1. Play Retro Bassnote (sawtooth) on odd steps
    const playBass = step % 2 === 0;
    if (playBass) {
      const bassFreq = melody.bass[Math.floor(step / 2) % melody.bass.length];
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassFreq, time);
      
      // Dynamic filter sweeping mimicking classic synthwave filter movement
      const filterSweep = 400 + Math.sin(time * 2) * 600;
      this.filterNode.frequency.setValueAtTime(filterSweep, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

      osc.connect(gain);
      gain.connect(this.filterNode);
      osc.start(time);
      osc.stop(time + 0.3);

      this.activeOscillators.push({ osc, gain });
    }

    // 2. Play Arpeggiated Lead Note (triangle wave for smooth retro feel)
    const leadFreq = melody.lead[step % melody.lead.length];
    const leadOsc = this.audioCtx.createOscillator();
    const leadGain = this.audioCtx.createGain();

    leadOsc.type = 'triangle';
    leadOsc.frequency.setValueAtTime(leadFreq, time);

    leadGain.gain.setValueAtTime(0.15, time);
    leadGain.gain.exponentialRampToValueAtTime(0.005, time + 0.15);

    leadOsc.connect(leadGain);
    leadGain.connect(this.filterNode);
    leadOsc.start(time);
    leadOsc.stop(time + 0.15);

    this.activeOscillators.push({ osc: leadOsc, gain: leadGain });

    // 3. Simple retro Drum click/snare sound simulation on quarter steps
    if (step % 4 === 0) {
      this.triggerRetroDrum(step);
    }

    // Garbage collect finished oscillators
    if (this.activeOscillators.length > 30) {
      this.activeOscillators.splice(0, 15);
    }
  }

  private triggerRetroDrum(step: number) {
    if (!this.audioCtx || !this.filterNode) return;
    const time = this.audioCtx.currentTime;

    if (step % 8 === 0) {
      // Synthwave Kick (Frequency sweep down)
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
      
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
      
      osc.connect(gain);
      gain.connect(this.filterNode);
      osc.start(time);
      osc.stop(time + 0.15);
    } else {
      // Retro Snare / Noise Burst
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, time);
      
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      
      osc.connect(gain);
      gain.connect(this.filterNode);
      osc.start(time);
      osc.stop(time + 0.2);
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.clearSynthIntervals();
  }

  public resume() {
    if (!this.currentTrack) return;
    this.isPlaying = true;
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    if (this.audioElement && this.audioElement.src) {
      this.audioElement.play().catch(e => console.error('Audio resume error', e));
    } else {
      this.playProceduralSynth(this.currentTrack);
    }
  }

  private stopCurrentPlayback() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.removeAttribute('src');
    }
    this.clearSynthIntervals();
  }

  private clearSynthIntervals() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // Stop all ringing oscillators
    this.activeOscillators.forEach(item => {
      try {
        item.osc.stop();
      } catch (e) {}
    });
    this.activeOscillators = [];
  }
}

export const audioService = new SynthwaveEngine();
