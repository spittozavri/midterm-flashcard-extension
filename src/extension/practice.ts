import { loadFlashcards, saveFlashcards, loadCurrentDay, saveCurrentDay } from './storage';
import type { Flashcard } from './flashcard';

let sessionCards: Flashcard[] = [];
let currentIndex = 0;
let currentDay = 1;

function isCardDue(card: Flashcard, currentDay: number): boolean {
  const interval = Math.pow(2, card.bucket);
  return (currentDay - card.lastPracticedDay) >= interval;
}

function updateBucket(card: Flashcard, result: 'easy' | 'hard' | 'wrong', currentDay: number): Flashcard {
  const MAX_BUCKET = 5;

  if (result === 'easy') {
    card.bucket = Math.min(card.bucket + 1, MAX_BUCKET);
    card.difficulty = 'easy';
  } else if (result === 'hard') {
    card.bucket = Math.max(card.bucket - 1, 0);
    card.difficulty = 'hard';
  } else {
    card.bucket = 0;
    card.difficulty = 'wrong';
  }

  card.lastPracticedDay = currentDay;
  return card;
}

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
  const showBtn = document.getElementById('show-answer-btn')!;
  const hintBtn = document.getElementById('hint-btn')!;
  const nextBtn = document.getElementById('next-btn')!;
  const dayLabel = document.getElementById('day-label')!;
  const endMsg = document.getElementById('end-message')!;
  const cardContainer = document.getElementById('card-container')!;

  showBtn.addEventListener('click', () => {
    document.getElementById('card-front')!.style.display = 'none';
    document.getElementById('card-back')!.style.display = 'block';
    document.getElementById('card-hint')!.style.display = 'block';
    initialActions.style.display = 'none';
    feedbackActions.style.display = 'flex';
  });

  hintBtn.addEventListener('click', () => {
    document.getElementById('card-hint')!.style.display = 'block';
  });

  nextBtn.addEventListener('click', async () => {
    currentIndex++;
    if (currentIndex < sessionCards.length) {
      displayCard(currentIndex);
      initialActions.style.display = 'flex';
      feedbackActions.style.display = 'none';
    } else {
      cardContainer.style.display = 'none';
      endMessage.style.display = 'block';
    }
  });

  nextDayBtn.addEventListener('click', async () => {
    currentDay++;
    await saveCurrentDay(currentDay);
    location.reload();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  currentDay = await loadCurrentDay();
  const allCards = await loadFlashcards();
  sessionCards = allCards.filter(card => isCardDue(card, currentDay));

  if (sessionCards.length > 0) {
    displayCard(0);
    setupUI();
  } else {
    document.getElementById('flashcard-container')!.style.display = 'none';
    document.getElementById('end-message')!.style.display = 'block';
    document.getElementById('next-day-btn')!.addEventListener('click', async () => {
      currentDay++;
      await saveCurrentDay(currentDay);
      location.reload();
    });
  }
});
