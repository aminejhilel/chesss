/**
 * Logic Module
 * Wraps chess.js for state management
 */
class ChessLogic {
    constructor() {
        this.game = new Chess();
        this.pieceValues = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
        };
    }

    reset() {
        this.game.reset();
    }

    undo() {
        return this.game.undo();
    }

    get fen() {
        return this.game.fen();
    }

    get turn() {
        return this.game.turn(); // 'w' or 'b'
    }

    get history() {
        return this.game.history({ verbose: true });
    }

    get isGameOver() {
        return this.game.game_over();
    }

    get status() {
        if (this.game.in_checkmate()) return 'Checkmate';
        if (this.game.in_draw()) return 'Draw';
        if (this.game.in_stalemate()) return 'Stalemate';
        if (this.game.in_threefold_repetition()) return 'Threefold Repetition';
        if (this.game.in_check()) return 'Check';
        return '';
    }

    getValidMoves(square) {
        return this.game.moves({ square, verbose: true });
    }

    makeMove(move) {
        // move can be {from: 'e2', to: 'e4', promotion: 'q'}
        return this.game.move(move);
    }

    getBoard() {
        return this.game.board();
    }

    getKingSquare(color) {
        const board = this.getBoard();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.type === 'k' && piece.color === color) {
                    return 'abcdefgh'[c] + (8 - r);
                }
            }
        }
        return null;
    }

    getMaterialScore() {
        let white = 0;
        let black = 0;
        const board = this.getBoard();
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece) {
                    if (piece.color === 'w') white += this.pieceValues[piece.type];
                    else black += this.pieceValues[piece.type];
                }
            }
        }
        return { w: white, b: black };
    }

    evaluateBoard() {
        let score = 0;
        const board = this.getBoard();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece) {
                    const value = this.pieceValues[piece.type];
                    score += piece.color === 'w' ? value : -value;
                }
            }
        }
        return score;
    }

    minimax(depth, alpha, beta, isMaximizing) {
        if (depth === 0 || this.game.game_over()) {
            return this.evaluateBoard();
        }

        const moves = this.game.moves();

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                this.game.move(move);
                const ev = this.minimax(depth - 1, alpha, beta, false);
                this.game.undo();
                maxEval = Math.max(maxEval, ev);
                alpha = Math.max(alpha, ev);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                this.game.move(move);
                const ev = this.minimax(depth - 1, alpha, beta, true);
                this.game.undo();
                minEval = Math.min(minEval, ev);
                beta = Math.min(beta, ev);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    getBestMove() {
        const moves = this.game.moves({ verbose: true });
        if (moves.length === 0) return null;

        let bestMove = null;
        let bestValue = this.turn === 'w' ? -Infinity : Infinity;

        for (const move of moves) {
            this.game.move(move);
            const boardValue = this.minimax(2, -Infinity, Infinity, this.turn === 'w'); // Depth 2 for performance in JS
            this.game.undo();

            if (this.turn === 'w') {
                if (boardValue > bestValue) {
                    bestValue = boardValue;
                    bestMove = move;
                }
            } else {
                if (boardValue < bestValue) {
                    bestValue = boardValue;
                    bestMove = move;
                }
            }
        }
        return bestMove || moves[Math.floor(Math.random() * moves.length)];
    }
}

window.ChessLogic = ChessLogic;
