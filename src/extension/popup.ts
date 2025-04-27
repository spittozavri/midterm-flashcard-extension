import type { Flashcard } from './flashcard';
document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup DOM fully loaded.');
  
    const form = document.getElementById('flashcardForm') as HTMLFormElement | null;
    if (!form) {
      console.error('Form element not found!');
      return;
    }
  
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const frontInput = document.getElementById('front') as HTMLInputElement | null;
      const backInput = document.getElementById('back') as HTMLTextAreaElement | null;
      const hintInput = document.getElementById('hint') as HTMLInputElement | null;
      const tagsInput = document.getElementById('tags') as HTMLInputElement | null;
  
      if (!frontInput || !backInput) {
        alert('Both front and back fields are required.');
        return;
      }
  
      const front = frontInput.value.trim();
      const back = backInput.value.trim();
      const hint = hintInput?.value.trim();
      const tags = tagsInput?.value.trim()?.split(',').map(tag => tag.trim()) ?? [];
  
      const flashcard : Flashcard = {
        front,
        back,
        hint: hint || undefined,
        tags,
        sourceUrl: 'https://example.com',
        createdAt: new Date().toISOString(),
        difficulty: 'easy',
        bucket: 0,
        lastPracticed: new Date().toISOString(),
      };
  
      try {
        await chrome.runtime.sendMessage({ type: 'saveFlashcard', flashcard });
        alert('Flashcard saved!');
        window.close();
      } catch (error) {
        console.error('Failed to save flashcard:', error);
        alert('Failed to save flashcard.');
      }
    });
  });