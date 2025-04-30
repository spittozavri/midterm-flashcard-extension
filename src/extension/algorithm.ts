import type { Flashcard } from './flashcard';

// Converts a list of cards to an array of bucket sets (0–5)
export function toBucketSets(cards: Flashcard[]): Set<Flashcard>[] {
  const buckets = Array.from({ length: 6 }, () => new Set<Flashcard>());
  for (const card of cards) {
    if (card.bucket >= 0 && card.bucket <= 5) {
      buckets[card.bucket].add(card);
    }
  }
  return buckets;
}

// Returns [min, max] range of non-empty buckets
export function getBucketRange(cards: Flashcard[]): [number, number] {
  const nonEmptyBuckets = new Set<number>();
  for (const card of cards) {
    if (card.bucket >= 0 && card.bucket <= 5) {
      nonEmptyBuckets.add(card.bucket);
    }
  }
  const sorted = Array.from(nonEmptyBuckets).sort((a, b) => a - b);
  return [sorted[0] ?? 0, sorted[sorted.length - 1] ?? 0];
}

// Returns cards due to be practiced today
export function practice(cards: Flashcard[], currentDay: number): Flashcard[] {
  return cards.filter(card => {
    const interval = Math.pow(2, card.bucket);
    return (currentDay - card.lastPracticedDay) >= interval;
  });
}

// Updates a card's bucket and metadata based on user result
export function update(card: Flashcard, result: 'easy' | 'hard' | 'wrong', currentDay: number): Flashcard {
  const MAX_BUCKET = 5;
  const updated = { ...card }; // avoid mutation

  if (result === 'easy') {
    updated.bucket = Math.min(updated.bucket + 1, MAX_BUCKET);
    updated.difficulty = 'easy';
  } else if (result === 'hard') {
    updated.bucket = Math.max(updated.bucket - 1, 0);
    updated.difficulty = 'hard';
  } else {
    updated.bucket = 0;
    updated.difficulty = 'wrong';
  }

  updated.lastPracticedDay = currentDay;
  return updated;
}

// Combines duplicate cards (same front + back)
export function deduplicate(cards: Flashcard[]): Flashcard[] {
  const map = new Map<string, Flashcard>();

  for (const card of cards) {
    const key = `${card.front.trim()}::${card.back.trim()}`;
    if (!map.has(key)) {
      map.set(key, card);
    }
  }

  return Array.from(map.values());
}
