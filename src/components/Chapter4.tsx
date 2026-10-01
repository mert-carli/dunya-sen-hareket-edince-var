import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../GameContext';

const COLORS = [
  {
    id: 'blue',
    color: '#4A90D9',
    bg: 'rgba(74,144,217,0.12)',
    border: 'rgba(74,144,217,0.3)',
    emoji: '🔵',
    meaning: 'Güven',
    world: 'Gökyüzü maviye dönüşür.',
    delay: 0,
  },
  {
    id: 'pink',
    color: '#D9739A',
    bg: 'rgba(217,115,154,0.12)',
    border: 'rgba(217,115,154,0.3)',
    emoji: '🌸',
    meaning: 'Sevgi',
    world: 'Çiçekler açmaya başlar.',
    delay: 0.3,
  },
  {
    id: 'yellow',
    color: '#D4AF37',
    bg: 'rgba(212,175,55,0.12)',
    border: 'rgba(212,175,55,0.3)',
    emoji: '🌞',
    meaning: 'Mutluluk',
    world: 'Güneş tekrar doğar.',
    delay: 0.6,
  },
  {
    id: 'green',
    color: '#5DAB6F',
    bg: 'rgba(93,171,111,0.12)',
    border: 'rgba(93,171,111,0.3)',
    emoji: '🌿',
    meaning: 'Umut',
    world: 'Doğa yeniden canlanır.',
    delay: 0.9,
  },
];

function ColorOrb({
  color,
  isRevealed,
  onReveal,
}: {
  color: typeof COLORS[0];
  isRevealed: boolean;
  onReveal: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: color.delay + 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-4 cursor-pointer"
      onClick={() => !isRevealed && onReveal()}
    >
      <motion.div
        className="relative w-24 h-24 rounded-full flex items-center justify-center"
        animate={{
          boxShadow: isRevealed
            ? [`0 0 30px ${color.color}60`, `0 0 60px ${color.color}80`, `0 0 30px ${color.color}60`]
            : `0 0 10px ${color.color}20`,
          background: isRevealed ? color.bg : 'rgba(40,40,40,0.5)',
        }}
        transition={{ duration: 2, repeat: isRevealed ? Infinity : 0 }}
        whileHover={{ scale: 1.08, y: -4 }}
        style={{ border: `1px solid ${isRevealed ? color.border : 'rgba(255,255,255,0.08)'}` }}
      >
        <motion.span
          className="text-4xl"
          animate={isRevealed ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ filter: isRevealed ? 'none' : 'grayscale(1) brightness(0.4)' }}
        >
          {color.emoji}
        </motion.span>

        {/* Ripple when revealed */}
        {isRevealed && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `1px solid ${color.color}` }}
            animate={{ scale: [1, 1.5, 1.8], opacity: [0.8, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </motion.div>

      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p
              className="font-serif text-base mb-1"
              style={{ color: color.color, fontWeight: 400 }}
            >
              {color.meaning}
            </p>
            <p className="text-gray-500 text-xs">{color.world}</p>
          </motion.div>
        )}
        {!isRevealed && (
          <motion.p
            className="text-gray-600 text-xs tracking-wider"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Dokun
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Chapter4() {
  const { goToPhase, setWorldColor } = useGame();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [showContinue, setShowContinue] = useState(false);

  const handleReveal = (id: string) => {
    const next = new Set([...revealed, id]);
    setRevealed(next);
    setWorldColor(next.size / COLORS.length);

    if (next.size === COLORS.length) {
      setTimeout(() => setShowContinue(true), 1500);
    }
  };

  // Background shifts from dark grey to colorful as colors are revealed
  const colorProgress = revealed.size / COLORS.length;
  const bgBlue = Math.floor(colorProgress * 30);
  const bgGreen = Math.floor(colorProgress * 20);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000"
      style={{
        background: `radial-gradient(ellipse at top, rgba(${bgBlue},${bgBlue + 10},${30 + bgBlue * 2},0.8) 0%, rgba(${bgGreen},${50 + bgGreen},${80 + bgGreen},0.28) 48%, #040608 100%)`,
      }}
    >
      {/* Dynamic aurora-like background */}
      {revealed.size > 0 && (
        <div className="absolute inset-0 overflow-hidden">
          {COLORS.filter(c => revealed.has(c.id)).map((c, i) => (
            <motion.div
              key={c.id}
              className="absolute rounded-full"
              style={{
                width: '400px',
                height: '400px',
                left: `${15 + i * 20}%`,
                top: `${20 + (i % 2) * 30}%`,
                background: `radial-gradient(circle, ${c.color}18 0%, transparent 70%)`,
                filter: 'blur(60px)',
              }}
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -20, 30, 0],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* Chapter header */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs tracking-[0.35em] text-gray-500 uppercase mb-1">Bölüm IV</p>
        <p className="font-serif text-gray-300 text-lg" style={{ fontWeight: 300 }}>
          🎨 Renklerin Dönüşü
        </p>
      </motion.div>

      <div className="relative z-10 w-full max-w-2xl px-6">
        <motion.p
          className="text-center text-gray-500 text-sm tracking-wider mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Her renk bir değeri taşır. Hepsini geri getir.
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center mb-12">
          {COLORS.map(color => (
            <ColorOrb
              key={color.id}
              color={color}
              isRevealed={revealed.has(color.id)}
              onReveal={() => handleReveal(color.id)}
            />
          ))}
        </div>

        <AnimatePresence>
          {showContinue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <p
                className="font-serif text-xl md:text-2xl text-white/80 mb-8 leading-relaxed"
                style={{ fontWeight: 300 }}
              >
                Renkler geri döndü. Dünya yeniden nefes alıyor.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goToPhase('final')}
                className="px-10 py-3.5 rounded-full text-white/70 hover:text-white text-xs tracking-[0.2em] uppercase transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                Son Sahneye Git →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
