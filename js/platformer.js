// ========================================
// PLATFORMER ESCAPE GAME
// ========================================
const gameCanvas = document.getElementById('platformerGame');
const gameCtx = gameCanvas.getContext('2d');
const gameUI = document.getElementById('gameUI');

let gameActive = false;
let gameAnimationId = null;

// Game state
const game = {
    player: {
        x: 0,
        y: 0,
        width: 40,
        height: 65,
        vx: 0,
        vy: 0,
        onGround: false,
        facingRight: true,
        animFrame: 0,
        animTimer: 0,
        introFalling: true, // True during intro fall, false when gameplay starts
        landingBounce: false,
        introSwayPhase: 0,
        jumpCooldown: 0, // Cooldown timer before can jump again
        lastGroundTime: 0 // Track when we last touched ground
    },
    platforms: [],
    hazards: [],
    movingPlatforms: [],
    crushers: [],
    walls: [],
    voidOrbs: [],
    particles: [],
    bgStars: [],
    voidTendrils: [],
    exitPortal: { x: 0, y: 0, radius: 60 },
    camera: { y: 0 },
    gameHeight: 0,
    won: false,
    fallTransition: 0,
    shakeIntensity: 0,
    lastCheckpoint: null,
    bestCheckpoint: null // Tracks the furthest checkpoint reached
};

// Physics constants - fast and responsive (+15% more)
const GRAVITY = 1.25;
const JUMP_FORCE = -19;
const MOVE_SPEED = 10.5;
const FRICTION = 0.89;
const MAX_FALL_SPEED = 25;

// Input state
const keys = {
    left: false,
    right: false,
    jump: false
};

