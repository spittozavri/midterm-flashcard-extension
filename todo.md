# Flashcard Extension \- TODO List

This list breaks down the development tasks based on the project specification and the phased plan. Each item should be checked off upon completion.

## Phase 1: Foundation & Core Data (Iteration 1\)

* Project Setup:  
  * Initialize Git repository.  
  * Set up basic Chrome Extension Manifest V3 structure (manifest.json).  
  * Create empty Service Worker file (background.js or similar).  
  * Create basic placeholder popup.html.  
*   
* Data Structures:  
  * Define Flashcard interface in flashcard.ts according to spec.  
*   
* Storage Module:  
  * Create storage.ts.  
  * Implement saveFlashcards(cards) function (writes to localStorage\['flashcards'\]).  
  * Implement loadFlashcards() function (reads from localStorage\['flashcards'\], handles empty/invalid data).  
  * Implement saveCurrentDay(day) function (writes to localStorage\['currentDay'\]).  
  * Implement loadCurrentDay() function (reads from localStorage\['currentDay'\], defaults to 1 if not found).  
*   
* Unit Testing (Storage):  
  * Set up testing environment (Jest/Vitest).  
  * Write unit tests for storage.ts functions, mocking localStorage.  
*   
* Initial Testing:  
  * Create a simple test script/page to manually call storage functions and verify basic save/load operations.  
* 

## Phase 2: Basic Card Creation (Iteration 2\)

* Popup UI:  
  * Create popup.html with form fields: Front (textarea), Back (textarea), Hint (input), Tags (input).  
  * Add a "Save Flashcard" button to popup.html.  
