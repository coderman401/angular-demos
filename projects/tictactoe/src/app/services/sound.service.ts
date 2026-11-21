import { Injectable } from '@angular/core';

type Cue = 'x' | 'o' | 'win' | 'lose' | 'draw' | 'join' | 'tap';

const KEY = 'xo.sound';

/**
 * Tiny synthesized sound effects (no audio files). Browsers only allow audio
 * after a user gesture, which every cue here follows. Also gives a short
 * vibration on phones that support it.
 */
@Injectable({ providedIn: 'root' })
export class SoundService {

  private ctx?: AudioContext;
  enabled = this.read();

  toggle() {
    this.enabled = !this.enabled;
    try { localStorage.setItem(KEY, this.enabled ? 'on' : 'off'); } catch { /* private mode */ }
    if (this.enabled) this.play('tap');
  }

  play(cue: Cue) {
    if (cue === 'x' || cue === 'o') this.vibrate(12);
    if (cue === 'win') this.vibrate([20, 40, 30]);
    if (!this.enabled) return;
    const ctx = this.context();
    if (!ctx) return;
    const t = ctx.currentTime;
    switch (cue) {
      case 'x': return this.tone(ctx, t, 660, 0.09, 'triangle');
      case 'o': return this.tone(ctx, t, 520, 0.09, 'sine');
      case 'tap': return this.tone(ctx, t, 880, 0.05, 'sine', 0.06);
      case 'join': [523, 784].forEach((f, i) => this.tone(ctx, t + i * 0.09, f, 0.12, 'sine')); return;
      case 'win': [523, 659, 784, 1047].forEach((f, i) => this.tone(ctx, t + i * 0.085, f, 0.16, 'triangle')); return;
      case 'draw': [587, 587].forEach((f, i) => this.tone(ctx, t + i * 0.14, f, 0.12, 'sine')); return;
      case 'lose': [440, 370, 311].forEach((f, i) => this.tone(ctx, t + i * 0.12, f, 0.16, 'sine')); return;
    }
  }

  private tone(ctx: AudioContext, start: number, freq: number, dur: number, type: OscillatorType, peak = 0.12) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  private context(): AudioContext | undefined {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!Ctor) return undefined;
      this.ctx = new Ctor();
    }
    if (this.ctx!.state === 'suspended') this.ctx!.resume();
    return this.ctx;
  }

  private vibrate(pattern: number | number[]) {
    if (!this.enabled) return;
    try { navigator.vibrate?.(pattern); } catch { /* unsupported */ }
  }

  private read(): boolean {
    try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; }
  }
}
