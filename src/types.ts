export type GamePhase =
  | 'intro'
  | 'chapter1'
  | 'chapter2'
  | 'chapter3'
  | 'chapter4'
  | 'final';

export interface GameState {
  phase: GamePhase;
  worldColor: number; // 0-1, grayscale to full color
  collectedFragments: string[];
  chapter1Choices: string[];
  treeGrowth: number; // 0-1
  audioEnabled: boolean;
}

export interface Crystal {
  id: string;
  name: string;
  nameTr: string;
  color: string;
  message: string;
  icon: string;
}

export const CRYSTALS: Crystal[] = [
  {
    id: 'patience',
    name: 'Patience',
    nameTr: 'Sabır',
    color: '#8BA7C7',
    message: 'Güven zaman ister.',
    icon: '⏳',
  },
  {
    id: 'openness',
    name: 'Openness',
    nameTr: 'Açıklık',
    color: '#B8A9C9',
    message: 'Saklanan şeyler mesafe oluşturur.',
    icon: '🚪',
  },
  {
    id: 'listening',
    name: 'Listening',
    nameTr: 'Dinlemek',
    color: '#A8C9B8',
    message: 'Anlamak için önce gerçekten dinlemek gerekir.',
    icon: '🎵',
  },
];

export const MIRROR_QUESTIONS = [
  {
    id: 'q1',
    question: 'Bir insanı kıran sadece yapılan şey midir?',
    options: ['Sadece yapılan şey', 'Niyet de önemlidir', 'Her ikisi de', 'Zamanla değişir'],
  },
  {
    id: 'q2',
    question: 'Özür dilemek mi, değişmek mi daha önemlidir?',
    options: ['Özür dilemek', 'Değişmek', 'İkisi birlikte anlam taşır', 'Duruma göre değişir'],
  },
  {
    id: 'q3',
    question: 'Kaybedilen güven nasıl geri kazanılır?',
    options: ['Zaman ile', 'Tutarlı davranışlarla', 'Açık konuşmakla', 'Emek ve sabırla'],
  },
];
