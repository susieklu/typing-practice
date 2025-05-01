const homeRowKeys = ["a", "s", "d", "f", "j", "k", "l", ";"];
const topRowKeys = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
const bottomRowKeys = ["z", "x", "c", "v", "b", "n", "m"];
const level2Words = [
    "flash", "slash", "glass", "salad", "shall", "salsa", "saga", "half", "sag", "fad",
    "dhal", "glad", "lash", "lad", "fall", "hall", "hash", "lass", "gaff", "add",
    "lag", "alga", "ask", "alas", "dash", "gala"
];
const level4Words = [
    "kid", "red", "did", "rid", "fed", "riff", "kidder", "udder", "rudder", "sir", "ire", "ide",
    "use", "fuse", "ruse", "hid", "gig", "lure", "lug", "lid", "dill", "frill", "drill", "file",
    "side", "kiss", "less", "jug", "jerk", "desk", "disk", "ask", "ark", "aid", "ail", "fail",
    "fake", "rake", "sake", "lake", "jake", "age", "usage", "lids", "slid", "slide", "laid",
    "reads", "fare", "luge", "slider", "shake", "shade", "gads", "gags", "sage", "shares",
    "slur", "skids", "kisses", "fuss", "hashed", "haggle", "sashes"
];
const level6Words = [
    "blanch", "flack", "snack", "flash", "shack", "black", "clank", "clang", "slang", "blank",
    "bhang", "gnash", "chads", "scald", "bland", "slack", "gland", "chalk", "chasm", "flank",
    "clash", "smack", "hack", "snag", "lamb", "band", "land", "mash"
];
const level7Sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Typing is a skill that improves with practice.",
    "A journey of a thousand miles begins with a single step.",
    "Practice makes perfect, so keep typing every day.",
    "The rain in Spain stays mainly in the plain.",
    "She sells seashells by the seashore.",
    "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
    "Peter Piper picked a peck of pickled peppers.",
    "The early bird catches the worm.",
    "All work and no play makes Jack a dull boy."
];
let textToType = "";
let currentIndex = 0;
let mistakes = 0;
let level = 1;
let practiceCount = 0;
let level2Queue = [];
let level2Accuracy = [];
let level4Queue = [];
let level4Accuracy = [];
let level6Queue = [];
let level6Accuracy = [];
let level7Queue = [...level7Sentences];
let level7Completed = 0;
let level7AccuracyScores = [];
let level7WPMs = [];
let startTime = null; // Track the start time for each sentence

function generateRandomText() {
    const formats = [
        () => `${randomKey()}${randomKey()} ${randomKey()}${randomKey()} ${randomKey()}${randomKey()}`,
        () => `${randomKey()}${randomKey()} ${randomKey()}${randomKey()} ${randomKey()}${randomKey()} ${randomKey()}${randomKey()}`,
        () => `${randomKey()}${randomKey()}${randomKey()}${randomKey()} ${randomKey()}${randomKey()}${randomKey()}${randomKey()}`
    ];
    const randomFormat = formats[Math.floor(Math.random() * formats.length)];
    return randomFormat();
}

function randomKey() {
    if (level === 1) {
        return homeRowKeys[Math.floor(Math.random() * homeRowKeys.length)];
    } else if (level === 3) {
        return topRowKeys[Math.floor(Math.random() * topRowKeys.length)];
    } else if (level === 5) {
        return bottomRowKeys[Math.floor(Math.random() * bottomRowKeys.length)];
    }
    return ""; // Default case for other levels
}

