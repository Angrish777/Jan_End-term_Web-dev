const gameState = {
    hackStrength: 100,
    dataPacketsFound: 0,
    systemLockout: 60,
    highScore: parseInt(localStorage.getItem('highScore')) || 0,
    grid: [],
    flippedCards: [],
    matchedPairs: 0,
    timerInterval: null,
    isGameActive: false
};

const hexToColorMap = {
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    '#FFA500': 'Orange',
    '#800080': 'Purple'
};

const generateHexPairs = () => {
    const pairs = [];
    Object.entries(hexToColorMap).forEach(([hex, color]) => {
        pairs.push({ type: 'hex', value: hex }, { type: 'color', value: color });
    });
    return pairs.sort(() => Math.random() - 0.5); 
};

const initGame = () => {
    gameState.grid = generateHexPairs();
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.hackStrength = 100;
    gameState.dataPacketsFound = 0;
    gameState.systemLockout = 60;
    gameState.isGameActive = true;
    updateUI();
    renderGrid();
    startTimer();
};

const renderGrid = () => {
    const gridContainer = document.getElementById('grid');
    gridContainer.innerHTML = '';
    gameState.grid.forEach((cardData, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;

        const front = document.createElement('div');
        front.className = 'card-front';
        front.textContent = '?';

        const back = document.createElement('div');
        back.className = 'card-back';
        back.textContent = cardData.value;

        if (cardData.type === 'hex') {
            back.style.background = cardData.value;
            back.classList.add('hex-colored'); 
        }

        card.appendChild(front);
        card.appendChild(back);
        gridContainer.appendChild(card);
    });
};

document.getElementById('grid').addEventListener('click', (e) => {
    if (!gameState.isGameActive) return;
    const card = e.target.closest('.card');
    if (!card || card.classList.contains('flipped') || gameState.flippedCards.length >= 2) return;

    const index = parseInt(card.dataset.index);
    card.classList.add('flipped');
    gameState.flippedCards.push({ element: card, data: gameState.grid[index] });

    if (gameState.flippedCards.length === 2) {
        checkMatch();
    }
});

const checkMatch = () => {
    const [card1, card2] = gameState.flippedCards;
    const { data: data1 } = card1;
    const { data: data2 } = card2;

    const isMatch = (data1.type === 'hex' && data2.type === 'color' && hexToColorMap[data1.value] === data2.value) ||
                     (data2.type === 'hex' && data1.type === 'color' && hexToColorMap[data2.value] === data1.value);

    if (isMatch) {
        gameState.matchedPairs++;
        gameState.dataPacketsFound++;
        card1.element.classList.add('success');
        card2.element.classList.add('success');
        gameState.flippedCards = [];
        if (gameState.matchedPairs === 8) {
            endGame(true);
        }
    } else {
        gameState.hackStrength -= 10;
        setTimeout(() => {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
            card1.element.classList.add('failed');
            card2.element.classList.add('failed');
            setTimeout(() => {
                card1.element.classList.remove('failed');
                card2.element.classList.remove('failed');
            }, 500);
            gameState.flippedCards = [];
        }, 1000);
        if (gameState.hackStrength <= 0) {
            endGame(false);
        }
    }
    updateUI();
};

const updateUI = () => {
    document.getElementById('strength-value').textContent = gameState.hackStrength;
    document.getElementById('packets-value').textContent = gameState.dataPacketsFound;
    document.getElementById('timer-value').textContent = gameState.systemLockout;
    document.getElementById('high-score-value').textContent = gameState.highScore;
};

const startTimer = () => {
    gameState.timerInterval = setInterval(() => {
        gameState.systemLockout--;
        updateUI();
        if (gameState.systemLockout <= 0) {
            endGame(false);
        }
    }, 1000);
};

const endGame = (won) => {
    gameState.isGameActive = false;
    clearInterval(gameState.timerInterval);
    if (won && gameState.dataPacketsFound > gameState.highScore) {
        gameState.highScore = gameState.dataPacketsFound;
        localStorage.setItem('highScore', gameState.highScore);
    }
    updateUI();
};

document.getElementById('restart-btn').addEventListener('click', () => {
    clearInterval(gameState.timerInterval);
    initGame();
});

window.addEventListener('load', initGame);