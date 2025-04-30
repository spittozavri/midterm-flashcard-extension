import type { Flashcard } from './flashcard';
import { loadCurrentDay } from './storage';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Popup] DOM fully loaded.');

  const form = document.getElementById('flashcardForm') as HTMLFormElement | null;
  if (!form) {
    console.error('[Popup] Form element not found!');
    return;
  }

  try {
    const result = await chrome.storage.local.get('selectedText');
    const selectedText = result.selectedText;
    if (selectedText) {
      const backInput = document.getElementById('back') as HTMLTextAreaElement | null;
      if (backInput) {
        backInput.value = selectedText;
      }
    }
  } catch (error) {
    console.error('[Popup] Failed to get selected text:', error);
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const frontInput = document.getElementById('front') as HTMLInputElement;
    const backInput = document.getElementById('back') as HTMLTextAreaElement;
    const hintInput = document.getElementById('hint') as HTMLInputElement;
    const tagsInput = document.getElementById('tags') as HTMLInputElement;

    const front = frontInput?.value.trim();
    const back = backInput?.value.trim();
    const hint = hintInput?.value.trim();
    const tags = tagsInput?.value.trim().split(',').map(tag => tag.trim()).filter(Boolean) ?? [];

    if (!front || !back) {
      alert('Both Front and Back fields are required.');
      return;
    }

    const currentDay = await loadCurrentDay();

    const flashcard: Flashcard = {
      front,
      back,
      hint: hint || undefined,
      tags,
      sourceUrl: location.hostname,
      createdAt: new Date().toISOString(),
      difficulty: 'easy',
      bucket: 0,
      lastPracticedDay: currentDay
    };

    try {
      await chrome.runtime.sendMessage({ type: 'saveFlashcard', flashcard });
      await chrome.storage.local.remove('selectedText');
      alert('Flashcard saved!');
      window.close();
    } catch (error) {
      console.error('[Popup] Failed to save flashcard:', error);
      alert('Failed to save flashcard.');
    }
  });
});
