import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../GameContext';
import { showToast, emitBurst } from './Toast';
import { useSound } from '../hooks/useSound';

const GROWTH_STAGES = [
  { label: 'Tohum', threshold: 0 },
  { label: 'Filiz', threshold: 0.2 },
  { label: 'Fidan', threshold: 0.45 },
  { label: 'Ağaç', threshold: 0.7 },
  { label: 'Meşe', threshold: 0.9 },
];

const MESSAGES = [
  'Güven zaman ister.',
  'Her küçük adım sayılır.',
  'Sabırla büyür.',
  'Tutarlılık güven inşa eder.',
  'Varlığın bazen kelimelerden güçlüdür.',
  'Dürüstlük güvenin temelidir.',
  'Dinlemek anlamaktır.',
  'Değişim kararla değil emekle olur.',
];

interface WaterDrop {
  id: string;
  x: number;
  y: number;
  targetY: number;
}

interface Ripple {
  id: string;
  x: number;
  y: number;
}

// SVG tree that grows with nice branches + leaves
function GrowingTree({ growth }: { growth: number }) {
  const trunkH = Math.max(4, growth * 120);
  const branchScale = Math.max(0, (growth - 0.3) / 0.7);
  const leafOpacity = Math.max(0, (growth - 0.15) / 0.85);

  // Color transitions: grey → dark green → bright green → gold tips
  const r = Math.round(60 + growth * 40);
  const g = Math.round(80 + growth * 120);
  const b = Math.round(40 + growth * 20);
  const trunkColor = `rgb(${Math.round(100 + growth * 30)},${Math.round(70 + growth * 20)},${Math.round(40 + growth * 10)})`;
  const leafColor = growth < 0.1 ? 'rgba(80,80,80,0.6)' : `rgba(${r},${g},${b},${0.5 + growth * 0.5})`;
  const glowColor = `rgba(${r},${g},${b},${growth * 0.4})`;

  return (
    <svg viewBox="0 0 200 220" className="w-full h-full" style={{ filter: `drop-shadow(0 0 ${growth * 20}px ${glowColor})` }}>
      <defs>
        <radialGradient id="leafRG" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={leafColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={leafColor} stopOpacity="0.3" />
        </radialGradient>
        <filter id="leafBlur">
          <feGaussianBlur stdDeviation="1.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Root hints */}
      {growth > 0.05 && (
        <g opacity={Math.min(1, growth * 3)}>
          <path d={`M 100 218 Q 78 212 68 220`} stroke={trunkColor} strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d={`M 100 218 Q 122 214 132 220`} stroke={trunkColor} strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" />
          <path d={`M 100 218 Q 88 225 80 218`} stroke={trunkColor} strokeWidth="1.5" fill="none" opacity="0.25" strokeLinecap="round" />
        </g>
      )}

      {/* Main trunk */}
      <motion.rect
        x={96} y={218 - trunkH} width={8} height={trunkH}
        fill={trunkColor} rx={4}
        animate={{ height: trunkH, y: 218 - trunkH }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />

      {/* Branches */}
      {branchScale > 0 && (
        <g opacity={branchScale}>
          {/* Left branch */}
          <path
            d={`M 100 ${218 - trunkH * 0.55} Q ${100 - 28 * branchScale} ${218 - trunkH * 0.68} ${100 - 38 * branchScale} ${218 - trunkH * 0.72}`}
            stroke={trunkColor} strokeWidth={3 * branchScale} fill="none" strokeLinecap="round"
          />
          {/* Right branch */}
          <path
            d={`M 100 ${218 - trunkH * 0.55} Q ${100 + 28 * branchScale} ${218 - trunkH * 0.68} ${100 + 38 * branchScale} ${218 - trunkH * 0.72}`}
            stroke={trunkColor} strokeWidth={3 * branchScale} fill="none" strokeLinecap="round"
          />
          {/* Upper left */}
          <path
            d={`M 100 ${218 - trunkH * 0.72} Q ${100 - 18 * branchScale} ${218 - trunkH * 0.82} ${100 - 24 * branchScale} ${218 - trunkH * 0.85}`}
            stroke={trunkColor} strokeWidth={2 * branchScale} fill="none" strokeLinecap="round"
          />
          {/* Upper right */}
          <path
            d={`M 100 ${218 - trunkH * 0.72} Q ${100 + 18 * branchScale} ${218 - trunkH * 0.82} ${100 + 24 * branchScale} ${218 - trunkH * 0.85}`}
            stroke={trunkColor} strokeWidth={2 * branchScale} fill="none" strokeLinecap="round"
          />
        </g>
      )}

      {/* Leaf canopy — layered ellipses */}
      {leafOpacity > 0 && (
        <g opacity={leafOpacity} filter="url(#leafBlur)">
          <ellipse cx={100} cy={218 - trunkH - 18 * growth} rx={35 * growth} ry={28 * growth}
            fill="url(#leafRG)" />
          <ellipse cx={100 - 22 * branchScale} cy={218 - trunkH * 0.75}
            rx={22 * branchScale} ry={17 * branchScale} fill={leafColor} opacity={0.7} />
          <ellipse cx={100 + 22 * branchScale} cy={218 - trunkH * 0.75}
            rx={22 * branchScale} ry={17 * branchScale} fill={leafColor} opacity={0.7} />
          <ellipse cx={100 - 12 * branchScale} cy={218 - trunkH * 0.9}
            rx={14 * branchScale} ry={11 * branchScale} fill={leafColor} opacity={0.6} />
          <ellipse cx={100 + 12 * branchScale} cy={218 - trunkH * 0.9}
            rx={14 * branchScale} ry={11 * branchScale} fill={leafColor} opacity={0.6} />
        </g>
      )}

      {/* Seed */}
      {growth < 0.08 && (
        <motion.ellipse cx={100} cy={216} rx={7} ry={4}
          fill="rgba(140,110,80,0.9)"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </svg>
  );
}

export function Chapter3() {
  const { growTree, state, goToPhase } = useGame();
  const { playDrop, playGrow, playComplete } = useSound();

  const [drops, setDrops] = useState<WaterDrop[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [streak, setStreak] = useState(0);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const streakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const growth = state.treeGrowth;
  const stageIndex = GROWTH_STAGES.findLastIndex(s => growth >= s.threshold);
  const stage = GROWTH_STAGES[Math.min(stageIndex, GROWTH_STAGES.length - 1)];
  const prevStage = useRef(stage.label);

  // Detect stage change → toast + burst
  useEffect(() => {
    if (stage.label !== prevStage.current && stage.label !== 'Tohum') {
      showToast({
        message: `${stage.label} aşamasına ulaştı! 🌿`,
        sub: 'Ağaç büyüyor...',
        color: '#5DAB6F',
        icon: '🌱',
      });
      prevStage.current = stage.label;
    }
  }, [stage.label]);

  const handleTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (showCompletion) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cx = e.clientX;
    const cy = e.clientY;

    // Water drop
    const dropId = Math.random().toString(36).slice(2);
    const targetY = rect.bottom - 40;
    setDrops(prev => [...prev, { id: dropId, x: cx, y: cy, targetY }]);
    setTimeout(() => setDrops(prev => prev.filter(d => d.id !== dropId)), 800);

    // Ripple at ground
    const rippleId = Math.random().toString(36).slice(2);
    setRipples(prev => [...prev, { id: rippleId, x: cx, y: targetY }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== rippleId)), 1000);

    // Sounds
    playDrop();
    setTimeout(() => playGrow(), 300);

    // Growth
    const base = 0.04;
    const streakBonus = Math.min(streak * 0.005, 0.02);
    growTree(base + streakBonus);

    // Streak
    setTapCount(t => t + 1);
    setStreak(s => s + 1);
    if (streakTimer.current) clearTimeout(streakTimer.current);
    streakTimer.current = setTimeout(() => setStreak(0), 2500);

    // Floating message
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setLastMessage(msg);

    // Burst at tree center if high growth
    if (growth > 0.5) {
      emitBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.3, color: '#5DAB6F', count: 10 });
    }

    // Check completion
    if (growth + base + streakBonus >= 1 && !showCompletion) {
      setTimeout(() => {
        playComplete();
        emitBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height * 0.3, color: '#D4AF37', count: 40 });
        setShowCompletion(true);
      }, 600);
    }
  }, [growth, growTree, streak, showCompletion, playDrop, playGrow, playComplete]);

  const progressPct = Math.min(100, growth * 100);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: `radial-gradient(ellipse at bottom, rgba(${10 + growth * 15},${15 + growth * 25},${10 + growth * 10},1) 0%, #040608 100%)`,
        cursor: showCompletion ? 'default' : 'crosshair',
      }}
      onClick={!showCompletion ? handleTap : undefined}
    >
      {/* Ground glow */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        animate={{
          background: `radial-gradient(ellipse at center, rgba(${40 + growth * 40},${80 + growth * 80},${30 + growth * 30},${growth * 0.2}) 0%, transparent 70%)`,
        }}
        transition={{ duration: 1.5 }}
      />

      {/* Chapter header */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs tracking-[0.35em] text-gray-500 uppercase mb-1">Bölüm III</p>
        <p className="font-serif text-gray-300 text-lg" style={{ fontWeight: 300 }}>🌱 Yeniden İnşa</p>
      </motion.div>

      {/* Tap instruction */}
      {!showCompletion && (
        <motion.p
          className="absolute top-24 left-1/2 -translate-x-1/2 text-xs text-gray-600 tracking-wider pointer-events-none"
          animate={{ opacity: tapCount > 3 ? 0 : [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: tapCount > 3 ? 0 : Infinity }}
        >
          Ağacı beslemek için ekrana dokun
        </motion.p>
      )}

      {/* Streak badge */}
      <AnimatePresence>
        {streak >= 3 && !showCompletion && (
          <motion.div
            key="streak"
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-32 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full z-10 pointer-events-none"
            style={{
              background: 'rgba(212,175,55,0.15)',
              border: '1px solid rgba(212,175,55,0.4)',
              boxShadow: '0 0 20px rgba(212,175,55,0.3)',
            }}
          >
            <span className="text-sm">🔥</span>
            <span className="text-xs text-yellow-300 tracking-widest font-medium">×{streak} STREAK</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Water drops */}
      <AnimatePresence>
        {drops.map(drop => (
          <motion.div
            key={drop.id}
            className="fixed pointer-events-none z-30 rounded-full"
            style={{
              width: 8, height: 12,
              left: drop.x - 4, top: drop.y,
              background: 'rgba(100,180,255,0.7)',
              boxShadow: '0 0 6px rgba(100,180,255,0.5)',
            }}
            initial={{ opacity: 0.9, y: 0 }}
            animate={{ opacity: 0, y: drop.targetY - drop.y }}
            transition={{ duration: 0.6, ease: 'easeIn' }}
          />
        ))}
      </AnimatePresence>

      {/* Ground ripples */}
      <AnimatePresence>
        {ripples.map(r => (
          <motion.div
            key={r.id}
            className="fixed pointer-events-none z-30 rounded-full border"
            style={{
              borderColor: 'rgba(100,200,100,0.5)',
              left: r.x, top: r.y,
              translateX: '-50%', translateY: '-50%',
            }}
            initial={{ width: 10, height: 10, opacity: 0.8 }}
            animate={{ width: 60, height: 60, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Tree */}
      <AnimatePresence mode="wait">
        {!showCompletion && (
          <motion.div
            key="tree"
            className="relative z-10 w-40 h-52 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <GrowingTree growth={growth} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage label */}
      {!showCompletion && (
        <motion.div
          className="relative z-10 flex items-center gap-3 mt-2 mb-4 pointer-events-none"
          key={stage.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-px w-6 bg-gray-700" />
          <span className="text-xs tracking-[0.3em] text-gray-500 uppercase">{stage.label}</span>
          <div className="h-px w-6 bg-gray-700" />
        </motion.div>
      )}

      {/* Progress bar */}
      {!showCompletion && (
        <div
          className="relative z-10 w-52 h-1 rounded-full overflow-hidden mb-6 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #2d5a2d, #5DAB6F, #8fd68f)' }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Floating wisdom message */}
      <AnimatePresence>
        {lastMessage && !showCompletion && (
          <motion.p
            key={lastMessage + Math.random()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 font-serif text-center text-gray-500 text-sm pointer-events-none whitespace-nowrap"
            style={{ fontStyle: 'italic' }}
          >
            "{lastMessage}"
          </motion.p>
        )}
      </AnimatePresence>

      {/* COMPLETION */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-40"
            style={{ background: 'rgba(4,6,8,0.85)', backdropFilter: 'blur(20px)' }}
          >
            {/* Full-grown tree */}
            <motion.div
              className="w-48 h-60 mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 150, delay: 0.2 }}
            >
              <GrowingTree growth={1} />
            </motion.div>

            <motion.p
              className="font-serif text-2xl md:text-3xl text-white/90 mb-3 leading-relaxed text-center"
              style={{ fontWeight: 300 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              "Güven büyük sözlerle değil,"
            </motion.p>
            <motion.p
              className="font-serif text-2xl md:text-3xl text-white/70 mb-10 leading-relaxed text-center"
              style={{ fontWeight: 300, fontStyle: 'italic' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              "küçük ama sürekli davranışlarla büyür."
            </motion.p>

            <motion.div
              className="text-sm text-gray-500 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {tapCount} dokunuş ile büyüttün 🌿
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => goToPhase('chapter4')}
              className="px-10 py-3.5 rounded-full text-white/70 hover:text-white text-xs tracking-[0.2em] uppercase transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              Devam Et →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