function displayText() {
    const nextButton = document.getElementById("next-sentence-button");
    nextButton.style.display = "none"; // Hide the "Next Sentence" button initially

    if (level === 7) {
        if (level7Completed >= 10) {
            endLevel7(); // End Level 7 if all sentences are completed
            return;
        }
        if (level7Queue.length === 0) {
            alert("No more sentences available.");
            return;
        }
        textToType = level7Queue.shift(); // Get the next sentence
        startTime = new Date(); // Start timing for the sentence
    } else {
        if (level === 1 || level === 3 || level === 5) {
            textToType = generateRandomText();
        } else if (level === 2) {
            if (level2Queue.length === 0) {
                level2Queue = [...level2Words].sort(() => Math.random() - 0.5).slice(0, 10); // Random 10 words
            }
            textToType = level2Queue.shift(); // Get the next word
        } else if (level === 4) {
            if (level4Queue.length === 0) {
                level4Queue = [...level4Words].sort(() => Math.random() - 0.5).slice(0, 10); // Random 10 words
            }
            textToType = level4Queue.shift(); // Get the next word
        } else if (level === 6) {
            if (level6Queue.length === 0) {
                level6Queue = [...level6Words].sort(() => Math.random() - 0.5).slice(0, 10); // Random 10 words
            }
            textToType = level6Queue.shift(); // Get the next word
        }
    }

    currentIndex = 0;
    const textDisplay = document.getElementById("text-display");
    textDisplay.innerHTML = textToType
        .split("")
        .map((char, index) => `<span id="char-${index}" class="neutral">${char}</span>`)
        .join("");
    highlightNextCharacter();
}

function handleKeyPress(event) {
    const charElement = document.getElementById(`char-${currentIndex}`);
    if (!charElement) return;

    const typedChar = event.key;
    const expectedChar = textToType[currentIndex];

    // Ignore the Shift key
    if (event.key === "Shift") {
        return;
    }

    // Handle Enter key for moving to the next sentence in Level 7
    if (level === 7 && event.key === "Enter" && document.getElementById("next-sentence-button").style.display === "block") {
        moveToNextSentence();
        return;
    }

    charElement.classList.remove("highlight");

    if (typedChar === expectedChar) {
        charElement.classList.remove("neutral");
        charElement.classList.add("correct"); // Apply green for correct typing
    } else {
        charElement.classList.remove("neutral");
        charElement.classList.add("incorrect"); // Apply red for incorrect typing
        mistakes++;
    }

    // Move to the next character regardless of correctness
    currentIndex++;
    if (currentIndex < textToType.length) {
        highlightNextCharacter();
    } else {
        assessInput();
    }
}

function highlightNextCharacter() {
    const nextCharElement = document.getElementById(`char-${currentIndex}`);
    if (nextCharElement) {
        nextCharElement.classList.add("highlight"); // Apply gray for the current letter
    }
}

function assessInput() {
    const accuracyScore = ((textToType.length - mistakes) / textToType.length) * 100;
    displayFeedback(accuracyScore);

    if (level === 7) {
        calculateAndDisplayWPM(accuracyScore); // Calculate and display WPM for the sentence
        level7AccuracyScores.push(accuracyScore);
        level7Completed++;

        if (level7Completed >= 10) {
            endLevel7(); // End Level 7 after 10 sentences
            return;
        }
        showNextSentenceButton(); // Show the "Next Sentence" button
    } else {
        mistakes = 0; // Reset mistakes
        displayText(); // Generate new text
    }
}

function calculateAndDisplayWPM(accuracyScore) {
    const endTime = new Date(); // End timing for the sentence
    const timeTakenInSeconds = (endTime - startTime) / 1000; // Time taken in seconds
    const words = textToType.split(" ").length; // Count the number of words in the sentence
    const wpm = Math.round((words / timeTakenInSeconds) * 60); // Calculate WPM
    level7WPMs.push(wpm); // Store WPM for this sentence

    const feedbackDisplay = document.getElementById("feedback");
    feedbackDisplay.textContent = `Accuracy: ${accuracyScore.toFixed(2)}% | WPM: ${wpm}`;
}

function showNextSentenceButton() {
    const nextButton = document.getElementById("next-sentence-button");
    nextButton.style.display = "block"; // Show the "Next Sentence" button
    nextButton.onclick = moveToNextSentence; // Attach the moveToNextSentence function
}

function moveToNextSentence() {
    const nextButton = document.getElementById("next-sentence-button");
    nextButton.style.display = "none"; // Hide the button after moving to the next sentence
    mistakes = 0; // Reset mistakes
    displayText(); // Load the next sentence
}

