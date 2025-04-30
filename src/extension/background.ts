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

      return true;
    }

    if (message.type === 'createFlashcard') {
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

      return true;
    }

    return false;
  }
);

// 👇 Auto-open practice.html on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('practice.html'),
  });
});

// 👇 Clicking the extension icon also opens practice.html
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('practice.html'),
  });
});
