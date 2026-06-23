export function playBreakSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Two soft sine tones (a gentle "ding-dong" chime).
    const frequencies = [587.33, 880.0]; // D5, A5
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(1, now + 0.05 + index * 0.08);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2 + index * 0.1);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start(now + index * 0.12);
      osc.stop(now + 1.8);
    });

    // Clean up the audio context once the chime finishes.
    setTimeout(() => {
      void ctx.close();
    }, 2000);
  } catch {
    // Ignore audio playback errors (e.g., no audio device).
  }
}
