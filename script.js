/**
 * Main App Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    const logic = new ChessLogic();
    let ui;

    // Promotion Handling
    let pendingMove = null;
    const modal = document.getElementById('promotion-modal');

    function handleSquareClick(square) {
        const moves = logic.getValidMoves(ui.selectedSquare);

        // If clicking on already selected square, deselect
        if (ui.selectedSquare === square) {
            ui.selectedSquare = null;
            ui.render(logic.getBoard());
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
            ui.render(logic.getBoard());
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
        }
    }

    function updateGame() {
        ui.render(logic.getBoard());
        ui.updateHistory(logic.history);
        ui.updateCaptured(logic.history);

        const turn = logic.turn === 'w' ? "White's Turn" : "Black's Turn";
        const status = logic.status;
        const statusText = status ? `${turn} (${status})` : turn;
        ui.updateStatus(statusText, logic.status === 'Check' || logic.status === 'Checkmate');

        // Update phase
        const moveCount = logic.history.length;
        let phase = 'Opening';
        if (moveCount > 30) phase = 'Endgame';
        else if (moveCount > 10) phase = 'Middle Game';
        document.getElementById('game-phase').textContent = phase;
    }

    // Initialize UI
    ui = new ChessUI('board', handleSquareClick);
    loadThemePreference();
    loadGame(); // Try to load saved game
    if (!localStorage.getItem('chess_game_pgn')) ui.render(logic.getBoard());

    // Controls
    document.getElementById('btn-undo').addEventListener('click', () => {
        logic.undo();
        ui.lastMove = logic.history[logic.history.length - 1] || null;
        updateGame();
        saveGame();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        if (confirm('Reset the game?')) {
            logic.reset();
            ui.lastMove = null;
            ui.selectedSquare = null;
            updateGame();
            localStorage.removeItem('chess_game_pgn');
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
