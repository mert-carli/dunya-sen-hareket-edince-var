import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../GameContext';
import { MIRROR_QUESTIONS } from '../types';
import { showToast, emitBurst } from './Toast';
import { useSound } from '../hooks/useSound';

function useTypewriter(text: string, speed = 38) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayed, done };
}

function MirrorCard({
  question,
  options,
  onChoice,
  index,
}: {
  question: string;
  options: string[];
  onChoice: (choice: string, e: React.MouseEvent) => void;
  index: number;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const { displayed, done } = useTypewriter(question, 38);

  const handleChoice = (opt: string, e: React.MouseEvent) => {
    if (chosen) return;
    setChosen(opt);
    onChoice(opt, e);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* Card */}
      <div
        className="relative rounded-3xl w-full"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 60px rgba(0,0,0,0.5), 0 0 80px rgba(150,170,220,0.05), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        {/* Top shimmer line */}
        <div
          className="absolute top-0 left-8 right-8 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }}
        />

        <div className="p-8 md:p-12">
          {/* Question number */}
          <p className="text-[10px] tracking-[0.4em] text-gray-600 mb-8 uppercase">
            Soru {index + 1} &nbsp;/&nbsp; {MIRROR_QUESTIONS.length}
          </p>

          {/* Typewriter question — fixed min-height so card doesn't jump */}
          <div className="mb-10" style={{ minHeight: '5rem' }}>
            <h2
              className="font-serif text-2xl md:text-3xl leading-[1.5] text-white/90"
              style={{ fontWeight: 300, letterSpacing: '0.01em' }}
            >
              {displayed}
              {!done && (
                <motion.span
                  className="inline-block w-px h-6 bg-white/40 ml-1 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                />
              )}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((opt, i) => (
              <motion.button
                key={opt}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: done ? 1 : 0, x: done ? 0 : 16 }}
                transition={{ delay: done ? i * 0.08 : 0, duration: 0.4 }}
                whileHover={!chosen ? { x: 6 } : {}}
                whileTap={!chosen ? { scale: 0.99 } : {}}
                onClick={(e) => handleChoice(opt, e)}
                disabled={!!chosen}
                className="w-full text-left px-6 py-4 rounded-2xl transition-all duration-250 relative overflow-hidden group"
                style={{
                  background: chosen === opt
                    ? 'rgba(150,180,220,0.16)'
                    : 'rgba(255,255,255,0.04)',
                  border: chosen === opt
                    ? '1px solid rgba(150,180,220,0.45)'
                    : '1px solid rgba(255,255,255,0.07)',
                  cursor: chosen ? 'default' : 'pointer',
                }}
              >
                {/* Hover fill */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ background: 'rgba(150,180,220,0.06)' }}
                />

                {/* Selection sweep */}
                {chosen === opt && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{ background: 'rgba(150,180,220,0.08)', transformOrigin: 'left' }}
                    transition={{ duration: 0.35 }}
                  />
                )}

                <span
                  className="relative z-10 text-sm leading-relaxed"
                  style={{
                    color: chosen === opt ? 'rgba(180,210,255,0.9)' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {opt}
                </span>

                {/* Selected check */}
                {chosen === opt && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-300 text-xs"
                  >
                    ✦
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-8 text-[10px] text-gray-700 text-center tracking-[0.25em] uppercase">
            Doğru ya da yanlış yok — sadece düşün
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function Chapter1() {
  const { addChapter1Choice, goToPhase, setWorldColor } = useGame();
  const { playClick, playComplete } = useSound();
  const [currentQ, setCurrentQ] = useState(0);
  const [done, setDone] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const handleChoice = (choice: string, e: React.MouseEvent) => {
    playClick();
    emitBurst({ x: e.clientX, y: e.clientY, color: 'rgba(150,180,220,0.9)', count: 12 });
    addChapter1Choice(choice);

    if (currentQ < MIRROR_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(q => q + 1), 650);
    } else {
      setTimeout(() => {
        setDone(true);
        setWorldColor(0.15);
        playComplete();
        showToast({
          message: 'Ayna temizlendi',
          sub: 'Değişim, önce kendini görmekle başlar.',
          color: '#8ba7c7',
          icon: '🪞',
        });
        setTimeout(() => setShowMessage(true), 800);
      }, 650);
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 30% 40%, #0d1220 0%, #050810 100%)' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(100,130,180,0.07) 0%, transparent 70%)' }}
      />

      {/* Floating mirror dust particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${8 + i * 12}%`,
            top: `${12 + (i % 4) * 18}%`,
            width: i % 2 === 0 ? 2 : 1.5,
            height: i % 2 === 0 ? 2 : 1.5,
            background: 'rgba(150,180,220,0.7)',
            boxShadow: '0 0 6px rgba(150,180,220,0.9)',
          }}
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 3 + i * 0.6, repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      {/* Chapter header */}
      <motion.div
        className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-[10px] tracking-[0.4em] text-gray-600 uppercase mb-1">Bölüm I</p>
        <p className="font-serif text-gray-300 text-lg" style={{ fontWeight: 300 }}>🪞 Fark Etmek</p>
      </motion.div>

      {/* Card container — responsive, properly padded */}
      <div className="relative z-10 w-full px-4 sm:px-8" style={{ maxWidth: '680px' }}>
        <AnimatePresence mode="wait">
          {!done ? (
            <MirrorCard
              key={currentQ}
              question={MIRROR_QUESTIONS[currentQ].question}
              options={MIRROR_QUESTIONS[currentQ].options}
              onChoice={handleChoice}
              index={currentQ}
            />
          ) : (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <motion.div
                className="w-28 h-28 mx-auto mb-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(150,180,220,0.2) 0%, rgba(150,180,220,0.04) 100%)',
                  border: '1px solid rgba(150,180,220,0.25)',
                }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(150,180,220,0.1)',
                    '0 0 60px rgba(150,180,220,0.35)',
                    '0 0 20px rgba(150,180,220,0.1)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-5xl">🪞</span>
              </motion.div>

              {showMessage && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                  <p
                    className="font-serif text-2xl md:text-3xl text-white/90 mb-4 leading-relaxed"
                    style={{ fontWeight: 300 }}
                  >
                    "Değişim, önce kendini görmekle başlar."
                  </p>
                  <p className="text-gray-600 text-sm mb-12 tracking-wider">
                    Bir ayna temizlendi. Dünya biraz aydınlandı.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => goToPhase('chapter2')}
                    className="px-10 py-3.5 rounded-full text-white/70 hover:text-white text-xs tracking-[0.2em] uppercase transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    Devam Et →
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      {!done && (
        <div className="absolute bottom-8 flex items-center gap-2">
          {MIRROR_QUESTIONS.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full transition-all duration-400"
              animate={{
                width: i === currentQ ? 28 : 6,
                background: i < currentQ
                  ? 'rgba(150,180,220,0.7)'
                  : i === currentQ
                  ? 'rgba(150,180,220,1)'
                  : 'rgba(255,255,255,0.12)',
              }}
              style={{ height: 6 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
