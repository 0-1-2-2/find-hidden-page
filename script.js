// Game State
const gameState = {
    found: 0,
    totalElements: 5,
    startTime: null,
    timerInterval: null,
    isGameComplete: false
};

// Initialize game on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
});

// Initialize the game
function initializeGame() {
    gameState.found = 0;
    gameState.startTime = Date.now();
    gameState.isGameComplete = false;

    // Reset all hidden elements
    for (let i = 1; i <= gameState.totalElements; i++) {
        const element = document.getElementById(`hidden${i}`);
        element.classList.remove('found');
    }

    // Close victory modal if open
    document.getElementById('victoryModal').classList.remove('show');

    // Update display
    updateFoundCount();
    startTimer();

    // Randomize positions on mobile
    if (window.innerWidth < 768) {
        randomizePositions();
    }
}

// Find element when clicked
function findElement(elementNumber) {
    const element = document.getElementById(`hidden${elementNumber}`);

    // Check if already found
    if (element.classList.contains('found')) {
        return;
    }

    // Mark as found
    element.classList.add('found');
    gameState.found++;

    // Update display
    updateFoundCount();

    // Play sound effect (optional - using Web Audio API)
    playSound();

    // Check if game is complete
    if (gameState.found === gameState.totalElements) {
        completeGame();
    }
}

// Update found count display
function updateFoundCount() {
    document.getElementById('foundCount').textContent = gameState.found;
}

// Start timer
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }

    gameState.timerInterval = setInterval(function() {
        const elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;

        const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('timer').textContent = timeString;
    }, 100);
}

// Complete game
function completeGame() {
    gameState.isGameComplete = true;
    clearInterval(gameState.timerInterval);

    // Show victory modal after a short delay
    setTimeout(function() {
        showVictoryModal();
    }, 500);
}

// Show victory modal
function showVictoryModal() {
    const timeString = document.getElementById('timer').textContent;
    document.getElementById('finalTime').textContent = timeString;
    document.getElementById('victoryModal').classList.add('show');
}

// Reset game
function resetGame() {
    initializeGame();
}

// Play sound effect
function playSound() {
    // Create a simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Audio context not available or permission denied
        console.log('Audio playback not available');
    }
}

// Randomize positions on mobile devices
function randomizePositions() {
    const gameArea = document.querySelector('.game-area');
    const areaRect = gameArea.getBoundingClientRect();
    const positions = [];

    for (let i = 1; i <= gameState.totalElements; i++) {
        const element = document.getElementById(`hidden${i}`);
        const padding = 60;

        let x, y;
        let isValidPosition = false;

        // Generate random positions that don't overlap
        while (!isValidPosition) {
            x = Math.random() * (areaRect.width - padding * 2) + padding;
            y = Math.random() * (areaRect.height - padding * 2) + padding;

            // Check if this position is far enough from other positions
            isValidPosition = !positions.some(pos => {
                const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
                return distance < 120; // Minimum distance between elements
            });
        }

        positions.push({ x, y });
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        element.style.position = 'absolute';
    }
}

// Handle window resize
window.addEventListener('resize', function() {
    if (window.innerWidth < 768 && gameState.found === 0) {
        randomizePositions();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'r' || event.key === 'R') {
        resetGame();
    }
});

// Show hint for debugging (press 'h' to show/hide all hidden elements)
document.addEventListener('keydown', function(event) {
    if (event.key === 'h' || event.key === 'H') {
        const allElements = document.querySelectorAll('.hidden-element');
        allElements.forEach(el => {
            if (!el.classList.contains('found')) {
                el.style.opacity = el.style.opacity === '1' ? '0' : '1';
            }
        });
    }
});

// Add touch support for mobile
document.addEventListener('touchstart', function(event) {
    if (event.target.closest('.hidden-element')) {
        // Touch event will trigger the click handler
    }
}, false);