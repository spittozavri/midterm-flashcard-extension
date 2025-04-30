import { loadFlashcards, saveFlashcards, loadCurrentDay, saveCurrentDay } from './storage';
import { practice as getDueCards, update as updateCard } from './algorithm';
import type { Flashcard } from './flashcard';

let sessionCards: Flashcard[] = [];
let currentIndex = 0;
let currentDay = 1;

function displayCard(index: number) {
  const card = sessionCards[index];
  const front = document.getElementById('card-front')!;
  const back = document.getElementById('card-back')!;
  const hint = document.getElementById('card-hint')!;
  const progressLabel = document.getElementById('progress-label')!;

  front.textContent = card.front;
  back.textContent = card.back;
  hint.textContent = card.hint || 'No hint';

  front.style.display = 'block';
  back.style.display = 'none';
  hint.style.display = 'none';

  progressLabel.textContent = `Card ${index + 1} of ${sessionCards.length}`;
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

  showBtn.addEventListener('click', () => {
    document.getElementById('card-front')!.style.display = 'none';
    document.getElementById('card-back')!.style.display = 'block';
    initialActions.style.display = 'none';
    feedbackActions.style.display = 'flex';
  });

  hintBtn.addEventListener('click', () => {
    document.getElementById('card-hint')!.style.display = 'block';
  });

  nextBtn.addEventListener('click', async () => {
    const result = difficulty.value as 'easy' | 'hard' | 'wrong';
    const card = sessionCards[currentIndex];
    const updatedCard = updateCard(card, result, currentDay);

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
  currentDay = await loadCurrentDay();
  const allCards = await loadFlashcards();
  sessionCards = getDueCards(allCards, currentDay);

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
