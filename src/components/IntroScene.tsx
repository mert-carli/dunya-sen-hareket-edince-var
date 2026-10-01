import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../GameContext';

// Animated SVG Crystal component
function CrystalSVG({ cracked = true }: { cracked?: boolean }) {
  return (
    <svg
      viewBox="0 0 200 240"
      className="w-full h-full"
      style={{ filter: 'drop-shadow(0 0 30px rgba(150,180,220,0.4))' }}
    >
      {/* Main crystal body */}
      <defs>
        <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8d8ee" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#8ba7c7" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#4a6a8a" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="crackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#f0d060" stopOpacity="0.6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Crystal facets */}
      <polygon
        points="100,10 160,80 140,200 100,230 60,200 40,80"
        fill="url(#crystalGrad)"
        stroke="rgba(200,220,255,0.3)"
        strokeWidth="1"
      />
      <polygon
        points="100,10 160,80 100,120"
        fill="rgba(200,220,255,0.4)"
        stroke="rgba(200,220,255,0.2)"
        strokeWidth="0.5"
      />
      <polygon
        points="40,80 100,120 60,200"
        fill="rgba(100,140,180,0.5)"
        stroke="rgba(200,220,255,0.2)"
        strokeWidth="0.5"
      />
      <polygon
        points="160,80 100,120 140,200"
        fill="rgba(80,120,160,0.5)"
        stroke="rgba(200,220,255,0.2)"
        strokeWidth="0.5"
      />

      {/* Cracks with gold glow */}
      {cracked && (
        <g filter="url(#glow)" className="kintsugi-glow">
          <path
            d="M 100 80 L 85 110 L 95 140 L 78 170"
            stroke="url(#crackGrad)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 100 80 L 118 105 L 108 130 L 125 160"
            stroke="url(#crackGrad)"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 85 110 L 72 125"
            stroke="url(#crackGrad)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 108 130 L 120 145 L 115 158"
            stroke="url(#crackGrad)"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Inner light */}
      <ellipse
        cx="100"
        cy="120"
        rx="25"
        ry="35"
        fill="rgba(200,230,255,0.15)"
      />
    </svg>
  );
}

export function IntroScene() {
  const { goToPhase } = useGame();
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #0a0e1a 0%, #000 100%)' }}
    >
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 0.5,
              height: Math.random() * 2 + 0.5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: 2 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Crystal */}
      <motion.div
        className="relative z-10 w-40 h-48 mb-16 float"
        initial={{ opacity: 0, scale: 0.6, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 2.5, ease: 'easeOut', delay: 0.5 }}
      >
        <CrystalSVG cracked />
      </motion.div>

      {/* Text sequence */}
      <motion.div
        className="relative z-10 text-center px-8 max-w-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 2 }}
      >
        <motion.p
          className="font-serif text-2xl md:text-3xl text-gray-200 mb-6 leading-relaxed"
          style={{ fontWeight: 300, letterSpacing: '0.02em' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 2.5 }}
        >
          "Bazı şeyler kırıldığında eskisi gibi olmaz."
        </motion.p>

        <motion.p
          className="font-serif text-xl md:text-2xl text-gray-400 mb-16 leading-relaxed"
          style={{ fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.02em' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 5 }}
        >
          "Ama değer verilen şeyler yeniden inşa edilir."
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 7.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => goToPhase('chapter1')}
          className="glass px-12 py-4 rounded-full text-white/80 hover:text-white text-sm tracking-[0.2em] uppercase transition-all duration-500"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.15)',
            boxShadow: '0 0 30px rgba(150,180,220,0.15)',
            letterSpacing: '0.25em',
          }}
        >
          Başla
        </motion.button>
      </motion.div>

      {/* Subtle bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}
      />
    </div>
  );
}
