document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const stopButton = document.getElementById('stop-button');
    const restartButton = document.getElementById('restart-button');
    const signalType = document.getElementById('signal-type');
    const roundTime = document.getElementById('round-time');
    const frequency = document.getElementById('frequency');
    const breakTime = document.getElementById('break-time');
    const visualSignal = document.getElementById('visual-signal');
    const timeRemainingDisplay = document.getElementById('time-remaining');
    const audioElement = document.getElementById('audio-signal');

    let signalInterval;
    let roundTimer;
    let countdownInterval;
    let isRunning = false;
    let isPaused = false;
    let timeRemaining;
    let roundLength, signalDelay, breakDuration;
    let isTrainingRunning = false;

    // Event listeners
    startButton.addEventListener('click', () => {
        if (!isRunning) startTraining();
    });

    pauseButton.addEventListener('click', () => {
        if (isPaused) {
            resumeTraining();
            pauseButton.textContent = 'Pause';
        } else {
            pauseTraining();
            pauseButton.textContent = 'Resume';
        }
    });

    stopButton.addEventListener('click', stopTraining);
    restartButton.addEventListener('click', restartTraining);

    // Start the training session
    function startTraining() {
        // Stop any previous training before starting a new one
        if (isRunning) {
            stopTraining();
        }

        // Clear previous timers and intervals before starting a new round
        clearTimersAndIntervals();

        // Get the selected settings
        roundLength = parseInt(roundTime.value) * 60 * 1000;
        signalDelay = 60000 / parseInt(frequency.value);
        breakDuration = parseInt(breakTime.value) * 1000;

        isRunning = true;
        isTrainingRunning = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
        stopButton.disabled = false;
        restartButton.disabled = false;
        isPaused = false;
        timeRemaining = roundLength;

        countdown(5, 'Round starts in', () => {
            playAudio('start.mp3');
            runRound();
        });

        pauseButton.textContent = 'Pause';
    }

    // Running the round and sending signals
    function runRound() {
        timeRemainingDisplay.textContent = 'Round in progress';

        signalInterval = setInterval(() => {
            if (isPaused) return;

            const randomDelay = Math.random() * signalDelay;
            setTimeout(() => {
                if (signalType.value === 'visual' || signalType.value === 'both') {
                    flashVisualSignal();
                }
                if (signalType.value === 'audio' || signalType.value === 'both') {
                    playAudio('clap.mp3');
                }
            }, randomDelay);
        }, signalDelay);

        roundTimer = setTimeout(() => {
            if (!isPaused) {
                clearInterval(signalInterval);
                playAudio('end.mp3');
                timeRemainingDisplay.textContent = 'Break Time';
                countdown(breakDuration / 1000, 'Next round in', () => {
                    startTraining();
                });
            }
        }, roundLength);
    }

    // Flash the visual signal
    function flashVisualSignal() {
        visualSignal.style.display = 'block';
        setTimeout(() => {
            visualSignal.style.display = 'none';
        }, 500);
    }

    // Play audio signals
    function playAudio(filename) {
        audioElement.src = `audio/${filename}`;
        audioElement.play();
    }

    // Countdown timer
    function countdown(seconds, message, callback) {
        let counter = seconds;
        timeRemainingDisplay.textContent = `${message}: ${counter}`;
        countdownInterval = setInterval(() => {
            counter--;
            timeRemainingDisplay.textContent = `${message}: ${counter}`;
            if (counter <= 0) {
                clearInterval(countdownInterval);  // Clear countdown timer when finished
                callback();
            }
        }, 1000);

        if (seconds === 5) {
            let countdownAudio = new Audio("audio/countdown.mp3");
            countdownAudio.play();
        }
    }

    // Stop the training session
    function stopTraining() {
        clearTimersAndIntervals(); // Ensure all intervals are cleared
        stopAudio(); // Stop any playing audio immediately
        isRunning = false;
        isPaused = false;
        isTrainingRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
        stopButton.disabled = true;
        restartButton.disabled = true;
        timeRemainingDisplay.textContent = 'Training Stopped';

        pauseButton.textContent = 'Pause';
    }

    // Restart the training session
    function restartTraining() {
        stopTraining();
        startTraining();
    }

    // Pause the training session
    function pauseTraining() {
        isPaused = true;
        timeRemainingDisplay.textContent = 'Training Paused';
        clearInterval(countdownInterval); // Stop the countdown timer if paused
        stopAudio(); // Stop any playing audio immediately
    }

    // Resume the training session
    function resumeTraining() {
        isPaused = false;
        timeRemainingDisplay.textContent = 'Training Resumed';
        runRound();
    }

    // Clear any existing timers and intervals
    function clearTimersAndIntervals() {
        clearInterval(signalInterval); // Clear the signal interval
        clearTimeout(roundTimer); // Clear the round timer
        clearInterval(countdownInterval); // Clear the countdown timer if any
    }

    // Stop any playing audio immediately
    function stopAudio() {
        audioElement.pause();
        audioElement.currentTime = 0;
    }

    // When user changes options, reset the Start button
    const options = [roundTime, frequency, breakTime, signalType];
    options.forEach(option => {
        option.addEventListener('change', () => {
            if (isRunning) stopTraining();
            startButton.disabled = false; // Enable the start button after options change
        });
    });
});
