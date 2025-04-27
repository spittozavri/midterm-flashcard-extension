import { saveFlashcards, loadFlashcards } from './storage';
import type { Flashcard } from './flashcard';

console.log('Background running...');

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
  if (message.type === 'saveFlashcard') {
    const newCard: Flashcard = message.flashcard;
    console.log('Background received flashcard:', newCard);

    try {
      const existingCards = await loadFlashcards();
      existingCards.push(newCard);
      await saveFlashcards(existingCards);

      sendResponse({ success: true });
    } catch (error) {
      console.error('Failed to save flashcard:', error);
      sendResponse({ success: false, error: String(error) });
    }
  }

  return true;
});

