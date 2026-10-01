import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useGame } from '../GameContext';
import { CRYSTALS } from '../types';
import type { Crystal } from '../types';
import { showToast, emitBurst } from './Toast';
import { useSound } from '../hooks/useSound';

// Random position that avoids center cluster
function randomPos() {
  const margin = 12;
  const zones = [
    // Four quadrants, roughly
    { xMin: margin, xMax: 38, yMin: margin + 10, yMax: 70 },
    { xMin: 62, xMax: 100 - margin, yMin: margin + 10, yMax: 70 },
    { xMin: 25, xMax: 50, yMin: 65, yMax: 90 },
    { xMin: 50, xMax: 75, yMin: 65, yMax: 90 },
    { xMin: margin, xMax: 35, yMin: 25, yMax: 55 },
    { xMin: 65, xMax: 100 - margin, yMin: 25, yMax: 55 },
  ];
  const zone = zones[Math.floor(Math.random() * zones.length)];
  return {
    x: zone.xMin + Math.random() * (zone.xMax - zone.xMin),
    y: zone.yMin + Math.random() * (zone.yMax - zone.yMin),
  };
}

interface FloatingFragment {
  crystal: Crystal;
  pos: { x: number; y: number };
  driftX: number;
  driftY: number;
  phase: number;
}

function FragmentOrb({
  frag,
  collected,
  onCollect,
}: {
  frag: FloatingFragment;
  collected: boolean;
  onCollect: (e: React.MouseEvent, frag: FloatingFragment) => void;
}) {
  const [hovered, setHovered] = useState(false);

  if (collected) return null;

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        left: `${frag.pos.x}%`,
        top: `${frag.pos.y}%`,
        translateX: '-50%',
        translateY: '-50%',
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, frag.driftY, 0],
        x: [0, frag.driftX, 0],
      }}
      transition={{
        opacity: { duration: 0.6 },
        scale: { duration: 0.6, type: 'spring', stiffness: 200 },
        y: { duration: 3 + frag.phase, repeat: Infinity, ease: 'easeInOut' },
        x: { duration: 4 + frag.phase, repeat: Infinity, ease: 'easeInOut' },
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={(e) => onCollect(e, frag)}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          margin: '-12px',
          border: `1px solid ${frag.crystal.color}`,
          opacity: hovered ? 0.5 : 0.15,
        }}
        animate={{ scale: hovered ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 1.5, repeat: hovered ? Infinity : 0 }}
      />

      {/* Pulsing search ring — always visible to hint location */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: '-20px',
          border: `1px solid ${frag.crystal.color}30`,
        }}
        animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: frag.phase * 0.4 }}
      />

      {/* Core orb */}
      <motion.div
        className="w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden"
        animate={{
          boxShadow: hovered
            ? `0 0 30px ${frag.crystal.color}80, 0 0 60px ${frag.crystal.color}40`
            : `0 0 12px ${frag.crystal.color}40`,
          scale: hovered ? 1.2 : 1,
          background: hovered
            ? `radial-gradient(circle, ${frag.crystal.color}60 0%, ${frag.crystal.color}20 70%)`
            : `radial-gradient(circle, ${frag.crystal.color}30 0%, ${frag.crystal.color}08 70%)`,
        }}
        transition={{ duration: 0.3 }}
        style={{ border: `1px solid ${frag.crystal.color}60` }}
      >
        <span className="text-xl z-10">{frag.crystal.icon}</span>

        {/* Inner shimmer */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${frag.crystal.color}40, transparent)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* Hover label */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: 'rgba(10,12,20,0.9)',
                border: `1px solid ${frag.crystal.color}40`,
                color: frag.crystal.color,
                backdropFilter: 'blur(20px)',
              }}
            >
              {frag.crystal.nameTr}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Custom cursor — glowing orb that follows mouse
function MagicCursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed pointer-events-none z-50 rounded-full"
      style={{
        width: 20,
        height: 20,
        left: springX,
        top: springY,
        translateX: '-50%',
        translateY: '-50%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.6) 0%, transparent 70%)',
        border: '1px solid rgba(212,175,55,0.4)',
        mixBlendMode: 'screen',
      }}
    />
  );
}

