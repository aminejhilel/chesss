/**
 * UI Module
 * Handles board rendering and DOM updates
 */
class ChessUI {
    constructor(boardElementId, onSquareClick) {
        this.boardElement = document.getElementById(boardElementId);
        this.onSquareClick = onSquareClick;
        this.pieceImages = {
            'w': {
                'p': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
                'r': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
                'n': 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
                'b': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
                'q': 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
                'k': 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg'
            },
            'b': {
                'p': 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
                'r': 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
                'n': 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
                'b': 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
                'q': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
                'k': 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg'
            }
        };
        this.sounds = {
            move: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
            capture: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
            check: new Audio('https://assets.mixkit.co/active_storage/sfx/2186/2186-preview.mp3'),
            gameover: new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3')
        };
        this.selectedSquare = null;
        this.lastMove = null;
        this.orientation = 'white';
        this.soundEnabled = true;
    }

    playSound(type) {
        if (this.soundEnabled && this.sounds[type]) {
            this.sounds[type].currentTime = 0;
            this.sounds[type].play().catch(() => { });
        }
    }

    render(boardState, legalMoves = [], kingInCheckSquare = null) {
        this.boardElement.innerHTML = '';

        const rows = this.orientation === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
        const columns = this.orientation === 'white' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

        for (const r of rows) {
            for (const c of columns) {
                const squareName = this.getSquareName(r, c);
                const square = document.createElement('div');
                const isLight = (r + c) % 2 === 0;

                square.className = `square ${isLight ? 'light' : 'dark'}`;
                square.dataset.square = squareName;

                // Highlights
                if (this.selectedSquare === squareName) square.classList.add('selected');
                if (this.lastMove && (this.lastMove.from === squareName || this.lastMove.to === squareName)) {
                    square.classList.add('last-move');
                }
                if (kingInCheckSquare === squareName) {
                    square.classList.add('in-check');
                }

                const piece = boardState[r][c];
                if (piece) {
                    const img = document.createElement('img');
                    img.src = this.pieceImages[piece.color][piece.type];
                    img.className = 'piece';
                    if (this.lastMove && this.lastMove.to === squareName) {
                        img.style.animation = 'piece-drop 0.3s ease-out';
                    }
                    square.appendChild(img);
                }

                // Legal move hints
                const moveHint = legalMoves.find(m => m.to === squareName);
                if (moveHint) {
                    const hintTask = document.createElement('div');
                    hintTask.className = 'legal-move-hint';
                    // If it's a capture, use a different style (ring)
                    if (moveHint.flags.includes('c') || moveHint.flags.includes('e')) {
                        hintTask.classList.add('capture');
                    }
                    square.appendChild(hintTask);
                }

                square.addEventListener('click', () => this.onSquareClick(squareName));
                this.boardElement.appendChild(square);
            }
        }
    }

    flipBoard() {
        this.orientation = this.orientation === 'white' ? 'black' : 'white';
        const ranks = document.querySelectorAll('.coordinates-rank span');
        const files = document.querySelectorAll('.coordinates-file span');
        const rankValues = this.orientation === 'white' ? ['8', '7', '6', '5', '4', '3', '2', '1'] : ['1', '2', '3', '4', '5', '6', '7', '8'];
        const fileValues = this.orientation === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
        ranks.forEach((rank, index) => { rank.textContent = rankValues[index]; });
        files.forEach((file, index) => { file.textContent = fileValues[index]; });
    }

    getSquareName(row, col) {
        const files = 'abcdefgh';
        return files[col] + (8 - row);
    }

    updateStatus(text, isCheck = false) {
        const textEl = document.getElementById('game-status-text');
        const pulseEl = document.querySelector('.pulse');
        textEl.textContent = text;
        pulseEl.style.backgroundColor = isCheck ? 'var(--danger)' : 'var(--accent)';
    }

    updateHistory(history) {
        const list = document.getElementById('move-history');
        list.innerHTML = '';

        for (let i = 0; i < history.length; i += 2) {
            const num = (i / 2) + 1;
            const whiteMove = history[i].san;
            const blackMove = history[i + 1] ? history[i + 1].san : '';

            list.innerHTML += `
                <div class="move-num">${num}.</div>
                <div class="move-val">${whiteMove}</div>
                <div class="move-val">${blackMove}</div>
            `;
        }
        list.scrollTop = list.scrollHeight;
    }

    updateCaptured(history) {
        const capturedWhite = document.getElementById('captured-white');
        const capturedBlack = document.getElementById('captured-black');

        capturedWhite.innerHTML = '';
        capturedBlack.innerHTML = '';

        const captured = { w: [], b: [] };
        history.forEach(m => {
            if (m.captured) {
                // if white moves and captures, piece was black
                const capturedColor = m.color === 'w' ? 'b' : 'w';
                captured[capturedColor].push(m.captured);
            }
        });

        captured.w.forEach(type => {
            capturedWhite.innerHTML += `<img src="${this.pieceImages['w'][type]}" class="captured-piece">`;
        });
        captured.b.forEach(type => {
            capturedBlack.innerHTML += `<img src="${this.pieceImages['b'][type]}" class="captured-piece">`;
        });
    }

    updateMaterialScore(scores) {
        const whiteScoreEl = document.getElementById('score-white');
        const blackScoreEl = document.getElementById('score-black');

        let wDiff = scores.w - scores.b;
        let bDiff = scores.b - scores.w;

        whiteScoreEl.textContent = wDiff > 0 ? `+${wDiff}` : '';
        blackScoreEl.textContent = bDiff > 0 ? `+${bDiff}` : '';
    }

    showGameOverModal(status, winner) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('game-over-title');
        const message = document.getElementById('game-over-message');

        modal.classList.remove('hidden');
        title.textContent = status;

        if (winner === 'w') {
            message.textContent = "White wins the game.";
        } else if (winner === 'b') {
            message.textContent = "Black wins the game.";
        } else {
            message.textContent = "The game is a draw.";
        }
    }
}

window.ChessUI = ChessUI;
