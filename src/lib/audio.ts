/**
 * Procedural sound for the invitation — synthesised live with the Web Audio
 * API. No audio files: nothing to license, nothing to download.
 *
 * TWO pieces of music, not one:
 *   - "opening"  (the sealed gates) — a slow harp piece: warm maj7/9 pad,
 *     an ascending harp sweep at the top of every bar and a short answering
 *     phrase — calm, ceremonial, wedding-invitation mood.
 *   - "inside"   (after the doors part) — a different piece: a brighter
 *     I–V–vi–IV loop with a composed music-box melody and a soft bass
 *     pulse, kept under the reading level.
 * `setScene()` crossfades from one piece to the other at the moment the
 * seal serves off.
 *
 * Plus the effects:
 *   - `serve()` — the whoosh + pop when the seal ball serves off the gates;
 *   - `paddleHit()` — the pickleball "pock", fired by the rally at contact.
 *
 * Browsers only allow audible playback after a user gesture. `boot()` tries
 * to start immediately (works when the browser already trusts the site) and
 * otherwise arms one-shot listeners so the very first tap / key press starts
 * the music — the opening screen's "tap to open" doubles as the unlock.
 */

type Scene = "opening" | "inside";

const STORAGE_KEY = "pnp-sound-muted";

/** MIDI note number → Hz. */
const HZ = (m: number) => 440 * 2 ** ((m - 69) / 12);

interface MotifNote {
  /** Seconds from the top of the bar. */
  t: number;
  /** MIDI note. */
  n: number;
  /** Velocity multiplier (default 1). */
  v?: number;
}

interface TrackDef {
  /** Seconds per chord bar. */
  bar: number;
  /** Chord crossfade (seconds, overlaps into the next bar). */
  fade: number;
  /** Music level for this piece (on the shared music gain). */
  level: number;
  /** Pad lowpass cutoff (Hz) — higher = brighter piece. */
  cutoff: number;
  /** Per-oscillator pad gain. */
  padGain: number;
  pluck: { type: OscillatorType; decay: number; level: number };
  /** Pad voicings (MIDI), one per bar, looped. */
  chords: number[][];
  /** Composed phrase per chord — same length as `chords`. */
  motifs: MotifNote[][];
  /** Optional soft bass pulses per chord. */
  bass?: Array<Array<{ t: number; n: number }>>;
}

/**
 * Piece one — the sealed gates. C major, dreamy: Cmaj9 → Fmaj9 → Am7 → G6,
 * a harp sweep up the chord at the top of each bar, a three-note answer in
 * the second half.
 */
const OPENING_TRACK: TrackDef = {
  bar: 7.2,
  fade: 2.8,
  level: 1,
  cutoff: 900,
  padGain: 0.045,
  pluck: { type: "triangle", decay: 1.9, level: 0.08 },
  chords: [
    [48, 55, 64, 71], // Cmaj9  (C3 G3 E4 B4)
    [41, 48, 57, 64, 67], // Fmaj9  (F2 C3 A3 E4 G4)
    [45, 52, 60, 67], // Am7    (A2 E3 C4 G4)
    [43, 50, 59, 64, 69], // G6add9 (G2 D3 B3 E4 A4)
  ],
  motifs: [
    // sweep…                                                …answer
    [{ t: 0, n: 72, v: 0.7 }, { t: 0.18, n: 76, v: 0.7 }, { t: 0.36, n: 79, v: 0.75 }, { t: 0.54, n: 83, v: 0.8 }, { t: 0.72, n: 86, v: 0.9 }, { t: 3.8, n: 79 }, { t: 4.6, n: 83 }, { t: 5.5, n: 84, v: 1.05 }],
    [{ t: 0, n: 72, v: 0.7 }, { t: 0.18, n: 77, v: 0.7 }, { t: 0.36, n: 81, v: 0.75 }, { t: 0.54, n: 84, v: 0.8 }, { t: 0.72, n: 88, v: 0.9 }, { t: 3.8, n: 81 }, { t: 4.6, n: 79 }, { t: 5.5, n: 77, v: 1.05 }],
    [{ t: 0, n: 72, v: 0.7 }, { t: 0.18, n: 76, v: 0.7 }, { t: 0.36, n: 79, v: 0.75 }, { t: 0.54, n: 81, v: 0.8 }, { t: 0.72, n: 84, v: 0.9 }, { t: 3.8, n: 76 }, { t: 4.6, n: 79 }, { t: 5.5, n: 81, v: 1.05 }],
    [{ t: 0, n: 71, v: 0.7 }, { t: 0.18, n: 74, v: 0.7 }, { t: 0.36, n: 79, v: 0.75 }, { t: 0.54, n: 81, v: 0.8 }, { t: 0.72, n: 86, v: 0.9 }, { t: 3.8, n: 83 }, { t: 4.6, n: 81 }, { t: 5.5, n: 79, v: 1.05 }],
  ],
};

