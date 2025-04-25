# Flashcard Extension – Developer Specification

---

## 1\. Project Overview

Build a browser extension that allows users to:

* Highlight text online and create flashcards  
* Practice saved flashcards daily using hand gesture recognition (via webcam)  
* Automatically schedule cards using bucket-based spaced repetition  
* Save all data locally in localStorage  
* No backend server, no user authentication required

 The app emphasizes quick input, gesture-driven grading, and lightweight local persistence.  
---

## 2\. Functional Requirements

### 2.1 Flashcard Creation (Highlight \+ Popup)

* When a user highlights text, a floating button appears.  
* On button click:  
  * A popup form opens (no fields auto-filled).  
  * The user manually fills:  
    * Front (required): the question  
    * Back (required): the answer  
    * Hint (optional)  
    * Tags (optional)  
* Validation:  
  * Front: 5–100 characters  
  * Back: 10–500 characters  
  * Hint: Max 100 characters  
  * Tags: Max 5 tags, each ≤20 chars  
* Saving:  
  * Flashcard is serialized and added to localStorage  
  * Popup closes immediately (no feedback message)  
* Source URL and created timestamp are auto-attached.

---

### 2.2 Flashcard Storage

* All flashcards are stored in localStorage under key flashcards.  
* Each flashcard object:

interface Flashcard {  
  front: string;  
  back: string;  
  hint?: string;  
  tags?: string\[\];  
  sourceUrl: string;  
  createdAt: string;       // ISO string  
  difficulty: 'easy' | 'hard' | 'wrong';  
  bucket: number;           // starts at 0  
  lastPracticed: string;    // ISO string (YYYY-MM-DD)  
}

* Flashcards cannot be edited or deleted once created.

---

### 2.3 Practice Mode (Dedicated Page)

* Practice mode is separate from creation.  
* When user enters practice mode:  
  * App loads all saved flashcards  
  * Filters only cards due today based on bucket scheduling and current day  
* Daily Bucket Rules:  
  * Bucket 0: review every day  
  * Bucket 1: every 2 days  
  * Bucket 2: every 4 days  
  * General: review bucket i every 2^i days  
* End-of-Day:  
  * When all due cards are practiced:  
    * Show a “No more cards to practice today\!” screen  
    * Display a “Go to Next Day” button  
    * Clicking "Next Day" increments a stored currentDay counter

---

### 2.4 Gesture-Based Grading (Hand Pose Detection)

* After clicking Show Answer, app enters grading mode:  
  * Webcam activates  
  * User performs gesture:  
    * 👍 (Easy): Move up to bucket i+1  
    * ✋ (Hard): Move down to bucket i-1 (min 0\)  
    * 👎 (Wrong): Reset to bucket 0  
  * After gesture is detected:  
    * Update card bucket \+ lastPracticed  
    * Auto-advance to next card  
* No buttons are shown for grading — gestures only.  
* Small webcam feed is shown at top-right of the practice screen.

---

### 2.5 Day Tracking

* currentDay integer is stored in localStorage:  
  * Initialized at 1  
  * Incremented when the user clicks “Go to Next Day”  
* Real date is stored in flashcard metadata (createdAt, lastPracticed), but progression is based on currentDay, not real calendar date.

---

## 3\. Non-Functional Requirements

| Category | Requirement |
| :---- | :---- |
| Platform | Chrome extension (Manifest V3) |
| Performance | Instant UI updates, no network calls |
| Persistence | Use localStorage APIs |
| Scalability | No hard limit on number of flashcards |
| Security | Webcam permission only during practice mode |
| Privacy | No external communication or data sharing |

---

## 4\. Error Handling

| Case | Handling |
| :---- | :---- |
| User denies webcam permission | Show blocking message: "Webcam access is required for grading flashcards." |
| Highlighted text too short/long | Prevent card creation, show alert |
| Flashcard fields empty | Prevent save, show alert |
| Gesture not recognized within timeout (e.g., 10 sec) | Show prompt: "Please show a gesture clearly." Retry |

---

## 5\. Architecture & Code Organization

| Component | Responsibility |
| :---- | :---- |
| flashcard.ts | Flashcard class and validation logic |
| storage.ts | Saving/loading flashcards and day counter |
| popup.ts | Floating "Create Flashcard" UI on highlight |
| practice.ts | Loading cards, showing sessions, managing gestures |
| handpose.ts | TensorFlow.js integration for gesture detection |
| ui.ts | DOM manipulation helpers |

 Code should be modular, small files, easy imports.  
---

## 6\. Testing Plan

| Test | How |
| :---- | :---- |
| Flashcard validation | Unit tests (Jest or Vitest) |
| localStorage operations | Mock storage in unit tests |
| Popup flow | Manual testing in browser |
| Practice mode flow | Manual testing: practice due cards, next day |
| Hand gesture detection | Integration test: webcam permissions \+ gestures |
| End-to-end flow | Highlight text → create flashcard → practice mode → grade via gesture |

 Developer must build simple local test pages to simulate highlight, popup, and practice flows.  
---

#  Deliverables

* Chrome extension zipped for submission  
* GitHub repo with clean commit history  
* Completed spec.md, plan.md, todo.md  
* Minimal, professional UI  
* Working gesture-based grading flow

---

# Quick Summary

| Feature | Choice |
| :---- | :---- |
| Storage | localStorage |
| Practice mode | Separate page |
| Hand grading | Gestures only |
| Scheduling | Bucket-based, virtual day progression |
| Reset | Not allowed |
| No editing/deleting | Yes |
| Max flashcards | Unlimited |

