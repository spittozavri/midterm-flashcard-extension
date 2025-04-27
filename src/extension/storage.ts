import type { Flashcard } from './flashcard';

const FLASHCARDS_KEY = 'flashcards';
const CURRENT_DAY_KEY = 'currentDay';

export async function loadFlashcards(): Promise<Flashcard[]> {
  try {
    const result = await chrome.storage.local.get(FLASHCARDS_KEY);
    return result[FLASHCARDS_KEY] || [];
  } catch (error) {
    console.error('Failed to load flashcards:', error);
    return [];
  }
}

export async function saveFlashcards(cards: Flashcard[]): Promise<void> {
  try {
    await chrome.storage.local.set({ [FLASHCARDS_KEY]: cards });
  } catch (error) {
    console.error('Failed to save flashcards:', error);
  }
}

export async function loadCurrentDay(): Promise<number> {
  try {
    const result = await chrome.storage.local.get(CURRENT_DAY_KEY);
    return result[CURRENT_DAY_KEY] || 1;
  } catch (error) {
    console.error('Failed to load current day:', error);
    return 1;
  }
}

export async function saveCurrentDay(day: number): Promise<void> {
  try {
    await chrome.storage.local.set({ [CURRENT_DAY_KEY]: day });
  } catch (error) {
    console.error('Failed to save current day:', error);
  }
}
