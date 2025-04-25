## Phase 1: Project Blueprint & Planning

1\. Core Objective: Create a Chrome extension for flashcard creation via text highlighting and practice using gesture recognition, with local storage persistence and spaced repetition.  
2\. Key Components & Interactions:

* Content Script: Runs on web pages. Detects text selection, displays a "Create Flashcard" button near the selection. Communicates with the Service Worker (or Background Script in MV3 terminology) to open the popup.  
* Popup ( A dedicated small window/view. Contains the form for creating a new flashcard (Front, Back, Hint, Tags). Performs validation. Sends the validated data to the Service Worker for saving.  
* Service Worker ( The extension's background process (MV3). Listens for messages from the Content Script (to open popup) and the Popup (to save flashcard). Interacts with storage.ts. Note: In MV3, direct DOM access from background is limited, hence the message passing.  
* Storage ( Module responsible for all localStorage interactions: saving/loading flashcards, saving/loading the currentDay counter. Provides a clean API for data persistence.  
* Flashcard Logic ( Defines the Flashcard data structure/class. Includes validation logic for flashcard fields. Includes logic for calculating if a card is due (isCardDue).  
* Practice Page ( A dedicated extension page. Loads due flashcards using storage.ts and flashcard.ts. Displays cards one by one. Integrates with handpose.ts for gesture input. Updates card status via storage.ts. Manages the "End of Day" / "Next Day" flow.  
* Handpose Integration ( Module responsible for setting up TensorFlow.js, loading the Handpose model, accessing the webcam, detecting hand gestures (👍, ✋, 👎), and communicating detected gestures back to the practice.js script.  
* UI Helpers ( Optional module for common DOM manipulation tasks (creating elements, adding/removing classes, etc.) to keep other modules cleaner.  
* Manifest ( Defines the extension's structure, permissions (storage, activeTab, potentially scripting for dynamic button injection, webcam access handled by practice page), content scripts, service worker, and actions (like the popup).

3\. Data Flow:

* Creation: Highlight \-\> Content Script \-\> Button Click \-\> Service Worker (message) \-\> Open Popup \-\> User Input \-\> Popup JS Validation \-\> Popup JS (message) \-\> Service Worker \-\> storage.ts \-\> localStorage.  
* Practice: User opens Practice Page \-\> practice.js \-\> storage.ts (load cards & day) \-\> flashcard.ts (filter due) \-\> Display Card Front \-\> User Action (Show Answer) \-\> Display Card Back \-\> practice.js \-\> handpose.ts (activate webcam & detect) \-\> handpose.ts (emit gesture) \-\> practice.js (receive gesture) \-\> flashcard.ts (calculate new bucket) \-\> storage.ts (update card & save) \-\> practice.js (load next card or end session).  
* Next Day: User clicks "Next Day" button \-\> practice.js \-\> storage.ts (increment & save day) \-\> practice.js (reload/reset view).

4\. Core Challenges/Risks:

* Gesture Recognition Accuracy/Reliability: Handpose performance can vary based on lighting, background, camera quality, and user gestures. Mapping landmarks to simple gestures (👍, ✋, 👎) requires careful implementation and tuning.  
* MV3 Constraints: Service workers have lifecycle limitations. Communication between scripts (content, popup, service worker, practice page) needs careful handling via messaging APIs. DOM manipulation from content scripts requires careful consideration (e.g., injecting the button).  
* UI/UX: Keeping the highlight button unobtrusive, the popup simple, and the practice flow smooth (especially the gesture part) is key.  
* Testing Gestures: Requires manual testing with a webcam or potentially more complex automated UI testing frameworks that can simulate camera input (less common/easy).

## Phase 2: Iterative Chunking & Refinement

Initial Chunks (Broad):

1. Core Data & Storage: Define Flashcard, implement basic save/load.  
2. Creation Flow: Implement highlight \-\> button \-\> popup \-\> save (no validation yet).  
3. Basic Practice Page: Load and display all cards sequentially (manual next button).  
4. Spaced Repetition Logic: Implement isCardDue and filter cards on practice page.  
5. Webcam & Basic Handpose: Integrate TFJS/Handpose, get webcam feed, display basic pose data.  
6. Gesture Mapping: Map Handpose output to 👍, ✋, 👎.  
7. Gesture Grading: Replace manual next button with gesture detection for grading/advancing.  
8. Day Progression: Implement "End of Day" and "Next Day" logic.  
9. Validation & Error Handling: Add input validation and error messages.  
10. Packaging & Polish: Finalize manifest, icons, UI cleanup, testing.

Refined Chunks (Smaller Steps):

* Iteration 1: Foundation & Core Data  
  * Step 1.1: Setup basic Manifest V3 structure (manifest.json), empty service worker (background.js), basic popup.html. Define Flashcard interface in flashcard.ts.  
  * Step 1.2 (TDD): Implement storage.ts with functions saveFlashcards(cards), loadFlashcards(), saveCurrentDay(day), loadCurrentDay(). Write unit tests mocking localStorage. Initialize currentDay to 1 if not found.  
  * Step 1.3: Implement a simple test function in background.js (or a test page) to manually save/load a dummy flashcard using storage.ts to ensure it works.  
*   
* Iteration 2: Basic Card Creation (No Validation)  
  * Step 2.1: Create popup.html with basic form fields (Front, Back, Hint, Tags) and a Save button. Create popup.js.  
  * Step 2.2: In popup.js, add event listener to Save button. On click, read form values, create a basic Flashcard object (hardcode sourceUrl, createdAt, difficulty, bucket, lastPracticed for now), and send a message to background.js with the card data.  
  * Step 2.3: In background.js, listen for the 'saveCard' message. When received, use storage.ts to load existing cards, add the new card, and save the updated list. Close the popup (chrome.windows.remove might be needed if opened as a separate window, or just window.close() if it's a standard action popup).  
  * Step 2.4: Add activeTab and scripting permissions to manifest.json. Create content.js. Implement simple text selection detection in content.js. For now, just log "Text selected" to the console. Configure content.js in manifest.json to run on desired pages (e.g., \<all\_urls\>).  
  * Step 2.5: Modify content.js to show a simple, static button (e.g., appended to body) when text is selected.  
  * Step 2.6: Modify content.js: On button click, send a 'createFlashcard' message to background.js.  
  * Step 2.7: Modify background.js: Listen for 'createFlashcard' message. When received, open the popup.html (potentially as a new small window using chrome.windows.create, as MV3 popups tied to the toolbar icon might be less ideal for this workflow). Self-correction: Using   
*   
* Iteration 3: Basic Practice Page & Display  
  * Step 3.1: Create practice.html and practice.js. Add basic HTML structure to display front/back of a card.  
  * Step 3.2: In practice.js, on page load, use storage.ts to load all flashcards. Store them in an array.  
  * Step 3.3: Implement displayCard(index) function in practice.js to show the front of the card at the given index. Show the first card initially. Hide the 'Back' section.  
  * Step 3.4: Add a "Show Answer" button. On click, reveal the 'Back' section of the currently displayed card.  
  * Step 3.5: Add a "Next Card" button. On click, increment the index and call displayCard for the next card. Handle reaching the end of the list (e.g., disable button or show a message).  
*   
* Iteration 4: Spaced Repetition Logic & Filtering  
  * Step 4.1 (TDD): Implement flashcard.ts: Add the isCardDue(card, currentDay) function based on the bucket rules (Bucket i due every 2^i days, using lastPracticed and currentDay). Write unit tests for this logic.  
  * Step 4.2: Modify practice.js: Load currentDay using storage.ts. Filter the loaded flashcards using isCardDue before storing them in the practice session array.  
  * Step 4.3: Modify practice.js: Handle the case where the filtered list of due cards is empty. Show a "No cards due today" message instead of card display elements. Disable "Show Answer"/"Next Card" buttons.  
*   
* Iteration 5: Input Validation & Creation Polish  
  * Step 5.1 (TDD): Implement validation logic within flashcard.ts (e.g., a static validate(data) method or checks within a constructor/factory function) for Front, Back, Hint, Tags lengths/counts according to spec. Write unit tests.  
  * Step 5.2: Modify popup.js: Before sending the 'saveCard' message, call the validation logic from flashcard.ts. If invalid, show alerts to the user and prevent saving.  
  * Step 5.3: Modify popup.js: Populate sourceUrl (using message from content script or chrome.tabs.query), createdAt (new Date().toISOString()), default difficulty ('easy'), bucket (0), and lastPracticed (derive from currentDay or use a placeholder like createdAt's date part initially). Refinement:  Let's use ISO date string (YYYY-MM-DD) derived from currentDay relative to a fixed epoch for simplicity in isCardDue. Correction: Spec says ISO String YYYY-MM-DD for lastPracticed. We need a way to map currentDay to a date for the isCardDue calculation. Let's assume currentDay \= 1 corresponds to a specific start date (e.g., Jan 1, 2024\) and calculate subsequent dates.  
  * Step 5.4 (TDD): Add helper function in storage.ts or a new dateUtils.ts: getDateStringForDay(dayNumber) that converts the virtual day number to a 'YYYY-MM-DD' string. Test this. Update popup.js to use this for lastPracticed on creation (using the current currentDay).  
  * Step 5.5: Modify content.js: Make the "Create Flashcard" button appear near the highlighted text (requires calculating position). Injecting it into the DOM might need scripting execution from the background script upon request. Simpler first approach: Keep it appended to body, maybe fixed position. Better approach: Use a library or calculate selection bounds. Let's stick to a simpler fixed/appended button first.  
*   
* Iteration 6: Webcam & Basic Handpose Setup  
  * Step 6.1: Add TensorFlow.js (@tensorflow/tfjs) and Handpose (@tensorflow-models/handpose) dependencies (e.g., via CDN links in practice.html or package manager if using a bundler).  
  * Step 6.2: Create handpose.ts. Add initHandpose() function: loads model, gets webcam stream (navigator.mediaDevices.getUserMedia), assigns stream to a video element. Handle permissions request.  
  * Step 6.3: Add a \<video\> element (small, muted, autoplay) to practice.html (e.g., top-right corner). Give it an ID.  
  * Step 6.4: Modify practice.js: Call initHandpose() after user clicks "Show Answer". Handle potential errors (e.g., webcam permission denied) \- show the blocking message as specified.  
  * Step 6.5: In handpose.ts, add startDetection(videoElement, callback) function: starts a loop (requestAnimationFrame or setInterval) to predict hand pose from the video feed using the loaded model. Pass the raw predictions to the callback.  
  * Step 6.6: Modify practice.js: After initHandpose succeeds and webcam is running, call startDetection, passing the video element and a callback function that simply logs the raw prediction data to the console for now. Stop detection when moving to the next card.  
*   
* Iteration 7: Gesture Recognition & Mapping  
  * Step 7.1: In handpose.ts, create a function mapLandmarksToGesture(landmarks) that takes Handpose landmarks and attempts to classify them as 'thumbs\_up', 'open\_palm' (for Hard), 'thumbs\_down', or 'unknown'. This involves analyzing finger joint positions and orientations (e.g., thumb angle relative to palm, other fingers extended or curled). This is complex; start with simple heuristics.  
  * Step 7.2: Modify startDetection in handpose.ts: Instead of calling back with raw landmarks, call mapLandmarksToGesture. Only call the callback when a recognized gesture ('thumbs\_up', 'open\_palm', 'thumbs\_down') is detected consistently for a short duration (e.g., 3 consecutive frames) to avoid jitter. Add a timeout mechanism (e.g., 10 seconds) \- if no gesture recognized, call back with 'timeout'.  
  * Step 7.3: Modify practice.js: Update the callback passed to startDetection. It should now receive the recognized gesture string ('thumbs\_up', 'open\_palm', 'thumbs\_down', 'timeout') or null/undefined if no gesture is detected yet.  
*   
* Iteration 8: Gesture-Based Grading  
  * Step 8.1: Modify practice.js: Remove the "Next Card" button. The gesture will trigger advancement.  
  * Step 8.2: In the startDetection callback in practice.js:  
    * If gesture is 'thumbs\_up': Calculate new bucket (i+1), update card's difficulty to 'easy', update lastPracticed to the current virtual date string, save the card via storage.ts, stop detection, and advance to the next card.  
    * If gesture is 'open\_palm': Calculate new bucket (i-1, min 0), update difficulty to 'hard', update lastPracticed, save, stop detection, advance.  
    * If gesture is 'thumbs\_down': Reset bucket to 0, update difficulty to 'wrong', update lastPracticed, save, stop detection, advance.  
    * If gesture is 'timeout': Show the "Please show a gesture clearly." message. Restart the detection timeout (or require user action to retry). Simpler: just keep detecting. Let's keep detecting but show the message.  
  *   
  * Step 8.3: Update advanceToNextCard() function (or similar logic): Ensure it correctly handles the end of the due card list. Stop webcam/detection when the last card is graded.  
*   
* Iteration 9: End of Day & Day Progression  
  * Step 9.1: Modify practice.js: When advanceToNextCard finds no more cards in the due list (after grading the last one), hide the card display area and the webcam feed.  
  * Step 9.2: Show the "No more cards to practice today\!" message and a "Go to Next Day" button.  
  * Step 9.3: Add event listener to "Go to Next Day" button. On click: increment currentDay using storage.ts, then reload the practice page or re-run the initial card loading/filtering logic to start the new "day".  
*   
* Iteration 10: Final Polish, Error Handling & Testing  
  * Step 10.1: Implement remaining error handling explicitly (e.g., storage errors, clearer validation messages in popup).  
  * Step 10.2: Refine UI: Style the highlight button, popup form, practice page elements, and webcam feed position.  
  * Step 10.3: Create ui.ts if needed to abstract common DOM operations. Refactor existing code to use it.  
  * Step 10.4: Finalize manifest.json (icons, description, version).  
  * Step 10.5 (TDD): Write any missing unit tests (especially for validation, isCardDue, storage).  
  * Step 10.6: Perform thorough manual end-to-end testing: highlight \-\> create \-\> practice multiple cards \-\> grade with gestures \-\> end of day \-\> next day \-\> practice again. Test edge cases (no cards, webcam denial, invalid input).  
  * Step 10.7: Zip the extension files for distribution.  
* 

This iterative plan breaks the project into manageable, testable steps, starting with the core data structure and gradually adding features, integrating the complex parts (gestures) later in the process. Each step builds directly on the previous ones.  
