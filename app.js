(() => {
    'use strict';

    const GAMES = {
        runner: './games/runner/index.html',
        catcher: './games/catcher/index.html',
        match3: './games/match3/index.html'
    };

    const coverScreen = document.getElementById('coverScreen');
    const selectScreen = document.getElementById('selectScreen');
    const bgFirTree = document.getElementById('bgFirTree');
    const playBtn = document.getElementById('playBtn');
    const gameContainer = document.getElementById('gameContainer');
    const snowCanvas = document.getElementById('snowCanvas');
    const snowCtx = snowCanvas.getContext('2d');

    function updateViewportHeight() {
        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    }

    function showSelectScreen() {
        coverScreen.classList.add('hidden');
        selectScreen.classList.remove('hidden');
        bgFirTree.classList.remove('hidden');
    }

    function launchGame(gameKey) {
        const url = GAMES[gameKey];
        if (!url) return;
        window.location.href = url;
    }

    // Навигация
    playBtn.addEventListener('click', showSelectScreen);

    // Иконки на первом экране также позволяют перейти в игру
    document.querySelectorAll('.hub-game-tile').forEach((tile) => {
        tile.addEventListener('click', () => {
            const gameKey = tile.dataset.game;
            launchGame(gameKey);
        });
    });

    // Карточки и кнопки на втором экране («СВОБОДНАЯ ИГРА»)
    document.querySelectorAll('.game-card').forEach((card) => {
        card.addEventListener('click', () => {
            const gameKey = card.dataset.game;
            launchGame(gameKey);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                launchGame(card.dataset.game);
            }
        });
    });

    // Проверка параметра ?screen=select для прямого возврата к выбору
    const params = new URLSearchParams(window.location.search);
    if (params.get('screen') === 'select') {
        showSelectScreen();
    }

    // ========================================================
    // Падающий снег (использует ассеты snowflakes из проекта)
    // ========================================================
    const FLAKE_COUNT = 22;
    const flakeSprites = [];
    for (let i = 0; i < FLAKE_COUNT; i++) {
        const img = new Image();
        img.src = `assets/snowflakes/flake_${i}.webp`;
        flakeSprites.push(img);
    }

    let width = 390;
    let height = 844;
    const flakes = [];

    function resizeSnow() {
        const rect = gameContainer.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width || 390;
        height = rect.height || 844;
        snowCanvas.width = Math.round(width * dpr);
        snowCanvas.height = Math.round(height * dpr);
        snowCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createFlake(randomY = false) {
        return {
            x: Math.random() * width,
            y: randomY ? Math.random() * height : -24,
            size: 10 + Math.random() * 14,
            speedY: 18 + Math.random() * 26,
            drift: (Math.random() - 0.5) * 14,
            swayPhase: Math.random() * Math.PI * 2,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.8,
            opacity: 0.4 + Math.random() * 0.45,
            spriteIndex: Math.floor(Math.random() * FLAKE_COUNT)
        };
    }

    function initSnow() {
        resizeSnow();
        for (let i = 0; i < 28; i++) {
            flakes.push(createFlake(true));
        }
    }

    let lastTime = performance.now();
    function renderSnow(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        snowCtx.clearRect(0, 0, width, height);

        for (let i = 0; i < flakes.length; i++) {
            const f = flakes[i];
            f.swayPhase += dt * 1.4;
            f.y += f.speedY * dt;
            f.x += (f.drift + Math.sin(f.swayPhase) * 10) * dt;
            f.rotation += f.rotSpeed * dt;

            if (f.y > height + 30) {
                flakes[i] = createFlake(false);
                continue;
            }
            if (f.x < -30) f.x = width + 25;
            if (f.x > width + 30) f.x = -25;

            const sprite = flakeSprites[f.spriteIndex];
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                snowCtx.save();
                snowCtx.translate(f.x, f.y);
                snowCtx.rotate(f.rotation);
                snowCtx.globalAlpha = f.opacity;
                snowCtx.drawImage(sprite, -f.size / 2, -f.size / 2, f.size, f.size);
                snowCtx.restore();
            }
        }

        requestAnimationFrame(renderSnow);
    }

    updateViewportHeight();
    window.addEventListener('resize', () => {
        updateViewportHeight();
        resizeSnow();
    });

    initSnow();
    requestAnimationFrame(renderSnow);
})();
