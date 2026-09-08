/**
 * Main App Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    const logic = new ChessLogic();
    let ui;

    // Promotion Handling
    let pendingMove = null;
    const modal = document.getElementById('promotion-modal');

    // AI & Settings
    const aiToggle = document.getElementById('ai-toggle');
    let aiEnabled = aiToggle.checked;
    aiToggle.addEventListener('change', (e) => {
        aiEnabled = e.target.checked;
        if (aiEnabled && logic.turn === 'b') {
            setTimeout(makeAIMove, 500);
        }
    });

    // Timers
    let timerInterval = null;
    let timeWhite = 600; // 10 minutes in seconds
    let timeBlack = 600;
    const timerWhiteEl = document.getElementById('timer-white');
    const timerBlackEl = document.getElementById('timer-black');

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    function updateTimers() {
        if (logic.isGameOver) {
            clearInterval(timerInterval);
            return;
        }
        if (logic.turn === 'w') {
            timeWhite--;
            timerWhiteEl.textContent = formatTime(timeWhite);
            if (timeWhite <= 30) timerWhiteEl.classList.add('low-time');
            if (timeWhite <= 0) handleTimeOut('w');
        } else {
            timeBlack--;
            timerBlackEl.textContent = formatTime(timeBlack);
            if (timeBlack <= 30) timerBlackEl.classList.add('low-time');
            if (timeBlack <= 0) handleTimeOut('b');
        }
    }

    function handleTimeOut(color) {
        clearInterval(timerInterval);
        ui.playSound('gameover');
        ui.showGameOverModal('Time Out', color === 'w' ? 'b' : 'w');
    }

    function startTimers() {
        clearInterval(timerInterval);
        timerInterval = setInterval(updateTimers, 1000);
    }

    function handleSquareClick(square) {
        const moves = logic.getValidMoves(ui.selectedSquare);

        // If clicking on already selected square, deselect
        if (ui.selectedSquare === square) {
            ui.selectedSquare = null;
            ui.render(logic.getBoard(), [], logic.status === 'Check' ? logic.getKingSquare(logic.turn) : null);
            return;
        }

        // Try to make a move
        const move = moves.find(m => m.to === square);
        if (move) {
            if (move.flags.includes('p')) {
                // Pawn Promotion
                pendingMove = { from: ui.selectedSquare, to: square };
                modal.classList.remove('hidden');
                return;
            }

            executeMove({ from: ui.selectedSquare, to: square });
            return;
        }

        // Select a piece
        const piece = logic.getBoard()[8 - parseInt(square[1])]['abcdefgh'.indexOf(square[0])];
        if (piece && piece.color === logic.turn) {
            ui.selectedSquare = square;
            const legalMoves = logic.getValidMoves(square);
            ui.render(logic.getBoard(), legalMoves);
        } else {
            ui.selectedSquare = null;
            ui.render(logic.getBoard(), [], logic.status === 'Check' ? logic.getKingSquare(logic.turn) : null);
        }
    }

    function saveGame() {
        localStorage.setItem('chess_game_pgn', logic.game.pgn());
    }

    function loadGame() {
        const savedPgn = localStorage.getItem('chess_game_pgn');
        if (savedPgn) {
            logic.game.load_pgn(savedPgn);
            ui.lastMove = logic.history[logic.history.length - 1] || null;
            updateGame();
        }
    }

    const themeButton = document.getElementById('btn-theme');
    const themeButtonText = document.getElementById('theme-button-text');

    function applyTheme(theme) {
        document.body.dataset.theme = theme;
        themeButtonText.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
    }

    function loadThemePreference() {
        const savedTheme = localStorage.getItem('chess_theme') || 'dark';
        applyTheme(savedTheme);
    }

    themeButton.addEventListener('click', () => {
        const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('chess_theme', nextTheme);
        applyTheme(nextTheme);
    });

    function executeMove(moveObj) {
        const move = logic.makeMove(moveObj);
        if (move) {
            // Sound Effects
            if (logic.game.in_checkmate()) ui.playSound('gameover');
            else if (logic.game.in_check()) ui.playSound('check');
            else if (move.captured) ui.playSound('capture');
            else ui.playSound('move');

            ui.selectedSquare = null;
            ui.lastMove = move;
            updateGame();
            saveGame();
            startTimers(); // Start or restart timers on move

            if (aiEnabled && logic.turn === 'b' && !logic.isGameOver) {
                setTimeout(makeAIMove, 500); // Add a small delay for realism
            }
        }
    }

    function makeAIMove() {
        const bestMove = logic.getBestMove();
        if (bestMove) {
            const move = logic.makeMove(bestMove);
            if (move) {
                if (logic.game.in_checkmate()) ui.playSound('gameover');
                else if (logic.game.in_check()) ui.playSound('check');
                else if (move.captured) ui.playSound('capture');
                else ui.playSound('move');

                ui.selectedSquare = null;
                ui.lastMove = move;
                updateGame();
                saveGame();
                startTimers();
            }
        }
    }

    function updateGame() {
        const isCheck = logic.status === 'Check' || logic.status === 'Checkmate';
        const kingSquare = isCheck ? logic.getKingSquare(logic.turn) : null;

        ui.render(logic.getBoard(), [], kingSquare);
        ui.updateHistory(logic.history);
        ui.updateCaptured(logic.history);
        ui.updateMaterialScore(logic.getMaterialScore());

        const turn = logic.turn === 'w' ? "White's Turn" : "Black's Turn";
        const status = logic.status;
        const statusText = status ? `${turn} (${status})` : turn;
        ui.updateStatus(statusText, isCheck);

        if (logic.isGameOver) {
            clearInterval(timerInterval);
            let winner = null;
            if (logic.game.in_checkmate()) {
                winner = logic.turn === 'w' ? 'b' : 'w';
            }
            ui.showGameOverModal(status, winner);
        }

        // Update phase
        const moveCount = logic.history.length;
        let phase = 'Opening';
        if (moveCount > 30) phase = 'Endgame';
        else if (moveCount > 10) phase = 'Middle Game';
        document.getElementById('game-phase').textContent = phase;
        document.getElementById('move-number').textContent = Math.floor(moveCount / 2) + 1;

        const scores = logic.getMaterialScore();
        const difference = scores.w - scores.b;
        const advantage = document.getElementById('material-advantage');
        advantage.textContent = difference === 0 ? 'Even' : `${difference > 0 ? 'White' : 'Black'} +${Math.abs(difference)}`;
        advantage.classList.toggle('positive', difference !== 0);
    }

    ui = new ChessUI('board', handleSquareClick);
    loadThemePreference();
    loadGame(); // Try to load saved game
    if (!localStorage.getItem('chess_game_pgn')) {
        ui.render(logic.getBoard());
        ui.updateMaterialScore(logic.getMaterialScore());
    }

    // Controls
    document.getElementById('btn-undo').addEventListener('click', () => {
        logic.undo();
        if (aiEnabled && logic.turn === 'b') {
            // Undo twice if playing against AI to get back to user's turn
            logic.undo();
        }
        ui.lastMove = logic.history[logic.history.length - 1] || null;
        updateGame();
        saveGame();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        if (confirm('Reset the game?')) {
            logic.reset();
            ui.lastMove = null;
            ui.selectedSquare = null;
            timeWhite = 600;
            timeBlack = 600;
            timerWhiteEl.textContent = formatTime(timeWhite);
            timerBlackEl.textContent = formatTime(timeBlack);
            timerWhiteEl.classList.remove('low-time');
            timerBlackEl.classList.remove('low-time');
            clearInterval(timerInterval);
            document.getElementById('game-over-modal').classList.add('hidden');
            updateGame();
            localStorage.removeItem('chess_game_pgn');
        }
    });

    // Close Game Over Modal
    document.getElementById('btn-close-modal').addEventListener('click', () => {
        document.getElementById('game-over-modal').classList.add('hidden');
    });

    // Play Again from Modal
    document.getElementById('btn-play-again').addEventListener('click', () => {
        document.getElementById('btn-reset').click();
    });

    document.getElementById('btn-flip').addEventListener('click', () => {
        ui.flipBoard();
        ui.render(logic.getBoard(), [], logic.status === 'Check' ? logic.getKingSquare(logic.turn) : null);
    });

    document.getElementById('btn-copy-pgn').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(logic.game.pgn() || 'No moves yet');
            const button = document.getElementById('btn-copy-pgn');
            button.classList.add('copied');
            button.title = 'PGN copied';
            setTimeout(() => {
                button.classList.remove('copied');
                button.title = 'Copy PGN';
            }, 1400);
        } catch (error) {
            window.prompt('Copy this PGN:', logic.game.pgn());
        }
    });

    document.getElementById('btn-sound').addEventListener('click', (event) => {
        ui.soundEnabled = !ui.soundEnabled;
        const icon = event.currentTarget.querySelector('svg');
        icon.setAttribute('data-lucide', ui.soundEnabled ? 'volume-2' : 'volume-x');
        event.currentTarget.title = ui.soundEnabled ? 'Mute sounds' : 'Enable sounds';
        lucide.createIcons();
    });

    // Fullscreen Toggle
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const boardWrapper = document.getElementById('board-wrapper');
    const fullscreenIcon = btnFullscreen.querySelector('i');

    function toggleFullscreen() {
        boardWrapper.classList.toggle('fullscreen-mode');
        if (boardWrapper.classList.contains('fullscreen-mode')) {
            fullscreenIcon.setAttribute('data-lucide', 'minimize');
        } else {
            fullscreenIcon.setAttribute('data-lucide', 'maximize');
        }
        lucide.createIcons();
    }

    btnFullscreen.addEventListener('click', toggleFullscreen);

    // Close fullscreen on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && boardWrapper.classList.contains('fullscreen-mode')) {
            toggleFullscreen();
        }
    });

    // Promotion Choices
    document.querySelectorAll('.choice').forEach(choice => {
        choice.addEventListener('click', () => {
            const pieceType = choice.dataset.piece;
            if (pendingMove) {
                executeMove({ ...pendingMove, promotion: pieceType });
                pendingMove = null;
                modal.classList.add('hidden');
            }
        });
    });
});
