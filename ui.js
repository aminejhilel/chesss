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
    }

    playSound(type) {
        if (this.sounds[type]) {
            this.sounds[type].currentTime = 0;
            this.sounds[type].play().catch(() => { });
        }
    }

    render(boardState, legalMoves = []) {
        this.boardElement.innerHTML = '';

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
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
                if (legalMoves.some(m => m.to === squareName)) {
                    const hintTask = document.createElement('div');
                    hintTask.className = 'legal-move-hint';
                    square.appendChild(hintTask);
                }

                square.addEventListener('click', () => this.onSquareClick(squareName));
                this.boardElement.appendChild(square);
            }
        }
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
}

window.ChessUI = ChessUI;
