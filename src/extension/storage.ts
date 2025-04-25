import type { Flashcard } from './flashcard';

const FLASHCARDS_KEY = 'flashcards';
const CURRENT_DAY_KEY = 'currentDay';

// Load flashcards from localStorage
export function loadFlashcards(): Flashcard[] {
  const data = localStorage.getItem(FLASHCARDS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse flashcards:', e);
    return [];
  }
}

// Save flashcards to localStorage
export function saveFlashcards(cards: Flashcard[]): void {
  localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
}

// Load current day (default = 1)
export function loadCurrentDay(): number {
  const stored = localStorage.getItem(CURRENT_DAY_KEY);
  return stored ? parseInt(stored) : 1;
}

// Save current day
export function saveCurrentDay(day: number): void {
  localStorage.setItem(CURRENT_DAY_KEY, day.toString());
}