function displayFeedback(accuracyScore) {
    const feedbackDisplay = document.getElementById("feedback");
    feedbackDisplay.textContent = `Accuracy: ${accuracyScore.toFixed(2)}% with ${mistakes} mistakes.`;
}

function levelUp() {
    if (level === 1) {
        level = 2;
        practiceCount = 0;
        updateLevelTitle("Level 2: Home Row Practice Words");
        alert("Congratulations! You've reached Level 2: Home Row Practice Words.");
    } else if (level === 2) {
        level = 3;
        practiceCount = 0;
        updateLevelTitle("Level 3: Top Row Practice");
        alert("Congratulations! You've reached Level 3: Top Row Practice.");
    } else if (level === 3) {
        level = 4;
        practiceCount = 0;
        updateLevelTitle("Level 4: Top Row Practice Words");
        alert("Congratulations! You've reached Level 4: Top Row Practice Words.");
    } else if (level === 4) {
        level = 5;
        practiceCount = 0;
        updateLevelTitle("Level 5: Bottom Row Practice");
        alert("Congratulations! You've reached Level 5: Bottom Row Practice.");
    } else if (level === 5) {
        level = 6;
        practiceCount = 0;
        updateLevelTitle("Level 6: Bottom Row Practice Words");
        alert("Congratulations! You've reached Level 6: Bottom Row Practice Words.");
    } else if (level === 6) {
        level = 7;
        practiceCount = 0;
        updateLevelTitle("Level 7: Sentence Practice");
        alert("Congratulations! You've reached Level 7: Sentence Practice.");
    }
}

function jumpToLevel(targetLevel) {
    level = targetLevel; // Set the current level to the target level
    practiceCount = 0; // Reset practice count
    mistakes = 0; // Reset mistakes

    // Update the level title dynamically
    const levelIndicator = document.getElementById("level-indicator");
    if (level === 1) {
        levelIndicator.textContent = "Level 1: Home Row Practice";
    } else if (level === 2) {
        levelIndicator.textContent = "Level 2: Home Row Practice Words";
    } else if (level === 3) {
        levelIndicator.textContent = "Level 3: Top Row Practice";
    } else if (level === 4) {
        levelIndicator.textContent = "Level 4: Top Row Practice Words";
    } else if (level === 5) {
        levelIndicator.textContent = "Level 5: Bottom Row Practice";
    } else if (level === 6) {
        levelIndicator.textContent = "Level 6: Bottom Row Practice Words";
    } else if (level === 7) {
        levelIndicator.textContent = "Level 7: Sentence Practice";
    }

    // Reset the text display and feedback
    displayText();
    const feedbackDisplay = document.getElementById("feedback");
    feedbackDisplay.textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
    displayText();
    document.getElementById("jump-to-level-1").addEventListener("click", () => jumpToLevel(1)); // Event listener for Level 1
    document.getElementById("jump-to-level-2").addEventListener("click", () => jumpToLevel(2));
    document.getElementById("jump-to-level-3").addEventListener("click", () => jumpToLevel(3));
    document.getElementById("jump-to-level-4").addEventListener("click", () => jumpToLevel(4));
    document.getElementById("jump-to-level-5").addEventListener("click", () => jumpToLevel(5));
    document.getElementById("jump-to-level-6").addEventListener("click", () => jumpToLevel(6));
    document.getElementById("jump-to-level-7").addEventListener("click", () => jumpToLevel(7));
    document.addEventListener("keydown", handleKeyPress);
});

// Define the endLevel7 function near the bottom of the file
function endLevel7() {
    console.log("Level 7 is ending. Calculating averages..."); // Debug log to confirm the function is called

    const averageAccuracy = level7AccuracyScores.reduce((a, b) => a + b, 0) / level7AccuracyScores.length;
    const averageWPM = level7WPMs.reduce((a, b) => a + b, 0) / level7WPMs.length;

    alert(`Level 7 Complete!\n\nAverage Accuracy: ${averageAccuracy.toFixed(2)}%\nAverage WPM: ${averageWPM.toFixed(2)}`);
}