/**
 * Piece two — inside, scrolling. Same key so the hand-over feels related,
 * but a different song: Cadd9 → G6 → Am7 → Fmaj9 (I–V–vi–IV), quicker
 * harmonic motion, a hummable music-box motif and a soft bass pulse.
 */
const INSIDE_TRACK: TrackDef = {
  bar: 4.8,
  fade: 1.6,
  level: 0.62,
  cutoff: 1250,
  padGain: 0.038,
  pluck: { type: "sine", decay: 1.2, level: 0.1 },
  chords: [
    [48, 55, 64, 67, 74], // Cadd9 (C3 G3 E4 G4 D5)
    [43, 55, 59, 64, 71], // G6    (G2 G3 B3 E4 B4)
    [45, 57, 60, 64, 72], // Am7   (A2 A3 C4 E4 C5)
    [41, 53, 57, 64, 72], // Fmaj9 (F2 F3 A3 E4 C5)
  ],
  motifs: [
    [{ t: 0, n: 76 }, { t: 0.55, n: 79 }, { t: 1.1, n: 81 }, { t: 1.65, n: 79 }, { t: 2.75, n: 84, v: 1.1 }, { t: 3.85, n: 79, v: 0.8 }],
    [{ t: 0, n: 74 }, { t: 0.55, n: 79 }, { t: 1.1, n: 81 }, { t: 1.65, n: 83 }, { t: 2.75, n: 86, v: 1.1 }, { t: 3.85, n: 83, v: 0.8 }],
    [{ t: 0, n: 72 }, { t: 0.55, n: 76 }, { t: 1.1, n: 79 }, { t: 1.65, n: 76 }, { t: 2.75, n: 81, v: 1.1 }, { t: 3.85, n: 76, v: 0.8 }],
    [{ t: 0, n: 72 }, { t: 0.55, n: 77 }, { t: 1.1, n: 79 }, { t: 1.65, n: 81 }, { t: 2.75, n: 84, v: 1.1 }, { t: 3.85, n: 81, v: 0.8 }],
  ],
  bass: [
    [{ t: 0, n: 36 }, { t: 2.4, n: 43 }],
    [{ t: 0, n: 43 }, { t: 2.4, n: 50 }],
    [{ t: 0, n: 45 }, { t: 2.4, n: 52 }],
    [{ t: 0, n: 41 }, { t: 2.4, n: 48 }],
  ],
};

const TRACKS: Record<Scene, TrackDef> = { opening: OPENING_TRACK, inside: INSIDE_TRACK };

/** One playing piece: its own pad / pluck buses so pieces can crossfade. */
interface Layer {
  out: GainNode;
  pad: BiquadFilterNode;
  pluck: GainNode;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private layer: Layer | null = null;
  private track: TrackDef = OPENING_TRACK;
  private noiseBuffer: AudioBuffer | null = null;

  private scene: Scene = "opening";
  private playing = false;
  private booted = false;
  private nextBarAt = 0;
  private chordIndex = 0;

  private mutedFlag =
    typeof window !== "undefined" && window.localStorage?.getItem(STORAGE_KEY) === "1";
  private listeners = new Set<() => void>();
  private unlockEvents = ["pointerdown", "touchend", "keydown", "click"] as const;
  private unlock = () => {
    if (!this.mutedFlag) this.start();
    if (this.playing) this.disarm();
  };

  /** Try to start straight away; otherwise the first gesture starts it. */
  boot(): void {
    if (this.booted || typeof window === "undefined") return;
    this.booted = true;
    if (!this.mutedFlag) this.start();
    this.arm();
  }

  get muted(): boolean {
    return this.mutedFlag;
  }