function initGame() {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;

    game.gameHeight = window.innerHeight * 1.8; // Shorter game for performance

    game.platforms = [];
    game.movingPlatforms = [];
    game.hazards = [];
    game.crushers = [];
    game.walls = [];
    game.voidOrbs = [];
    game.voidTendrils = [];

    const screenWidth = gameCanvas.width;
    const numColumns = 7;
    const columnWidth = screenWidth / numColumns;
    const numRows = 12; // Fewer rows = less objects = better performance
    const rowHeight = (game.gameHeight - 250) / numRows;

    // Platform sizes
    const PLATFORM_WIDTH_MIN = 85;
    const PLATFORM_WIDTH_MAX = 130;
    const PLATFORM_HEIGHT = 16;
    const CHECKPOINT_WIDTH = 160;

    // Starting platform
    game.platforms.push({
        x: screenWidth / 2 - 90,
        y: game.gameHeight - 60,
        width: 180,
        height: 22,
        color1: '#10b981',
        color2: '#059669',
        glowColor: 'rgba(16, 185, 129, 0.5)',
        isStart: true,
        row: -1,
        col: Math.floor(numColumns / 2)
    });

    // Generate void background tendrils (reduced for performance)
    for (let i = 0; i < 8; i++) {
        game.voidTendrils.push({
            x: Math.random() * screenWidth,
            y: Math.random() * game.gameHeight,
            length: 200 + Math.random() * 300,
            angle: Math.random() * Math.PI * 2,
            speed: 0.003 + Math.random() * 0.005,
            thickness: 30 + Math.random() * 50,
            phase: Math.random() * Math.PI * 2
        });
    }

    // Generate platforms - TONS of platforms for guaranteed possible gameplay
    const platformGrid = [];

    for (let row = 0; row < numRows; row++) {
        platformGrid[row] = [];
        const baseY = game.gameHeight - 160 - (row * rowHeight);
        const isCheckpointRow = row % 3 === 0 && row > 0; // Checkpoint every 3 rows

        let zone = 'intro';
        if (row >= 3 && row < 6) zone = 'water';
        else if (row >= 6 && row < 9) zone = 'lava';
        else if (row >= 9) zone = 'final';

        // 4-5 platforms per row - balanced for performance
        const platformsThisRow = isCheckpointRow ? 5 : 4 + Math.floor(Math.random() * 2);
        const columnOrder = [...Array(numColumns).keys()].sort(() => Math.random() - 0.5);

        for (let p = 0; p < Math.min(platformsThisRow, numColumns); p++) {
            const col = columnOrder[p];
            const baseX = col * columnWidth + 15;
            const maxX = (col + 1) * columnWidth - 15;

            const width = isCheckpointRow ? CHECKPOINT_WIDTH : PLATFORM_WIDTH_MIN + Math.random() * (PLATFORM_WIDTH_MAX - PLATFORM_WIDTH_MIN);
            const x = baseX + Math.random() * Math.max(5, maxX - baseX - width);
            // Scatter heights much more - ±35 pixels variation
            const y = baseY + (Math.random() - 0.5) * 70;

            let color1, color2, glowColor;
            if (zone === 'water') {
                color1 = `hsl(${190 + Math.random() * 25}, 70%, 50%)`;
                color2 = `hsl(${200 + Math.random() * 25}, 60%, 40%)`;
                glowColor = 'rgba(56, 189, 248, 0.3)';
            } else if (zone === 'lava') {
                color1 = `hsl(${5 + Math.random() * 25}, 85%, 50%)`;
                color2 = `hsl(${0 + Math.random() * 20}, 75%, 40%)`;
                glowColor = 'rgba(249, 115, 22, 0.3)';
            } else if (zone === 'final') {
                color1 = `hsl(${275 + Math.random() * 35}, 75%, 55%)`;
                color2 = `hsl(${285 + Math.random() * 35}, 65%, 45%)`;
                glowColor = 'rgba(168, 85, 247, 0.3)';
            } else {
                color1 = `hsl(${245 + Math.random() * 35}, 70%, 55%)`;
                color2 = `hsl(${255 + Math.random() * 35}, 60%, 45%)`;
                glowColor = 'rgba(139, 92, 246, 0.3)';
            }

            // Checkpoints: 2 per checkpoint row (positions 1 and near end)
            const isCheckpoint = isCheckpointRow && (
                p === 1 ||
                p === platformsThisRow - 2
            );
            const platform = {
                x: x, y: y,
                width: isCheckpoint ? CHECKPOINT_WIDTH : width,
                height: isCheckpoint ? 20 : PLATFORM_HEIGHT,
                color1: isCheckpoint ? '#10b981' : color1,
                color2: isCheckpoint ? '#059669' : color2,
                glowColor: isCheckpoint ? 'rgba(16, 185, 129, 0.5)' : glowColor,
                zone: zone, row: row, col: col,
                isCheckpoint: isCheckpoint,
                checkpointId: row
            };

            game.platforms.push(platform);
            platformGrid[row].push(platform);
        }
    }

    // Add moving platforms - reduced for performance
    for (let row = 0; row < numRows; row++) {
        const baseY = game.gameHeight - 160 - (row * rowHeight);
        const movingCount = 2 + Math.floor(Math.random() * 2); // 2-3 per row

        for (let m = 0; m < movingCount; m++) {
            const x = Math.random() * (screenWidth - 70);
            const y = baseY + (Math.random() - 0.5) * rowHeight * 0.5;

            const moveType = Math.random();
            let type, color1, color2, glowColor;

            if (moveType < 0.35) {
                type = 'horizontal';
                color1 = '#f59e0b'; color2 = '#d97706';
                glowColor = 'rgba(245, 158, 11, 0.3)';
            } else if (moveType < 0.65) {
                type = 'vertical';
                color1 = '#06b6d4'; color2 = '#0891b2';
                glowColor = 'rgba(6, 182, 212, 0.3)';
            } else {
                type = 'circular';
                color1 = '#a855f7'; color2 = '#7c3aed';
                glowColor = 'rgba(168, 85, 247, 0.3)';
            }

            game.movingPlatforms.push({
                x: x, y: y,
                width: 65 + Math.random() * 35,
                height: 14,
                startX: x, startY: y,
                moveRange: 25 + Math.random() * 40,
                speed: 0.4 + Math.random() * 0.5,
                direction: Math.random() > 0.5 ? 1 : -1,
                moveType: type,
                phase: Math.random() * Math.PI * 2,
                color1: color1, color2: color2, glowColor: glowColor
            });
        }
    }

    // ============ TONS OF OBSTACLES ============

    // WALLS - vertical barriers only (reduced for performance)
    for (let row = 3; row < numRows - 2; row += 2) {
        if (Math.random() > 0.4) continue; // Skip most rows
        const baseY = game.gameHeight - 160 - (row * rowHeight);

        const x = 30 + Math.random() * (screenWidth - 80);
        const y = baseY - 20 - Math.random() * 50;

        game.walls.push({
            x: x,
            y: y,
            width: 20,
            height: 50 + Math.random() * 60,
            isVertical: true
        });
    }

    // VOID ORBS - dark floating orbs that move in patterns (reduced for performance)
    for (let i = 0; i < 8; i++) {
        const row = 2 + Math.floor(Math.random() * (numRows - 4));
        const x = 40 + Math.random() * (screenWidth - 80);
        const y = game.gameHeight - 160 - (row * rowHeight) - Math.random() * 60;

        const pattern = Math.floor(Math.random() * 4); // 0: circle, 1: figure8, 2: horizontal, 3: vertical

        game.voidOrbs.push({
            x: x, y: y,
            baseX: x, baseY: y,
            radius: 15 + Math.random() * 10,
            pattern: pattern,
            speed: 0.008 + Math.random() * 0.012,
            phase: Math.random() * Math.PI * 2,
            moveRange: 35 + Math.random() * 45
        });
    }

    // SPIKES - reduced for performance
    for (let i = 5; i < game.platforms.length; i += 6) {
        const plat = game.platforms[i];
        if (plat.isCheckpoint || plat.isStart || plat.width < 90) continue;

        game.hazards.push({
            x: plat.x + 10 + Math.random() * (plat.width - 40),
            y: plat.y - 18,
            width: 22,
            height: 18,
            type: 'spike'
        });
    }

    // WATER POOLS - water zone (reduced for performance)
    for (let row = 4; row < 7; row += 2) {
        game.hazards.push({
            x: 30 + Math.random() * (screenWidth - 180),
            y: game.gameHeight - 160 - (row * rowHeight) + rowHeight * 0.4,
            width: 100 + Math.random() * 100,
            height: 25,
            type: 'water',
            wavePhase: Math.random() * Math.PI * 2
        });
    }

    // LAVA POOLS - lava zone (reduced for performance)
    for (let row = 8; row < 11; row += 2) {
        game.hazards.push({
            x: 30 + Math.random() * (screenWidth - 160),
            y: game.gameHeight - 160 - (row * rowHeight) + rowHeight * 0.4,
            width: 80 + Math.random() * 80,
            height: 22,
            type: 'lava',
            bubbleTimer: 0
        });
    }

    // FIRE HAZARDS - floating (reduced for performance)
    for (let i = 0; i < 5; i++) {
        const row = 2 + Math.floor(Math.random() * (numRows - 4));
        const x = 30 + Math.random() * (screenWidth - 60);
        const y = game.gameHeight - 160 - (row * rowHeight) - 10 - Math.random() * 60;

        game.hazards.push({
            x: x, y: y,
            width: 24, height: 24,
            baseX: x, baseY: y,
            moveRange: 30 + Math.random() * 40,
            speed: 0.006 + Math.random() * 0.01,
            phase: Math.random() * Math.PI * 2,
            moveType: Math.random() > 0.5 ? 'vertical' : 'horizontal',
            type: 'fire'
        });
    }

    // CRUSHERS - reduced for performance
    for (let row = 8; row < numRows - 2; row += 3) {
        if (Math.random() > 0.5) continue;
        const x = 60 + Math.random() * (screenWidth - 120);
        const baseY = game.gameHeight - 160 - (row * rowHeight);

        game.crushers.push({
            x: x,
            y: baseY - 180,
            width: 45, height: 55,
            baseY: baseY - 180,
            targetY: baseY - 50,
            state: 'waiting',
            waitTimer: 90 + Math.floor(Math.random() * 80),
            speed: 0
        });
    }

    // LASER BEAMS - horizontal beams that sweep (reduced for performance)
    for (let row = 5; row < numRows - 3; row += 4) {
        if (Math.random() > 0.4) continue;
        const y = game.gameHeight - 160 - (row * rowHeight) - 30;
        const goingRight = Math.random() > 0.5;

        game.hazards.push({
            x: goingRight ? -100 : screenWidth + 100,
            y: y,
            width: 120,
            height: 6,
            baseX: goingRight ? -100 : screenWidth + 100,
            speed: 2 + Math.random() * 1.5,
            direction: goingRight ? 1 : -1,
            type: 'laser'
        });
    }

    // Exit portal
    const topY = game.gameHeight - 160 - ((numRows - 1) * rowHeight);
    game.exitPortal = {
        x: screenWidth / 2,
        y: topY - 120,
        radius: 70,
        pulsePhase: 0
    };

    // Player starts falling from top of screen
    game.player.x = gameCanvas.width / 2 - game.player.width / 2;
    game.player.y = -120; // Start above the screen
    game.player.vx = 0;
    game.player.vy = 6; // Initial falling speed (slower for smoother intro)
    game.player.introFalling = true;
    game.player.landingBounce = false;
    game.player.introSwayPhase = 0;
    game.player.animTimer = 0;
    game.player.jumpCooldown = 0;
    game.player.lastGroundTime = 0;

    // Camera starts showing bottom
    game.camera.y = game.gameHeight - gameCanvas.height;

    // Generate background stars (reduced for performance)
    game.bgStars = [];
    for (let i = 0; i < 60; i++) {
        game.bgStars.push({
            x: Math.random() * gameCanvas.width,
            y: Math.random() * game.gameHeight,
            radius: Math.random() * 2 + 0.5,
            twinkleSpeed: Math.random() * 0.025 + 0.01,
            twinkleOffset: Math.random() * Math.PI * 2,
            depth: Math.random() * 0.5 + 0.5
        });
    }

    game.particles = [];
    game.won = false;
    game.fallTransition = 1; // Start with black screen that fades
    game.shakeIntensity = 0;
    game.slideOffset = window.innerHeight;
    game.lastCheckpoint = null;
    game.bestCheckpoint = null;
    game.introTimer = 0;
    game.landingAnimationTimer = 0;
    game.getUpAnimationTimer = 0;

    // Initialize crushers if not already set
    if (!game.crushers) game.crushers = [];
}

