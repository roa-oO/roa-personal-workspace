/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class CuteAudioEngine {
  private ctx: AudioContext | null = null;
  private volumeNode: GainNode | null = null;
  private currentBgmNode: AudioNode | null = null;
  private currentBgmSource: any = null; // can be OscillatorNode, AudioWorklet, or custom scheduler timer
  private bgmVolume: number = 0.5; // default 50%
  private isBgmPlaying: boolean = false;
  private currentTrackId: number = 1;
  private currentAudioElement: HTMLAudioElement | null = null;

  // Track state schedulers
  private bgmIntervalId: any = null;

  constructor() {
    // Lazy initialize to bypass initial autoplay restrictions
  }

  private initContext() {
    if (!this.ctx) {
      // Browser compatibility
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.volumeNode.connect(this.ctx.destination);
    }
    // Resume context if suspended
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.volumeNode) {
      this.volumeNode.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = this.bgmVolume;
    }
  }

  public playSFX(type: 'focusStart' | 'breakStart' | 'allCompleted') {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.05); // soft attack
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.01); // Exponential release

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    if (type === 'focusStart') {
      // 낮은 단일 톤 1회, 440Hz
      playTone(440, now, 0.4, 'triangle');
    } else if (type === 'breakStart') {
      // 두 음 상행, 523Hz → 659Hz
      playTone(523, now, 0.25, 'sine');
      playTone(659, now + 0.22, 0.45, 'sine');
    } else if (type === 'allCompleted') {
      // 세 음 상행, 523Hz → 659Hz → 784Hz
      playTone(523, now, 0.2, 'sine');
      playTone(659, now + 0.18, 0.2, 'sine');
      playTone(784, now + 0.36, 0.5, 'sine');
    }
  }

  public playBgm(trackId: number) {
    this.initContext();
    this.stopBgm();

    this.currentTrackId = trackId;
    this.isBgmPlaying = true;

    const env = (import.meta as any).env ?? {};
    const externalAudioUrl = env[`VITE_BGM_TRACK_${trackId}_URL`]?.trim();
    const audioPath = externalAudioUrl || `/audio/track${trackId}.mp3`;
    const sourceType = externalAudioUrl ? 'external audio' : 'local audio';
    console.log(`[AudioEngine] Attempting to play ${sourceType}: ${audioPath}`);
    
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = this.bgmVolume;
    this.currentAudioElement = audio;

    let fallbackTriggered = false;
    const triggerFallback = () => {
      if (fallbackTriggered) return;
      fallbackTriggered = true;
      if (this.currentAudioElement === audio) {
        console.log(`[AudioEngine] Audio file load failed. Invoking synthetic atmospheric track for ID: ${trackId}`);
        this.playSynthBgm(trackId);
      }
    };

    // Watch for load/loading error events
    audio.addEventListener('error', () => {
      triggerFallback();
    });

    audio.play().catch((err) => {
      console.warn(`[AudioEngine] HTMLAudioElement.play() failed for path: ${audioPath}:`, err);
      // If it is just an initial user gesture restriction, did not play immediately is expected.
      // But if it is a file 404/not found error, we trigger fallback.
      if (err.name !== 'NotAllowedError') {
        triggerFallback();
      }
    });
  }

  private playSynthBgm(trackId: number) {
    if (!this.ctx || !this.volumeNode) return;

    if (trackId === 1) {
      // Track 1: Cozy Lo-Fi Keys 🎹 (Soft slow jazz Rhodes-like chords)
      this.playLofiChords();
    } else if (trackId === 2) {
      // Track 2: Summer Rain & Forest 🌧️ (Synthesized white-filtered rainfall + low rumbling thunder)
      this.playRainAndThunder();
    } else if (trackId === 3) {
      // Track 3: Cute Retro Chiptune 👾 (Playful 8-bit sweet arpeggios)
      this.playCozyChiptune();
    } else if (trackId === 4) {
      // Track 4: Soothing Ocean Waves 🌊 (Periodically modulated low rainfall and sea movement)
      this.playOceanWaves();
    } else if (trackId === 5) {
      // Track 5: Zen Meditation Drone 🧘 (Ethereal multi-layered chord drone)
      this.playZenDrone();
    }
  }

  public stopBgm() {
    this.isBgmPlaying = false;

    // Pause and free HTMlAudioElement if active
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {
        console.warn('AudioElement stop error:', e);
      }
      this.currentAudioElement = null;
    }
    
    // Clear scheduled intervals
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }

    if (this.ctx) {
      // Clean up current BGM node resources
      try {
        if (this.currentBgmSource) {
          if (Array.isArray(this.currentBgmSource)) {
            this.currentBgmSource.forEach((src) => {
              try { src.stop(); } catch(e) {}
            });
          } else if (typeof this.currentBgmSource.stop === 'function') {
            this.currentBgmSource.stop();
          }
          this.currentBgmSource = null;
        }

        if (this.currentBgmNode) {
          this.currentBgmNode.disconnect();
          this.currentBgmNode = null;
        }
      } catch (e) {
        console.warn('BGM Cleanup error:', e);
      }
    }
  }

  // --- Track Implementations ---

  // Track 1: Cozy Lo-Fi Chords generator
  private playLofiChords() {
    if (!this.ctx || !this.volumeNode) return;
    const ctx = this.ctx;

    // Progression: Cmaj7 -> Am7 -> Dm7 -> G7 (Soft, warm jazz vibe)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
      [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
      [293.66, 349.23, 440.00, 523.25], // Dm7 (D4, F4, A4, C4)
      [196.00, 246.94, 293.66, 349.23], // G7 (G3, B3, D4, F4)
    ];

    let chordIndex = 0;
    const playChordOnce = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.volumeNode) return;
      const startTime = ctx.currentTime;
      const duration = 4.8; // 5 seconds envelope including decay

      const oscs: OscillatorNode[] = [];
      const chordGain = ctx.createGain();
      
      chordGain.gain.setValueAtTime(0, startTime);
      chordGain.gain.linearRampToValueAtTime(0.08, startTime + 0.8); // soft slow swell
      chordGain.gain.setValueAtTime(0.08, startTime + 3.5);
      chordGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      const notes = chords[chordIndex % chords.length];
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle'; // triangle has that soft warm Rhodes E-Piano sound
        osc.frequency.setValueAtTime(freq, startTime);
        
        // Add subtle detune for extra warm analog texture
        osc.detune.setValueAtTime(Math.random() * 8 - 4, startTime);

        osc.connect(chordGain);
        osc.start(startTime);
        oscs.push(osc);
      });

      // Simple lowpass filter to make it warmer
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.setValueAtTime(700, startTime);
      lpf.Q.setValueAtTime(1, startTime);

      chordGain.connect(lpf);
      lpf.connect(this.volumeNode);

      // Save for stopping later
      this.currentBgmSource = oscs;
      
      chordIndex++;
    };

    // Initial trigger
    playChordOnce();
    
    // Looping schedule (every 5 seconds)
    this.bgmIntervalId = setInterval(playChordOnce, 5000);
  }

  // Track 2: Cozy Forest Rain
  private playRainAndThunder() {
    if (!this.ctx || !this.volumeNode) return;
    const ctx = this.ctx;

    // Create custom noise buffer for soft rainfall rain
    const bufferSize = 4 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Fill with pink-filtered noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // normalise
      b6 = white * 0.115926;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    // Add highpass and lowpass filter configurations for cosy fireplace or foliage rainfall feel
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(0.4, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.24, ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.volumeNode);

    rainSource.start(0);

    this.currentBgmSource = rainSource;
    this.currentBgmNode = rainGain;

    // Thunder simulator scheduled randomly
    const thunderTimer = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.volumeNode) return;
      const tTime = ctx.currentTime;
      
      const thunderOsc = ctx.createOscillator();
      const thunderGain = ctx.createGain();
      const thunderFilter = ctx.createBiquadFilter();

      thunderOsc.type = 'sawtooth';
      thunderOsc.frequency.setValueAtTime(32, tTime);

      thunderFilter.type = 'lowpass';
      thunderFilter.frequency.setValueAtTime(80, tTime); // ultra low boom

      thunderGain.gain.setValueAtTime(0, tTime);
      thunderGain.gain.linearRampToValueAtTime(0.35, tTime + 1.2);
      thunderGain.gain.exponentialRampToValueAtTime(0.0001, tTime + 4.5);

      thunderOsc.connect(thunderFilter);
      thunderFilter.connect(thunderGain);
      thunderGain.connect(this.volumeNode);

      thunderOsc.start(tTime);
      thunderOsc.stop(tTime + 5.0);

      const nextThunderDelay = 15000 + Math.random() * 20000; // 15s to 35s
      this.bgmIntervalId = setTimeout(thunderTimer, nextThunderDelay);
    };

    // schedule first thunder in 10s
    this.bgmIntervalId = setTimeout(thunderTimer, 10000);
  }

  // Track 3: Cozy Retro 8-bit Chiptune
  private playCozyChiptune() {
    if (!this.ctx || !this.volumeNode) return;
    const ctx = this.ctx;

    // Soft cute chip loops: Arpeggiator of C major / G major scale notes
    const notes = [
      523.25, 587.33, 659.25, 783.99, // C5, D5, E5, G5
      659.25, 783.99, 880.00, 987.77, // E5, G5, A5, B5
      880.00, 987.77, 1046.50, 1318.51 // A5, B5, C6, E6
    ];

    let noteIndex = 0;
    const oscs: OscillatorNode[] = [];

    const playPulseNote = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.volumeNode) return;
      const startTime = ctx.currentTime;
      const duration = 0.22;

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'square'; // classic 8bit pulse wave
      osc.frequency.setValueAtTime(notes[noteIndex % notes.length], startTime);

      noteGain.gain.setValueAtTime(0, startTime);
      noteGain.gain.linearRampToValueAtTime(0.015, startTime + 0.01); // cute clicky pluck
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      // Low pass to avoid piercing high frequencies
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, startTime);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.volumeNode);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);

      noteIndex++;
      
      // Schedule bass progression on every 4 notes
      if (noteIndex % 4 === 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'triangle';
        const bassFreq = notes[noteIndex % 6] / 4; // 2 octaves down
        bassOsc.frequency.setValueAtTime(bassFreq, startTime);

        bassGain.gain.setValueAtTime(0, startTime);
        bassGain.gain.linearRampToValueAtTime(0.04, startTime + 0.05);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8);

        bassOsc.connect(bassGain);
        bassGain.connect(this.volumeNode);
        bassOsc.start(startTime);
        bassOsc.stop(startTime + 1.0);
      }
    };

    // Looping arpeggiator every 250ms
    this.bgmIntervalId = setInterval(playPulseNote, 250);
  }

  // Track 4: Soothing Ocean Waves
  private playOceanWaves() {
    if (!this.ctx || !this.volumeNode) return;
    const ctx = this.ctx;

    // Wave generator uses filtered low noise with an automated slow LFO volume sway
    const bufferSize = 3 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, ctx.currentTime); // very deep sub aquatic swell

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.05, ctx.currentTime);

    noise.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(this.volumeNode);

    noise.start(0);

    this.currentBgmSource = noise;
    this.currentBgmNode = waveGain;

    // Automate volume like a swinging sea wave (every 5-6s swell and fade)
    let state = 0;
    const oscillateWave = () => {
      if (!this.isBgmPlaying || !this.ctx) return;
      const targetGain = state === 0 ? 0.22 : 0.04;
      const targetFreq = state === 0 ? 450 : 180;
      const rampTime = 2.8;

      waveGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + rampTime);
      filter.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + rampTime);

      state = 1 - state;
    };

    oscillateWave();
    this.bgmIntervalId = setInterval(oscillateWave, 3000);
  }

  // Track 5: Zen Meditation Drone
  private playZenDrone() {
    if (!this.ctx || !this.volumeNode) return;
    const ctx = this.ctx;

    const frequencies = [130.81, 196.00, 261.63, 329.63, 392.00]; // Cs, Gs, Es chords (rich harmonics)
    const oscs: OscillatorNode[] = [];
    const droneGain = ctx.createGain();

    droneGain.gain.setValueAtTime(0, ctx.currentTime);
    droneGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2.0); // very slow fade in

    // Multi lowpass and detuning setup
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Detune each voice ever so slightly to create gorgeous interference beating
      osc.detune.setValueAtTime((idx - 2) * 5 + (Math.random() * 2), ctx.currentTime);

      osc.connect(droneGain);
      osc.start(0);
      oscs.push(osc);
    });

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    droneGain.connect(filter);
    filter.connect(this.volumeNode);

    this.currentBgmSource = oscs;
    this.currentBgmNode = droneGain;

    // Automated filter sweep to create soft movement feel
    let direction = 1;
    const filterSweep = () => {
      if (!this.isBgmPlaying || !this.ctx) return;
      const targetFreq = direction === 1 ? 550 : 250;
      filter.frequency.linearRampToValueAtTime(targetFreq, ctx.currentTime + 3.0);
      direction = -direction;
    };

    filterSweep();
    this.bgmIntervalId = setInterval(filterSweep, 3200);
  }
}

export const soundEngine = new CuteAudioEngine();
