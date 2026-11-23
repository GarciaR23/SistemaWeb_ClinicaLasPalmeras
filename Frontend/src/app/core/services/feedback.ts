import { Injectable, signal } from '@angular/core';

export type FeedbackKind = 'success' | 'error' | 'rejection';
export interface FeedbackMessage { kind: FeedbackKind; title: string; message: string; }

@Injectable({ providedIn: 'root' })
export class Feedback {
  readonly current = signal<FeedbackMessage | null>(null);
  readonly phase = signal<'loading' | 'ready'>('ready');
  readonly soundOn = signal(localStorage.getItem('palmeras.feedback-sound') !== 'off');
  private timer?: number;
  private phaseTimer?: number;

  show(kind: FeedbackKind, title: string, message: string): void {
    window.clearTimeout(this.timer);
    window.clearTimeout(this.phaseTimer);
    this.current.set({ kind, title, message });

    if (kind === 'success') {
      this.phase.set('loading');
      this.phaseTimer = window.setTimeout(() => {
        this.phase.set('ready');
        if (this.soundOn()) this.play('success');
      }, 550);
      this.timer = window.setTimeout(() => this.close(), 4800);
    } else {
      this.phase.set('ready');
      if (this.soundOn()) this.play(kind);
      this.timer = window.setTimeout(() => this.close(), 6000);
    }
  }

  close(): void {
    window.clearTimeout(this.timer);
    window.clearTimeout(this.phaseTimer);
    this.current.set(null);
    this.phase.set('ready');
  }

  toggleSound(): void {
    const enabled = !this.soundOn();
    this.soundOn.set(enabled);
    localStorage.setItem('palmeras.feedback-sound', enabled ? 'on' : 'off');
  }

  private play(kind: FeedbackKind): void {
    try {
      const context = new AudioContext();
      const notes = kind === 'success' ? [587.33, 880] : [240, 180, 240];
      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = kind === 'success' ? 'sine' : 'triangle';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, context.currentTime + index * 0.13);
        gain.gain.exponentialRampToValueAtTime(0.28, context.currentTime + index * 0.13 + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + index * 0.13 + 0.16);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(context.currentTime + index * 0.13);
        oscillator.stop(context.currentTime + index * 0.13 + 0.18);
      });
      window.setTimeout(() => void context.close(), 800);
    } catch { /* El sonido se omite cuando el navegador lo bloquea. */ }
  }
}
