export class GameAudio {
  private context: AudioContext | undefined;
  muted = false;
  unlock() { this.context ??= new AudioContext(); void this.context.resume(); }
  play(kind: "jump" | "collect" | "damage" | "chest" | "victory") {
    if (this.muted || !this.context) return;
    const notes = { jump: [330, 660], collect: [660, 880, 1320], damage: [160, 100], chest: [440, 554, 660, 880], victory: [523, 659, 784, 1046, 784, 1046] }[kind];
    notes.forEach((frequency, i) => {
      const oscillator = this.context?.createOscillator(); const gain = this.context?.createGain();
      if (!oscillator || !gain || !this.context) return;
      const start = this.context.currentTime + i * .1;
      oscillator.type = kind === "damage" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.12, start + .01); gain.gain.exponentialRampToValueAtTime(.0001, start + .2);
      oscillator.connect(gain); gain.connect(this.context.destination); oscillator.start(start); oscillator.stop(start + .21);
    });
  }
}