  setMuted(muted: boolean): void {
    if (muted === this.mutedFlag) return;
    this.mutedFlag = muted;
    try {
      window.localStorage?.setItem(STORAGE_KEY, muted ? "1" : "0");
    } catch {
      /* private mode — the toggle still works for this visit */
    }
    if (muted) void this.ctx?.suspend();
    else this.start(); // called from the toggle's click — a real gesture
    this.listeners.forEach((fn) => fn());
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  /** Switch pieces: "opening" plays piece one, "inside" piece two. */
  setScene(scene: Scene): void {
    if (scene === this.scene) return;
    this.scene = scene;
    const ctx = this.ctx;
    if (ctx && this.playing && this.musicGain) this.switchTrack(ctx);
  }

  /** The seal ball serving off the gates: a rising whoosh into a pop. */
  serve(): void {
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

  /* ---------------------------------------------------------------- */

  private arm(): void {
    this.unlockEvents.forEach((e) => window.addEventListener(e, this.unlock, { capture: true, passive: true }));
  }

  private disarm(): void {
    this.unlockEvents.forEach((e) => window.removeEventListener(e, this.unlock, { capture: true }));
  }

  /** The context, but only when it is actually allowed to make sound. */
  private running(): AudioContext | null {
    return this.ctx && this.ctx.state === "running" && !this.mutedFlag ? this.ctx : null;
  }

  private start(): void {
    if (this.mutedFlag) return;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
    }
    const ctx = this.ctx;
    void ctx.resume().then(() => {
      if (ctx.state === "running" && !this.mutedFlag) this.beginMusic(ctx);
    });
    if (ctx.state === "running") this.beginMusic(ctx);
  }

  private beginMusic(ctx: AudioContext): void {
    if (this.playing) return;
    this.playing = true;
    this.disarm();

    this.master = ctx.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(ctx.destination);

    this.track = TRACKS[this.scene];
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0; // fade the piece in from silence
    this.musicGain.gain.setTargetAtTime(this.track.level, ctx.currentTime, 1.5);
    this.musicGain.connect(this.master);

    this.layer = this.buildLayer(ctx, this.track);
    this.nextBarAt = ctx.currentTime + 0.05;
    this.chordIndex = 0;

    // The engine lives for the page's whole life — the scheduler is never
    // torn down. While muted the context is suspended, its clock freezes,
    // and the look-ahead loop schedules nothing.
    setInterval(() => this.tick(ctx), 300);
    this.tick(ctx);
  }

  /** Per-piece buses: pad through a warm lowpass, plucks with a touch of echo. */
  private buildLayer(ctx: AudioContext, track: TrackDef): Layer {
    const out = ctx.createGain();
    out.gain.value = 1;
    out.connect(this.musicGain!);

    const pad = ctx.createBiquadFilter();
    pad.type = "lowpass";
    pad.frequency.value = track.cutoff;
    pad.connect(out);

    const pluck = ctx.createGain();
    pluck.gain.value = 1;
    pluck.connect(out);
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.42;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.26;
    pluck.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(out);

    return { out, pad, pluck };
  }

  /** Crossfade to the current scene's piece, restarting it from its first bar. */
  private switchTrack(ctx: AudioContext): void {
    const t = ctx.currentTime;
    const old = this.layer;
    if (old) {
      // Let the old piece ring out underneath; drop the bus once it's silent.
      old.out.gain.setTargetAtTime(0.0001, t, 0.5);
      setTimeout(() => old.out.disconnect(), 4000);
    }

    this.track = TRACKS[this.scene];
    this.layer = this.buildLayer(ctx, this.track);
    this.layer.out.gain.setValueAtTime(0.0001, t);
    this.layer.out.gain.setTargetAtTime(1, t + 0.9, 0.9);
    this.nextBarAt = t + 1.1;
    this.chordIndex = 0;

    this.musicGain!.gain.setTargetAtTime(this.track.level, t, 0.8);
  }

  /** Look-ahead scheduler: keep the next bar of the current piece queued. */
  private tick(ctx: AudioContext): void {
    const horizon = ctx.currentTime + 0.8;
    while (this.nextBarAt < horizon) {
      const at = this.nextBarAt;
      const track = this.track;
      const layer = this.layer;
      if (!layer) return;
      const i = this.chordIndex % track.chords.length;
      this.scheduleChord(ctx, layer, track, at, track.chords[i]);
      for (const note of track.motifs[i]) this.schedulePluck(ctx, layer, track, at + note.t, note);
      for (const b of track.bass?.[i] ?? []) this.scheduleBass(ctx, layer, at + b.t, b.n);
      this.chordIndex += 1;
      this.nextBarAt += track.bar;
    }
  }

  private scheduleChord(ctx: AudioContext, layer: Layer, track: TrackDef, at: number, tones: ReadonlyArray<number>): void {
    const end = at + track.bar + track.fade; // overlap into the next bar
    for (const midi of tones) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = HZ(midi);
      osc.detune.value = Math.random() * 6 - 3;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(track.padGain, at + track.fade);
      gain.gain.setValueAtTime(track.padGain, end - track.fade);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain).connect(layer.pad);
      osc.start(at);
      osc.stop(end + 0.1);
    }
  }

  /** One melody note: fundamental + a quiet octave shimmer, quick attack, long ring. */
  private schedulePluck(ctx: AudioContext, layer: Layer, track: TrackDef, at: number, note: MotifNote): void {
    const level = track.pluck.level * (note.v ?? 1);
    const freq = HZ(note.n);
    const voices: Array<[OscillatorType, number, number]> = [
      [track.pluck.type, freq, level],
      ["sine", freq * 2, level * 0.28],
    ];
    for (const [type, f, peak] of voices) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = f;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(peak, at + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + track.pluck.decay);
      osc.connect(gain).connect(layer.pluck);
      osc.start(at);
      osc.stop(at + track.pluck.decay + 0.1);
    }
  }

  /** A soft, round bass pulse under piece two. */
  private scheduleBass(ctx: AudioContext, layer: Layer, at: number, midi: number): void {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = HZ(midi);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.09, at + 0.04);
    gain.gain.setValueAtTime(0.09, at + 1.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 2.1);
    osc.connect(gain).connect(layer.out);
    osc.start(at);
    osc.stop(at + 2.2);
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
