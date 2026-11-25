/**
 * Новогодняя Игра — Мешок Деда Мороза (Уровень 2: Чемпион)
 * Полный игровой движок на HTML5 Canvas 2D
 */
(function() {
    'use strict';

    // ----------------------------------------------------
    // СНЕЖНЫЙ ДВИЖОК ДЛЯ ФОНА
    // ----------------------------------------------------
    class SnowSystem {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.flakes = [];
            this.flakeImages = [];
            this.maxFlakes = 24;
            this.init();
        }

        init() {
            this.resize();
            window.addEventListener('resize', () => this.resize());

            let loadedCount = 0;
            for (let i = 0; i <= 21; i++) {
                const img = new Image();
                img.src = `assets/snowflakes/flake_${i}.webp`;
                img.onload = () => {
                    loadedCount++;
                    if (loadedCount === 22) {
                        this.createFlakes();
                    }
                };
                this.flakeImages.push(img);
            }
        }

        resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const container = document.getElementById('gameContainer');
            this.width = container ? container.clientWidth : window.innerWidth;
            this.height = container ? container.clientHeight : (window.visualViewport ? window.visualViewport.height : window.innerHeight);
            this.canvas.width = Math.round(this.width * dpr);
            this.canvas.height = Math.round(this.height * dpr);
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        createFlakes() {
            this.flakes = [];
            for (let i = 0; i < this.maxFlakes; i++) {
                this.flakes.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: 14 + Math.random() * 18,
                    speedY: 0.6 + Math.random() * 1.3,
                    speedX: (Math.random() - 0.5) * 0.6,
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.02,
                    opacity: 0.35 + Math.random() * 0.65,
                    img: this.flakeImages[Math.floor(Math.random() * this.flakeImages.length)]
                });
            }
            this.animate();
        }

        animate() {
            this.ctx.clearRect(0, 0, this.width, this.height);

            for (const flake of this.flakes) {
                flake.y += flake.speedY;
                flake.x += flake.speedX + Math.sin(flake.y * 0.01) * 0.4;
                flake.rotation += flake.rotSpeed;

                if (flake.y > this.height + 30) {
                    flake.y = -30;
                    flake.x = Math.random() * this.width;
                }
                if (flake.x > this.width + 30) flake.x = -30;
                else if (flake.x < -30) flake.x = this.width + 30;

                this.ctx.save();
                this.ctx.globalAlpha = flake.opacity;
                this.ctx.translate(flake.x, flake.y);
                this.ctx.rotate(flake.rotation);
                if (flake.img && flake.img.complete) {
                    this.ctx.drawImage(flake.img, -flake.size / 2, -flake.size / 2, flake.size, flake.size);
                }
                this.ctx.restore();
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    // ----------------------------------------------------
    // СИСТЕМА КОНФЕТТИ ПРИ ЗАВЕРШЕНИИ ПОПЫТКИ
    // (Аутентичная праздничная анимация и физика из игра_чистовая)
    // ----------------------------------------------------
    class ConfettiSystem {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.confetti = [];
            this.isActive = false;
            this.animationId = null;
            this.colors = ['#ffd166', '#ff4757', '#06d6a0', '#118ab2', '#ffffff'];
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }

        resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const container = document.getElementById('gameContainer');
            this.width = container ? container.clientWidth : window.innerWidth;
            this.height = container ? container.clientHeight : (window.visualViewport ? window.visualViewport.height : window.innerHeight);
            this.canvas.width = Math.round(this.width * dpr);
            this.canvas.height = Math.round(this.height * dpr);
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        start() {
            this.stop();
            this.resize();
            this.canvas.classList.remove('hidden');
            this.isActive = true;
            this.confetti = [];

            // 85-95 праздничных конфетти сверху
            const count = 90;
            for (let i = 0; i < count; i++) {
                this.confetti.push({
                    x: Math.random() * this.width,
                    y: -20 - Math.random() * 260,
                    vx: (Math.random() - 0.5) * 4.5,
                    vy: Math.random() * 4 + 2.5,
                    color: this.colors[Math.floor(Math.random() * this.colors.length)],
                    size: Math.random() * 8 + 5,
                    rotation: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 8,
                    opacity: 1
                });
            }

            this.lastTime = performance.now();
            const step = (time) => {
                if (!this.isActive) return;
                const dt = Math.min((time - this.lastTime) / 1000, 0.1);
                this.lastTime = time;

                this.update(dt);
                this.render();

                // Проверяем, остались ли видимые конфетти на экране
                const hasAlive = this.confetti.some(c => c.y < this.height + 60 && c.opacity > 0.05);
                if (hasAlive) {
                    this.animationId = requestAnimationFrame(step);
                } else {
                    this.stop();
                }
            };
            this.animationId = requestAnimationFrame(step);
        }

        update(dt) {
            this.confetti.forEach(c => {
                c.x += c.vx;
                c.y += c.vy;
                c.vy += 0.35; // Гравитация точно по референсу из игра_чистовая
                c.rotation += c.rotSpeed;

                // Плавное растворение у нижнего края экрана
                if (c.y > this.height * 0.88) {
                    c.opacity = Math.max(0, c.opacity - dt * 1.8);
                }
            });
        }

        render() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.confetti.forEach(c => {
                if (c.y > this.height + 60 || c.opacity <= 0) return;
                this.ctx.save();
                this.ctx.globalAlpha = c.opacity;
                this.ctx.translate(c.x, c.y);
                this.ctx.rotate((c.rotation * Math.PI) / 180);
                this.ctx.fillStyle = c.color;
                this.ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
                this.ctx.restore();
            });
        }

        stop() {
            this.isActive = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.width, this.height);
            }
            if (this.canvas) {
                this.canvas.classList.add('hidden');
            }
        }
    }

    // ----------------------------------------------------
    // ДАННЫЕ ПРАВИЛ
    // ----------------------------------------------------
    const RULES_DATA = [
        { src: 'assets/rules_card_1.webp', alt: 'Правило 1: Двигайте мешок' },
        { src: 'assets/rules_card_2.webp', alt: 'Правило 2: Ловите блюда' },
        { src: 'assets/rules_card_3.webp', alt: 'Правило 3: Ловите перчик х2' },
        { src: 'assets/rules_card_4.webp', alt: 'Правило 4: Остерегайтесь препятствий' },
        { src: 'assets/rules_card_5.webp', alt: 'Правило 5: 1 сердце = 1 попытка' },
        { src: 'assets/rules_card_6.webp?v=5.1.0', alt: 'Правило 6: Поймайте все блюда' }
    ];

    // Предзагрузка всех карточек правил в кэш браузера (плавный переход без мерцания 1:1 как в Match 3)
    RULES_DATA.forEach(r => {
        const img = new Image();
        img.src = r.src;
    });

    // ----------------------------------------------------
    // ИГРОВОЙ ДВИЖОК ЛОВЛИ (CATCH ENGINE)
    // ----------------------------------------------------
    class CatchGame {
        constructor() {
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');

            this.baseWidth = 390;
            this.virtualWidth = 390;
            this.virtualHeight = 844;
            this.scale = 1;

            this.images = {};
            this.items = [];
            this.popups = [];

            this.isPlaying = false;
            this.score = 0;
            this.foodCount = 0;
            this.maxFood = 30;
            this.maxScore = 750;
            this.attemptsRemaining = 3; // 1 сердце = 1 попытка (от 3 до 1)

            this.pepperBonusActive = false;
            this.pepperBonusTimer = 0;

            this.spawnTimer = 0;
            this.nextSpawnInterval = 48;
            this.baseFallSpeed = 3.6;

            this.itemsSpawnedCount = 0;
            this.itemsSinceLastIcicle = 0;
            this.nextIcicleThreshold = 3 + Math.floor(Math.random() * 3); // 4-6 предметов
            this.screenShake = 0;

            // Мешок игрока (чуть меньше, в идеальном балансе с крупными элементами)
            this.player = {
                x: 195,
                y: 720,
                width: 178,
                height: 136, // естественное соотношение 1.31 (406x310)
                targetX: 195,
                invulnerableTimer: 0,
                scaleX: 1,
                scaleY: 1,
                swallowTimer: 0,
                swallowDuration: 0.28
            };

            this.init();
        }

        async init() {
            this.resize();
            window.addEventListener('resize', () => this.resize());
            this.bindControls();
            await this.preloadAssets();
        }

        resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const container = document.getElementById('gameContainer');
            const clientW = container ? container.clientWidth : window.innerWidth;
            const clientH = container ? container.clientHeight : (window.visualViewport ? window.visualViewport.height : window.innerHeight);

            this.scale = clientW / this.baseWidth;
            this.virtualWidth = this.baseWidth;
            this.virtualHeight = Math.round(clientH / this.scale);

            this.canvas.width = Math.round(clientW * dpr);
            this.canvas.height = Math.round(clientH * dpr);

            this.ctx.setTransform(dpr * this.scale, 0, 0, dpr * this.scale, 0, 0);

            // Позиция мешка внизу экрана на сугробе
            this.player.y = this.virtualHeight - 80;
        }

        bindControls() {
            const handleMove = (clientX) => {
                if (!this.isPlaying) return;
                const rect = this.canvas.getBoundingClientRect();
                const touchX = (clientX - rect.left) / this.scale;
                this.player.targetX = Math.max(this.player.width / 2, Math.min(this.virtualWidth - this.player.width / 2, touchX));
            };

            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    handleMove(e.touches[0].clientX);
                }
            }, { passive: true });

            window.addEventListener('touchstart', (e) => {
                if (e.touches.length > 0) {
                    handleMove(e.touches[0].clientX);
                }
            }, { passive: true });

            window.addEventListener('mousemove', (e) => {
                if (e.buttons === 1) {
                    handleMove(e.clientX);
                }
            });

            window.addEventListener('mousedown', (e) => {
                handleMove(e.clientX);
            });
        }

        preloadAssets() {
            const list = {
                basket: 'assets/player_basket.webp',
                basket_half: 'assets/player_basket_half.webp?v=5.1.0',
                basket_full: 'assets/player_basket_full.webp?v=5.1.0',
                ramen: 'assets/food_ramen.webp',
                dango: 'assets/food_dango.webp',
                salmon: 'assets/food_salmon.webp',
                icecream: 'assets/food_icecream.webp',
                dimsum: 'assets/food_dimsum.webp',
                dimsum_flower: 'assets/food_dimsum_flower.webp',
                bao: 'assets/food_bao.webp',
                onigiri: 'assets/food_onigiri.webp',
                pepper: 'assets/bonus_pepper.webp',
                santa: 'assets/bonus_santa.webp',
                icicle: 'assets/obstacle_icicle.webp',
                heart: 'assets/heart.webp',
                coin: 'assets/coin_lb.webp'
            };

            const promises = Object.entries(list).map(([key, src]) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => {
                        this.images[key] = img;
                        resolve();
                    };
                    img.onerror = () => {
                        console.warn(`Failed loading: ${src}`);
                        resolve();
                    };
                });
            });

            return Promise.all(promises);
        }

        resetGameplayState() {
            this.isPlaying = false;
            this.score = 0;
            this.foodCount = 0;
            // this.attemptsRemaining сохраняется из ScreenManager
            this.items = [];
            this.popups = [];

            // Сброс бонуса перчика x2 и гарантированное скрытие плашки
            this.pepperBonusActive = false;
            this.pepperBonusTimer = 0;
            const pepperBadge = document.getElementById('pepperBonusIndicator');
            if (pepperBadge) {
                pepperBadge.classList.add('hidden');
            }

            this.spawnTimer = 0;
            this.itemsSpawnedCount = 0;
            this.itemsSinceLastIcicle = 0;
            this.nextIcicleThreshold = 3 + Math.floor(Math.random() * 3);
            this.screenShake = 0;

            // Редкий падающий Дед Мороз (1-2 за сессию, +50% баллов = 38)
            this.santaSpawnsCount = 0;
            this.santaTotalAllowed = Math.random() < 0.5 ? 1 : 2;
            this.santaSpawnTarget1 = 8 + Math.floor(Math.random() * 5);
            this.santaSpawnTarget2 = 19 + Math.floor(Math.random() * 5);

            // Сброс мешка и анимаций
            this.player.x = this.virtualWidth / 2;
            this.player.targetX = this.virtualWidth / 2;
            this.player.invulnerableTimer = 0;
            this.player.scaleX = 1;
            this.player.scaleY = 1;
            this.player.swallowTimer = 0;

            // Очистка Canvas
            this.ctx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);

            // Сброс параметров HUD
            this.updateHUD();
        }

        renderInitialFrame() {
            this.resetGameplayState();
            this.canvas.classList.remove('hidden');
            this.render();
        }

        start() {
            this.resetGameplayState();
            this.isPlaying = true;
            this.canvas.classList.remove('hidden');

            this.lastTime = performance.now();
            requestAnimationFrame((time) => this.gameLoop(time));
        }

        gameLoop(timestamp) {
            if (!this.isPlaying) return;

            const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
            this.lastTime = timestamp;

            this.update(dt);
            this.render();

            requestAnimationFrame((time) => this.gameLoop(time));
        }

        update(dt) {
            // Плавное следование мешка за пальцем
            this.player.x += (this.player.targetX - this.player.x) * 0.32;

            if (this.player.invulnerableTimer > 0) {
                this.player.invulnerableTimer -= dt;
            }

            // Анимация заглатывания ("типо он заглатывает их")
            if (this.player.swallowTimer > 0) {
                this.player.swallowTimer -= dt;
                const p = Math.max(0, 1 - (this.player.swallowTimer / this.player.swallowDuration)); // 0 -> 1
                if (p < 0.35) {
                    // Фаза 1: горловина распахивается шире, мешок слегка приседает
                    const t = p / 0.35;
                    this.player.scaleX = 1 + 0.18 * Math.sin(t * Math.PI * 0.5);
                    this.player.scaleY = 1 - 0.14 * Math.sin(t * Math.PI * 0.5);
                } else if (p < 0.70) {
                    // Фаза 2: заглатывание внутрь, мешок вытягивается по вертикали ("глоток")
                    const t = (p - 0.35) / 0.35;
                    this.player.scaleX = 1.18 - 0.28 * t;
                    this.player.scaleY = 0.86 + 0.30 * t;
                } else {
                    // Фаза 3: пружинящий возврат в исходное положение
                    const t = (p - 0.70) / 0.30;
                    this.player.scaleX = 0.90 + 0.10 * Math.sin(t * Math.PI);
                    this.player.scaleY = 1.16 - 0.16 * Math.sin(t * Math.PI);
                }
            } else {
                this.player.scaleX = 1;
                this.player.scaleY = 1;
            }

            // Таймер бонуса перчик x2
            if (this.pepperBonusActive) {
                this.pepperBonusTimer -= dt;
                const timerElem = document.getElementById('pepperTimer');
                if (timerElem) {
                    timerElem.textContent = `${Math.max(0, this.pepperBonusTimer).toFixed(1)}s`;
                }
                if (this.pepperBonusTimer <= 0) {
                    this.pepperBonusActive = false;
                    document.getElementById('pepperBonusIndicator').classList.add('hidden');
                }
            }

            // Тряска экрана при попадании сосульки
            if (this.screenShake > 0) {
                this.screenShake -= dt;
            }

            // Ускорение падения и уменьшение интервала спавна по мере прогресса (до 750)
            const progress = Math.min(1, this.foodCount / this.maxFood);
            const currentSpeed = (this.baseFallSpeed + progress * 2.6) * (this.pepperBonusActive ? 1.30 : 1.0);

            // Случайный органичный спавн предметов
            this.spawnTimer++;
            if (this.spawnTimer >= this.nextSpawnInterval) {
                this.spawnTimer = 0;
                const minInt = Math.max(28, 42 - Math.floor(progress * 14));
                const maxInt = Math.max(46, 62 - Math.floor(progress * 16));
                this.nextSpawnInterval = minInt + Math.floor(Math.random() * (maxInt - minInt + 1));
                this.spawnItem();
            }

            // Обновление позиций предметов
            for (let i = this.items.length - 1; i >= 0; i--) {
                if (!this.isPlaying) break;
                const item = this.items[i];
                if (!item) continue;

                if (item.swallowed) {
                    // Анимация затягивания в горловину мешка
                    item.swallowProgress += dt * 4.2;
                    if (item.swallowProgress >= 1) {
                        this.items.splice(i, 1);
                        continue;
                    }
                } else {
                    item.y += item.speed * currentSpeed;
                    item.rotation += item.rotSpeed;

                    // Проверка поимки горловиной мешка
                    if (this.checkCatch(item)) {
                        this.onCatch(item);
                        if (!this.isPlaying) break;
                        if (item.type === 'obstacle') {
                            this.items.splice(i, 1);
                        }
                        continue;
                    }

                    // Выход за пределы экрана
                    if (item.y > this.virtualHeight + 80) {
                        this.items.splice(i, 1);
                    }
                }
            }

            // Обновление всплывающих очков
            for (let i = this.popups.length - 1; i >= 0; i--) {
                const p = this.popups[i];
                p.y -= 1.4;
                p.alpha -= 0.022;
                if (p.alpha <= 0) {
                    this.popups.splice(i, 1);
                }
            }
        }

        spawnItem() {
            this.itemsSpawnedCount++;
            this.itemsSinceLastIcicle++;

            let isIcicle = false;
            // Сосульки выпадают чаще на 15%: порог 3-5 предметов, ранний шанс с 2-го предмета
            if (this.itemsSinceLastIcicle >= this.nextIcicleThreshold) {
                isIcicle = true;
            } else if (this.itemsSinceLastIcicle >= 2 && Math.random() < 0.38) {
                isIcicle = true;
            }

            // Проверка на появление редкого бонуса Деда Мороза (1-2 раза за всю сессию)
            let isSanta = false;
            if (!isIcicle && this.santaSpawnsCount < this.santaTotalAllowed) {
                if (this.santaSpawnsCount === 0 && this.foodCount >= this.santaSpawnTarget1) {
                    isSanta = true;
                } else if (this.santaSpawnsCount === 1 && this.foodCount >= this.santaSpawnTarget2) {
                    isSanta = true;
                }
            }

            let type, subType, width, height, scoreVal = 25;

            if (isIcicle) {
                // Штрафные предметы — ТОЛЬКО сосульки (крупные, заметные)
                type = 'obstacle';
                subType = 'icicle';
                width = 58;
                height = 126;
                this.itemsSinceLastIcicle = 0;
                this.nextIcicleThreshold = 3 + Math.floor(Math.random() * 3); // 3, 4 или 5 предметов (на 15% чаще)
            } else if (isSanta) {
                // Редкий падающий Дед Мороз (+50% баллов = 60 вместо 40)
                type = 'bonus';
                subType = 'santa';
                width = 86;
                height = 56;
                scoreVal = 60;
                this.santaSpawnsCount++;
            } else {
                // Шанс на бонус перчик x2 (около 7%)
                const isPepper = (Math.random() < 0.07 && !this.pepperBonusActive);
                if (isPepper) {
                    type = 'bonus';
                    subType = 'pepper';
                    width = 74;
                    height = 54;
                } else {
                    type = 'food';
                    // Крупные, сочные блюда по референсу (1 пойманное блюдо = 40 баллов)
                    const foodTypes = [
                        { key: 'ramen', w: 74, h: 74, score: 40 },
                        { key: 'dango', w: 80, h: 65, score: 40 },
                        { key: 'dimsum', w: 75, h: 67, score: 40 },
                        { key: 'dimsum_flower', w: 76, h: 68, score: 40 },
                        { key: 'salmon', w: 72, h: 64, score: 40 },
                        { key: 'icecream', w: 64, h: 72, score: 40 },
                        { key: 'bao', w: 76, h: 62, score: 40 },
                        { key: 'onigiri', w: 74, h: 66, score: 40 }
                    ];
                    const chosen = foodTypes[Math.floor(Math.random() * foodTypes.length)];
                    subType = chosen.key;
                    width = chosen.w;
                    height = chosen.h;
                    scoreVal = chosen.score;
                }
            }

            // Случайный разброс X по ширине экрана
            const margin = 35;
            const spawnX = margin + Math.random() * (this.virtualWidth - margin * 2);

            // Индивидуальная скорость падения
            const speedVar = 0.88 + Math.random() * 0.35;
            const fallSpeed = isIcicle ? speedVar * 1.25 : speedVar;

            this.items.push({
                type,
                subType,
                x: spawnX,
                y: -height - 10,
                width,
                height,
                scoreVal,
                speed: fallSpeed,
                rotation: (Math.random() - 0.5) * 0.4,
                rotSpeed: isIcicle ? 0 : (Math.random() - 0.5) * 0.025,
                swallowed: false,
                swallowProgress: 0,
                startX: spawnX,
                startY: -height - 10,
                startRot: (Math.random() - 0.5) * 0.4
            });
        }

        checkCatch(item) {
            if (item.swallowed) return false;

            // Горловина мешка (верхняя часть на уровне белого меха)
            const mouthX = this.player.x;
            const mouthY = this.player.y - this.player.height * 0.35;
            const catchRadiusX = 64;
            const catchRadiusY = 30;

            if (item.type === 'obstacle') {
                // Для сосульки проверяем её нижний острый конец
                const tipY = item.y + item.height * 0.45;
                const dx = Math.abs(item.x - mouthX);
                const dy = Math.abs(tipY - mouthY);
                return dx < catchRadiusX && dy < catchRadiusY;
            } else {
                // Для блюд и бонусов
                const dx = Math.abs(item.x - mouthX);
                const dy = Math.abs(item.y - mouthY);
                return dx < catchRadiusX && dy < catchRadiusY;
            }
        }

        onCatch(item) {
            if (item.type === 'food') {
                // Запуск анимации заглатывания
                this.player.swallowTimer = this.player.swallowDuration;
                item.swallowed = true;
                item.swallowProgress = 0;
                item.startX = item.x;
                item.startY = item.y;
                item.startRot = item.rotation;

                const multiplier = this.pepperBonusActive ? 2 : 1;
                const points = item.scoreVal * multiplier;
                this.score = Math.min(this.maxScore, this.score + points);
                this.foodCount++;

                this.popups.push({
                    text: `+${points}`,
                    color: multiplier > 1 ? '#FFD700' : '#FFFFFF',
                    x: item.x,
                    y: item.y - 12,
                    alpha: 1
                });

                this.updateHUD();

                if (this.foodCount >= this.maxFood || this.score >= this.maxScore) {
                    this.endGame(true);
                }
            } else if (item.type === 'bonus' && item.subType === 'santa') {
                // Поимка редкого Деда Мороза (+50% очков: 38 баллов, или 76 при перчике)
                this.player.swallowTimer = this.player.swallowDuration;
                item.swallowed = true;
                item.swallowProgress = 0;
                item.startX = item.x;
                item.startY = item.y;
                item.startRot = item.rotation;

                const multiplier = this.pepperBonusActive ? 2 : 1;
                const points = item.scoreVal * multiplier;
                this.score = Math.min(this.maxScore, this.score + points);
                this.foodCount++;

                this.popups.push({
                    text: `+${points} 🎅`,
                    color: '#FFD700',
                    x: item.x,
                    y: item.y - 12,
                    alpha: 1
                });

                this.updateHUD();

                if (this.foodCount >= this.maxFood || this.score >= this.maxScore) {
                    this.endGame(true);
                }
            } else if (item.type === 'bonus' && item.subType === 'pepper') {
                this.player.swallowTimer = this.player.swallowDuration;
                item.swallowed = true;
                item.swallowProgress = 0;
                item.startX = item.x;
                item.startY = item.y;
                item.startRot = item.rotation;

                this.pepperBonusActive = true;
                this.pepperBonusTimer = 5.0;
                document.getElementById('pepperBonusIndicator').classList.remove('hidden');

                this.popups.push({
                    text: 'x2 БОНУС!',
                    color: '#FF4500',
                    x: item.x,
                    y: item.y - 12,
                    alpha: 1
                });
            } else if (item.type === 'obstacle') {
                // Попадание препятствия сразу завершает текущую попытку!
                if (this.player.invulnerableTimer <= 0) {
                    this.player.invulnerableTimer = 2.0;
                    this.screenShake = 0.35;

                    // Текущее сердце сгорает прямо на глазах игрока
                    const currentHeart = document.getElementById(`heart${this.attemptsRemaining}`);
                    if (currentHeart) {
                        currentHeart.classList.remove('active');
                        currentHeart.classList.add('lost');
                    }

                    this.popups.push({
                        text: 'Ой! Препятствие!',
                        color: '#FF2222',
                        x: item.x,
                        y: item.y - 10,
                        alpha: 1
                    });

                    // 1 попадание сразу завершает попытку
                    this.endGame(false);
                }
            }
        }

        updateHUD() {
            // Обновление сердец: 1 сердце = 1 попытка (от 3 до 1)
            for (let i = 1; i <= 3; i++) {
                const heart = document.getElementById(`heart${i}`);
                if (heart) {
                    if (i <= this.attemptsRemaining) {
                        heart.classList.remove('lost');
                        heart.classList.add('active');
                    } else {
                        heart.classList.remove('active');
                        heart.classList.add('lost');
                    }
                }
            }

            // Баллы
            const scoreText = document.getElementById('hudScoreText');
            if (scoreText) {
                scoreText.textContent = `${this.score}/${this.maxScore}`;
            }

            // Количество пойманных блюд
            const foodText = document.getElementById('hudFoodText');
            if (foodText) {
                foodText.textContent = `${this.foodCount}/${this.maxFood}`;
            }

            // Прогресс-бар с Дедом Морозом
            const fill = document.getElementById('hudProgressFill');
            const santa = document.getElementById('hudProgressSanta');
            const pct = Math.min(100, (this.foodCount / this.maxFood) * 100);
            if (fill) fill.style.width = `${pct}%`;
            if (santa) santa.style.left = `${pct}%`;
        }

        endGame(isVictory) {
            const finalScore = this.score;
            this.isPlaying = false;
            this.resetGameplayState();
            if (this.screenManager) {
                this.screenManager.showResult(finalScore, isVictory);
            }
        }

        render() {
            this.ctx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);

            this.ctx.save();
            // Эффект легкой тряски экрана при получении урона
            if (this.screenShake > 0) {
                const shakeIntensity = 6 * (this.screenShake / 0.25);
                this.ctx.translate((Math.random() - 0.5) * shakeIntensity, (Math.random() - 0.5) * shakeIntensity);
            }

            // Рендер падающих предметов
            for (const item of this.items) {
                this.ctx.save();

                if (item.swallowed) {
                    // Анимация затягивания внутрь горловины
                    const mouthX = this.player.x;
                    const mouthY = this.player.y - this.player.height * 0.35;
                    const curX = item.startX + (mouthX - item.startX) * item.swallowProgress;
                    const curY = item.startY + (mouthY + 18 - item.startY) * item.swallowProgress;
                    const curScale = Math.max(0, 1 - item.swallowProgress);
                    this.ctx.translate(curX, curY);
                    this.ctx.scale(curScale, curScale);
                    this.ctx.rotate(item.startRot + item.swallowProgress * 2.5);
                } else {
                    this.ctx.translate(item.x, item.y);
                    this.ctx.rotate(item.rotation);
                }

                const img = this.images[item.subType];
                if (img && img.complete) {
                    this.ctx.drawImage(img, -item.width / 2, -item.height / 2, item.width, item.height);
                } else {
                    this.ctx.fillStyle = item.type === 'food' ? '#FFA500' : '#00BFFF';
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, item.width / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                this.ctx.restore();
            }

            // Рендер мешка игрока с естественными пропорциями и анимацией заглатывания
            this.ctx.save();
            this.ctx.translate(this.player.x, this.player.y);
            this.ctx.scale(this.player.scaleX, this.player.scaleY);

            // Мигание при неуязвимости
            if (this.player.invulnerableTimer > 0) {
                this.ctx.globalAlpha = Math.floor(Date.now() / 80) % 2 === 0 ? 0.35 : 0.9;
            }

            // Выбор стейта мешка в зависимости от набранных баллов (до 1/3 пустой, до 2/3 полузаполненный, далее полный)
            let basketImg = this.images.basket;
            if (this.score >= (this.maxScore * 2) / 3 && this.images.basket_full && this.images.basket_full.complete) {
                basketImg = this.images.basket_full;
            } else if (this.score >= this.maxScore / 3 && this.images.basket_half && this.images.basket_half.complete) {
                basketImg = this.images.basket_half;
            }

            if (basketImg && basketImg.complete) {
                const drawW = this.player.width;
                const drawH = (basketImg.naturalWidth > 0)
                    ? (basketImg.naturalHeight / basketImg.naturalWidth) * drawW
                    : this.player.height;
                const drawY = (this.player.height / 2) - drawH;
                this.ctx.drawImage(basketImg, -drawW / 2, drawY, drawW, drawH);
            } else {
                this.ctx.fillStyle = '#D62828';
                this.ctx.fillRect(-this.player.width / 2, -this.player.height / 2, this.player.width, this.player.height);
            }

            this.ctx.restore();

            // Рендер всплывающих очков
            for (const p of this.popups) {
                this.ctx.save();
                this.ctx.font = '900 20px Rubik, sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = p.color;
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 3;
                this.ctx.globalAlpha = Math.max(0, p.alpha);
                this.ctx.strokeText(p.text, p.x, p.y);
                this.ctx.fillText(p.text, p.x, p.y);
                this.ctx.restore();
            }

            this.ctx.restore(); // Сброс тряски экрана
        }
    }

    // ----------------------------------------------------
    // УПРАВЛЕНИЕ ВСЕМИ ЭКРАНАМИ И ОТСЧЕТОМ (3..2..1)
    // ----------------------------------------------------
    class ScreenManager {
        constructor() {
            this.currentRuleIndex = 0;
            this.totalRules = RULES_DATA.length;
            this.game = new CatchGame();
            this.game.screenManager = this;

            // Механика 3 попыток на уровень
            this.maxAttempts = 3;
            this.attemptsUsed = 0;
            this.bestScore = 0;

            const confettiCanvas = document.getElementById('confettiCanvas');
            this.confettiSystem = confettiCanvas ? new ConfettiSystem(confettiCanvas) : null;

            this.dom = {
                startScreen: document.getElementById('startScreen'),
                rulesScreen: document.getElementById('rulesScreen'),
                hud: document.getElementById('hud'),
                bgSky: document.getElementById('bgSky'),
                bgFirTree: document.getElementById('bgFirTree'),
                bgGame: document.getElementById('bgGame'),
                countdownOverlay: document.getElementById('countdownOverlay'),
                cnt3: document.getElementById('cnt3'),
                cnt2: document.getElementById('cnt2'),
                cnt1: document.getElementById('cnt1'),
                resultScreen: document.getElementById('resultScreen'),
                resultScoreValue: document.getElementById('resultScoreValue'),
                resultAttemptsText: document.getElementById('resultAttemptsText'),
                resultBestScoreText: document.getElementById('resultBestScoreText'),
                btnClaimBonus: document.getElementById('btnClaimBonus'),
                btnRetryGame: document.getElementById('btnRetryGame'),
                finalScreen: document.getElementById('finalScreen'),
                btnFinalExit: document.getElementById('btnFinalExit'),
                playBtn: document.getElementById('playBtn'),
                rulesCardSlot: document.getElementById('rulesCardSlot'),
                rulesPagination: document.getElementById('rulesPagination'),
                dualButtonsGroup: document.getElementById('dualButtonsGroup'),
                singleStartGroup: document.getElementById('singleStartGroup'),
                rulesNextBtn: document.getElementById('rulesNextBtn'),
                rulesSkipBtn: document.getElementById('rulesSkipBtn'),
                rulesStartBtn: document.getElementById('rulesStartBtn')
            };

            this.initEvents();
        }

        initEvents() {
            if (this.dom.playBtn) {
                this.dom.playBtn.addEventListener('click', () => this.goToRules());
            }

            if (this.dom.rulesNextBtn) {
                this.dom.rulesNextBtn.addEventListener('click', () => {
                    if (this.currentRuleIndex < this.totalRules - 1) {
                        this.showRuleSlide(this.currentRuleIndex + 1);
                    }
                });
            }

            if (this.dom.rulesSkipBtn) {
                this.dom.rulesSkipBtn.addEventListener('click', () => this.startCountdown());
            }

            if (this.dom.rulesStartBtn) {
                this.dom.rulesStartBtn.addEventListener('click', () => this.startCountdown());
            }

            // Клик по точкам пагинации правил (1:1 из Match 3)
            if (this.dom.rulesPagination) {
                const dots = this.dom.rulesPagination.querySelectorAll('.pagination-dot');
                dots.forEach((dot, idx) => {
                    dot.addEventListener('click', () => this.showRuleSlide(idx));
                });
            }

            // Поддержка свайпа карточки правил пальцем (1:1 из Match 3)
            if (this.dom.rulesCardSlot) {
                let touchRulesX = 0;
                this.dom.rulesCardSlot.addEventListener('touchstart', e => {
                    touchRulesX = e.touches[0].clientX;
                }, { passive: true });

                this.dom.rulesCardSlot.addEventListener('touchend', e => {
                    const diff = touchRulesX - e.changedTouches[0].clientX;
                    if (Math.abs(diff) > 40) {
                        if (diff > 0 && this.currentRuleIndex < this.totalRules - 1) {
                            this.showRuleSlide(this.currentRuleIndex + 1);
                        } else if (diff < 0 && this.currentRuleIndex > 0) {
                            this.showRuleSlide(this.currentRuleIndex - 1);
                        }
                    }
                }, { passive: true });
            }

            // Кнопка "ПОПРОБОВАТЬ ЕЩЕ РАЗ" перезапускает игру
            if (this.dom.btnRetryGame) {
                this.dom.btnRetryGame.addEventListener('click', () => {
                    if (this.attemptsUsed >= this.maxAttempts) return;
                    if (this.confettiSystem) {
                        this.confettiSystem.stop();
                    }
                    if (this.dom.resultScreen) {
                        this.dom.resultScreen.classList.add('hidden');
                    }
                    this.startCountdown();
                });
            }

            // Кнопка "ЗАБРАТЬ БОНУСЫ" -> переход на финальный экран "СПАСИБО ЗА ВИЗИТ!"
            if (this.dom.btnClaimBonus) {
                this.dom.btnClaimBonus.addEventListener('click', () => {
                    if (this.confettiSystem) {
                        this.confettiSystem.stop();
                    }
                    if (this.dom.resultScreen) {
                        this.dom.resultScreen.classList.add('hidden');
                    }
                    if (this.dom.bgFirTree) {
                        this.dom.bgFirTree.classList.remove('hidden');
                    }
                    if (this.dom.finalScreen) {
                        this.dom.finalScreen.classList.remove('hidden');
                    }
                });
            }

            // Кнопка "ВЫЙТИ" на финальном экране
            if (this.dom.btnFinalExit) {
                this.dom.btnFinalExit.addEventListener('click', () => {
                    // 1. Попытка закрыть в Telegram WebApp
                    if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.close === 'function') {
                        window.Telegram.WebApp.close();
                        return;
                    }

                    // 2. Попытка закрыть окно / вкладку браузера
                    window.close();

                    // 3. Красивый экран завершения, если браузер заблокировал прямой вызов window.close()
                    setTimeout(() => {
                        const plateContent = document.querySelector('.final-plate-content');
                        if (plateContent) {
                            plateContent.innerHTML = `
                                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;text-align:center;padding:10px;">
                                    <h2 style="font-family:'Suisse Intl',Rubik,sans-serif;font-weight:700;color:#0b4d96;font-size:20px;margin-bottom:8px;">Игра завершена!</h2>
                                    <p style="font-family:'Suisse Intl',Rubik,sans-serif;color:#335d8a;font-size:13.5px;line-height:1.4;margin:0;">Спасибо за участие в новогодней игре.<br>Вы можете безопасно закрыть эту страницу.</p>
                                </div>
                            `;
                        }
                    }, 250);
                });
            }

            if (this.dom.rulesPagination) {
                this.dom.rulesPagination.addEventListener('click', (e) => {
                    const dot = e.target.closest('.pagination-dot');
                    if (dot) {
                        const idx = parseInt(dot.getAttribute('data-index'), 10);
                        if (!isNaN(idx) && idx >= 0 && idx < this.totalRules) {
                            this.showRuleSlide(idx);
                        }
                    }
                });
            }

            this.initTouchSwipes();
        }

        initTouchSwipes() {
            let startX = 0;
            let startY = 0;
            const slot = this.dom.rulesCardSlot;
            if (!slot) return;

            slot.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                }
            }, { passive: true });

            slot.addEventListener('touchend', (e) => {
                if (e.changedTouches.length === 1) {
                    const diffX = e.changedTouches[0].clientX - startX;
                    const diffY = e.changedTouches[0].clientY - startY;

                    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                        if (diffX < 0 && this.currentRuleIndex < this.totalRules - 1) {
                            this.showRuleSlide(this.currentRuleIndex + 1);
                        } else if (diffX > 0 && this.currentRuleIndex > 0) {
                            this.showRuleSlide(this.currentRuleIndex - 1);
                        }
                    }
                }
            }, { passive: true });
        }

        goToRules() {
            this.dom.startScreen.classList.add('hidden');
            if (this.dom.bgFirTree) {
                this.dom.bgFirTree.classList.remove('hidden');
            }
            this.dom.rulesScreen.classList.remove('hidden');
            this.showRuleSlide(0);
        }

        showRuleSlide(index) {
            if (index < 0 || index >= RULES_DATA.length) return;
            this.currentRuleIndex = index;
            const data = RULES_DATA[index];

            if (this.dom.rulesCardSlot) {
                const existingImg = this.dom.rulesCardSlot.querySelector('.rules-card-img');
                if (existingImg) {
                    if (existingImg.getAttribute('src') !== data.src) {
                        existingImg.src = data.src;
                        existingImg.alt = data.alt;
                    }
                } else {
                    this.dom.rulesCardSlot.innerHTML = `<img src="${data.src}" class="rules-card-img" alt="${data.alt}">`;
                }
            }

            if (this.dom.rulesPagination) {
                const dots = this.dom.rulesPagination.querySelectorAll('.pagination-dot');
                dots.forEach((dot, i) => {
                    if (i === index) dot.classList.add('active');
                    else dot.classList.remove('active');
                });
            }

            if (index === this.totalRules - 1) {
                if (this.dom.dualButtonsGroup) this.dom.dualButtonsGroup.classList.add('hidden');
                if (this.dom.singleStartGroup) this.dom.singleStartGroup.classList.remove('hidden');
            } else {
                if (this.dom.dualButtonsGroup) this.dom.dualButtonsGroup.classList.remove('hidden');
                if (this.dom.singleStartGroup) this.dom.singleStartGroup.classList.add('hidden');
            }
        }

        startCountdown() {
            if (this.confettiSystem) {
                this.confettiSystem.stop();
            }
            this.dom.rulesScreen.classList.add('hidden');
            if (this.dom.resultScreen) {
                this.dom.resultScreen.classList.add('hidden');
            }
            if (this.dom.finalScreen) {
                this.dom.finalScreen.classList.add('hidden');
            }
            if (this.dom.bgFirTree) {
                this.dom.bgFirTree.classList.add('hidden');
            }
            this.dom.bgGame.classList.add('active');

            // Количество оставшихся попыток (1 сердце = 1 попытка)
            const attemptsRemaining = Math.max(1, this.maxAttempts - this.attemptsUsed);
            this.game.attemptsRemaining = attemptsRemaining;

            // Полная чистка всех стейтов перед началом новой попытки
            this.game.resetGameplayState();

            // Показываем HUD и начальный кадр игры (мешок на сугробе под прозрачной стеклянной плашкой 1:1 как в игра_чистовая)
            this.dom.hud.classList.remove('hidden');
            this.game.renderInitialFrame();

            const overlay = this.dom.countdownOverlay;
            const c3 = this.dom.cnt3;
            const c2 = this.dom.cnt2;
            const c1 = this.dom.cnt1;
            overlay.classList.remove('hidden');

            [c3, c2, c1].forEach(el => {
                if (el) {
                    el.classList.remove('active');
                    el.classList.remove('hidden');
                }
            });

            if (this.countdownTimers) {
                this.countdownTimers.forEach(clearTimeout);
            }
            this.countdownTimers = [];

            // Шаг 3 сразу
            if (c3) c3.classList.add('active');

            // Шаг 2 через 950ms
            this.countdownTimers.push(setTimeout(() => {
                if (c3) c3.classList.remove('active');
                if (c2) c2.classList.add('active');
            }, 950));

            // Шаг 1 через 1900ms
            this.countdownTimers.push(setTimeout(() => {
                if (c2) c2.classList.remove('active');
                if (c1) c1.classList.add('active');
            }, 1900));

            // Старт игры через 2850ms
            this.countdownTimers.push(setTimeout(() => {
                if (c1) c1.classList.remove('active');
                overlay.classList.add('hidden');
                this.game.start();
            }, 2850));
        }

        showResult(score, isVictory) {
            this.attemptsUsed++;
            this.bestScore = Math.max(this.bestScore, score);
            const attemptsLeft = Math.max(0, this.maxAttempts - this.attemptsUsed);

            // Полный сброс всех геймплейных стейтов (перчик x2, таймеры, предметы, всплывашки)
            this.game.resetGameplayState();
            if (this.game.canvas) {
                this.game.canvas.classList.add('hidden');
            }

            // Переключаем фон на ТАКОЙ ЖЕ КАК У ПРАВИЛ (чистый зимний лес rules_clean_bg.webp)
            if (this.dom.bgGame) {
                this.dom.bgGame.classList.remove('active');
            }
            if (this.dom.bgRules) {
                this.dom.bgRules.classList.add('active');
            }

            // Динамический вывод счета
            if (this.dom.resultScoreValue) {
                this.dom.resultScoreValue.textContent = `+${score}`;
            }

            // Динамический вывод количества оставшихся попыток
            if (this.dom.resultAttemptsText) {
                this.dom.resultAttemptsText.textContent = `Осталось попыток: ${attemptsLeft}/${this.maxAttempts}`;
            }

            // Динамический вывод лучшего результата
            if (this.dom.resultBestScoreText) {
                this.dom.resultBestScoreText.textContent = `Ваш лучший результат: ${this.bestScore}`;
            }

            // На 3-й раз (когда попыток больше не осталось) кнопка "ПОПРОБОВАТЬ ЕЩЕ РАЗ" пропадает
            if (this.dom.btnRetryGame) {
                if (attemptsLeft > 0) {
                    this.dom.btnRetryGame.classList.remove('hidden');
                } else {
                    this.dom.btnRetryGame.classList.add('hidden');
                }
            }

            // Скрываем HUD и активируем экран результатов
            if (this.dom.hud) {
                this.dom.hud.classList.add('hidden');
            }
            if (this.dom.bgGame) {
                this.dom.bgGame.classList.remove('active');
            }
            if (this.dom.bgFirTree) {
                this.dom.bgFirTree.classList.remove('hidden');
            }
            if (this.dom.resultScreen) {
                this.dom.resultScreen.classList.remove('hidden');
            }

            // Праздничная анимация конфетти сверху при завершении попытки (1:1 из игра_чистовая)
            if (this.confettiSystem) {
                this.confettiSystem.start();
            }
        }
    }

    // Инициализация при загрузке DOM
    document.addEventListener('DOMContentLoaded', () => {
        const snowCanvas = document.getElementById('snowCanvas');
        if (snowCanvas) {
            new SnowSystem(snowCanvas);
        }

        window.screenManager = new ScreenManager();
    });
})();
