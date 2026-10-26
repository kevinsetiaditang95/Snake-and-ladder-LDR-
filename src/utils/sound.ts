import confetti from 'canvas-confetti';

// Web Audio API Synthesizer for Tactile Board Game Sound Effects
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playDiceRoll() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + i * 65 + Math.random() * 40, now + i * 0.06);
      gain.gain.setValueAtTime(0.08, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.05);
    }
  }

  public playStep() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playLadder(isEven: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = isEven ? [261.63, 329.63, 392.0, 523.25, 659.25] : [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isEven ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.16);
    });
  }

  public playSnake() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 392, 349.23, 293.66, 220];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.07, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.14);
    });
  }

  public playTodReveal() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [392.0, 493.88, 587.33, 783.99];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.11, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.22);
    });
  }

  public playDareFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.14, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.28);
    });
  }

  public playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.5];
    melody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.15, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.35);
    });
  }
}

export const soundFX = new SoundManager();

/**
 * Multi-wave celebratory fireworks & side-cannon confetti when a player wins the game.
 */
export function fireVictoryConfetti() {
  const colors = ['#FBBF24', '#10B981', '#EC4899', '#38BDF8', '#F43F5E', '#A855F7'];

  // Center main burst
  confetti({
    particleCount: 110,
    spread: 90,
    origin: { y: 0.55 },
    colors,
    shapes: ['star', 'circle'],
    scalar: 1.15,
    zIndex: 9999,
  });

  // Left & Right side cannons staggered
  setTimeout(() => {
    confetti({
      particleCount: 65,
      angle: 60,
      spread: 60,
      origin: { x: 0.05, y: 0.65 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 65,
      angle: 120,
      spread: 60,
      origin: { x: 0.95, y: 0.65 },
      colors,
      zIndex: 9999,
    });
  }, 260);

  // Final golden crown shower
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 110,
      startVelocity: 35,
      origin: { x: 0.5, y: 0.35 },
      colors: ['#FDE047', '#F59E0B', '#EC4899', '#10B981'],
      shapes: ['star'],
      scalar: 1.2,
      zIndex: 9999,
    });
  }, 620);
}

/**
 * Celebratory particle burst when a player completes a Dare challenge
 * (with extra intensity for Snake Head Dare rescue or challenging Dare cards).
 */
export function fireDareCelebrationConfetti(isHardDare: boolean = false) {
  const dareColors = ['#F43F5E', '#F59E0B', '#EC4899', '#10B981', '#FDE047'];

  confetti({
    particleCount: isHardDare ? 95 : 70,
    spread: isHardDare ? 85 : 70,
    origin: { y: 0.6 },
    colors: dareColors,
    shapes: ['star', 'circle'],
    scalar: isHardDare ? 1.15 : 1.05,
    zIndex: 9999,
  });

  if (isHardDare) {
    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 65,
        spread: 55,
        origin: { x: 0.1, y: 0.7 },
        colors: dareColors,
        shapes: ['star'],
        zIndex: 9999,
      });
      confetti({
        particleCount: 45,
        angle: 115,
        spread: 55,
        origin: { x: 0.9, y: 0.7 },
        colors: dareColors,
        shapes: ['star'],
        zIndex: 9999,
      });
    }, 200);
  }
}

/**
 * Gentle sparkle burst when completing a Truth question.
 */
export function fireTruthSparkleConfetti() {
  confetti({
    particleCount: 45,
    spread: 60,
    origin: { y: 0.65 },
    colors: ['#38BDF8', '#FBBF24', '#A7F3D0', '#F472B6'],
    zIndex: 9999,
  });
}