*   
* Popup Logic (  
  * Add event listener to the Save button.  
  * On save, read values from form fields.  
  * Create a basic Flashcard object (temporarily hardcode/default difficulty, bucket, lastPracticed, sourceUrl, createdAt).  
  * Send a message (e.g., { type: 'saveCard', payload: cardData }) to the Service Worker.  
*   
* Service Worker (Background Script):  
  * Add listener for messages from the popup.  
  * On 'saveCard' message:  
    * Use storage.ts to load existing cards.  
    * Add the new card to the list.  
    * Use storage.ts to save the updated card list.  
    * Close the popup window/view.  
  *   
*   
* Content Script (  
  * Create content.js.  
  * Implement text selection detection (document.addEventListener('mouseup', ...)).  
  * On text selection, display a floating "Create Flashcard" button near the selection (initial simple placement is fine).  
  * Add event listener to the button. On click, send a message (e.g., { type: 'createFlashcard' }) to the Service Worker.  
*   
* Manifest Configuration:  
  * Add activeTab and scripting permissions to manifest.json.  
  * Configure content\_scripts in manifest.json to inject content.js (e.g., on \<all\_urls\>).  
  * Configure the Service Worker (background.service\_worker).  
  * Configure the popup action or mechanism (e.g., chrome.windows.create).  
*   
* Service Worker (Popup Handling):  
  * Add listener for 'createFlashcard' message from content script.  
  * On message, open popup.html (e.g., using chrome.windows.create).  
* 

## Phase 3: Basic Practice Page & Display (Iteration 3\)

* Practice Page UI (  
  * Create practice.html.  
  * Add basic HTML structure to display card front (e.g., \<div id="card-front"\>).  
  * Add structure for card back (e.g., \<div id="card-back" style="display: none;"\>), hint, and tags.  
  * Add a "Show Answer" button.  
  * Add a temporary "Next Card" button.  
*   
* Practice Page Logic (  
  * On page load (DOMContentLoaded):  
    * Use storage.ts to load all flashcards.  
    * Store loaded cards in a local array (e.g., sessionCards).  
    * Initialize current card index (e.g., currentIndex \= 0).  
  *   
  * Implement displayCard(index) function:  
    * Update \#card-front with sessionCards\[index\].front.  
    * Update \#card-back content (initially hidden).  
    * Hide \#card-back.  
    * Show \#card-front.  
  *   
  * Display the first card (displayCard(0)).  
  * Add event listener to "Show Answer" button: Reveal \#card-back.  
  * Add event listener to "Next Card" button: Increment currentIndex, call displayCard, handle reaching the end of sessionCards.  
* 

## Phase 4: Spaced Repetition Logic & Filtering (Iteration 4\)

* Spaced Repetition Logic (  
  * Implement getDateStringForDay(dayNumber) utility (maps virtual day to 'YYYY-MM-DD').  
  * Implement isCardDue(card, currentDay) function based on bucket, lastPracticed, currentDay, and getDateStringForDay.  
  * Write unit tests for isCardDue and getDateStringForDay.  
*   
* Practice Page Logic (  
  * On page load:  
    * Load currentDay using storage.ts.  
    * Load all flashcards using storage.ts.  
    * Filter the loaded flashcards using isCardDue to get only cards due today. Store these in sessionCards.  
  *   
  * Handle the case where sessionCards is empty after filtering:  
    * Display "No cards due today" message.  
    * Hide card display elements and buttons.  
  *   
* 

## Phase 5: Input Validation & Creation Polish (Iteration 5\)

* Validation Logic (  
  * Implement validation functions/methods for Front (5-100 chars), Back (10-500 chars), Hint (max 100 chars), Tags (max 5 tags, each \<= 20 chars).  
  * Write unit tests for validation logic.  
*   
* Popup Logic (  
  * Before sending 'saveCard' message, call validation logic.  
  * If validation fails, show alerts (alert(...)) to the user and prevent saving.  
  * Populate sourceUrl (get current tab URL via chrome.tabs.query).  
  * Populate createdAt (new Date().toISOString()).  
  * Set default difficulty: 'easy', bucket: 0\.  
  * Populate lastPracticed using getDateStringForDay(currentDay) (requires fetching currentDay or having it passed). Refinement: Pass currentDay from background to popup or have popup request it. Simpler: Set lastPracticed to the date derived from currentDay when the card is first saved.  
*   
* Content Script UI:  
  * Refine positioning of the "Create Flashcard" button to appear closer to the highlighted text (use window.getSelection() range methods if possible).  
* 

## Phase 6: Webcam & Basic Handpose Setup (Iteration 6\)

* Dependencies:  
  * Add TensorFlow.js (@tensorflow/tfjs) and Handpose (@tensorflow-models/handpose) libraries to the project (e.g., via CDN in practice.html or npm/bundler).  
*   
* Handpose Module (  
  * Create handpose.ts.  
  * Implement initHandpose():  
    * Load the Handpose model.  
    * Request webcam access (navigator.mediaDevices.getUserMedia).  
    * Return the video stream on success, handle errors/denial.  
  *   
*   
* Practice Page UI (  
  * Add a \<video\> element (small, muted, autoplay) for the webcam feed (e.g., top-right corner). Give it an ID.  
  * Add an area to display error messages (e.g., webcam permission denied).  
*   
* Practice Page Logic (  
  * When "Show Answer" is clicked:  
    * Call initHandpose().  
    * On success, set the video element's srcObject to the stream.  
    * On error (permission denied), display the blocking message: "Webcam access is required for grading flashcards." and prevent further grading steps.  
  *   
*   
* Handpose Module (  
  * Implement startDetection(videoElement, callback):  
    * Start a prediction loop (requestAnimationFrame or setInterval).  
    * In the loop, get hand pose predictions from the videoElement.  
    * Pass raw landmarks predictions to the callback function.  
  *   
  * Implement stopDetection() to cancel the prediction loop.  
*   
* Practice Page Logic (  
  * After webcam stream is set up, call startDetection, passing the video element and a callback function.  
  * The initial callback should just log the raw prediction data to the console.  
  * Call stopDetection() when moving to the next card or ending the session.  
* 

## Phase 7: Gesture Recognition & Mapping (Iteration 7\)

* Gesture Logic (  
  * Implement mapLandmarksToGesture(landmarks) function:  
    * Analyze landmark positions/angles to detect 👍 ('thumbs\_up'), ✋ ('open\_palm'), 👎 ('thumbs\_down').  
    * Return the detected gesture string or 'unknown'/null.  
  *   
  * Modify startDetection:  
    * Call mapLandmarksToGesture on predictions.  
    * Implement consistency check (e.g., require same gesture for N frames).  
    * Implement 10-second timeout: if no gesture recognized, call back with 'timeout'.  
    * Only call the main callback with a confirmed gesture string ('thumbs\_up', 'open\_palm', 'thumbs\_down') or 'timeout'.  
  *   
*   
* Practice Page Logic (  
  * Update the callback passed to startDetection to expect gesture strings ('thumbs\_up', 'open\_palm', 'thumbs\_down', 'timeout') or null. Log these recognized gestures.  
* 

## Phase 8: Gesture-Based Grading (Iteration 8\)

* Practice Page UI (  
  * Remove the temporary "Next Card" button.  
  * Add an element to display gesture feedback (e.g., "Please show a gesture clearly.").  
*   
* Practice Page Logic (  
  * In the startDetection callback:  
    * If gesture is 'thumbs\_up':  
      * Update card: difficulty \= 'easy', bucket \= min(bucket \+ 1, MAX\_BUCKET), lastPracticed \= getDateStringForDay(currentDay).  
      * Save updated card using storage.ts.  
      * Call stopDetection().  
      * Advance to the next card.  
    *   
    * If gesture is 'open\_palm':  
      * Update card: difficulty \= 'hard', bucket \= max(0, bucket \- 1), lastPracticed \= getDateStringForDay(currentDay).  
      * Save updated card using storage.ts.  
      * Call stopDetection().  
      * Advance to the next card.  
    *   
    * If gesture is 'thumbs\_down':  
      * Update card: difficulty \= 'wrong', bucket \= 0, lastPracticed \= getDateStringForDay(currentDay).  
      * Save updated card using storage.ts.  
      * Call stopDetection().  
      * Advance to the next card.  
    *   
    * If gesture is 'timeout':  
      * Display "Please show a gesture clearly." prompt.  
      * Optionally reset the timeout timer within startDetection or just let detection continue.  
    *   
  *   
  * Refine advanceToNextCard logic to handle moving to the next due card in sessionCards.  
  * Ensure webcam/detection stops correctly after the last card is graded.  
* 

## Phase 9: End of Day & Day Progression (Iteration 9\)

* Practice Page Logic (  
  * When advanceToNextCard finds no more cards in sessionCards (i.e., after grading the last due card):  
    * Hide card display area and webcam feed/video element.  
    * Display "No more cards to practice today\!" message.  
    * Show a "Go to Next Day" button.  
  *   
  * Add event listener to "Go to Next Day" button:  
    * Increment currentDay (load current, increment, save using storage.ts).  
    * Reload the practice page (location.reload()) or re-run the initial setup logic (load day, load cards, filter, display first card or "no cards" message).  
  *   
* 

## Phase 10: Final Polish, Error Handling & Testing (Iteration 10\)

* Error Handling:  
  * Implement robust error handling for localStorage operations (e.g., quota exceeded, although unlikely).  
  * Ensure all specified error messages (webcam denial, gesture timeout, validation alerts) are implemented clearly.  
*   
* UI/UX Refinements:  
  * Apply basic CSS styling for a clean, professional look (popup, practice page, highlight button).  
  * Ensure webcam feed placement is unobtrusive.  
  * Ensure highlight button doesn't overlap critical page elements.  
*   
* Code Organization:  
  * Create ui.ts for DOM manipulation helpers if needed, refactor existing code.  
  * Ensure code is modular and follows spec structure (flashcard.ts, storage.ts, popup.ts, practice.ts, handpose.ts, content.js).  
*   
* Manifest Finalization:  
  * Add necessary icons (16, 48, 128).  
  * Set appropriate extension name and description.  
  * Set version number.  
*   
* Testing:  
  * Complete any remaining unit tests (validation, isCardDue, etc.).  
  * Perform thorough manual End-to-End testing:  
    * Highlight \-\> Create \-\> Save flow.  
    * Practice flow: Load due cards, show answer, grade (Easy 👍, Hard ✋, Wrong 👎) for multiple cards.  
    * Test bucket progression logic over several virtual days.  
    * Test "End of Day" and "Next Day" flow.  
    * Test edge cases: No cards due, first use, webcam denial, invalid form input, gesture timeout.  
  *   
  * Test on different websites (highlighting/button appearance).  
*   
* Deliverables:  
  * Ensure clean Git commit history.  
  * Create a zipped file of the extension ready for loading/submission.  
  * Finalize spec.md, plan.md, todo.md.  
  * Create GitHub repository (if not already done).  
* 

