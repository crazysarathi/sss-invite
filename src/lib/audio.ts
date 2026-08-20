/**
 * Procedural sound effects for the invitation — synthesised live with the
 * Web Audio API. No audio files: nothing to license, nothing to download.
 *
 * No ambient music — the page is silent except for four moments:
 *   - `serve()` — the whoosh + pop when the seal ball serves off the gates;
 *   - `paddleHit()` — the pickleball "pock", fired by the rally at contact;
 *   - `floorBounce()` — the duller court-floor bounce, fired once per impact
 *     while the hero ball drops and settles on the card;
 *   - `scrollCrackle()` — a faint paper "crick-crack" as the reader scrolls,
 *     the stationery moving under their fingers (see useScrollCrackle).
 *
 * Browsers only allow audible playback after a user gesture. `boot()` arms
 * one-shot listeners so the very first tap / key press unlocks the context —
 * the opening screen's "tap to open" doubles as the unlock, which is also
 * the moment the first effect (the serve) plays.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private booted = false;

  private unlockEvents = ["pointerdown", "touchend", "keydown", "click"] as const;
  private unlock = () => {
    this.start();
    if (this.ctx?.state === "running") this.disarm();
  };

  /** Try to unlock straight away; otherwise the first gesture unlocks it. */
  boot(): void {
    if (this.booted || typeof window === "undefined") return;
    this.booted = true;
    this.start();
    this.arm();
  }

  /** The seal ball serving off the gates: a rising whoosh into a pop. */
  serve(): void {
    if (this.running()) {
      this.playServe();
      return;
    }
    // The Esc-skip path fires serve() in the same gesture task that is still
    // unlocking the context — resume() resolves a beat later, so retry once
    // then (dropped if it resolves too late to feel attached to the doors).
    const asked = performance.now();
    void this.ctx?.resume().then(() => {
      if (performance.now() - asked < 600 && this.running()) this.playServe();
    });
  }

  private playServe(): void {
    const ctx = this.running();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noise(ctx);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.1;
    band.frequency.setValueAtTime(350, t);
    band.frequency.exponentialRampToValueAtTime(2600, t + 0.4);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.28);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    noise.connect(band).connect(gain).connect(this.master);
    noise.start(t);
    noise.stop(t + 0.55);
    setTimeout(() => this.paddleHit(1.4), 380);
  }

  /** The pickleball "pock" — pitch wobbles a little so rallies don't machine-gun. */
  paddleHit(strength = 1): void {
    const ctx = this.running();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const wobble = 0.92 + Math.random() * 0.16;
    // the thump
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300 * wobble, t);
    osc.frequency.exponentialRampToValueAtTime(150 * wobble, t + 0.1);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.3 * strength, t);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(oscGain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.14);
    // the plastic click on top
    const click = ctx.createBufferSource();
    click.buffer = this.noise(ctx);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 2100 * wobble;
    band.Q.value = 1.6;
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.12 * strength, t);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    click.connect(band).connect(clickGain).connect(this.master);
    click.start(t);
    click.stop(t + 0.06);
  }

  /** The ball meeting the court floor — deeper and duller than a paddle hit. */
  floorBounce(strength = 1): void {
    const ctx = this.running();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const wobble = 0.94 + Math.random() * 0.12;
    // the hollow thump
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(210 * wobble, t);
    osc.frequency.exponentialRampToValueAtTime(85 * wobble, t + 0.13);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.28 * strength, t);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(oscGain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.18);
    // a soft plastic tap on top — quieter and lower than the paddle click
    const tap = ctx.createBufferSource();
    tap.buffer = this.noise(ctx);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1300 * wobble;
    band.Q.value = 1.3;
    const tapGain = ctx.createGain();
    tapGain.gain.setValueAtTime(0.07 * strength, t);
    tapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    tap.connect(band).connect(tapGain).connect(this.master);
    tap.start(t);
    tap.stop(t + 0.05);
  }

  /** A tiny paper "crick" — sometimes doubled into a "crick-crack". */
  scrollCrackle(strength = 1): void {
    const ctx = this.running();
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    this.crack(ctx, t, strength);
    // roughly every third crackle gets a softer echo right behind it
    if (Math.random() < 0.35) this.crack(ctx, t + 0.05 + Math.random() * 0.04, strength * 0.55);
  }

  /** One paper crack: a short bright noise burst, pitch varied per shot. */
  private crack(ctx: AudioContext, t: number, strength: number): void {
    if (!this.master) return;
    const wobble = 0.8 + Math.random() * 0.5;
    const burst = ctx.createBufferSource();
    burst.buffer = this.noise(ctx);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 3100 * wobble;
    band.Q.value = 2.4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.055 * strength, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
    burst.connect(band).connect(gain).connect(this.master);
    burst.start(t, Math.random() * 0.9);
    burst.stop(t + 0.04);
  }

  /* ---------------------------------------------------------------- */

  private arm(): void {
    this.unlockEvents.forEach((e) => window.addEventListener(e, this.unlock, { capture: true, passive: true }));
  }

  private disarm(): void {
    this.unlockEvents.forEach((e) => window.removeEventListener(e, this.unlock, { capture: true }));
  }

  /** The context, but only when it is actually allowed to make sound. */
  private running(): AudioContext | null {
    return this.ctx && this.ctx.state === "running" ? this.ctx : null;
  }

  private start(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(this.ctx.destination);
    }
    const ctx = this.ctx;
    void ctx.resume().then(() => {
      if (ctx.state === "running") this.disarm();
    });
  }

  private noise(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
  }
}

/** The one sound engine for the whole invitation. */
export const sound = new SoundEngine();
