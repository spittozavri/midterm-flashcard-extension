console.log('[Content Script] Loaded.');

// Remove any existing flashcard button when clicking outside
document.addEventListener('mousedown', (event: MouseEvent) => {
  const existingButton = document.querySelector('.flashcard-button');
  if (existingButton && !existingButton.contains(event.target as Node)) {
    existingButton.remove();
  }
});

document.addEventListener('mouseup', () => {
    // Remove any existing button first
    const existingButton = document.querySelector('.flashcard-button');
    if (existingButton) {
      existingButton.remove();
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }
  
    const selectedText = selection.toString().trim();
    if (!selectedText) {
      return;
    }
  
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
  
    const button = document.createElement('button');
    button.textContent = 'Save Flashcard';
    button.className = 'flashcard-button';
  
    // Position at bottom-right of selection
    button.style.position = 'fixed';  // Changed to fixed positioning
    button.style.top = `${rect.bottom + 8}px`;    // 8px below the bottom of selection
    button.style.left = `${rect.right - 100}px`;    // Approximate width of button
    button.style.zIndex = '10000';
  
    // Style
    button.style.padding = '8px 12px';
    button.style.fontSize = '14px';
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.boxShadow = '0px 2px 6px rgba(0, 0, 0, 0.2)';
  
    document.body.appendChild(button);
  
    button.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        type: 'createFlashcard',
        text: selectedText,
        sourceUrl: window.location.href
      });
  
      button.remove();
      selection.removeAllRanges();
    });
});
  