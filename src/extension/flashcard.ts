export interface Flashcard {
  front: string;
  back: string;
  hint?: string;
  tags: string[];
  sourceUrl: string;
  createdAt: string;
  difficulty: 'easy' | 'hard' | 'wrong';
  bucket: number;
  lastPracticedDay: number;
}