function startPlatformerGame() {
    if (gameActive) return;
    gameActive = true;

    initGame();

    // Show game canvas
    gameCanvas.style.display = 'block';
    gameUI.style.display = 'block';

    // Slide-up transition
    game.slideOffset = window.innerHeight;
    game.isSliding = true;

    const mainElements = [
        document.querySelector('.container'),
        document.querySelector('.poll-container'),
        document.querySelector('.slot-machine'),
        document.querySelector('.poker-card-wrapper'),
        document.querySelector('.floating-objects'),
        document.querySelector('.aurora'),
        document.querySelector('.spiral-galaxy'),
        document.querySelector('#stars'),
        document.querySelector('#mascot')
    ].filter(el => el);

    mascot.state = 'playing';

    mainElements.forEach(el => {
        el.style.transition = 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.transform = 'translateY(-100vh)';
    });

    game.shakeIntensity = 20;

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    setTimeout(() => {
        game.isSliding = false;
        game.slideOffset = 0;
    }, 1500);

    gameLoop();
}

function handleKeyDown(e) {
    if (!gameActive || game.player.introFalling) return;

    switch(e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
            keys.left = true;
            break;
        case 'd':
        case 'arrowright':
            keys.right = true;
            break;
        case 'w':
        case 'arrowup':
        case ' ':
            keys.jump = true;
            e.preventDefault();
            break;
        case 'r':
            // Respawn at checkpoint
            respawnAtCheckpoint();
            break;
    }
}

function respawnAtCheckpoint() {
    const p = game.player;
    const respawnPlatform = game.bestCheckpoint ||
        game.platforms.find(pl => pl.isStart) ||
        game.platforms[0];

    p.x = respawnPlatform.x + respawnPlatform.width / 2 - p.width / 2;
    p.y = respawnPlatform.y - p.height;
    p.vx = 0;
    p.vy = 0;
    p.onGround = true;
    game.shakeIntensity = 8;

    for (let i = 0; i < 12; i++) {
        game.particles.push({
            x: p.x + p.width / 2,
            y: p.y + p.height / 2,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1,
            color: '#10b981'
        });
    }
}

function handleKeyUp(e) {
    switch(e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
            keys.left = false;
            break;
        case 'd':
        case 'arrowright':
            keys.right = false;
            break;
        case 'w':
        case 'arrowup':
        case ' ':
            keys.jump = false;
            break;
    }
}

