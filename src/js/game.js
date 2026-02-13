/**
 * ASHWIN SDK — Mini-Game: Block Chain Collector
 * 30-second arcade game built with Canvas.
 * Opt-in, lazy-loaded, sprite-sheet-based.
 * Keyboard: Arrow keys / A-D to move, collect falling blocks.
 */

(function () {
    'use strict';

    const launchBtn = document.getElementById('launch-game');
    const canvas = document.getElementById('game-canvas');
    const scoreDisplay = document.getElementById('game-score');

    if (!launchBtn || !canvas) return;

    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    // ── Colors (match theme) ───────────────────────────────
    const NEON = '#00FF66';
    const INK = '#000000';
    const PAPER = '#FFFFFF';
    const DIMMED = '#1A1A1A';
    const DANGER = '#FF3333';

    // ── Game State ─────────────────────────────────────────
    let running = false;
    let score = 0;
    let timeLeft = 30;
    let blocks = [];
    let chain = [];
    let player = { x: W / 2 - 16, y: H - 40, w: 32, h: 24, speed: 5 };
    let keys = {};
    let animFrame = null;
    let timerInterval = null;

    // ── Pixel Art Helpers ──────────────────────────────────
    function drawPixelRect(x, y, w, h, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x), Math.round(y), w, h);
    }

    function drawPlayer() {
        // Simple pixel collector sprite
        drawPixelRect(player.x, player.y, player.w, player.h, NEON);
        drawPixelRect(player.x + 4, player.y - 4, player.w - 8, 4, NEON);
        // Eyes
        drawPixelRect(player.x + 8, player.y + 6, 4, 4, INK);
        drawPixelRect(player.x + 20, player.y + 6, 4, 4, INK);
    }

    function drawBlock(block) {
        const color = block.isChain ? NEON : PAPER;
        drawPixelRect(block.x, block.y, block.w, block.h, color);
        // Inner detail
        drawPixelRect(block.x + 2, block.y + 2, block.w - 4, block.h - 4, block.isChain ? '#00CC52' : DIMMED);
        // Link symbol on chain blocks
        if (block.isChain) {
            drawPixelRect(block.x + 6, block.y + 6, 4, 4, NEON);
        }
    }

    function drawChainBar() {
        const barW = 120;
        const barH = 12;
        const barX = W - barW - 10;
        const barY = 10;
        const filled = Math.min(chain.length / 10, 1) * barW;

        ctx.fillStyle = DIMMED;
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = NEON;
        ctx.fillRect(barX, barY, filled, barH);
        ctx.strokeStyle = PAPER;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        ctx.fillStyle = PAPER;
        ctx.font = '10px "Source Code Pro", monospace';
        ctx.fillText(`CHAIN: ${chain.length}/10`, barX, barY + barH + 12);
    }

    function drawHUD() {
        ctx.fillStyle = PAPER;
        ctx.font = 'bold 14px "Source Code Pro", monospace';
        ctx.fillText(`SCORE: ${score}`, 10, 22);
        ctx.fillText(`TIME: ${timeLeft}s`, 10, 40);
        drawChainBar();
    }

    function drawBackground() {
        ctx.fillStyle = INK;
        ctx.fillRect(0, 0, W, H);

        // Grid lines
        ctx.strokeStyle = 'rgba(0,255,102,0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y < H; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // Bottom line
        ctx.strokeStyle = NEON;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, H - 10);
        ctx.lineTo(W, H - 10);
        ctx.stroke();
    }

    // ── Block Spawning ─────────────────────────────────────
    function spawnBlock() {
        const isChain = Math.random() > 0.4;
        blocks.push({
            x: Math.random() * (W - 20),
            y: -20,
            w: 16,
            h: 16,
            speed: 1.5 + Math.random() * 2,
            isChain,
        });
    }

    // ── Collision Detection ─────────────────────────────────
    function collides(a, b) {
        return a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y;
    }

    // ── Update ──────────────────────────────────────────────
    function update() {
        // Player movement
        if ((keys['ArrowLeft'] || keys['KeyA']) && player.x > 0) {
            player.x -= player.speed;
        }
        if ((keys['ArrowRight'] || keys['KeyD']) && player.x < W - player.w) {
            player.x += player.speed;
        }

        // Block movement + collision + cleanup
        for (let i = blocks.length - 1; i >= 0; i--) {
            blocks[i].y += blocks[i].speed;

            if (collides(player, blocks[i])) {
                if (blocks[i].isChain) {
                    chain.push(1);
                    score += 10;
                    if (chain.length >= 10) {
                        score += 50; // Bonus for completing a chain
                        chain = [];
                    }
                } else {
                    score += 1;
                }
                blocks.splice(i, 1);
                continue;
            }

            // Remove off-screen blocks
            if (blocks[i].y > H) {
                if (blocks[i].isChain) {
                    chain = []; // Break chain if missed
                }
                blocks.splice(i, 1);
            }
        }
    }

    // ── Render ──────────────────────────────────────────────
    function render() {
        drawBackground();
        blocks.forEach(drawBlock);
        drawPlayer();
        drawHUD();
    }

    // ── Game Loop ──────────────────────────────────────────
    function gameLoop() {
        if (!running) return;
        update();
        render();
        animFrame = requestAnimationFrame(gameLoop);
    }

    // ── Start / End ────────────────────────────────────────
    function startGame() {
        score = 0;
        timeLeft = 30;
        blocks = [];
        chain = [];
        player.x = W / 2 - 16;
        running = true;

        canvas.style.display = 'block';
        scoreDisplay.style.display = 'block';
        launchBtn.style.display = 'none';
        canvas.focus();

        // Spawn blocks periodically
        const spawnTimer = setInterval(() => {
            if (!running) { clearInterval(spawnTimer); return; }
            spawnBlock();
            if (Math.random() > 0.6) spawnBlock(); // Occasional double
        }, 400);

        // Timer
        timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                endGame();
                clearInterval(spawnTimer);
            }
        }, 1000);

        gameLoop();
    }

    function endGame() {
        running = false;
        clearInterval(timerInterval);
        if (animFrame) cancelAnimationFrame(animFrame);

        // Final screen
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = NEON;
        ctx.font = 'bold 24px "Source Code Pro", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
        ctx.fillStyle = PAPER;
        ctx.font = '16px "Source Code Pro", monospace';
        ctx.fillText(`FINAL SCORE: ${score}`, W / 2, H / 2 + 15);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '12px "Source Code Pro", monospace';
        ctx.fillText('PRESS ENTER TO PLAY AGAIN', W / 2, H / 2 + 45);
        ctx.textAlign = 'start';

        scoreDisplay.querySelector('span').textContent = score;

        // Track score
        if (window.SDK_ANALYTICS) {
            window.SDK_ANALYTICS.track('game_complete', { score });
        }
    }

    // ── Input ──────────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.code === 'Enter' && !running && canvas.style.display === 'block') {
            startGame();
        }
    });
    document.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Touch controls (mobile)
    let touchStartX = 0;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].clientX;
        const diff = touchX - touchStartX;
        if (Math.abs(diff) > 5) {
            player.x += diff > 0 ? player.speed : -player.speed;
            player.x = Math.max(0, Math.min(W - player.w, player.x));
            touchStartX = touchX;
        }
    }, { passive: true });

    // ── Launch Button ──────────────────────────────────────
    launchBtn.addEventListener('click', startGame);

})();
