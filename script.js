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
    const reactionTimeDisplay = document.getElementById('reaction-time');

    let signalInterval;
    let roundTimer;
    let countdownInterval;
    let isRunning = false;
    let isPaused = false;
    let timeRemaining;
    let roundLength, signalDelay, breakDuration;
    let isTrainingRunning = false;
    let activeTimeouts = [];
    let signalTime = null;

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

    document.addEventListener('click', () => {
        if (signalTime) {
            const reaction = Date.now() - signalTime;
            reactionTimeDisplay.textContent = `Reaction Time: ${reaction} ms`;
            signalTime = null;
        }
    });

    function startTraining() {
        if (isRunning) {
            stopTraining();
        }

        clearTimersAndIntervals();

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

    function runRound() {
        timeRemainingDisplay.textContent = 'Round in progress';
        reactionTimeDisplay.textContent = 'Reaction Time: -- ms';

        signalInterval = setInterval(() => {
            if (isPaused) return;

            const randomDelay = Math.random() * signalDelay;
            const timeoutId = setTimeout(() => {
                if (signalType.value === 'visual' || signalType.value === 'both') {
                    flashVisualSignal();
                }
                if (signalType.value === 'audio' || signalType.value === 'both') {
                    playAudio('clap.mp3');
                }
            }, randomDelay);
            activeTimeouts.push(timeoutId);
        }, signalDelay);
        activeTimeouts.push(signalInterval);

        roundTimer = setTimeout(() => {
            if (!isPaused) {
                clearInterval(signalInterval);
                signalInterval = null;
                playAudio('end.mp3');
                timeRemainingDisplay.textContent = 'Break Time';
                countdown(breakDuration / 1000, 'Next round in', () => {
                    startTraining();
                });
            }
        }, roundLength);
        activeTimeouts.push(roundTimer);
    }

    function flashVisualSignal() {
        visualSignal.style.display = 'block';
        signalTime = Date.now();
        setTimeout(() => {
            visualSignal.style.display = 'none';
        }, 500);
    }

    function playAudio(filename) {
        audioElement.src = `audio/${filename}`;
        audioElement.play();
        signalTime = Date.now();
    }

    function countdown(seconds, message, callback) {
        let counter = seconds;
        timeRemainingDisplay.textContent = `${message}: ${counter}`;
        countdownInterval = setInterval(() => {
            if (isPaused) return;
            counter--;
            timeRemainingDisplay.textContent = `${message}: ${counter}`;
            if (counter <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                callback();
            }
        }, 1000);
        activeTimeouts.push(countdownInterval);

        if (seconds === 5) {
            let countdownAudio = new Audio("audio/countdown.mp3");
            countdownAudio.play();
        }
    }

    function stopTraining() {
        clearTimersAndIntervals();
        stopAudio();
        isRunning = false;
        isPaused = false;
        isTrainingRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
        stopButton.disabled = true;
        restartButton.disabled = true;
        timeRemainingDisplay.textContent = 'Training Stopped';
        reactionTimeDisplay.textContent = 'Reaction Time: -- ms';

        pauseButton.textContent = 'Pause';
    }

    function restartTraining() {
        stopTraining();
        startTraining();
    }

    function pauseTraining() {
        isPaused = true;
        timeRemainingDisplay.textContent = 'Training Paused';
        clearInterval(countdownInterval);
        clearInterval(signalInterval);
        clearAllTimeouts();
        stopAudio();
    }

    function resumeTraining() {
        isPaused = false;
        timeRemainingDisplay.textContent = 'Training Resumed';
        runRound();
    }

    function clearTimersAndIntervals() {
        activeTimeouts.forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        activeTimeouts = [];
        signalTime = null;
    }

    function clearAllTimeouts() {
        activeTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        activeTimeouts = [];
        signalTime = null;
    }

    function stopAudio() {
        audioElement.pause();
        audioElement.currentTime = 0;
    }

    const options = [roundTime, frequency, breakTime, signalType];
    options.forEach(option => {
        option.addEventListener('change', () => {
            if (isRunning) stopTraining();
            startButton.disabled = false;
        });
    });
});
