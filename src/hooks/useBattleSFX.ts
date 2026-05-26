/**
 * Battle Sound Effects Hook
 * Uses Web Audio API to generate procedurally-synthesized sound effects
 * No external audio files needed!
 */

import { useCallback, useRef } from 'react';

type SFXType = 
  | 'sword_swing' 
  | 'sword_hit' 
  | 'fire_spell' 
  | 'ice_spell' 
  | 'heal_spell' 
  | 'explosion' 
  | 'levelup' 
  | 'critical_hit'
  | 'miss'
  | 'block';

interface UseBattleSFXOptions {
  enabled?: boolean;
  volume?: number;
}

export function useBattleSFX(options: UseBattleSFXOptions = {}) {
  const { enabled = true, volume = 0.5 } = options;
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume if suspended (browser policy)
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const play = useCallback((type: SFXType) => {
    if (!enabled) return;
    try {
      const ctx = getAudioContext();
      const vol = volume;

      switch (type) {
        case 'sword_swing':
          playSwordSwing(ctx, vol);
          break;
        case 'sword_hit':
          playSwordHit(ctx, vol);
          break;
        case 'fire_spell':
          playFireSpell(ctx, vol);
          break;
        case 'ice_spell':
          playIceSpell(ctx, vol);
          break;
        case 'heal_spell':
          playHealSpell(ctx, vol);
          break;
        case 'explosion':
          playExplosion(ctx, vol);
          break;
        case 'levelup':
          playLevelUp(ctx, vol);
          break;
        case 'critical_hit':
          playCriticalHit(ctx, vol);
          break;
        case 'miss':
          playMiss(ctx, vol);
          break;
        case 'block':
          playBlock(ctx, vol);
          break;
      }
    } catch (e) {
      // Audio not available - silently fail
      console.debug('SFX unavailable:', e);
    }
  }, [enabled, volume, getAudioContext]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  }, []);

  return { play, cleanup };
}

// ====== Sound Generators ======

function createGain(ctx: AudioContext, volume: number, duration: number, rampType: 'exp' | 'linear' = 'exp') {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  if (rampType === 'exp') {
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  } else {
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
  }
  gain.connect(ctx.destination);
  return gain;
}

function playSwordSwing(ctx: AudioContext, vol: number) {
  const duration = 0.25;
  const gain = createGain(ctx, vol * 0.4, duration);
  
  // White noise source for swoosh
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  // Bandpass filter that sweeps frequency
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(200, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + duration);
  
  noise.connect(filter);
  filter.connect(gain);
  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + duration);
}

function playSwordHit(ctx: AudioContext, vol: number) {
  const duration = 0.15;
  const gain = createGain(ctx, vol * 0.6, duration);
  
  // Sharp metallic impact
  const osc1 = ctx.createOscillator();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(800, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);
  
  // Low thump
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(80, ctx.currentTime);
  
  // Noise burst
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vol * 0.3, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc1.connect(gain);
  osc2.connect(gain);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + duration);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + duration);
  noise.start(ctx.currentTime);
}

function playFireSpell(ctx: AudioContext, vol: number) {
  const duration = 0.5;
  const gain = createGain(ctx, vol * 0.5, duration);
  
  // Rumbling fire
  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(60, ctx.currentTime);
  osc1.frequency.linearRampToValueAtTime(120, ctx.currentTime + duration);
  
  // Mid crackle
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(400, ctx.currentTime);
  osc2.frequency.linearRampToValueAtTime(100, ctx.currentTime + duration);
  
  // White noise
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + duration);
  
  osc1.connect(gain);
  osc2.connect(gain);
  noise.connect(filter);
  filter.connect(gain);
  
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + duration);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + duration);
  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + duration);
}

function playIceSpell(ctx: AudioContext, vol: number) {
  const duration = 0.4;
  const gain = createGain(ctx, vol * 0.45, duration);
  
  // Crystal shards - multiple high tones
  const freq1 = 880;
  const freq2 = 1320;
  const freq3 = 1760;
  
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
  osc1.frequency.linearRampToValueAtTime(freq1 * 1.5, ctx.currentTime + duration);
  
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq2, ctx.currentTime);
  
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(freq3, ctx.currentTime);
  
  // Modulator for shimmer
  const modOsc = ctx.createOscillator();
  modOsc.type = 'sine';
  modOsc.frequency.setValueAtTime(6, ctx.currentTime);
  const modGain = ctx.createGain();
  modGain.gain.value = 20;
  modOsc.connect(modGain);
  modGain.connect(osc1.frequency);
  
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(vol * 0.2, ctx.currentTime);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc1.connect(gain);
  osc2.connect(gain2);
  osc3.connect(gain2);
  
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + duration);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + duration);
  osc3.start(ctx.currentTime);
  osc3.stop(ctx.currentTime + duration);
  modOsc.start(ctx.currentTime);
  modOsc.stop(ctx.currentTime + duration);
}

function playHealSpell(ctx: AudioContext, vol: number) {
  const duration = 0.6;
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  
  notes.forEach((freq, idx) => {
    const startTime = ctx.currentTime + (idx / notes.length) * duration * 0.7;
    const noteDuration = duration * 0.4;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol * 0.35, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + noteDuration);
  });
}

function playExplosion(ctx: AudioContext, vol: number) {
  const duration = 0.6;
  const gain = createGain(ctx, vol * 0.6, duration);
  
  // Low boom
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(40, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + duration);
  
  // Mid crunch
  const osc2 = ctx.createOscillator();
  osc2.type = 'sawtooth';
  osc2.frequency.setValueAtTime(80, ctx.currentTime);
  osc2.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + duration);
  
  // Noise burst
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + duration);
  
  osc1.connect(gain);
  osc2.connect(gain);
  noise.connect(filter);
  filter.connect(gain);
  
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + duration);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + duration);
  noise.start(ctx.currentTime);
}

function playLevelUp(ctx: AudioContext, vol: number) {
  const duration = 0.7;
  const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
  
  notes.forEach((freq, idx) => {
    const startTime = ctx.currentTime + (idx / notes.length) * duration * 0.6;
    const noteDuration = duration * 0.35;
    
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = freq * 2;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol * 0.3, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
    
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(vol * 0.1, startTime + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
    
    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(ctx.destination);
    gain2.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + noteDuration);
    osc2.start(startTime);
    osc2.stop(startTime + noteDuration);
  });
}

function playCriticalHit(ctx: AudioContext, vol: number) {
  const duration = 0.2;
  const gain = createGain(ctx, vol * 0.65, duration);
  
  // High-pitched sharp hit
  const osc1 = ctx.createOscillator();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(2000, ctx.currentTime);
  osc1.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);
  
  // Low punch
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(60, ctx.currentTime);
  
  // Noise burst
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.08));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  osc1.connect(gain);
  osc2.connect(gain);
  
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + duration);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + duration);
  noise.start(ctx.currentTime);
}

function playMiss(ctx: AudioContext, vol: number) {
  const duration = 0.2;
  const gain = createGain(ctx, vol * 0.3, duration);
  
  // Quick air swoosh
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  
  noise.connect(filter);
  filter.connect(gain);
  noise.start(ctx.currentTime);
  noise.stop(ctx.currentTime + duration);
}

function playBlock(ctx: AudioContext, vol: number) {
  const duration = 0.1;
  const gain = createGain(ctx, vol * 0.5, duration);
  
  // Dull thud
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + duration);
  
  osc.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}
