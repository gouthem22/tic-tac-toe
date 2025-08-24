let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let scores = { X: 0, O: 0, draw: 0 };
let gameMode = 'multi'; // 'single' or 'multi'
let isAITurn = false;

const cells = document.querySelectorAll('.cell');
const currentPlayerElement = document.getElementById('currentPlayer');
const gameMessageElement = document.getElementById('gameMessage');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');
const scoreDrawElement = document.getElementById('scoreDraw');
const modeSelectionElement = document.getElementById('modeSelection');
const gameInfoElement = document.getElementById('gameInfo');
const gameBoardElement = document.getElementById('gameBoard');
const gameControlsElement = document.getElementById('gameControls');
const gameModeElement = document.getElementById('gameMode');

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Initialize particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
        particlesContainer.appendChild(particle);
    }
}

function startGame(mode) {
    gameMode = mode;
    modeSelectionElement.style.display = 'none';
    gameInfoElement.style.display = 'block';
    gameBoardElement.style.display = 'grid';
    gameMessageElement.style.display = 'block';
    gameControlsElement.style.display = 'block';
    
    if (mode === 'single') {
        gameModeElement.textContent = '🤖 Single Player Mode - You are X, AI is O';
        gameMessageElement.textContent = 'You go first! Click any cell.';
    } else {
        gameModeElement.textContent = '👥 Two Player Mode';
        gameMessageElement.textContent = "Let's play! X goes first!";
    }
    
    resetGame();
}

function backToModeSelection() {
    modeSelectionElement.style.display = 'block';
    gameInfoElement.style.display = 'none';
    gameBoardElement.style.display = 'none';
    gameMessageElement.style.display = 'none';
    gameControlsElement.style.display = 'none';
    resetScore();
}

function returnToHomePage() {
    // Clear any existing animations and reset game state
    gameMessageElement.classList.remove('winner-message');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');
    });
    
    // Return to mode selection
    modeSelectionElement.style.display = 'block';
    gameInfoElement.style.display = 'none';
    gameBoardElement.style.display = 'none';
    gameMessageElement.style.display = 'none';
    gameControlsElement.style.display = 'none';
    
    // Reset game variables
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    isAITurn = false;
}

// AI Logic - Minimax Algorithm
function minimax(board, depth, isMaximizing) {
    const winner = checkWinner(board);
    
    if (winner === 'O') return 1; // AI wins
    if (winner === 'X') return -1; // Human wins
    if (winner === 'draw') return 0; // Draw
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function getBestMove() {
    let bestScore = -Infinity;
    let bestMove;
    
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O';
            let score = minimax(gameBoard, 0, false);
            gameBoard[i] = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function checkWinner(board) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    
    if (!board.includes('')) {
        return 'draw';
    }
    
    return null;
}

function makeAIMove() {
    if (!gameActive || currentPlayer !== 'O' || gameMode !== 'single') return;
    
    isAITurn = true;
    gameMessageElement.textContent = '🤖 AI is thinking...';
    
    setTimeout(() => {
        const bestMove = getBestMove();
        
        gameBoard[bestMove] = 'O';
        cells[bestMove].textContent = 'O';
        cells[bestMove].classList.add('o');
        
        if (!checkResult()) {
            currentPlayer = 'X';
            currentPlayerElement.textContent = 'Current Player: X';
            gameMessageElement.textContent = 'Your turn! Click any cell.';
        }
        
        isAITurn = false;
    }, 1000); // 1 second delay for AI move
}

function handleCellClick(e) {
    const cellIndex = e.target.getAttribute('data-cell');
    
    if (gameBoard[cellIndex] !== '' || !gameActive || isAITurn) {
        return;
    }

    gameBoard[cellIndex] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.classList.add(currentPlayer.toLowerCase());

    if (checkResult()) {
        return;
    }

    if (gameMode === 'single') {
        if (currentPlayer === 'X') {
            currentPlayer = 'O';
            currentPlayerElement.textContent = 'Current Player: O (AI)';
            makeAIMove();
        }
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        currentPlayerElement.textContent = `Current Player: ${currentPlayer}`;
        gameMessageElement.textContent = `Player ${currentPlayer}'s turn!`;
    }
}

function checkResult() {
    let roundWon = false;
    let winningCells = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            roundWon = true;
            winningCells = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        if (gameMode === 'single') {
            if (currentPlayer === 'X') {
                gameMessageElement.textContent = '🎉 You Win! Great job! 🎉';
            } else {
                gameMessageElement.textContent = '🤖 AI Wins! Better luck next time! 🤖';
            }
        } else {
            gameMessageElement.textContent = `🎉 Player ${currentPlayer} Wins! 🎉`;
        }
        
        gameMessageElement.classList.add('winner-message');
        gameActive = false;
        scores[currentPlayer]++;
        updateScoreDisplay();
        
        // Highlight winning cells
        winningCells.forEach(index => {
            cells[index].classList.add('winning');
        });
        
        // Auto return to home page after 3 seconds
        setTimeout(() => {
            returnToHomePage();
        }, 3000);
        
        return true;
    }

    if (!gameBoard.includes('')) {
        gameMessageElement.textContent = "🤝 It's a Draw! 🤝";
        gameActive = false;
        scores.draw++;
        updateScoreDisplay();
        
        // Auto return to home page after 3 seconds
        setTimeout(() => {
            returnToHomePage();
        }, 3000);
        
        return true;
    }

    return false;
}

function resetGame() {
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    isAITurn = false;
    
    currentPlayerElement.textContent = 'Current Player: X';
    
    if (gameMode === 'single') {
        gameMessageElement.textContent = 'You go first! Click any cell.';
    } else {
        gameMessageElement.textContent = "Let's play! X goes first!";
    }
    
    gameMessageElement.classList.remove('winner-message');
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');
    });
}

function resetScore() {
    scores = { X: 0, O: 0, draw: 0 };
    updateScoreDisplay();
    resetGame();
}

function updateScoreDisplay() {
    scoreXElement.textContent = scores.X;
    scoreOElement.textContent = scores.O;
    scoreDrawElement.textContent = scores.draw;
}

// Event listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

// Initialize the game
createParticles();
updateScoreDisplay();