function updatePlayer() {
    const p = game.player;

    // Handle intro falling
    if (p.introFalling) {
        // Fast intro fall (+15%)
        const introGravity = GRAVITY * 0.95;
        p.vy += introGravity;
        p.vy = Math.min(p.vy, 22); // Fast fall

        // Smooth interpolation for position
        p.y += p.vy;

        // Gentle swaying motion while falling
        if (!p.introSwayPhase) p.introSwayPhase = 0;
        p.introSwayPhase += 0.08;
        const swayAmount = Math.sin(p.introSwayPhase) * 0.5;
        p.x += swayAmount;

        p.animTimer += 0.04; // Smooth leg animation while falling

        // Trail particles with varied colors
        if (Math.random() > 0.5) {
            game.particles.push({
                x: p.x + p.width / 2 + (Math.random() - 0.5) * 10,
                y: p.y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -2 - Math.random() * 2,
                life: 1.2,
                color: Math.random() > 0.5 ? '#fbbf24' : '#8b5cf6'
            });
        }

        // Check if landed on starting platform
        const startPlat = game.platforms.find(pl => pl.isStart);
        if (p.y + p.height >= startPlat.y && p.y + p.height < startPlat.y + 50 &&
            p.x + p.width > startPlat.x && p.x < startPlat.x + startPlat.width) {

            // Smooth landing with slight bounce
            p.y = startPlat.y - p.height;

            // Small bounce effect
            if (!p.landingBounce) {
                p.landingBounce = true;
                p.vy = -3; // Small bounce up
                game.shakeIntensity = 15;

                // Initial landing particles
                for (let i = 0; i < 12; i++) {
                    game.particles.push({
                        x: p.x + p.width / 2,
                        y: p.y + p.height,
                        vx: (Math.random() - 0.5) * 8,
                        vy: -Math.random() * 5 - 1,
                        life: 1.2,
                        color: ['#fbbf24', '#10b981', '#8b5cf6'][Math.floor(Math.random() * 3)]
                    });
                }
            } else if (p.vy >= 0) {
                // Final landing after bounce
                p.vy = 0;
                p.introFalling = false;
                p.onGround = true;
                p.landingBounce = false;
                game.shakeIntensity = 8;

                // Final landing particles
                for (let i = 0; i < 10; i++) {
                    game.particles.push({
                        x: p.x + p.width / 2,
                        y: p.y + p.height,
                        vx: (Math.random() - 0.5) * 6,
                        vy: -Math.random() * 4 - 1,
                        life: 1,
                        color: '#10b981'
                    });
                }
            }
        }
        return;
    }

    // Normal gameplay - fast acceleration (+15% more)
    if (keys.left) {
        p.vx -= 1.15;
        p.facingRight = false;
    }
    if (keys.right) {
        p.vx += 1.15;
        p.facingRight = true;
    }

    p.vx *= FRICTION;
    p.vx = Math.max(-MOVE_SPEED, Math.min(MOVE_SPEED, p.vx));

    // Jump cooldown decreases each frame
    if (p.jumpCooldown > 0) {
        p.jumpCooldown--;
    }

    // Track time on ground
    if (p.onGround) {
        p.lastGroundTime++;
    } else {
        p.lastGroundTime = 0;
    }

    // Can only jump if: on ground, cooldown is 0, and been on ground for at least 5 frames
    if (keys.jump && p.onGround && p.jumpCooldown === 0 && p.lastGroundTime > 5) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
        p.jumpCooldown = 12; // ~0.2 second cooldown after jumping
        p.lastGroundTime = 0;
        for (let i = 0; i < 8; i++) {
            game.particles.push({
                x: p.x + p.width / 2,
                y: p.y + p.height,
                vx: (Math.random() - 0.5) * 6,
                vy: Math.random() * 2 + 1,
                life: 1,
                color: '#8b5cf6'
            });
        }
    }

    p.vy += GRAVITY;
    p.vy = Math.min(p.vy, MAX_FALL_SPEED);

    // Update animation timer
    if (Math.abs(p.vx) > 0.5 || !p.onGround) {
        p.animTimer += 0.03;
    }

    p.x += p.vx;
    p.y += p.vy;

    if (p.x + p.width < 0) {
        p.x = gameCanvas.width;
    } else if (p.x > gameCanvas.width) {
        p.x = -p.width;
    }

    // Wall collisions - block movement but don't kill
    if (game.walls) {
        for (const wall of game.walls) {
            // Check if player overlaps wall
            if (p.x + p.width > wall.x && p.x < wall.x + wall.width &&
                p.y + p.height > wall.y && p.y < wall.y + wall.height) {

                // Determine which side to push out from
                const overlapLeft = (p.x + p.width) - wall.x;
                const overlapRight = (wall.x + wall.width) - p.x;
                const overlapTop = (p.y + p.height) - wall.y;
                const overlapBottom = (wall.y + wall.height) - p.y;

                const minOverlapX = Math.min(overlapLeft, overlapRight);
                const minOverlapY = Math.min(overlapTop, overlapBottom);

                if (minOverlapX < minOverlapY) {
                    // Push horizontally
                    if (overlapLeft < overlapRight) {
                        p.x = wall.x - p.width;
                    } else {
                        p.x = wall.x + wall.width;
                    }
                    p.vx = 0;
                } else {
                    // Push vertically
                    if (overlapTop < overlapBottom) {
                        p.y = wall.y - p.height;
                        p.vy = 0;
                        p.onGround = true;
                    } else {
                        p.y = wall.y + wall.height;
                        p.vy = 0;
                    }
                }
            }
        }
    }

    // Void orb collisions - deadly
    if (game.voidOrbs) {
        for (const orb of game.voidOrbs) {
            // Update orb position based on pattern
            orb.phase += orb.speed;
            if (orb.pattern === 0) { // Circle
                orb.x = orb.baseX + Math.cos(orb.phase) * orb.moveRange;
                orb.y = orb.baseY + Math.sin(orb.phase) * orb.moveRange;
            } else if (orb.pattern === 1) { // Figure 8
                orb.x = orb.baseX + Math.sin(orb.phase) * orb.moveRange;
                orb.y = orb.baseY + Math.sin(orb.phase * 2) * (orb.moveRange * 0.5);
            } else if (orb.pattern === 2) { // Horizontal
                orb.x = orb.baseX + Math.sin(orb.phase) * orb.moveRange;
            } else { // Vertical
                orb.y = orb.baseY + Math.sin(orb.phase) * orb.moveRange;
            }

            // Check collision with player
            const dx = (p.x + p.width/2) - orb.x;
            const dy = (p.y + p.height/2) - orb.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < orb.radius + 15) {
                respawnPlayer();
                break;
            }
        }
    }

    // Laser beam collisions - deadly
    for (const h of game.hazards) {
        if (h.type === 'laser') {
            // Update laser position
            h.x += h.speed * h.direction;
            // Reset when off screen
            if (h.direction > 0 && h.x > gameCanvas.width + 200) {
                h.x = -h.width - 100;
            } else if (h.direction < 0 && h.x < -h.width - 200) {
                h.x = gameCanvas.width + 100;
            }
        }
    }

    // Platform collision
    p.onGround = false;
    for (const plat of game.platforms) {
        if (p.x + p.width > plat.x && p.x < plat.x + plat.width) {
            if (p.vy > 0 &&
                p.y + p.height > plat.y &&
                p.y + p.height < plat.y + plat.height + p.vy + 5) {
                p.y = plat.y - p.height;
                p.vy = 0;
                p.onGround = true;
                p.squatAmount = Math.min(p.vy, 8); // Landing squash

                if (plat.isCheckpoint) {
                    // Only save as best checkpoint if it's further up (higher checkpointId = further north)
                    if (!game.bestCheckpoint || plat.checkpointId > game.bestCheckpoint.checkpointId) {
                        game.bestCheckpoint = plat;
                        // Celebration particles for new best checkpoint
                        for (let i = 0; i < 20; i++) {
                            game.particles.push({
                                x: plat.x + plat.width / 2,
                                y: plat.y,
                                vx: (Math.random() - 0.5) * 8,
                                vy: -Math.random() * 6 - 2,
                                life: 1.2,
                                color: '#10b981'
                            });
                        }
                        game.shakeIntensity = 5;
                    }
                }
            }
        }
    }

    // Moving platform collision
    for (const mp of game.movingPlatforms) {
        // Store previous position for player carry
        const prevX = mp.x;
        const prevY = mp.y;

        // Update platform position based on movement type
        if (mp.moveType === 'vertical') {
            mp.y += mp.speed * mp.direction;
            if (mp.y > mp.startY + mp.moveRange || mp.y < mp.startY - mp.moveRange) {
                mp.direction *= -1;
            }
        } else if (mp.moveType === 'horizontal') {
            mp.x += mp.speed * mp.direction;
            if (mp.x > mp.startX + mp.moveRange || mp.x < mp.startX - mp.moveRange) {
                mp.direction *= -1;
            }
        } else if (mp.moveType === 'circular') {
            // Circular motion
            mp.phase += mp.speed * 0.05;
            mp.x = mp.startX + Math.cos(mp.phase) * mp.moveRange;
            mp.y = mp.startY + Math.sin(mp.phase) * mp.moveRange;
        }

        // Calculate delta for carrying player
        const deltaX = mp.x - prevX;
        const deltaY = mp.y - prevY;

        if (p.x + p.width > mp.x && p.x < mp.x + mp.width) {
            if (p.vy >= 0 &&
                p.y + p.height > mp.y &&
                p.y + p.height < mp.y + mp.height + Math.max(p.vy, 5) + 5) {
                p.y = mp.y - p.height;
                p.vy = 0;
                p.onGround = true;
                // Carry player with platform movement
                p.x += deltaX;
                p.y += deltaY;
            }
        }
    }

    // Crusher hazards
    if (game.crushers) {
        for (const crusher of game.crushers) {
            // Update crusher state
            if (crusher.state === 'waiting') {
                crusher.waitTimer--;
                if (crusher.waitTimer <= 0) {
                    crusher.state = 'falling';
                    crusher.speed = 0;
                }
            } else if (crusher.state === 'falling') {
                crusher.speed += 0.8;
                crusher.y += crusher.speed;
                if (crusher.y >= crusher.targetY) {
                    crusher.y = crusher.targetY;
                    crusher.state = 'rising';
                    crusher.speed = 0;
                    game.shakeIntensity = Math.max(game.shakeIntensity, 8);
                }
            } else if (crusher.state === 'rising') {
                crusher.speed += 0.1;
                crusher.y -= crusher.speed;
                if (crusher.y <= crusher.baseY) {
                    crusher.y = crusher.baseY;
                    crusher.state = 'waiting';
                    crusher.waitTimer = 90 + Math.floor(Math.random() * 90);
                    crusher.speed = 0;
                }
            }

            // Check collision with player
            const pad = 5;
            if (p.x + p.width - pad > crusher.x + pad &&
                p.x + pad < crusher.x + crusher.width - pad &&
                p.y + p.height - pad > crusher.y + pad &&
                p.y + pad < crusher.y + crusher.height - pad) {
                respawnPlayer();
                break;
            }
        }
    }

    // Hazard collisions
    for (const h of game.hazards) {
        // Update hazard movement
        if (h.type === 'fire') {
            h.phase += h.speed;
            if (h.moveType === 'horizontal') {
                h.x = h.baseX + Math.sin(h.phase) * h.moveRange;
            } else {
                h.y = h.baseY + Math.sin(h.phase) * h.moveRange;
            }
        } else if (h.type === 'water') {
            h.wavePhase += 0.05;
        } else if (h.type === 'lava') {
            h.bubbleTimer += 1;
        }

        // Collision detection
        let pad = 5;
        if (h.type === 'water' || h.type === 'lava') {
            pad = 8; // Slightly more forgiving for pools
        }

        if (p.x + p.width - pad > h.x + pad &&
            p.x + pad < h.x + h.width - pad &&
            p.y + p.height - pad > h.y + pad &&
            p.y + pad < h.y + h.height - pad) {
            respawnPlayer();
            break;
        }
    }

    if (p.y > game.gameHeight - 30) {
        respawnPlayer();
    }

    function respawnPlayer() {
        // Use best checkpoint (furthest reached), not last touched
        const respawnPlatform = game.bestCheckpoint ||
            game.platforms.find(pl => pl.isStart) ||
            game.platforms[game.platforms.length - 1];

        p.x = respawnPlatform.x + respawnPlatform.width / 2 - p.width / 2;
        p.y = respawnPlatform.y - p.height;
        p.vx = 0;
        p.vy = 0;
        p.onGround = true;
        game.shakeIntensity = 12;

        for (let i = 0; i < 15; i++) {
            game.particles.push({
                x: p.x + p.width / 2,
                y: p.y + p.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color: '#ef4444'
            });
        }

        if (game.bestCheckpoint) {
            for (let i = 0; i < 10; i++) {
                game.particles.push({
                    x: p.x + p.width / 2,
                    y: p.y + p.height,
                    vx: (Math.random() - 0.5) * 6,
                    vy: -Math.random() * 4,
                    life: 1,
                    color: '#10b981'
                });
            }
        }
    }

    if (Math.abs(p.vx) > 2 && p.onGround) {
        if (Math.random() > 0.5) {
            game.particles.push({
                x: p.x + (p.facingRight ? 0 : p.width),
                y: p.y + p.height - 5,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2,
                life: 1,
                color: '#ec4899'
            });
        }
    }

    p.animTimer += 0.03;
    if (p.animTimer >= 1) {
        p.animTimer = 0;
        p.animFrame = (p.animFrame + 1) % 4;
    }

    // Check exit portal
    const portalDist = Math.sqrt(
        Math.pow(p.x + p.width / 2 - game.exitPortal.x, 2) +
        Math.pow(p.y + p.height / 2 - game.exitPortal.y, 2)
    );

    if (portalDist < game.exitPortal.radius + 20 && !game.won) {
        game.won = true;
        endGame();
    }
}

