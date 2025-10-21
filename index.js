const cells = Array.from(document.querySelectorAll('.cell'));
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
const scorePlayerEl = document.getElementById('score-player');
const scoreBotEl = document.getElementById('score-bot');

let board = Array(9).fill(null); 
let currentPlayer = 'X';
let running = true;
let score = { player: 0, bot: 0 };

function loadScore() {
	try {
		const s = JSON.parse(localStorage.getItem('ticTacToeScore'));
		if (s && typeof s.player === 'number' && typeof s.bot === 'number') score = s;
	} catch (e) { }
	updateScoreUI();
}

function saveScore() {
	try { localStorage.setItem('ticTacToeScore', JSON.stringify(score)); } catch (e) { }
}

function updateScoreUI() {
	if (scorePlayerEl) scorePlayerEl.textContent = String(score.player);
	if (scoreBotEl) scoreBotEl.textContent = String(score.bot);
}

const winningCombinations = [
	[0,1,2], [3,4,5], [6,7,8],
	[0,3,6], [1,4,7], [2,5,8],
	[0,4,8], [2,4,6]
];

function updateStatus() {
	if (!running) return;
    	statusText.textContent = `Vez do jogador: ${currentPlayer}`;
}

function handleCellClick(e) {
	const cell = e.currentTarget;
	const index = Number(cell.dataset.index);

	if (!running) return;
	if (board[index]) return; 

	board[index] = currentPlayer;
	cell.textContent = currentPlayer;
	cell.classList.add(currentPlayer.toLowerCase());

	const winningCombo = getWinningCombo(currentPlayer);
	if (winningCombo) {
		statusText.textContent = `Jogador ${currentPlayer} venceu!`;
		running = false;
		highlightWinningCells(winningCombo);
        	
		if (currentPlayer === 'X') {
			score.player += 1;
		} else {
			score.bot += 1;
		}
		updateScoreUI();
		saveScore();
		return;
	}

	if (board.every(cell => cell !== null)) {
		statusText.textContent = `Empate!`;
		running = false;
		return;
	}

	currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
	updateStatus();


    	if (running && currentPlayer === 'O') {
		setTimeout(botMove, 300);
	}
}


function botMove() {
	if (!running) return;
	
	const choice = findWinningMove('O') || findWinningMove('X') || (board[4] ? null : 4) || chooseCorner() || chooseRandom();
	if (choice == null) return;
	
	const cell = cells[choice];
	cell.click();
}

function findWinningMove(player) {
	for (const combo of winningCombinations) {
		const values = combo.map(i => board[i]);
		const emptyIndex = combo.find(i => board[i] === null);
		if (emptyIndex !== undefined) {
			const filledByPlayer = combo.filter(i => board[i] === player).length;
			const emptyCount = combo.filter(i => board[i] === null).length;
			if (filledByPlayer === 2 && emptyCount === 1) return emptyIndex;
		}
	}
	return null;
}

function chooseCorner() {
	const corners = [0,2,6,8].filter(i => board[i] === null);
	if (corners.length === 0) return null;
	return corners[Math.floor(Math.random() * corners.length)];
}

function chooseRandom() {
	const empties = board.map((v,i) => v === null ? i : -1).filter(i => i !== -1);
	if (empties.length === 0) return null;
	return empties[Math.floor(Math.random() * empties.length)];
}

function getWinningCombo(player) {
	return winningCombinations.find(combo => combo.every(i => board[i] === player)) || null;
}

function highlightWinningCells(combo) {
	combo.forEach(i => cells[i].classList.add('win'));
}

function restartGame() {
	board.fill(null);
	currentPlayer = 'X';
	running = true;
	cells.forEach(c => {
		c.textContent = '';
		c.classList.remove('win', 'x', 'o');
	});
	statusText.textContent = `Vez do jogador: ${currentPlayer}`;
}


cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
const resetScoreBtn = document.getElementById('resetScoreBtn');
if (resetScoreBtn) resetScoreBtn.addEventListener('click', () => { resetScore(); });

loadScore();
updateStatus();


function resetScore() {
	score = { player: 0, bot: 0 };
	saveScore();
	updateScoreUI();
}