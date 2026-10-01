import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FINAL_LINES = [
  { text: 'Seni kırdığım an, dünyandaki renklerden birini azalttım.', delay: 8 },
  { text: 'Bunu değiştiremem.', delay: 12 },
  { text: 'Ama bundan sonra dünyanı tekrar güzelleştirmek için çabalamayı seçiyorum.', delay: 16 },
];

// Kintsugi crystal SVG — gold cracks are the feature, not the flaw
function KintsugiCrystal() {
  return (
    <svg
      viewBox="0 0 200 240"
      className="w-full h-full"
      style={{ filter: 'drop-shadow(0 0 40px rgba(212,175,55,0.4))' }}
    >
      <defs>
        <linearGradient id="healedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8d8ee" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#a0b8d0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#6080a0" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0d060" stopOpacity="1" />
          <stop offset="50%" stopColor="#d4af37" stopOpacity="1" />
          <stop offset="100%" stopColor="#b8960c" stopOpacity="1" />
        </linearGradient>
        <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="crystalGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Crystal body */}
      <polygon
        points="100,10 162,78 142,202 100,232 58,202 38,78"
        fill="url(#healedGrad)"
        filter="url(#crystalGlow)"
        stroke="rgba(200,220,255,0.4)"
        strokeWidth="1"
      />

      {/* Internal reflections */}
      <polygon
        points="100,10 162,78 100,118"
        fill="rgba(220,235,255,0.35)"
      />
      <polygon
        points="38,78 100,118 58,202"
        fill="rgba(100,140,180,0.4)"
      />
      <polygon
        points="162,78 100,118 142,202"
        fill="rgba(80,120,160,0.4)"
      />

      {/* GOLD KINTSUGI CRACKS — the healed beauty */}
      <g filter="url(#goldGlow)">
        <motion.path
          d="M 100 78 L 84 108 L 94 140 L 76 172"
          stroke="url(#goldGrad)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 1, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 100 78 L 119 103 L 106 132 L 126 162"
          stroke="url(#goldGrad)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 1.5, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 84 108 L 70 124"
          stroke="url(#goldGrad)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 2.5, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 106 132 L 122 148 L 116 162"
          stroke="url(#goldGrad)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 2.8, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 94 140 L 80 158"
          stroke="url(#goldGrad)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 3, ease: 'easeInOut' }}
        />
      </g>

      {/* Pulsing inner light through the cracks */}
      <motion.ellipse
        cx="100"
        cy="125"
        rx="20"
        ry="28"
        fill="rgba(212,175,55,0.15)"
        animate={{ rx: [18, 24, 18], ry: [25, 32, 25], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

export function FinalScene() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [showFinalLines, setShowFinalLines] = useState(false);
  const [visibleFinalLines, setVisibleFinalLines] = useState(0);
  const [showLastLine, setShowLastLine] = useState(false);

  useEffect(() => {
    // Show crystal messages
    const t1 = setTimeout(() => setVisibleMessages(1), 500);
    const t2 = setTimeout(() => setVisibleMessages(2), 3500);

    // Start final text sequence
    const tFinal = setTimeout(() => setShowFinalLines(true), 7500);
    const tf1 = setTimeout(() => setVisibleFinalLines(1), 8500);
    const tf2 = setTimeout(() => setVisibleFinalLines(2), 12500);
    const tf3 = setTimeout(() => setVisibleFinalLines(3), 16500);

    // Last line
    const tLast = setTimeout(() => setShowLastLine(true), 22500);

    return () => {
      [t1, t2, tFinal, tf1, tf2, tf3, tLast].forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #0c1018 0%, #020406 100%)',
      }}
    >
      {/* Gold aurora */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 70%)',
        }}
      />

      <AnimatePresence mode="wait">
        {!showFinalLines ? (
          /* Crystal + first messages */
          <motion.div
            key="crystal-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="relative z-10 flex flex-col items-center px-6 max-w-xl"
          >
            <motion.div
              className="w-44 h-52 mb-10 float"
              initial={{ opacity: 0, scale: 0.7, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            >
              <KintsugiCrystal />
            </motion.div>

            <AnimatePresence>
              {visibleMessages >= 1 && (
                <motion.p
                  key="m1"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2 }}
                  className="font-serif text-xl md:text-2xl text-white/80 text-center mb-4 leading-relaxed"
                  style={{ fontWeight: 300 }}
                >
                  "Bazı kırıklar tamamen kaybolmaz."
                </motion.p>
              )}
              {visibleMessages >= 2 && (
                <motion.p
                  key="m2"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2 }}
                  className="font-serif text-xl md:text-2xl text-white/60 text-center leading-relaxed"
                  style={{ fontWeight: 300, fontStyle: 'italic' }}
                >
                  "Ama doğru emekle daha güçlü bir şeye dönüşebilir."
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Final message sequence */
          <motion.div
            key="final-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="relative z-10 flex flex-col items-center px-6 max-w-2xl text-center gap-8"
          >
            {FINAL_LINES.slice(0, visibleFinalLines).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className={`font-serif leading-relaxed ${
                  i === 2
                    ? 'text-xl md:text-2xl text-white/80'
                    : i === 1
                    ? 'text-base md:text-lg text-gray-400'
                    : 'text-lg md:text-xl text-gray-300'
                }`}
                style={{ fontWeight: i === 2 ? 400 : 300 }}
              >
                {line.text}
              </motion.p>
            ))}

            <AnimatePresence>
              {showLastLine && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6"
                >
                  {/* Gold divider */}
                  <motion.div
                    className="h-px mb-8 mx-auto"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: '200px' }}
                    transition={{ duration: 1.5 }}
                  />

                  <p
                    className="font-serif text-2xl md:text-4xl"
                    style={{
                      fontWeight: 300,
                      background: 'linear-gradient(135deg, #f0d060, #d4af37, #b8960c)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '0.02em',
                    }}
                  >
                    "Çünkü sen benim için değerli birisin."
                  </p>

                  <motion.div
                    className="h-px mt-8 mx-auto"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: '200px' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />

                  {/* Restart option */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    onClick={() => window.location.reload()}
                    className="mt-12 text-xs tracking-[0.3em] text-gray-600 hover:text-gray-400 uppercase transition-all duration-300"
                    style={{ letterSpacing: '0.25em' }}
                  >
                    Yeniden Başla
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