export function Chapter2() {
  const { collectFragment, state, goToPhase } = useGame();
  const { playCollect, playComplete } = useSound();
  const [showCompletion, setShowCompletion] = useState(false);
  const [hint, setHint] = useState(false);
  const [astronaut, setAstronaut] = useState({ x: 50, y: 62 });
  const [movement, setMovement] = useState({ up: false, down: false, left: false, right: false });

  const [fragments] = useState<FloatingFragment[]>(() =>
    CRYSTALS.map(c => ({
      crystal: c,
      pos: randomPos(),
      driftX: (Math.random() - 0.5) * 20,
      driftY: (Math.random() - 0.5) * 16,
      phase: Math.random() * 2,
    }))
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'w'].includes(key)) setMovement(prev => ({ ...prev, up: true }));
      if (['arrowdown', 's'].includes(key)) setMovement(prev => ({ ...prev, down: true }));
      if (['arrowleft', 'a'].includes(key)) setMovement(prev => ({ ...prev, left: true }));
      if (['arrowright', 'd'].includes(key)) setMovement(prev => ({ ...prev, right: true }));
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowup', 'w'].includes(key)) setMovement(prev => ({ ...prev, up: false }));
      if (['arrowdown', 's'].includes(key)) setMovement(prev => ({ ...prev, down: false }));
      if (['arrowleft', 'a'].includes(key)) setMovement(prev => ({ ...prev, left: false }));
      if (['arrowright', 'd'].includes(key)) setMovement(prev => ({ ...prev, right: false }));
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setAstronaut(prev => {
        let nextX = prev.x + (movement.right ? 0.8 : 0) - (movement.left ? 0.8 : 0);
        let nextY = prev.y + (movement.down ? 0.8 : 0) - (movement.up ? 0.8 : 0);

        nextX = Math.min(94, Math.max(6, nextX));
        nextY = Math.min(88, Math.max(16, nextY));

        return { x: nextX, y: nextY };
      });
    }, 30);

    return () => window.clearInterval(tick);
  }, [movement]);

  const handleCollect = useCallback((e: React.MouseEvent, frag: FloatingFragment) => {
    if (state.collectedFragments.includes(frag.crystal.id)) return;

    emitBurst({ x: e.clientX, y: e.clientY, color: frag.crystal.color, count: 24 });
    playCollect();

    showToast({
      message: `${frag.crystal.nameTr} Parçası Toplandı`,
      sub: frag.crystal.message,
      color: frag.crystal.color,
      icon: frag.crystal.icon,
    });

    collectFragment(frag.crystal.id);

    const newCount = state.collectedFragments.length + 1;
    if (newCount >= CRYSTALS.length) {
      setTimeout(() => {
        playComplete();
        setShowCompletion(true);
      }, 800);
    }
  }, [collectFragment, state.collectedFragments, playCollect, playComplete]);

  const collectNearbyFragment = useCallback((frag: FloatingFragment) => {
    if (state.collectedFragments.includes(frag.crystal.id)) return;

    const burstX = (astronaut.x / 100) * window.innerWidth;
    const burstY = (astronaut.y / 100) * window.innerHeight;

    emitBurst({ x: burstX, y: burstY, color: frag.crystal.color, count: 18 });
    playCollect();

    showToast({
      message: `${frag.crystal.nameTr} Parçası Toplandı`,
      sub: frag.crystal.message,
      color: frag.crystal.color,
      icon: frag.crystal.icon,
    });

    collectFragment(frag.crystal.id);
  }, [astronaut.x, astronaut.y, collectFragment, playCollect, state.collectedFragments]);

  const collected = state.collectedFragments;

  useEffect(() => {
    if (showCompletion) return;

    const nearby = fragments.find(frag => {
      if (state.collectedFragments.includes(frag.crystal.id)) return false;
      const dx = Math.abs(astronaut.x - frag.pos.x);
      const dy = Math.abs(astronaut.y - frag.pos.y);
      return dx < 7 && dy < 7;
    });

    if (nearby) {
      collectNearbyFragment(nearby);
    }
  }, [astronaut, collected, fragments, showCompletion, collectNearbyFragment]);

  const remaining = CRYSTALS.length - collected.length;

  const toggleHint = () => setHint(h => !h);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 60% 30%, #0e1525 0%, #050810 100%)', cursor: 'none' }}
    >
      <MagicCursor />

      {/* Atmospheric fog layers */}
      <div className="absolute inset-0 pointer-events-none">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: '600px',
              height: '400px',
              left: `${10 + i * 30}%`,
              top: `${20 + i * 15}%`,
              background: 'radial-gradient(ellipse, rgba(80,100,150,0.04) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
          />
        ))}
      </div>

      {/* Chapter header */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs tracking-[0.35em] text-gray-500 uppercase mb-1">Bölüm II</p>
        <p className="font-serif text-gray-300 text-lg" style={{ fontWeight: 300 }}>
          🧩 Kayıp Parçalar
        </p>
      </motion.div>

      {/* Counter + hint button — top right area, below HUD */}
      <motion.div
        className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {CRYSTALS.map(c => (
            <motion.div
              key={c.id}
              className="w-2 h-2 rounded-full"
              animate={{
                background: collected.includes(c.id) ? c.color : 'rgba(255,255,255,0.15)',
                scale: collected.includes(c.id) ? [1, 1.5, 1] : 1,
                boxShadow: collected.includes(c.id) ? `0 0 8px ${c.color}` : 'none',
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">
            {collected.length} / {CRYSTALS.length}
          </span>
        </div>

        <motion.button
          className="text-xs text-gray-600 hover:text-gray-400 px-3 py-2 rounded-full transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          onClick={toggleHint}
          whileTap={{ scale: 0.95 }}
        >
          {hint ? '🔆 İpucu Açık' : '💡 İpucu'}
        </motion.button>
      </motion.div>

      <motion.div
        className="absolute left-6 bottom-20 z-20 px-4 py-3 rounded-2xl text-[10px] tracking-[0.2em] uppercase"
        style={{
          background: 'rgba(15,20,32,0.7)',
          border: '1px solid rgba(140,180,220,0.18)',
          backdropFilter: 'blur(16px)',
          color: 'rgba(220,235,255,0.7)',
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        Uzay misyonu: WASD / OK tuşları ile astronotu yönlendir
      </motion.div>

      <motion.div
        className="absolute pointer-events-none z-20"
        style={{
          left: `${astronaut.x}%`,
          top: `${astronaut.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="relative flex flex-col items-center">
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-3 h-5 rounded-full"
            style={{ background: 'rgba(255,170,80,0.9)', filter: 'blur(2px)' }}
            animate={{ opacity: movement.left || movement.right || movement.up || movement.down ? [0.3, 1, 0.3] : 0.15 }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          <div className="w-11 h-11 rounded-full border border-sky-200/70 bg-gradient-to-b from-slate-100/95 to-slate-300/50 shadow-[0_0_25px_rgba(125,211,252,0.4)] relative">
            <div className="absolute inset-x-2 top-2 h-3 rounded-full bg-slate-900/80 border border-slate-500/60" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-sky-300/90 shadow-[0_0_10px_rgba(125,211,252,0.9)]" />
            <div className="absolute left-2 right-2 bottom-1.5 h-3 rounded-[999px] bg-slate-800/80 border border-slate-400/50" />
          </div>
          <div className="mt-1 flex gap-1">
            <div className="w-2 h-4 rounded-full bg-slate-200/80" />
            <div className="w-2 h-4 rounded-full bg-slate-200/80" />
          </div>
        </div>
      </motion.div>

      {/* Instruction */}
      <motion.p
        className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center text-gray-600 text-xs tracking-wider whitespace-nowrap z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: remaining > 0 ? 1 : 0 }}
        transition={{ delay: 1 }}
      >
        Kristalin parçalarını bul ve topla — {remaining} parça kaldı
      </motion.p>

      {/* Floating fragments */}
      <AnimatePresence>
        {!showCompletion && fragments.map(frag => (
          <motion.div
            key={frag.crystal.id}
            style={{ position: 'absolute', inset: 0 }}
            animate={hint ? { filter: 'brightness(1.5)' } : { filter: 'brightness(1)' }}
          >
            <FragmentOrb
              frag={frag}
              collected={collected.includes(frag.crystal.id)}
              onCollect={handleCollect}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Completion overlay */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            key="completion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-20"
            style={{ background: 'radial-gradient(ellipse at center, rgba(10,14,25,0.95) 0%, rgba(5,8,16,0.98) 100%)' }}
          >
            {/* Multi-color glow */}
            <div className="absolute inset-0 pointer-events-none">
              {CRYSTALS.map((c, i) => (
                <motion.div
                  key={c.id}
                  className="absolute rounded-full"
                  style={{
                    width: '300px', height: '300px',
                    left: `${25 + i * 25}%`,
                    top: '30%',
                    background: `radial-gradient(circle, ${c.color}20 0%, transparent 70%)`,
                    filter: 'blur(40px)',
                  }}
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="relative z-10 text-center px-6 max-w-xl"
            >
              {/* Collected icons */}
              <div className="flex justify-center gap-6 mb-10">
                {CRYSTALS.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.15, type: 'spring', stiffness: 300 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                      style={{
                        background: `radial-gradient(circle, ${c.color}30 0%, ${c.color}08 70%)`,
                        border: `1px solid ${c.color}60`,
                        boxShadow: `0 0 20px ${c.color}40`,
                      }}
                    >
                      {c.icon}
                    </div>
                    <p className="text-xs" style={{ color: c.color }}>{c.nameTr}</p>
                  </motion.div>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="font-serif text-2xl md:text-3xl text-white/90 mb-4 leading-relaxed"
                style={{ fontWeight: 300 }}
              >
                "Tüm parçalar bulundu."
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-gray-500 text-sm mb-10 tracking-wider"
              >
                Sabır. Açıklık. Dinlemek.
              </motion.p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goToPhase('chapter3')}
                className="px-10 py-3.5 rounded-full text-white/70 hover:text-white text-xs tracking-[0.2em] uppercase transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                Devam Et →
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
