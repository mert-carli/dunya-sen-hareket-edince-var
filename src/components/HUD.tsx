import { motion } from 'framer-motion';
import { useGame } from '../GameContext';
import type { GamePhase } from '../types';

const CHAPTERS: { phase: GamePhase; label: string; icon: string }[] = [
  { phase: 'chapter1', label: 'Fark Etmek', icon: '🪞' },
  { phase: 'chapter2', label: 'Kayıp Parçalar', icon: '🧩' },
  { phase: 'chapter3', label: 'Yeniden İnşa', icon: '🌱' },
  { phase: 'chapter4', label: 'Renklerin Dönüşü', icon: '🎨' },
];

const PHASE_ORDER: GamePhase[] = ['intro', 'chapter1', 'chapter2', 'chapter3', 'chapter4', 'final'];

export function HUD() {
  const { state, toggleAudio } = useGame();
  const { phase, audioEnabled } = state;

  if (phase === 'intro') return null;

  const currentIndex = PHASE_ORDER.indexOf(phase);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Top navigation */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p
            className="font-serif text-sm text-gray-500"
            style={{ fontWeight: 300, letterSpacing: '0.05em' }}
          >
            Kırık Işık
          </p>
          <p className="text-[10px] tracking-[0.3em] text-gray-700 uppercase mt-0.5">
            Fragments of Trust
          </p>
        </motion.div>

        {/* Audio toggle */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          onClick={toggleAudio}
          className="pointer-events-auto flex items-center gap-2 text-xs tracking-wider text-gray-600 hover:text-gray-400 transition-all duration-300 uppercase"
          style={{ letterSpacing: '0.15em' }}
        >
          <span>{audioEnabled ? '♪' : '♩'}</span>
          <span>{audioEnabled ? 'Ses Açık' : 'Ses Kapalı'}</span>
        </motion.button>
      </div>

      {/* Chapter progress — bottom center */}
      {phase !== 'final' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {CHAPTERS.map((ch, i) => {
            const chIndex = PHASE_ORDER.indexOf(ch.phase);
            const isCompleted = currentIndex > chIndex;
            const isCurrent = currentIndex === chIndex;

            return (
              <motion.div
                key={ch.phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-1.5"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    background: isCompleted
                      ? 'rgba(212,175,55,0.8)'
                      : isCurrent
                      ? 'rgba(150,180,220,0.8)'
                      : 'rgba(255,255,255,0.12)',
                    transform: isCurrent ? 'scale(1.5)' : 'scale(1)',
                    boxShadow: isCurrent ? '0 0 8px rgba(150,180,220,0.6)' : 'none',
                  }}
                />
                {i < CHAPTERS.length - 1 && (
                  <div
                    className="w-6 h-px"
                    style={{
                      background: isCompleted
                        ? 'rgba(212,175,55,0.4)'
                        : 'rgba(255,255,255,0.08)',
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* World color indicator — subtle top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden">
        <motion.div
          className="h-full"
          style={{
            background: 'linear-gradient(90deg, #4A90D9, #D9739A, #D4AF37, #5DAB6F)',
          }}
          animate={{ width: `${state.worldColor * 100}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
