import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider, useGame } from './GameContext';
import { ParticleBackground } from './components/ParticleBackground';
import { IntroScene } from './components/IntroScene';
import { Chapter1 } from './components/Chapter1';
import { Chapter2 } from './components/Chapter2';
import { Chapter3 } from './components/Chapter3';
import { Chapter4 } from './components/Chapter4';
import { FinalScene } from './components/FinalScene';
import { HUD } from './components/HUD';
import { ToastContainer, BurstLayer } from './components/Toast';

function GameRouter() {
  const { state } = useGame();
  const { phase, worldColor } = state;

  return (
    <div className="relative w-full h-full">
      {/* Global layers */}
      <ParticleBackground intensity={0.3 + worldColor * 0.7} />
      <BurstLayer />
      <ToastContainer />

      {/* HUD overlay */}
      <HUD />

      {/* Scene transitions */}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <SceneWrapper key="intro"><IntroScene /></SceneWrapper>
        )}
        {phase === 'chapter1' && (
          <SceneWrapper key="chapter1"><Chapter1 /></SceneWrapper>
        )}
        {phase === 'chapter2' && (
          <SceneWrapper key="chapter2"><Chapter2 /></SceneWrapper>
        )}
        {phase === 'chapter3' && (
          <SceneWrapper key="chapter3"><Chapter3 /></SceneWrapper>
        )}
        {phase === 'chapter4' && (
          <SceneWrapper key="chapter4"><Chapter4 /></SceneWrapper>
        )}
        {phase === 'final' && (
          <SceneWrapper key="final"><FinalScene /></SceneWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}

function SceneWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="fixed inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}

export default App;
