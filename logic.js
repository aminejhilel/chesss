/**
 * Logic Module
 * Wraps chess.js for state management
 */
class ChessLogic {
    constructor() {
        this.game = new Chess();
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
}

window.ChessLogic = ChessLogic;
