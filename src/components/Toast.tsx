import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Toast {
  id: string;
  message: string;
  sub?: string;
  color?: string;
  icon?: string;
}

let toastListeners: Array<(t: Toast) => void> = [];

export function showToast(toast: Omit<Toast, 'id'>) {
  const t: Toast = { ...toast, id: Math.random().toString(36).slice(2) };
  toastListeners.forEach(fn => fn(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id));
      }, 3500);
    };
    toastListeners.push(handler);
    return () => { toastListeners = toastListeners.filter(fn => fn !== handler); };
  }, []);

  return (
    <div className="fixed top-20 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[200px]"
            style={{
              background: 'rgba(10,12,20,0.85)',
              backdropFilter: 'blur(30px)',
              border: `1px solid ${t.color ? t.color + '40' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: `0 4px 30px ${t.color ? t.color + '20' : 'rgba(0,0,0,0.3)'}`,
            }}
          >
            {t.icon && <span className="text-xl">{t.icon}</span>}
            <div>
              <p className="text-sm text-white/90" style={{ color: t.color || 'white', fontWeight: 400 }}>
                {t.message}
              </p>
              {t.sub && <p className="text-xs text-gray-500 mt-0.5">{t.sub}</p>}
            </div>
            {/* Shimmer progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 rounded-full"
              style={{ background: t.color || 'rgba(255,255,255,0.4)' }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3.5, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Burst particle emitter — call with screen coordinates ─────────────────
interface BurstOptions {
  x: number;
  y: number;
  color?: string;
  count?: number;
}

interface BurstEvent extends BurstOptions {
  id: string;
}

let burstListeners: Array<(b: BurstEvent) => void> = [];

export function emitBurst(opts: BurstOptions) {
  const b: BurstEvent = { ...opts, id: Math.random().toString(36).slice(2) };
  burstListeners.forEach(fn => fn(b));
}

interface Particle {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
}

export function BurstLayer() {
  const [bursts, setBursts] = useState<Particle[]>([]);

  useEffect(() => {
    const handler = (b: BurstEvent) => {
      const count = b.count ?? 18;
      const particles: Particle[] = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 60 + Math.random() * 100;
        return {
          id: `${b.id}-${i}`,
          x: b.x,
          y: b.y,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          color: b.color ?? '#d4af37',
          size: 3 + Math.random() * 4,
        };
      });
      setBursts(prev => [...prev, ...particles]);
      setTimeout(() => {
        setBursts(prev => prev.filter(p => !particles.find(q => q.id === p.id)));
      }, 1000);
    };
    burstListeners.push(handler);
    return () => { burstListeners = burstListeners.filter(fn => fn !== handler); };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[99] overflow-hidden">
      <AnimatePresence>
        {bursts.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: p.x,
              top: p.y,
              background: p.color,
              boxShadow: `0 0 6px ${p.color}`,
              translateX: '-50%',
              translateY: '-50%',
            }}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 0,
              x: p.dx,
              y: p.dy,
            }}
            exit={{}}
            transition={{ duration: 0.8, ease: [0.2, 0, 0.8, 1] }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
