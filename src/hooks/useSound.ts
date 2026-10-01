import { useCallback, useRef } from 'react';

// All sounds generated via Web Audio API — no external files needed
export function useSound() {
  const ctx = useRef<AudioContext | null>(null);
  const enabled = useRef(true);

  const getCtx = () => {
    if (!ctx.current) {
      ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctx.current;
  };

  const setEnabled = useCallback((val: boolean) => {
    enabled.current = val;
  }, []);

  // Crystal collect — warm chime
  const playCollect = useCallback(() => {
    if (!enabled.current) return;
    try {
      const ac = getCtx();
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ac.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.start(t);
        osc.stop(t + 0.8);
      });
    } catch (_) {}
  }, []);

  // Soft click
  const playClick = useCallback(() => {
    if (!enabled.current) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
      osc.start();
      osc.stop(ac.currentTime + 0.15);
    } catch (_) {}
  }, []);

  // Tree growth — low soft thud
  const playGrow = useCallback(() => {
    if (!enabled.current) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);
      osc.start();
      osc.stop(ac.currentTime + 0.4);
    } catch (_) {}
  }, []);

  // Completion fanfare — ascending arp
  const playComplete = useCallback(() => {
    if (!enabled.current) return;
    try {
      const ac = getCtx();
      const freqs = [261.63, 329.63, 392, 523.25, 659.25, 783.99];
      freqs.forEach((freq, i) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t = ac.currentTime + i * 0.1;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.start(t);
        osc.stop(t + 1.2);
      });
    } catch (_) {}
  }, []);

  // Water drop — for tree nurturing
  const playDrop = useCallback(() => {
    if (!enabled.current) return;
    try {
      const ac = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
      osc.start();
      osc.stop(ac.currentTime + 0.1);
    } catch (_) {}
  }, []);

  return { playCollect, playClick, playGrow, playComplete, playDrop, setEnabled };
}
