import { loadFlashcards, loadCurrentDay, saveCurrentDay } from './storage';
import type { Flashcard } from './flashcard';

let sessionCards: Flashcard[] = [];
let currentIndex = 0;
let currentDay = 1;

// Utility to get virtual day string
function getDateStringForDay(day: number): string {
  const baseDate = new Date('2023-01-01'); // arbitrary fixed start
  baseDate.setDate(baseDate.getDate() + day);
  return baseDate.toISOString().split('T')[0];
}

// Check if a card is due today
function isCardDue(card: Flashcard, day: number): boolean {
  const today = getDateStringForDay(day);
  return card.lastPracticed !== today;
}

// Display a card
function displayCard(index: number) {
  const card = sessionCards[index];

  const frontEl = document.getElementById('card-front')!;
  const backEl = document.getElementById('card-back')!;
  const hintEl = document.getElementById('card-hint')!;
  const tagsEl = document.getElementById('card-tags')!;

  frontEl.textContent = card.front;
  backEl.textContent = card.back;
  hintEl.textContent = card.hint || 'No hint';
  tagsEl.textContent = card.tags?.join(', ') || 'No tags';

  backEl.style.display = 'none';
}

// Setup listeners
function setupUI() {
  const showBtn = document.getElementById('show-btn')!;
  const nextBtn = document.getElementById('next-btn')!;
  const dayLabel = document.getElementById('day-label')!;
  const endMsg = document.getElementById('end-message')!;
  const cardContainer = document.getElementById('card-container')!;

  showBtn.addEventListener('click', () => {
    document.getElementById('card-back')!.style.display = 'block';
  });

  nextBtn.addEventListener('click', async () => {
    currentIndex++;
    if (currentIndex < sessionCards.length) {
      displayCard(currentIndex);
    } else {
      cardContainer.style.display = 'none';
      endMsg.style.display = 'block';
    }
  });

  document.getElementById('next-day-btn')!.addEventListener('click', async () => {
    currentDay++;
    await saveCurrentDay(currentDay);
    location.reload();
  });

  dayLabel!.textContent = `Day ${currentDay}`;
}

// Main
document.addEventListener('DOMContentLoaded', async () => {
  currentDay = await loadCurrentDay();
  const allCards = await loadFlashcards();
  sessionCards = allCards.filter(card => isCardDue(card, currentDay));

  setupUI();

  if (sessionCards.length > 0) {
    displayCard(0);
  } else {
    document.getElementById('card-container')!.style.display = 'none';
    document.getElementById('end-message')!.style.display = 'block';
  }
});
