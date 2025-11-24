
// A standalone service to generate UI sounds using the Web Audio API
// No external MP3 files required.

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // Initialize interaction on first user event to bypass autoplay policies
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => this.init(), { once: true });
    }
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3; // Master volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playHover() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  public playClick() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playSuccess() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    
    // Chord
    [440, 554, 659].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, t + (i * 0.05));
      gain.gain.linearRampToValueAtTime(0.1, t + (i * 0.05) + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1);
      
      osc.start(t + (i * 0.05));
      osc.stop(t + 1);
    });
  }

  // Removed sealing sound effect as requested
  public playSealing() {
    // No-op
  }

  public playUnlockStart() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const duration = 2.5;

    // Create a smooth "pad" sound using multiple detuned oscillators
    const freqs = [110, 220, 221, 329.6]; // A2, A3, A3(detuned), E4
    
    freqs.forEach(freq => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      
      // Gentle swell in
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.05, t + duration * 0.6);
      gain.gain.linearRampToValueAtTime(0, t + duration);

      osc.start(t);
      osc.stop(t + duration);
    });
  }

  public playUnlockReveal() {
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;

    // Celestial Chime / Chord (E Major 9)
    // E4, G#4, B4, D#5, F#5
    const notes = [329.63, 415.30, 493.88, 622.25, 739.99]; 

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.type = 'sine';
      osc.frequency.value = freq;
      
      // Staggered start for arpeggio effect
      const start = t + (i * 0.08);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15 - (i * 0.02), start + 0.05); // Attack
      gain.gain.exponentialRampToValueAtTime(0.001, start + 3.0); // Long tail decay

      osc.start(start);
      osc.stop(start + 4.0);
    });
    
    // Add a low fundamental "boom" for impact
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.connect(bassGain);
    bassGain.connect(this.masterGain);
    bass.type = 'triangle';
    bass.frequency.value = 55; // A1
    bassGain.gain.setValueAtTime(0.2, t);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
    bass.start(t);
    bass.stop(t + 2.0);
  }
}

export const SoundService = new AudioSynthesizer();
