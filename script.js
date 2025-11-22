document.addEventListener('DOMContentLoaded', () => {
    const textDisplay = document.getElementById('text-display');
    const textInput = document.getElementById('text-input');
    const fileUpload = document.getElementById('book-upload');
    const resetBtn = document.getElementById('reset-btn');
    const timerEl = document.getElementById('timer');
    const wpmEl = document.getElementById('wpm');
    const accuracyEl = document.getElementById('accuracy');

    let testText = "The quick brown fox jumps over the lazy dog. This is some default text for practice. Use the file input below to load your favorite books.";
    let startTime;
    let timerInterval;
    let typedCharacters = 0;
    let correctCharacters = 0;
    let testActive = false;

    function loadText(text) {
        if (!text || text.trim().length === 0) {
            alert("Error: Imported file is empty or could not be read.");
            return;
        }
        testText = text;
        textDisplay.innerHTML = ''; // Clear existing content
        testText.split('').forEach(character => {
            const charSpan = document.createElement('span');
            charSpan.innerText = character;
            charSpan.classList.add('correct');
            textDisplay.appendChild(charSpan);
        });
        textInput.value = '';
        textInput.focus();
        resetMetrics();
        // Optional: Scroll to the top of the text area when a new book loads
        textDisplay.scrollTop = 0; 
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

    textInput.addEventListener('input', (e) => {
        if (!testActive) {
            testActive = true;
            startTimer();
        }

        const typedValue = textInput.value;
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
                isMismatch = true;
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

        if (!isMismatch && typedValue.length === testText.length) {
            clearInterval(timerInterval);
            testActive = false;
            alert("Test finished! Great job!");
        }
    });

    // Handle File Upload (Importing Books)
    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0]; // Get the first selected file
        
        if (file) {
            // Optional check for file size (large files can cause issues)
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert("File is too large. Please select a smaller text file.");
                event.target.value = null; // Clear the input
                return;
            }

            const reader = new FileReader();
            
            // This is the key part: The onload function runs AFTER the file is fully read.
            reader.onload = (e) => {
                // e.target.result contains the raw text content of the file
                loadText(e.target.result); 
                console.log("File loaded successfully into the app."); // Check your browser console
            };

            // Add error handling
            reader.onerror = (e) => {
                console.error("FileReader error: ", e.target.error);
                alert("Error reading the file: " + e.target.error.name);
            };

            // Start reading the file as text
            reader.readAsText(file);
        } else {
            console.log("No file selected or selection was cancelled.");
        }
    });

    resetBtn.addEventListener('click', () => {
        loadText(testText);
    });

    // Initialize with default text on load
    loadText(testText);
});
