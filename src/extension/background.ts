import { loadFlashcards, saveFlashcards } from './storage';
import type { Flashcard } from './flashcard';

console.log('[Background] Service Worker running.');

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

      loadFlashcards()
        .then(existing => {
          existing.push(message.flashcard);
          return saveFlashcards(existing);
        })
        .then(() => sendResponse({ success: true }))
        .catch(err => {
          console.error('[Background] Error saving flashcard:', err);
          sendResponse({ success: false, error: String(err) });
        });

      return true; // async response
    }

    if (message.type === 'createFlashcard') {
      console.log('[Background] Creating flashcard from selected text:', message.text);

      chrome.storage.local.set({ selectedText: message.text }).then(() => {
        chrome.windows.create({
          url: chrome.runtime.getURL('popup.html'),
          type: 'popup',
          width: 400,
          height: 600,
        });
        sendResponse({ success: true });
      }).catch(err => {
        console.error('[Background] Error creating flashcard:', err);
        sendResponse({ success: false, error: String(err) });
      });

      return true; // async response
    }

    return false; // unknown message
  }
);