function updateCamera() {
    const targetY = game.player.y - gameCanvas.height / 2;
    const clampedTarget = Math.max(0, Math.min(game.gameHeight - gameCanvas.height, targetY));

    // Smoother camera follow with easing
    const cameraSpeed = game.player.introFalling ? 0.04 : 0.06;
    const diff = clampedTarget - game.camera.y;

    // Use smooth interpolation
    game.camera.y += diff * cameraSpeed;

    // Smooth shake decay
    game.shakeIntensity *= 0.92;
    if (game.shakeIntensity < 0.5) game.shakeIntensity = 0;
}

function updateParticles() {
    game.particles = game.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.03;
        return p.life > 0;
    });
}

function drawGame() {
    const ctx = gameCtx;

    // Dark void background with slight purple tint
    ctx.fillStyle = '#0a0612';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Add ambient void glow effect
    const time = Date.now() * 0.001;
    const voidGlow = ctx.createRadialGradient(
        gameCanvas.width / 2, gameCanvas.height / 2, 0,
        gameCanvas.width / 2, gameCanvas.height / 2, gameCanvas.width * 0.8
    );
    voidGlow.addColorStop(0, `rgba(88, 28, 135, ${0.15 + Math.sin(time * 0.5) * 0.05})`);
    voidGlow.addColorStop(0.5, `rgba(59, 7, 100, ${0.1 + Math.sin(time * 0.3) * 0.03})`);
    voidGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = voidGlow;
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    ctx.save();
    // Smoother shake using sin waves instead of pure random
    const shakeTime = Date.now() * 0.02;
    const shakeX = Math.sin(shakeTime * 1.5) * game.shakeIntensity * 0.5 + (Math.random() - 0.5) * game.shakeIntensity * 0.5;
    const shakeY = Math.cos(shakeTime * 1.3) * game.shakeIntensity * 0.5 + (Math.random() - 0.5) * game.shakeIntensity * 0.5;
    ctx.translate(shakeX, -game.camera.y + shakeY);

    // Draw void tendrils - eerie swirling dark purple tendrils (more visible)
    if (game.voidTendrils) {
        game.voidTendrils.forEach(tendril => {
            const parallaxY = tendril.y + game.camera.y * 0.3;
            const screenY = parallaxY - game.camera.y;

            if (screenY > -tendril.length && screenY < gameCanvas.height + tendril.length) {
                tendril.angle += tendril.speed;

                ctx.save();
                ctx.translate(tendril.x, parallaxY);
                ctx.rotate(tendril.angle);

                // Create gradient for tendril - more visible
                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, tendril.length);
                grad.addColorStop(0, `rgba(139, 92, 246, ${0.5 + Math.sin(time + tendril.phase) * 0.15})`);
                grad.addColorStop(0.4, `rgba(88, 28, 135, ${0.35 + Math.sin(time * 0.8 + tendril.phase) * 0.1})`);
                grad.addColorStop(0.7, `rgba(59, 7, 100, ${0.2})`);
                grad.addColorStop(1, 'transparent');

                ctx.fillStyle = grad;
                ctx.beginPath();

                // Wavy tendril shape
                for (let i = 0; i <= 20; i++) {
                    const t = i / 20;
                    const dist = t * tendril.length;
                    const waveOffset = Math.sin(t * 4 + time * 2 + tendril.phase) * tendril.thickness * (1 - t) * 0.5;

                    if (i === 0) {
                        ctx.moveTo(waveOffset, dist);
                    } else {
                        ctx.lineTo(waveOffset, dist);
                    }
                }
                for (let i = 20; i >= 0; i--) {
                    const t = i / 20;
                    const dist = t * tendril.length;
                    const waveOffset = Math.sin(t * 4 + time * 2 + tendril.phase + Math.PI) * tendril.thickness * (1 - t) * 0.5;
                    ctx.lineTo(waveOffset + tendril.thickness * (1 - t), dist);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        });
    }

    // Draw purple-tinted background stars
    game.bgStars.forEach(star => {
        const parallaxY = star.y + game.camera.y * (1 - star.depth);
        const screenY = parallaxY - game.camera.y;

        if (screenY > -50 && screenY < gameCanvas.height + 50) {
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(star.x, parallaxY, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(167, 139, 250, ${0.4 * twinkle * star.depth})`; // Brighter purple stars
            ctx.fill();
        }
    });

    // Draw exit portal
    const portal = game.exitPortal;
    portal.pulsePhase += 0.03;
    const pulseSize = Math.sin(portal.pulsePhase) * 15;
    const rotationPhase = time * 0.5;

    ctx.save();
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 60;
    for (let ring = 3; ring >= 0; ring--) {
        const ringRadius = portal.radius + pulseSize + 30 + ring * 20;
        const ringAlpha = 0.15 - ring * 0.03;
        ctx.beginPath();
        ctx.arc(portal.x, portal.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251, 191, 36, ${ringAlpha})`;
        ctx.lineWidth = 8 - ring * 2;
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Swirling energy particles (reduced for performance)
    ctx.save();
    for (let i = 0; i < 10; i++) {
        const particleAngle = rotationPhase + (i / 10) * Math.PI * 2;
        const particleDist = portal.radius + 20 + Math.sin(time * 3 + i) * 12;
        const px = portal.x + Math.cos(particleAngle) * particleDist;
        const py = portal.y + Math.sin(particleAngle) * particleDist;
        const particleSize = 3 + Math.sin(time * 5 + i * 0.5) * 2;

        ctx.beginPath();
        ctx.arc(px, py, particleSize, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? '#fbbf24' : '#fff';
        ctx.globalAlpha = 0.6 + Math.sin(time * 4 + i) * 0.3;
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // Portal glow
    const portalGlow = ctx.createRadialGradient(
        portal.x, portal.y, 0,
        portal.x, portal.y, portal.radius + pulseSize + 60
    );
    portalGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    portalGlow.addColorStop(0.2, 'rgba(255, 230, 150, 0.8)');
    portalGlow.addColorStop(0.4, 'rgba(251, 191, 36, 0.5)');
    portalGlow.addColorStop(0.7, 'rgba(139, 92, 246, 0.2)');
    portalGlow.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(portal.x, portal.y, portal.radius + pulseSize + 60, 0, Math.PI * 2);
    ctx.fillStyle = portalGlow;
    ctx.fill();

    // Portal core
    ctx.save();
    ctx.translate(portal.x, portal.y);
    ctx.rotate(rotationPhase * 0.3);

    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, portal.radius + pulseSize);
    coreGrad.addColorStop(0, '#fff');
    coreGrad.addColorStop(0.3, '#fffbeb');
    coreGrad.addColorStop(0.6, '#fbbf24');
    coreGrad.addColorStop(0.85, '#f59e0b');
    coreGrad.addColorStop(1, '#d97706');

    ctx.beginPath();
    ctx.arc(0, 0, portal.radius + pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 40;
    ctx.fill();

    const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, portal.radius * 0.5);
    innerGrad.addColorStop(0, '#fff');
    innerGrad.addColorStop(0.5, 'rgba(255,255,255,0.8)');
    innerGrad.addColorStop(1, 'rgba(255,255,200,0.3)');
    ctx.beginPath();
    ctx.arc(0, 0, portal.radius * 0.5 + pulseSize * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = innerGrad;
    ctx.fill();

    ctx.restore();

    // Light rays (reduced for performance)
    ctx.save();
    for (let i = 0; i < 6; i++) {
        const rayAngle = rotationPhase * 0.5 + (i / 6) * Math.PI * 2;
        const rayLength = 100 + Math.sin(time * 2.5 + i * 0.8) * 50;
        const rayWidth = 4 + Math.sin(time * 3 + i) * 2;

        const rayGrad = ctx.createLinearGradient(
            portal.x, portal.y,
            portal.x + Math.cos(rayAngle) * rayLength,
            portal.y + Math.sin(rayAngle) * rayLength
        );
        rayGrad.addColorStop(0, 'rgba(255, 200, 100, 0.6)');
        rayGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.3)');
        rayGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(portal.x, portal.y);
        ctx.lineTo(
            portal.x + Math.cos(rayAngle) * rayLength,
            portal.y + Math.sin(rayAngle) * rayLength
        );
        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = rayWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    ctx.restore();

    // "EXIT" text
    ctx.save();
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 0.7 + Math.sin(time * 2) * 0.2;
    ctx.fillText('EXIT', portal.x, portal.y - portal.radius - 30 - pulseSize);
    ctx.restore();

    // Draw platforms
    game.platforms.forEach(plat => {
        ctx.shadowColor = plat.glowColor;
        ctx.shadowBlur = 20;

        const grad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
        grad.addColorStop(0, plat.color1);
        grad.addColorStop(1, plat.color2);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 5);
        ctx.fill();

        ctx.shadowBlur = 0;
    });

    // Draw moving platforms
    game.movingPlatforms.forEach(mp => {
        ctx.shadowColor = mp.glowColor;
        ctx.shadowBlur = 15;

        const grad = ctx.createLinearGradient(mp.x, mp.y, mp.x, mp.y + mp.height);
        grad.addColorStop(0, mp.color1);
        grad.addColorStop(1, mp.color2);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(mp.x, mp.y, mp.width, mp.height, 4);
        ctx.fill();

        // Direction indicator
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        if (mp.moveType === 'vertical') {
            ctx.fillText(mp.direction > 0 ? '\u2193' : '\u2191', mp.x + mp.width / 2, mp.y + mp.height / 2 + 3);
        } else if (mp.moveType === 'circular') {
            ctx.fillText('\u27F3', mp.x + mp.width / 2, mp.y + mp.height / 2 + 3); // Circular arrow
        } else {
            ctx.fillText(mp.direction > 0 ? '\u2192' : '\u2190', mp.x + mp.width / 2, mp.y + mp.height / 2 + 3);
        }

        ctx.shadowBlur = 0;
    });

    // Draw walls (maze barriers - block but don't kill)
    if (game.walls) {
        game.walls.forEach(wall => {
            ctx.shadowColor = 'rgba(88, 28, 135, 0.5)';
            ctx.shadowBlur = 10;

            // Dark purple/gray gradient for void walls
            const wallGrad = ctx.createLinearGradient(
                wall.x, wall.y,
                wall.x + (wall.isVertical ? wall.width : 0),
                wall.y + (wall.isVertical ? 0 : wall.height)
            );
            wallGrad.addColorStop(0, '#1e1b4b');
            wallGrad.addColorStop(0.5, '#312e81');
            wallGrad.addColorStop(1, '#1e1b4b');

            ctx.fillStyle = wallGrad;
            ctx.beginPath();
            ctx.roundRect(wall.x, wall.y, wall.width, wall.height, 4);
            ctx.fill();

            // Border glow
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner pattern - small dots
            ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
            const dotSpacing = 15;
            for (let dx = dotSpacing; dx < wall.width - 5; dx += dotSpacing) {
                for (let dy = dotSpacing; dy < wall.height - 5; dy += dotSpacing) {
                    ctx.beginPath();
                    ctx.arc(wall.x + dx, wall.y + dy, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.shadowBlur = 0;
        });
    }

    // Draw hazards
    game.hazards.forEach(h => {
        if (h.type === 'spike') {
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#dc2626';

            const spikeCount = 3;
            const spikeWidth = h.width / spikeCount;
            for (let i = 0; i < spikeCount; i++) {
                ctx.beginPath();
                ctx.moveTo(h.x + i * spikeWidth, h.y + h.height);
                ctx.lineTo(h.x + i * spikeWidth + spikeWidth / 2, h.y);
                ctx.lineTo(h.x + (i + 1) * spikeWidth, h.y + h.height);
                ctx.closePath();
                ctx.fill();
            }
        } else if (h.type === 'fire') {
            ctx.shadowColor = '#f97316';
            ctx.shadowBlur = 25;

            const fireGrad = ctx.createRadialGradient(
                h.x + h.width / 2, h.y + h.height / 2, 0,
                h.x + h.width / 2, h.y + h.height / 2, h.width / 2
            );
            fireGrad.addColorStop(0, '#fbbf24');
            fireGrad.addColorStop(0.5, '#f97316');
            fireGrad.addColorStop(1, '#dc2626');

            ctx.fillStyle = fireGrad;
            ctx.beginPath();
            const wobble = Math.sin(time * 5 + h.phase) * 3;
            ctx.ellipse(
                h.x + h.width / 2 + wobble,
                h.y + h.height / 2,
                h.width / 2 + Math.sin(time * 8) * 2,
                h.height / 2 + Math.cos(time * 6) * 2,
                0, 0, Math.PI * 2
            );
            ctx.fill();

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(h.x + h.width / 2 + wobble, h.y + h.height / 2, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (h.type === 'water') {
            // Water pool - blue with wave animation
            ctx.shadowColor = '#3b82f6';
            ctx.shadowBlur = 15;

            const waterGrad = ctx.createLinearGradient(h.x, h.y, h.x, h.y + h.height);
            waterGrad.addColorStop(0, 'rgba(59, 130, 246, 0.7)');
            waterGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.8)');
            waterGrad.addColorStop(1, 'rgba(29, 78, 216, 0.9)');

            ctx.fillStyle = waterGrad;
            ctx.beginPath();

            // Wavy top edge
            ctx.moveTo(h.x, h.y + h.height);
            ctx.lineTo(h.x, h.y + 5);
            for (let wx = 0; wx <= h.width; wx += 10) {
                const waveY = Math.sin((wx / 20) + h.wavePhase) * 4;
                ctx.lineTo(h.x + wx, h.y + waveY);
            }
            ctx.lineTo(h.x + h.width, h.y + h.height);
            ctx.closePath();
            ctx.fill();

            // Surface shine
            ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let wx = 5; wx < h.width - 5; wx += 10) {
                const waveY = Math.sin((wx / 20) + h.wavePhase) * 4;
                if (wx === 5) ctx.moveTo(h.x + wx, h.y + waveY);
                else ctx.lineTo(h.x + wx, h.y + waveY);
            }
            ctx.stroke();
        } else if (h.type === 'lava') {
            // Lava pool - orange/red with bubbles
            ctx.shadowColor = '#f97316';
            ctx.shadowBlur = 20;

            const lavaGrad = ctx.createLinearGradient(h.x, h.y, h.x, h.y + h.height);
            lavaGrad.addColorStop(0, '#fbbf24');
            lavaGrad.addColorStop(0.4, '#f97316');
            lavaGrad.addColorStop(1, '#dc2626');

            ctx.fillStyle = lavaGrad;
            ctx.beginPath();
            ctx.roundRect(h.x, h.y, h.width, h.height, 3);
            ctx.fill();

            // Bubbles
            ctx.fillStyle = '#fef3c7';
            for (let b = 0; b < 3; b++) {
                const bubbleX = h.x + 10 + (b * h.width / 3);
                const bubbleY = h.y + 5 + Math.sin(time * 3 + b * 2) * 5;
                const bubbleSize = 3 + Math.sin(time * 5 + b) * 1.5;
                ctx.beginPath();
                ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
                ctx.fill();
            }

            // Surface glow
            ctx.strokeStyle = '#fef3c7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(h.x + 5, h.y + 2);
            ctx.lineTo(h.x + h.width - 5, h.y + 2);
            ctx.stroke();
        } else if (h.type === 'laser') {
            // Laser beam - bright red/pink sweeping beam
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 30;

            // Main beam
            const laserGrad = ctx.createLinearGradient(h.x, h.y, h.x + h.width, h.y);
            laserGrad.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
            laserGrad.addColorStop(0.3, '#ef4444');
            laserGrad.addColorStop(0.5, '#fca5a5');
            laserGrad.addColorStop(0.7, '#ef4444');
            laserGrad.addColorStop(1, 'rgba(239, 68, 68, 0.3)');

            ctx.fillStyle = laserGrad;
            ctx.fillRect(h.x, h.y, h.width, h.height);

            // Core bright line
            ctx.fillStyle = '#fff';
            ctx.fillRect(h.x + 10, h.y + h.height / 2 - 1, h.width - 20, 2);

            // Pulsing glow effect
            const pulse = Math.sin(time * 10) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(252, 165, 165, ${pulse * 0.5})`;
            ctx.fillRect(h.x, h.y - 4, h.width, h.height + 8);
        }
        ctx.shadowBlur = 0;
    });

    // Draw crushers
    if (game.crushers) {
        game.crushers.forEach(crusher => {
            ctx.shadowColor = '#6b7280';
            ctx.shadowBlur = 10;

            // Crusher body
            const crusherGrad = ctx.createLinearGradient(crusher.x, crusher.y, crusher.x, crusher.y + crusher.height);
            crusherGrad.addColorStop(0, '#4b5563');
            crusherGrad.addColorStop(0.5, '#374151');
            crusherGrad.addColorStop(1, '#1f2937');

            ctx.fillStyle = crusherGrad;
            ctx.beginPath();
            ctx.roundRect(crusher.x, crusher.y, crusher.width, crusher.height, 4);
            ctx.fill();

            // Spikes on bottom
            ctx.fillStyle = '#dc2626';
            const spikeCount = 4;
            const spikeW = crusher.width / spikeCount;
            for (let i = 0; i < spikeCount; i++) {
                ctx.beginPath();
                ctx.moveTo(crusher.x + i * spikeW, crusher.y + crusher.height);
                ctx.lineTo(crusher.x + i * spikeW + spikeW / 2, crusher.y + crusher.height + 10);
                ctx.lineTo(crusher.x + (i + 1) * spikeW, crusher.y + crusher.height);
                ctx.closePath();
                ctx.fill();
            }

            // Warning indicator when about to fall
            if (crusher.state === 'waiting' && crusher.waitTimer < 30) {
                ctx.fillStyle = `rgba(239, 68, 68, ${0.5 + Math.sin(time * 10) * 0.3})`;
                ctx.beginPath();
                ctx.arc(crusher.x + crusher.width / 2, crusher.y + crusher.height + 25, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.shadowBlur = 0;
        });
    }

    // Draw void orbs (deadly moving orbs)
    if (game.voidOrbs) {
        game.voidOrbs.forEach(orb => {
            ctx.save();

            // Outer glow
            ctx.shadowColor = '#581c87';
            ctx.shadowBlur = 25;

            // Dark swirling void orb
            const orbGrad = ctx.createRadialGradient(
                orb.x, orb.y, 0,
                orb.x, orb.y, orb.radius
            );
            orbGrad.addColorStop(0, '#000');
            orbGrad.addColorStop(0.3, '#1e1b4b');
            orbGrad.addColorStop(0.6, '#581c87');
            orbGrad.addColorStop(0.85, '#7c3aed');
            orbGrad.addColorStop(1, 'rgba(124, 58, 237, 0.3)');

            ctx.fillStyle = orbGrad;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            ctx.fill();

            // Swirling inner pattern
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const spiralAngle = time * 2 + (i * Math.PI * 2 / 3) + orb.phase;
                const spiralRadius = orb.radius * 0.6;
                ctx.beginPath();
                ctx.arc(
                    orb.x + Math.cos(spiralAngle) * spiralRadius * 0.3,
                    orb.y + Math.sin(spiralAngle) * spiralRadius * 0.3,
                    orb.radius * 0.3,
                    spiralAngle,
                    spiralAngle + Math.PI
                );
                ctx.stroke();
            }

            // Center eye/core
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius * 0.25, 0, Math.PI * 2);
            ctx.fill();

            // Particle trail effect
            const trailAngle = time * 3 + orb.phase;
            for (let i = 0; i < 4; i++) {
                const angle = trailAngle + (i * Math.PI / 2);
                const dist = orb.radius + 5 + Math.sin(time * 4 + i) * 5;
                ctx.fillStyle = `rgba(139, 92, 246, ${0.6 - i * 0.15})`;
                ctx.beginPath();
                ctx.arc(
                    orb.x + Math.cos(angle) * dist,
                    orb.y + Math.sin(angle) * dist,
                    3 - i * 0.5,
                    0, Math.PI * 2
                );
                ctx.fill();
            }

            ctx.restore();
        });
    }

    // Draw particles
    game.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
        ctx.fill();
    });

    // Draw player - bigger stick figure style
    const pl = game.player;

    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 20;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const centerX = pl.x + pl.width / 2;
    const headY = pl.y + 16;
    const bodyTop = pl.y + 28;
    const bodyBottom = pl.y + 48;

    // Head - bigger
    ctx.beginPath();
    ctx.arc(centerX, headY, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();

    // Body - longer
    ctx.beginPath();
    ctx.moveTo(centerX, bodyTop);
    ctx.lineTo(centerX, bodyBottom);
    ctx.stroke();

    // Animation - simple swing based on movement
    const isMoving = Math.abs(pl.vx) > 0.5 || !pl.onGround;
    const walkOffset = isMoving ? Math.sin(pl.animTimer * Math.PI * 2) * 8 : 0;
    const jumpArmOffset = !pl.onGround ? -12 : 0;

    // Arms - swing opposite to legs, longer
    ctx.beginPath();
    ctx.moveTo(centerX, bodyTop + 6);
    ctx.lineTo(centerX - 16, bodyTop + 20 - walkOffset + jumpArmOffset);
    ctx.moveTo(centerX, bodyTop + 6);
    ctx.lineTo(centerX + 16, bodyTop + 20 + walkOffset + jumpArmOffset);
    ctx.stroke();

    // Legs - swing with movement, longer
    ctx.beginPath();
    ctx.moveTo(centerX, bodyBottom);
    ctx.lineTo(centerX - 13, pl.y + pl.height + walkOffset);
    ctx.moveTo(centerX, bodyBottom);
    ctx.lineTo(centerX + 13, pl.y + pl.height - walkOffset);
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.restore();

    // Fall transition overlay - smooth fade with easing
    if (game.fallTransition > 0) {
        // Ease out cubic for smoother fade
        game.fallTransition -= 0.012;
        const easedAlpha = game.fallTransition * game.fallTransition * game.fallTransition;
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0, easedAlpha)})`;
        ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    }
}

function gameLoop() {
    if (!gameActive) return;

    updatePlayer();
    updateCamera();
    updateParticles();
    drawGame();

    gameAnimationId = requestAnimationFrame(gameLoop);
}

function endGame() {
    for (let i = 0; i < 60; i++) {
        game.particles.push({
            x: game.exitPortal.x,
            y: game.exitPortal.y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            life: 2,
            color: ['#fbbf24', '#f59e0b', '#10b981', '#fff'][Math.floor(Math.random() * 4)]
        });
    }

    const winGlow = document.createElement('div');
    winGlow.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at 50% 20%, rgba(251, 191, 36, 0.4) 0%, transparent 60%);
        z-index: 2500; pointer-events: none;
        animation: winGlowAnim 1.5s ease-out forwards;
    `;
    document.body.appendChild(winGlow);
    setTimeout(() => winGlow.remove(), 1500);

    setTimeout(() => {
        const mainElements = [
            document.querySelector('.container'),
            document.querySelector('.poll-container'),
            document.querySelector('.slot-machine'),
            document.querySelector('.poker-card-wrapper'),
            document.querySelector('.floating-objects'),
            document.querySelector('.aurora'),
            document.querySelector('.spiral-galaxy'),
            document.querySelector('#stars'),
            document.querySelector('#mascot')
        ].filter(el => el);

        mainElements.forEach(el => {
            el.style.transition = 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.transform = 'translateY(0)';
        });

        gameCanvas.style.transition = 'opacity 1.2s ease';
        gameCanvas.style.opacity = '0';

        mascotRiseFromGame();

        setTimeout(() => {
            gameActive = false;
            cancelAnimationFrame(gameAnimationId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);

            gameCanvas.style.display = 'none';
            gameCanvas.style.opacity = '1';
            gameCanvas.style.transition = '';
            gameUI.style.display = 'none';

            // Fully reset all element styles
            mainElements.forEach(el => {
                el.style.transition = '';
                el.style.transform = '';
            });

            // Reset slot machine completely
            const slotMachine = document.getElementById('slotMachine');
            slotMachine.style.position = '';
            slotMachine.classList.remove('winning');

            keys.left = false;
            keys.right = false;
            keys.jump = false;

            // Reset slot machine reels
            document.getElementById('reel1').textContent = '\u2660\uFE0F';
            document.getElementById('reel2').textContent = '\u2660\uFE0F';
            document.getElementById('reel3').textContent = '\u2660\uFE0F';
            const slotResultEl = document.getElementById('slotResult');
            slotResultEl.textContent = '';
            slotResultEl.classList.remove('jackpot');

            for (let i = 0; i < 30; i++) {
                setTimeout(() => createSlotConfetti(), i * 30);
            }
        }, 1200);
    }, 800);
}

// Handle window resize
window.addEventListener('resize', () => {
    if (gameActive) {
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
    }
});
