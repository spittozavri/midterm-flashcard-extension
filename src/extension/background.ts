import { saveFlashcards, loadFlashcards } from './storage';
import type { Flashcard } from './flashcard';

console.log('[Background] Running...');

type SaveFlashcardMessage = {
  type: 'saveFlashcard';
  flashcard: Flashcard;
};

type CreateFlashcardMessage = {
  type: 'createFlashcard';
  text: string;
};

type ExtensionMessage = SaveFlashcardMessage | CreateFlashcardMessage;

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    if (message.type === 'saveFlashcard') {
      console.log('[Background] Saving flashcard:', message.flashcard);

      loadFlashcards().then(existingCards => {
        existingCards.push(message.flashcard);
        saveFlashcards(existingCards);

        sendResponse({ success: true });
      }).catch(error => {
        console.error('[Background] Failed saving flashcard:', error);
        sendResponse({ success: false, error: String(error) });
      });

      return true; 
    }

    if (message.type === 'createFlashcard') {
      console.log('[Background] Creating flashcard from selected text:', message.text);

      // Save the selected text into chrome.storage.local first
      chrome.storage.local.set({ selectedText: message.text }).then(() => {
        // After saving, open the popup window
        chrome.windows.create({
          url: chrome.runtime.getURL('popup.html'),
          type: 'popup',
          width: 400,
          height: 600,
        });

        sendResponse({ success: true });
      }).catch(error => {
        console.error('[Background] Failed creating flashcard:', error);
        sendResponse({ success: false, error: String(error) });
      });

      return true; 
    }

    return false;
  }
);
