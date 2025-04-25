// flashcard.ts

export type Difficulty = 'easy' | 'hard' | 'wrong';

export interface Flashcard {
  front: string;
  back: string;
  tags?: string[];
  hint?: string;
  sourceUrl: string;
  createdAt: string;
  difficulty: Difficulty;
  bucket: number;
  lastPracticed: string;
}
