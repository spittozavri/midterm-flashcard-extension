import { loadFlashcards, saveFlashcards, loadCurrentDay, saveCurrentDay } from './storage';
import { initWebcam, loadHandposeModel, detectHands, stopWebcam } from './handpose.ts';
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

  document.getElementById('card-front')!.textContent = card.front;
  document.getElementById('card-back')!.textContent = card.back;
  document.getElementById('card-hint')!.textContent = card.hint || 'No hint';

  document.getElementById('card-front')!.style.display = 'block';
  document.getElementById('card-back')!.style.display = 'none';
  document.getElementById('card-hint')!.style.display = 'none';

  document.getElementById('progress-label')!.textContent = `Card ${index + 1} of ${sessionCards.length}`;
}

function setupUI() {
  const showBtn = document.getElementById('show-answer-btn')!;
  const hintBtn = document.getElementById('hint-btn')!;
  const nextBtn = document.getElementById('next-btn')!;
  const difficulty = document.getElementById('difficulty') as HTMLSelectElement;
  const initialActions = document.getElementById('initial-actions')!;
  const feedbackActions = document.getElementById('feedback-actions')!;
  const dayIndicator = document.getElementById('day-indicator')!;
  const endMessage = document.getElementById('end-message')!;
  const cardContainer = document.getElementById('flashcard-container')!;
  const nextDayBtn = document.getElementById('next-day-btn')!;
 

  dayIndicator.textContent = `Day ${currentDay}`;

  showBtn.addEventListener('click', async () => {
    document.getElementById('card-front')!.style.display = 'none';
    document.getElementById('card-back')!.style.display = 'block';
    initialActions.style.display = 'none';
    feedbackActions.style.display = 'flex';

    const webcam = await initWebcam();
    await loadHandposeModel();
    detectHands(webcam, (gesture) => {
      console.log('[Gesture] Detected:', gesture);
      // In future: automatically map gesture to difficulty and advance
    });
  });

  hintBtn.addEventListener('click', () => {
    document.getElementById('card-hint')!.style.display = 'block';
  });

  nextBtn.addEventListener('click', async () => {
    stopWebcam();

    const result = difficulty.value as 'easy' | 'hard' | 'wrong';
    const card = sessionCards[currentIndex];
    const updatedCard = updateBucket(card, result, currentDay);

    const allCards = await loadFlashcards();
    const idx = allCards.findIndex(c =>
      c.front === updatedCard.front &&
      c.back === updatedCard.back &&
      c.createdAt === updatedCard.createdAt
    );
    if (idx !== -1) {
      allCards[idx] = updatedCard;
      await saveFlashcards(allCards);
    }

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
  await initWebcam();
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
