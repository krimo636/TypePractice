document.addEventListener('DOMContentLoaded', () => {
    const textDisplay = document.getElementById('text-display');
    const textInput = document.getElementById('text-input');
    const fileUpload = document.getElementById('book-upload');
    const resetBtn = document.getElementById('reset-btn');
    const timerEl = document.getElementById('timer');
    const wpmEl = document.getElementById('wpm');
    const accuracyEl = document.getElementById('accuracy');

    // Default text, if no saved text exists
    let testText = "The quick brown fox jumps over the lazy dog. This is some default text for practice.";
    let startTime;
    let timerInterval;
    let typedCharacters = 0;
    let correctCharacters = 0;
    let testActive = false;
    let currentInputIndex = 0; // Tracks where we are in the text

    // --- Progress Tracking (localStorage) ---
    function saveProgress() {
        localStorage.setItem('typingAppText', testText);
        localStorage.setItem('typingAppIndex', currentInputIndex);
    }

    function loadProgress() {
        const savedText = localStorage.getItem('typingAppText');
        const savedIndex = localStorage.getItem('typingAppIndex');

        if (savedText) {
            testText = savedText;
        }
        
        loadText(testText);
        
        if (savedIndex && savedIndex > 0 && savedIndex < testText.length) {
            currentInputIndex = parseInt(savedIndex, 10);
            // Simulate having typed up to that point
            textInput.value = testText.substring(0, currentInputIndex); 
            updateTextDisplayUI(textInput.value);
            // Focus the input to continue typing immediately
            textInput.focus(); 
        }
    }

    function loadText(text) {
        if (!text || text.trim().length === 0) {
            alert("Error: Text is empty.");
            return;
        }
        testText = text;
        textDisplay.innerHTML = '';
        testText.split('').forEach(character => {
            const charSpan = document.createElement('span');
            charSpan.innerText = character;
            charSpan.classList.add('correct');
            textDisplay.appendChild(charSpan);
        });
        resetMetrics();
        currentInputIndex = 0;
        saveProgress(); // Save the new text as the default
    }

    function resetMetrics() {
        testActive = false;
        clearInterval(timerInterval);
        startTime = null;
        typedCharacters = 0;
        correctCharacters = 0;
        timerEl.textContent = '0s';
        wpmEl.textContent = '0';
        accuracyEl.textContent = '100%';
        currentInputIndex = 0;
        textInput.value = '';
        loadText(testText); // Re-render text to clear highlights
        saveProgress();
    }

    function startTimer() {
        startTime = new Date();
        timerInterval = setInterval(() => {
            const currentTime = new Date();
            const timeElapsedInSeconds = (currentTime - startTime) / 1000;
            timerEl.textContent = `${Math.round(timeElapsedInSeconds)}s`;
            calculateMetrics(timeElapsedInSeconds);
        }, 1000);
    }

    function calculateMetrics(timeElapsedInSeconds) {
        if (timeElapsedInSeconds > 0) {
            const minutes = timeElapsedInSeconds / 60;
            const wpm = Math.round((correctCharacters / 5) / minutes);
            wpmEl.textContent = wpm;
        }
        if (typedCharacters > 0) {
            const accuracy = Math.round((correctCharacters / typedCharacters) * 100);
            accuracyEl.textContent = `${accuracy}%`;
        }
    }
    
    // Helper function to update UI after input
    function updateTextDisplayUI(typedValue) {
        const testChars = textDisplay.querySelectorAll('span');
        typedCharacters = typedValue.length;
        correctCharacters = 0;
        let isMismatch = false;

        for (let i = 0; i < testChars.length; i++) {
            const testChar = testChars[i];
            const typedChar = typedValue[i];

            if (typedChar == null) {
                testChar.classList.remove('incorrect', 'current');
                testChar.classList.add('correct');
            } else if (typedChar === testChar.innerText) {
                testChar.classList.remove('incorrect', 'current');
                correctCharacters++;
            } else {
                testChar.classList.add('incorrect');
                testChar.classList.remove('current', 'correct');
                isMismatch = true;
            }

            if (i === typedValue.length) {
                testChar.classList.add('current');
            }
        }
        return isMismatch;
    }

    // --- Strict Mode Logic ---
    textInput.addEventListener('input', (e) => {
        if (!testActive) {
            testActive = true;
            startTimer();
        }

        const typedValue = textInput.value;
        const lastTypedChar = typedValue[typedValue.length - 1];
        const targetChar = testText[typedValue.length - 1];

        // STRICT MODE CHECK: If the last character typed is wrong, restrict input field.
        if (lastTypedChar !== targetChar && typedValue.length > currentInputIndex) {
             // Revert the input field to its correct state
             textInput.value = typedValue.substring(0, typedValue.length - 1);
             // Optional: Add a visual shake/flash for the error
             textDisplay.classList.add('error-flash');
             setTimeout(() => textDisplay.classList.remove('error-flash'), 200);
             return; // Stop processing further
        }
        
        // If correct, update the index and save progress
        if (typedValue.length > currentInputIndex && lastTypedChar === targetChar) {
            currentInputIndex = typedValue.length;
            saveProgress(); // Save current position
        }

        const isMismatch = updateTextDisplayUI(typedValue);


        if (!isMismatch && typedValue.length === testText.length) {
            clearInterval(timerInterval);
            testActive = false;
            alert("Test finished! Great job!");
            currentInputIndex = 0; // Reset index for next test
            saveProgress();
        }
    });
    
    // Handle File Upload (Importing Books)
    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                loadText(e.target.result); 
                event.target.value = null; // Clear input field visually
            };
            reader.onerror = (e) => console.error("FileReader error: ", e.target.error);
            reader.readAsText(file);
        }
    });

    resetBtn.addEventListener('click', () => {
        resetMetrics();
        // Force the display to re-render default text highlights
        updateTextDisplayUI(textInput.value); 
    });
        // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggleBtn.textContent = 'Toggle Light Mode';
        } else {
            document.body.classList.remove('dark-theme');
            themeToggleBtn.textContent = 'Toggle Dark Mode';
        }
        localStorage.setItem('typingAppTheme', theme);
    }

    // Check saved theme on load
    function loadTheme() {
        const savedTheme = localStorage.getItem('typingAppTheme') || 'light'; // Default to light
        setTheme(savedTheme);
    }

    // Toggle theme on button click
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
    
    // Call loadTheme after all functions are defined, right above loadProgress()
    loadTheme(); 
    loadProgress(); // This was already here
});


    // Initialize with default text or saved progress on load
    loadProgress();
});

