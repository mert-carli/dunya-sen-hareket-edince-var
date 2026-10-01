import React, { createContext, useContext, useState, useCallback } from 'react';
import type { GameState, GamePhase } from './types';

interface GameContextValue {
  state: GameState;
  goToPhase: (phase: GamePhase) => void;
  collectFragment: (id: string) => void;
  addChapter1Choice: (choice: string) => void;
  growTree: (amount: number) => void;
  setWorldColor: (value: number) => void;
  toggleAudio: () => void;
}

const initialState: GameState = {
  phase: 'intro',
  worldColor: 0,
  collectedFragments: [],
  chapter1Choices: [],
  treeGrowth: 0,
  audioEnabled: true,
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(initialState);

  const goToPhase = useCallback((phase: GamePhase) => {
    setState(prev => ({ ...prev, phase }));
  }, []);

  const collectFragment = useCallback((id: string) => {
    setState(prev => {
      if (prev.collectedFragments.includes(id)) return prev;
      const fragments = [...prev.collectedFragments, id];
      const worldColor = Math.min(1, prev.worldColor + 0.2);
      return { ...prev, collectedFragments: fragments, worldColor };
    });
  }, []);

  const addChapter1Choice = useCallback((choice: string) => {
    setState(prev => ({
      ...prev,
      chapter1Choices: [...prev.chapter1Choices, choice],
    }));
  }, []);

  const growTree = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      treeGrowth: Math.min(1, prev.treeGrowth + amount),
      worldColor: Math.min(1, prev.worldColor + amount * 0.15),
    }));
  }, []);

  const setWorldColor = useCallback((value: number) => {
    setState(prev => ({ ...prev, worldColor: Math.min(1, Math.max(0, value)) }));
  }, []);

  const toggleAudio = useCallback(() => {
    setState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
  }, []);

  return (
    <GameContext.Provider value={{
      state,
      goToPhase,
      collectFragment,
      addChapter1Choice,
      growTree,
      setWorldColor,
      toggleAudio,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
