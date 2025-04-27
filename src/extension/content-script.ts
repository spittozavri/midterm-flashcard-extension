console.log('[Content Script] Loaded.');

let selectedText = '';

function createFlashcardButton(textToSave: string, rect: DOMRect) {
  console.log('[Content Script] Creating flashcard button with text:', textToSave);
  
  const flashcardButton = document.createElement('button');
  flashcardButton.textContent = 'Save Flashcard';
  flashcardButton.className = 'flashcard-button';

  flashcardButton.style.position = 'fixed';
  flashcardButton.style.top = `${rect.bottom + window.scrollY + 8}px`; // Fixed: Added window.scrollY
  flashcardButton.style.left = `${rect.left + window.scrollX}px`; // Fixed: Changed to start at left and added scrollX
  flashcardButton.style.zIndex = '10000';
  flashcardButton.style.padding = '8px 12px';
  flashcardButton.style.fontSize = '14px';
  flashcardButton.style.backgroundColor = '#007bff';
  flashcardButton.style.color = 'white';
  flashcardButton.style.border = 'none';
  flashcardButton.style.borderRadius = '4px';
  flashcardButton.style.cursor = 'pointer';
  flashcardButton.style.boxShadow = '0px 2px 6px rgba(0, 0, 0, 0.2)';
  flashcardButton.style.opacity = '0';
  flashcardButton.style.transition = 'opacity 0.3s ease';

  document.body.appendChild(flashcardButton);
  console.log('[Content Script] Button added to DOM');

  flashcardButton.getBoundingClientRect();
  
  requestAnimationFrame(() => {
    flashcardButton.style.opacity = '1';
  });

  flashcardButton.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent event bubbling
    console.log('[Content Script] Button clicked!');
    console.log('[Content Script] Selected text:', textToSave);

    chrome.runtime.sendMessage({
      type: 'createFlashcard',
      text: textToSave
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Content Script] Error sending message:', chrome.runtime.lastError.message);
      } else {
        console.log('[Content Script] Message acknowledged:', response);
      }
    });

    flashcardButton.remove();
    window.getSelection()?.removeAllRanges();
  });
  
  return flashcardButton; 
}

document.addEventListener('mouseup', (e) => {
  if ((e.target as Element).closest('.flashcard-button')) {
    return;
  }
  
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    return;
  }

  selectedText = selection.toString().trim();
  console.log('[Content Script] Selected text:', selectedText);
  
  if (!selectedText) {
    return;
  }

  const existingButton = document.querySelector('.flashcard-button');
  if (existingButton) {
    console.log('[Content Script] Removing existing button');
    existingButton.remove();
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  createFlashcardButton(selectedText, rect);
});

// Clean up if clicking elsewhere
document.addEventListener('mousedown', (event) => {
  const button = document.querySelector('.flashcard-button');
  if (button && !(event.target as Element).closest('.flashcard-button')) {
    console.log('[Content Script] Clicked outside, removing button');
    button.remove(); // Removed the setTimeout
  }
});