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
    particles: [],
    bgStars: [],
    exitPortal: { x: 0, y: 0, radius: 60 },
    camera: { y: 0 },
    gameHeight: 0,
    won: false,
    fallTransition: 0,
    shakeIntensity: 0,
    lastCheckpoint: null
};

// Physics constants
const GRAVITY = 0.45;
const JUMP_FORCE = -10.5;
const MOVE_SPEED = 4.2;
const FRICTION = 0.82;
const MAX_FALL_SPEED = 12;

// Input state
const keys = {
    left: false,
    right: false,
    jump: false
};

function initGame() {
    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;

    game.gameHeight = window.innerHeight * 5;

    // Jump physics - be generous with distances
    const MAX_SAFE_VERTICAL = 50;
    const MAX_SAFE_HORIZONTAL = 80;
    const MAX_DIAGONAL = Math.sqrt(MAX_SAFE_VERTICAL * MAX_SAFE_VERTICAL + MAX_SAFE_HORIZONTAL * MAX_SAFE_HORIZONTAL);

    game.platforms = [];
    game.movingPlatforms = [];
    game.hazards = [];
    game.crushers = [];

    const screenWidth = gameCanvas.width;
    const numColumns = 8; // More columns
    const columnWidth = screenWidth / numColumns;
    const numRows = 35; // More rows
    const rowHeight = (game.gameHeight - 400) / numRows;

    // Platform sizes - bigger
    const PLATFORM_WIDTH_MIN = 90;
    const PLATFORM_WIDTH_MAX = 140;
    const PLATFORM_HEIGHT = 18;
    const CHECKPOINT_WIDTH = 180;

    // Starting platform
    game.platforms.push({
        x: screenWidth / 2 - 100,
        y: game.gameHeight - 60,
        width: 200,
        height: 24,
        color1: '#10b981',
        color2: '#059669',
        glowColor: 'rgba(16, 185, 129, 0.5)',
        isStart: true,
        row: -1,
        col: Math.floor(numColumns / 2)
    });

    // Track all platforms by position for obstacle checking
    const allPlatformPositions = [];

    // Generate dense grid of platforms
    const platformGrid = [];

    for (let row = 0; row < numRows; row++) {
        platformGrid[row] = [];
        const baseY = game.gameHeight - 180 - (row * rowHeight);
        const isCheckpointRow = row % 7 === 0 && row > 0; // Checkpoints every 7 rows

        // Zone based on row
        let zone = 'intro';
        if (row >= 8 && row < 16) zone = 'water';
        else if (row >= 16 && row < 26) zone = 'lava';
        else if (row >= 26) zone = 'final';

        // Place 4-7 platforms per row for dense coverage
        const platformsThisRow = isCheckpointRow ? 5 : 4 + Math.floor(Math.random() * 4);

        // Distribute across columns more evenly
        const columnOrder = [...Array(numColumns).keys()].sort(() => Math.random() - 0.5);

        for (let p = 0; p < Math.min(platformsThisRow, numColumns); p++) {
            const col = columnOrder[p];

            const baseX = col * columnWidth + 10;
            const maxX = (col + 1) * columnWidth - 10;

            const width = isCheckpointRow ? CHECKPOINT_WIDTH : PLATFORM_WIDTH_MIN + Math.random() * (PLATFORM_WIDTH_MAX - PLATFORM_WIDTH_MIN);
            const x = baseX + Math.random() * Math.max(5, maxX - baseX - width);
            const y = baseY + (Math.random() - 0.5) * 25;

            // Zone colors
            let color1, color2, glowColor;
            if (zone === 'water') {
                color1 = `hsl(${190 + Math.random() * 25}, 70%, 55%)`;
                color2 = `hsl(${200 + Math.random() * 25}, 60%, 45%)`;
                glowColor = 'rgba(56, 189, 248, 0.4)';
            } else if (zone === 'lava') {
                color1 = `hsl(${5 + Math.random() * 25}, 85%, 55%)`;
                color2 = `hsl(${0 + Math.random() * 20}, 75%, 45%)`;
                glowColor = 'rgba(249, 115, 22, 0.4)';
            } else if (zone === 'final') {
                color1 = `hsl(${275 + Math.random() * 35}, 80%, 60%)`;
                color2 = `hsl(${285 + Math.random() * 35}, 70%, 50%)`;
                glowColor = 'rgba(168, 85, 247, 0.4)';
            } else {
                color1 = `hsl(${245 + Math.random() * 35}, 75%, 60%)`;
                color2 = `hsl(${255 + Math.random() * 35}, 65%, 50%)`;
                glowColor = 'rgba(139, 92, 246, 0.4)';
            }

            const isCheckpoint = isCheckpointRow && p === Math.floor(platformsThisRow / 2);
            const platform = {
                x: x,
                y: y,
                width: width,
                height: isCheckpoint ? 22 : PLATFORM_HEIGHT,
                color1: isCheckpoint ? '#10b981' : color1,
                color2: isCheckpoint ? '#059669' : color2,
                glowColor: isCheckpoint ? 'rgba(16, 185, 129, 0.6)' : glowColor,
                zone: zone,
                row: row,
                col: col,
                isCheckpoint: isCheckpoint,
                checkpointId: row
            };

            game.platforms.push(platform);
            platformGrid[row].push(platform);
            allPlatformPositions.push({ x: x, y: y, width: width, height: PLATFORM_HEIGHT });
        }
    }

    // Ensure connectivity - add bridge platforms where needed
    for (let row = 1; row < numRows; row++) {
        const currentRowPlats = platformGrid[row];
        const prevRowPlats = platformGrid[row - 1];
        if (!prevRowPlats || prevRowPlats.length === 0) continue;

        for (const plat of currentRowPlats) {
            let isReachable = false;
            let bestPrevPlat = null;
            let bestDist = Infinity;

            for (const prevPlat of prevRowPlats) {
                const dx = Math.abs((plat.x + plat.width/2) - (prevPlat.x + prevPlat.width/2));
                const dy = plat.y - prevPlat.y; // Should be negative (going up)
                const diagonalDist = Math.sqrt(dx * dx + dy * dy);

                if (diagonalDist < bestDist) {
                    bestDist = diagonalDist;
                    bestPrevPlat = prevPlat;
                }

                // Check if reachable considering obstacles
                if (diagonalDist < MAX_DIAGONAL * 1.5) {
                    isReachable = true;
                }
            }

            // Add stepping stone platforms if gap is too large
            if (!isReachable && bestPrevPlat) {
                const steps = Math.ceil(bestDist / (MAX_DIAGONAL * 0.8));
                for (let s = 1; s < steps; s++) {
                    const t = s / steps;
                    const midX = bestPrevPlat.x + (plat.x - bestPrevPlat.x) * t + (Math.random() - 0.5) * 30;
                    const midY = bestPrevPlat.y + (plat.y - bestPrevPlat.y) * t;

                    game.movingPlatforms.push({
                        x: midX,
                        y: midY,
                        width: 75 + Math.random() * 25,
                        height: 16,
                        startX: midX,
                        startY: midY,
                        moveRange: 20 + Math.random() * 25,
                        speed: 0.4 + Math.random() * 0.4,
                        direction: 1,
                        moveType: Math.random() > 0.5 ? 'horizontal' : 'vertical',
                        color1: '#06b6d4',
                        color2: '#0891b2',
                        glowColor: 'rgba(6, 182, 212, 0.5)',
                        isBridge: true
                    });
                }
            }
        }
    }

    // Add TONS of moving platforms for visual interest and alternative paths
    for (let row = 0; row < numRows; row++) {
        const baseY = game.gameHeight - 180 - (row * rowHeight);

        // 4-6 moving platforms per row
        const movingCount = 4 + Math.floor(Math.random() * 3);
        for (let m = 0; m < movingCount; m++) {
            const x = Math.random() * (screenWidth - 80);
            const y = baseY + (Math.random() - 0.5) * rowHeight * 0.6;

            const moveType = Math.random();
            let type, color1, color2, glowColor;

            if (moveType < 0.35) {
                type = 'horizontal';
                color1 = '#f59e0b';
                color2 = '#d97706';
                glowColor = 'rgba(245, 158, 11, 0.4)';
            } else if (moveType < 0.65) {
                type = 'vertical';
                color1 = '#06b6d4';
                color2 = '#0891b2';
                glowColor = 'rgba(6, 182, 212, 0.4)';
            } else {
                type = 'circular';
                color1 = '#a855f7';
                color2 = '#7c3aed';
                glowColor = 'rgba(168, 85, 247, 0.4)';
            }

            game.movingPlatforms.push({
                x: x,
                y: y,
                width: 70 + Math.random() * 40,
                height: 16,
                startX: x,
                startY: y,
                moveRange: 25 + Math.random() * 45,
                speed: 0.3 + Math.random() * 0.6,
                direction: Math.random() > 0.5 ? 1 : -1,
                moveType: type,
                phase: Math.random() * Math.PI * 2,
                color1: color1,
                color2: color2,
                glowColor: glowColor
            });
        }
    }

    // Helper function to check if position is clear of obstacles
    function isPositionClearOfHazards(x, y, width, height, hazardList) {
        for (const h of hazardList) {
            const hx = h.baseX !== undefined ? h.baseX : h.x;
            const hy = h.baseY !== undefined ? h.baseY : h.y;
            const buffer = 40;
            if (x < hx + h.width + buffer && x + width > hx - buffer &&
                y < hy + h.height + buffer && y + height > hy - buffer) {
                return false;
            }
        }
        return true;
    }

    // Add hazards - but check they don't block paths

    // Spikes on platforms (sparse)
    for (let i = 8; i < game.platforms.length; i += 10) {
        const plat = game.platforms[i];
        if (plat.isCheckpoint || plat.isStart) continue;
        if (plat.width < 110) continue; // Only on wider platforms

        const spikeX = plat.x + 20 + Math.random() * (plat.width - 60);
        game.hazards.push({
            x: spikeX,
            y: plat.y - 16,
            width: 20,
            height: 16,
            type: 'spike'
        });
    }

    // Water pools (water zone)
    for (let row = 8; row < 16; row += 2) {
        const x = 50 + Math.random() * (screenWidth - 200);
        const y = game.gameHeight - 180 - (row * rowHeight) + rowHeight * 0.5;
        const pool = {
            x: x,
            y: y,
            width: 120 + Math.random() * 100,
            height: 25,
            type: 'water',
            wavePhase: Math.random() * Math.PI * 2
        };
        // Make sure there's a path around it
        game.hazards.push(pool);
    }

    // Lava pools (lava zone)
    for (let row = 16; row < 26; row += 2) {
        const x = 50 + Math.random() * (screenWidth - 180);
        const y = game.gameHeight - 180 - (row * rowHeight) + rowHeight * 0.5;
        game.hazards.push({
            x: x,
            y: y,
            width: 100 + Math.random() * 80,
            height: 22,
            type: 'lava',
            bubbleTimer: 0
        });
    }

    // Fire hazards (floating, moving)
    for (let i = 0; i < 15; i++) {
        const row = 3 + Math.floor(Math.random() * (numRows - 6));
        const x = 50 + Math.random() * (screenWidth - 100);
        const y = game.gameHeight - 180 - (row * rowHeight) - 20 - Math.random() * 50;

        game.hazards.push({
            x: x,
            y: y,
            width: 24,
            height: 24,
            baseX: x,
            baseY: y,
            moveRange: 30 + Math.random() * 40,
            speed: 0.008 + Math.random() * 0.012,
            phase: Math.random() * Math.PI * 2,
            moveType: Math.random() > 0.5 ? 'vertical' : 'horizontal',
            type: 'fire'
        });
    }

    // Crushers (later zones only)
    for (let row = 20; row < numRows - 3; row += 4) {
        const x = 80 + Math.random() * (screenWidth - 160);
        const baseY = game.gameHeight - 180 - (row * rowHeight);

        game.crushers.push({
            x: x,
            y: baseY - 180,
            width: 45,
            height: 55,
            baseY: baseY - 180,
            targetY: baseY - 45,
            state: 'waiting',
            waitTimer: 100 + Math.floor(Math.random() * 120),
            speed: 0
        });
    }

    // Exit portal
    const topY = game.gameHeight - 180 - ((numRows - 1) * rowHeight);
    game.exitPortal = {
        x: screenWidth / 2,
        y: topY - 140,
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

    // Generate background stars
    game.bgStars = [];
    for (let i = 0; i < 150; i++) {
        game.bgStars.push({
            x: Math.random() * gameCanvas.width,
            y: Math.random() * game.gameHeight,
            radius: Math.random() * 2 + 0.5,
            twinkleSpeed: Math.random() * 0.03 + 0.01,
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
        // Smooth eased gravity for intro
        const introGravity = GRAVITY * 0.6;
        p.vy += introGravity;
        p.vy = Math.min(p.vy, 10); // Slower max fall for smoother landing

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

    // Normal gameplay
    if (keys.left) {
        p.vx -= 0.35;
        p.facingRight = false;
    }
    if (keys.right) {
        p.vx += 0.35;
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

    // Can only jump if: on ground, cooldown is 0, and been on ground for at least 15 frames (~0.25s)
    if (keys.jump && p.onGround && p.jumpCooldown === 0 && p.lastGroundTime > 15) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
        p.jumpCooldown = 25; // ~0.4 second cooldown after jumping
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

                if (plat.isCheckpoint && (!game.lastCheckpoint || plat.checkpointId > game.lastCheckpoint.checkpointId)) {
                    game.lastCheckpoint = plat;
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
        const respawnPlatform = game.lastCheckpoint ||
            game.platforms.find(pl => pl.isStart) ||
            game.platforms[game.platforms.length - 1];

        p.x = respawnPlatform.x + respawnPlatform.width / 2 - p.width / 2;
        p.y = respawnPlatform.y - p.height;
        p.vx = 0;
        p.vy = 0;
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

        if (game.lastCheckpoint) {
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

    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    ctx.save();
    // Smoother shake using sin waves instead of pure random
    const shakeTime = Date.now() * 0.02;
    const shakeX = Math.sin(shakeTime * 1.5) * game.shakeIntensity * 0.5 + (Math.random() - 0.5) * game.shakeIntensity * 0.5;
    const shakeY = Math.cos(shakeTime * 1.3) * game.shakeIntensity * 0.5 + (Math.random() - 0.5) * game.shakeIntensity * 0.5;
    ctx.translate(shakeX, -game.camera.y + shakeY);

    // Draw background stars
    const time = Date.now() * 0.001;
    game.bgStars.forEach(star => {
        const parallaxY = star.y + game.camera.y * (1 - star.depth);
        const screenY = parallaxY - game.camera.y;

        if (screenY > -50 && screenY < gameCanvas.height + 50) {
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
            ctx.beginPath();
            ctx.arc(star.x, parallaxY, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * twinkle * star.depth})`;
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

    // Swirling energy particles
    ctx.save();
    for (let i = 0; i < 20; i++) {
        const particleAngle = rotationPhase + (i / 20) * Math.PI * 2;
        const particleDist = portal.radius + 20 + Math.sin(time * 3 + i) * 15;
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

    // Light rays
    ctx.save();
    for (let i = 0; i < 12; i++) {
        const rayAngle = rotationPhase * 0.5 + (i / 12) * Math.PI * 2;
        const rayLength = 120 + Math.sin(time * 2.5 + i * 0.8) * 60;
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
