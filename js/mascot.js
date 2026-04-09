// ========================================
// MASCOT CHARACTER SYSTEM
// ========================================
const mascotCanvas = document.getElementById('mascot');
const mascotCtx = mascotCanvas.getContext('2d');

const mascot = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    width: 24,
    height: 40,
    onGround: false,
    facingRight: true,
    animFrame: 0,
    animTimer: 0,
    state: 'looping', // 'looping', 'falling', 'playing', 'rising'
    currentPlatformIndex: 0,
    waitTimer: 0,
    particles: [],
    // Running state
    isRunning: false,
    runDirection: 1,
    runTarget: 0,
    runSpeed: 1.5,
    runPauseTarget: null,
    jumpWaitTarget: null
};

// Platforms for mascot to jump around on the main site
const mascotPlatforms = [];

function initMascotPlatforms() {
    mascotCanvas.width = window.innerWidth;
    mascotCanvas.height = window.innerHeight;

    const w = mascotCanvas.width;
    const h = mascotCanvas.height;

    mascotPlatforms.length = 0;
    mascotPlatforms.push(
        // Outer ring
        { x: w * 0.1, y: h * 0.75, width: 80 },
        { x: w * 0.05, y: h * 0.55, width: 70 },
        { x: w * 0.12, y: h * 0.35, width: 75 },
        { x: w * 0.25, y: h * 0.2, width: 80 },
        { x: w * 0.45, y: h * 0.12, width: 90 },
        { x: w * 0.65, y: h * 0.18, width: 80 },
        { x: w * 0.8, y: h * 0.32, width: 75 },
        { x: w * 0.88, y: h * 0.5, width: 70 },
        { x: w * 0.82, y: h * 0.7, width: 80 },
        { x: w * 0.6, y: h * 0.82, width: 85 },
        { x: w * 0.35, y: h * 0.78, width: 80 },
        // Inner platforms
        { x: w * 0.25, y: h * 0.5, width: 70 },
        { x: w * 0.4, y: h * 0.38, width: 75 },
        { x: w * 0.55, y: h * 0.45, width: 70 },
        { x: w * 0.7, y: h * 0.55, width: 75 },
        { x: w * 0.5, y: h * 0.65, width: 80 }
    );

    // Start mascot on first platform
    const startPlat = mascotPlatforms[0];
    mascot.x = startPlat.x + startPlat.width / 2 - mascot.width / 2;
    mascot.y = startPlat.y - mascot.height;
    mascot.currentPlatformIndex = 0;
    mascot.previousPlatformIndex = -1;
    mascot.onGround = true;
    mascot.waitTimer = 0;
    mascot.state = 'looping';
    mascot.isRunning = false;
}

const MASCOT_GRAVITY = 0.4;
const MASCOT_RUN_SPEED_MIN = 0.8;
const MASCOT_RUN_SPEED_MAX = 2.0;

function updateMascot() {
    if (mascot.state === 'playing') return;

    const m = mascot;

    if (m.state === 'looping') {
        const currentPlat = mascotPlatforms[m.currentPlatformIndex];

        if (m.onGround) {
            // Running on platform
            if (m.isRunning) {
                m.animTimer += 0.10; // Slower, smoother running animation
                m.x += m.runSpeed * m.runDirection;
                m.facingRight = m.runDirection > 0;

                // Check if reached target or platform edge
                const atLeftEdge = m.x <= currentPlat.x + 5;
                const atRightEdge = m.x + m.width >= currentPlat.x + currentPlat.width - 5;
                const reachedTarget = (m.runDirection > 0 && m.x >= m.runTarget) ||
                                     (m.runDirection < 0 && m.x <= m.runTarget);

                if (atLeftEdge || atRightEdge || reachedTarget) {
                    // Stop running, start wait timer for jump
                    m.isRunning = false;
                    m.vx = 0;
                    m.waitTimer = 80; // Short pause before jumping
                    // Clamp position to platform
                    m.x = Math.max(currentPlat.x + 5, Math.min(m.x, currentPlat.x + currentPlat.width - m.width - 5));
                }
            } else {
                m.waitTimer += 1;
                m.animTimer += 0.05; // Slow idle animation

                // After landing, start running after a random short pause
                if (!m.runPauseTarget) {
                    m.runPauseTarget = 20 + Math.floor(Math.random() * 40); // Random 20-60 frames before running
                }
                if (m.waitTimer === m.runPauseTarget) {
                    m.runPauseTarget = null; // Reset for next time

                    // Decide to run left or right on the platform
                    const platCenter = currentPlat.x + currentPlat.width / 2;
                    const mascotCenter = m.x + m.width / 2;

                    // Run toward a random spot on the platform (not always the edge)
                    const leftBound = currentPlat.x + 10;
                    const rightBound = currentPlat.x + currentPlat.width - m.width - 10;

                    if (Math.random() > 0.5) {
                        m.runDirection = 1;
                        // Random target between current position and right edge
                        m.runTarget = m.x + 15 + Math.random() * (rightBound - m.x - 15);
                    } else {
                        m.runDirection = -1;
                        // Random target between left edge and current position
                        m.runTarget = leftBound + Math.random() * (m.x - leftBound - 15);
                    }

                    // Random run speed each time
                    m.runSpeed = MASCOT_RUN_SPEED_MIN + Math.random() * (MASCOT_RUN_SPEED_MAX - MASCOT_RUN_SPEED_MIN);

                    // Only run if there's enough space
                    const distToTarget = Math.abs(m.runTarget - m.x);
                    if (distToTarget > 15) {
                        m.isRunning = true;
                    }
                }

                // Time to jump to next platform (random timing)
                if (!m.jumpWaitTarget) {
                    m.jumpWaitTarget = 100 + Math.floor(Math.random() * 150); // Random 100-250 frames before jumping
                }
                if (m.waitTimer > m.jumpWaitTarget) {
                    m.waitTimer = 0;
                    m.jumpWaitTarget = null; // Reset for next landing
                    m.runPauseTarget = null;
                    m.isRunning = false;

                    // Find reachable platforms
                    const currentCenter = { x: currentPlat.x + currentPlat.width / 2, y: currentPlat.y };
                    const maxJumpDist = 600;
                    const minJumpDist = 80;

                    const reachablePlatforms = mascotPlatforms
                        .map((plat, idx) => {
                            const platCenter = { x: plat.x + plat.width / 2, y: plat.y };
                            const dist = Math.sqrt(
                                Math.pow(platCenter.x - currentCenter.x, 2) +
                                Math.pow(platCenter.y - currentCenter.y, 2)
                            );
                            const isPrevious = idx === m.previousPlatformIndex;
                            return { plat, idx, dist, weight: isPrevious ? 0.15 : 1 };
                        })
                        .filter(p => p.idx !== m.currentPlatformIndex && p.dist >= minJumpDist && p.dist <= maxJumpDist);

                    let chosenIdx;
                    if (reachablePlatforms.length === 0) {
                        const otherPlatforms = mascotPlatforms
                            .map((p, idx) => ({ idx, weight: idx === m.previousPlatformIndex ? 0.15 : 1 }))
                            .filter(p => p.idx !== m.currentPlatformIndex);
                        const totalWeight = otherPlatforms.reduce((sum, p) => sum + p.weight, 0);
                        let rand = Math.random() * totalWeight;
                        for (const p of otherPlatforms) {
                            rand -= p.weight;
                            if (rand <= 0) { chosenIdx = p.idx; break; }
                        }
                        if (chosenIdx === undefined) chosenIdx = otherPlatforms[0].idx;
                    } else {
                        const totalWeight = reachablePlatforms.reduce((sum, p) => sum + p.weight, 0);
                        let rand = Math.random() * totalWeight;
                        for (const p of reachablePlatforms) {
                            rand -= p.weight;
                            if (rand <= 0) { chosenIdx = p.idx; break; }
                        }
                        if (chosenIdx === undefined) chosenIdx = reachablePlatforms[0].idx;
                    }

                    m.previousPlatformIndex = m.currentPlatformIndex;
                    m.currentPlatformIndex = chosenIdx;

                    const nextPlat = mascotPlatforms[m.currentPlatformIndex];

                    // Calculate projectile motion
                    const startX = m.x + m.width / 2;
                    const startY = m.y + m.height;
                    const endX = nextPlat.x + nextPlat.width / 2;
                    const endY = nextPlat.y;

                    const dx = endX - startX;
                    const dy = endY - startY;

                    const apexHeight = Math.min(startY, endY) - 120;
                    const rise = startY - apexHeight;

                    const vy0 = -Math.sqrt(2 * MASCOT_GRAVITY * rise);
                    const discriminant = vy0 * vy0 + 2 * MASCOT_GRAVITY * dy;
                    const totalTime = (-vy0 + Math.sqrt(Math.max(0, discriminant))) / MASCOT_GRAVITY;
                    const vx0 = dx / Math.max(totalTime, 1);

                    m.vy = vy0;
                    m.vx = vx0;
                    m.onGround = false;
                    m.facingRight = dx > 0;

                    // Jump particles
                    for (let i = 0; i < 5; i++) {
                        m.particles.push({
                            x: m.x + m.width / 2,
                            y: m.y + m.height,
                            vx: (Math.random() - 0.5) * 4,
                            vy: Math.random() * 2,
                            life: 1,
                            color: '#8b5cf6'
                        });
                    }
                }
            }
        } else {
            // In air - gentle animation
            m.animTimer += 0.08;
        }

        // Apply gravity when in air
        if (!m.onGround) {
            m.vy += MASCOT_GRAVITY;
            m.vy = Math.min(m.vy, 12);
            m.x += m.vx;
            m.y += m.vy;
        }

        // Platform collision
        if (!m.onGround) {
            const targetPlat = mascotPlatforms[m.currentPlatformIndex];
            if (m.x + m.width > targetPlat.x && m.x < targetPlat.x + targetPlat.width) {
                if (m.vy > 0 && m.y + m.height >= targetPlat.y && m.y + m.height < targetPlat.y + 25) {
                    m.y = targetPlat.y - m.height;
                    m.vy = 0;
                    m.vx = 0;
                    m.onGround = true;
                    m.isRunning = false;
                    m.waitTimer = 0;

                    // Landing particles
                    for (let i = 0; i < 3; i++) {
                        m.particles.push({
                            x: m.x + m.width / 2,
                            y: m.y + m.height,
                            vx: (Math.random() - 0.5) * 3,
                            vy: -Math.random() * 2,
                            life: 0.8,
                            color: '#8b5cf6'
                        });
                    }
                }
            }
        }

        // Safety: if fell off screen, reset
        if (m.y > mascotCanvas.height + 100) {
            const startPlat = mascotPlatforms[0];
            m.x = startPlat.x + startPlat.width / 2 - m.width / 2;
            m.y = startPlat.y - m.height;
            m.vx = 0;
            m.vy = 0;
            m.currentPlatformIndex = 0;
            m.onGround = true;
            m.isRunning = false;
        }
    } else if (m.state === 'centering') {
        // Mascot is jumping to center platform before iris close
        m.vy += MASCOT_GRAVITY;
        m.vy = Math.min(m.vy, 10);
        m.x += m.vx;
        m.y += m.vy;
        m.animTimer += 0.08;

        // Trail particles while jumping
        if (Math.random() > 0.6) {
            m.particles.push({
                x: m.x + m.width / 2,
                y: m.y + m.height,
                vx: (Math.random() - 0.5) * 3,
                vy: 1,
                life: 0.8,
                color: '#fbbf24'
            });
        }

        // Check if landed on target center platform
        const targetPlat = m.targetCenterPlatform;
        if (targetPlat && m.vy > 0) {
            if (m.x + m.width > targetPlat.x && m.x < targetPlat.x + targetPlat.width) {
                if (m.y + m.height >= targetPlat.y && m.y + m.height < targetPlat.y + 30) {
                    // Landed on center platform!
                    m.y = targetPlat.y - m.height;
                    m.vy = 0;
                    m.vx = 0;
                    m.onGround = true;
                    m.state = 'centered';

                    // Landing particles
                    for (let i = 0; i < 10; i++) {
                        m.particles.push({
                            x: m.x + m.width / 2,
                            y: m.y + m.height,
                            vx: (Math.random() - 0.5) * 6,
                            vy: -Math.random() * 4,
                            life: 1,
                            color: '#fbbf24'
                        });
                    }

                    // Trigger the callback after a brief moment
                    setTimeout(() => {
                        if (m.onCenteredCallback) {
                            m.onCenteredCallback();
                            m.onCenteredCallback = null;
                        }
                    }, 200);
                }
            }
        }

        // Safety: if missed the platform, just land wherever and continue
        if (m.y > mascotCanvas.height - 50) {
            m.state = 'centered';
            m.onGround = true;
            m.vy = 0;
            m.vx = 0;
            if (m.onCenteredCallback) {
                m.onCenteredCallback();
                m.onCenteredCallback = null;
            }
        }
    } else if (m.state === 'centered') {
        // Mascot is standing still at center, waiting for trapdoor
        m.animTimer += 0.02; // Slow idle animation
        m.vx = 0;
        m.vy = 0;
        m.onGround = true;
        // Don't keep repositioning - just stay still where we landed
    } else if (m.state === 'falling') {
        // Smooth eased gravity for falling
        m.vy += 0.4;
        m.vy = Math.min(m.vy, 12); // Cap fall speed

        // Smooth position update
        m.y += m.vy;
        m.x += m.vx * 0.95; // Dampen horizontal movement

        // Gentle swaying while falling
        if (!m.fallSwayPhase) m.fallSwayPhase = 0;
        m.fallSwayPhase += 0.1;
        m.x += Math.sin(m.fallSwayPhase) * 0.3;

        m.animTimer += 0.06;

        // Trail particles
        if (Math.random() > 0.4) {
            m.particles.push({
                x: m.x + m.width / 2 + (Math.random() - 0.5) * 8,
                y: m.y,
                vx: (Math.random() - 0.5) * 1.5,
                vy: -1.5 - Math.random(),
                life: 1,
                color: Math.random() > 0.5 ? '#fbbf24' : '#8b5cf6'
            });
        }

        if (m.y > mascotCanvas.height + 50) {
            m.state = 'playing';
            m.fallSwayPhase = 0;
            actuallyStartPlatformer();
        }
    } else if (m.state === 'rising') {
        m.vy -= 0.3;
        m.vy = Math.max(m.vy, -15);
        m.y += m.vy;
        m.animTimer += 0.06;

        const targetPlat = mascotPlatforms[0];
        const targetX = targetPlat.x + targetPlat.width / 2 - m.width / 2;
        m.x += (targetX - m.x) * 0.02;

        if (Math.random() > 0.3) {
            m.particles.push({
                x: m.x + m.width / 2,
                y: m.y + m.height,
                vx: (Math.random() - 0.5) * 3,
                vy: 3,
                life: 1,
                color: Math.random() > 0.5 ? '#fbbf24' : '#8b5cf6'
            });
        }

        if (m.y < targetPlat.y - m.height + 10) {
            m.y = targetPlat.y - m.height;
            m.vy = 0;
            m.vx = 0;
            m.onGround = true;
            m.currentPlatformIndex = 0;
            m.waitTimer = 0;
            m.state = 'looping';
            m.isRunning = false;

            for (let i = 0; i < 10; i++) {
                m.particles.push({
                    x: m.x + m.width / 2,
                    y: m.y + m.height,
                    vx: (Math.random() - 0.5) * 8,
                    vy: -Math.random() * 5,
                    life: 1,
                    color: '#10b981'
                });
            }
        }
    }

    // Update particles
    m.particles = m.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.life -= 0.03;
        return p.life > 0;
    });
}

function drawMascot() {
    if (mascot.state === 'playing') return;

    const ctx = mascotCtx;
    ctx.clearRect(0, 0, mascotCanvas.width, mascotCanvas.height);

    const m = mascot;

    // Draw particles
    m.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    // Draw the mascot - simple stick figure style
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const centerX = m.x + m.width / 2;
    const headY = m.y + 10;
    const bodyTop = m.y + 16;
    const bodyBottom = m.y + 28;

    // Head
    ctx.beginPath();
    ctx.arc(centerX, headY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(centerX, bodyTop);
    ctx.lineTo(centerX, bodyBottom);
    ctx.stroke();

    // Animation - legs and arms swing with movement
    const isMoving = m.isRunning || !m.onGround;
    const walkOffset = isMoving ? Math.sin(m.animTimer * Math.PI * 2) * 6 : 0;
    const jumpArmOffset = !m.onGround ? -8 : 0;

    // Arms - swing opposite to legs
    ctx.beginPath();
    ctx.moveTo(centerX, bodyTop + 4);
    ctx.lineTo(centerX - 9, bodyTop + 12 - walkOffset + jumpArmOffset);
    ctx.moveTo(centerX, bodyTop + 4);
    ctx.lineTo(centerX + 9, bodyTop + 12 + walkOffset + jumpArmOffset);
    ctx.stroke();

    // Legs - swing with movement
    ctx.beginPath();
    ctx.moveTo(centerX, bodyBottom);
    ctx.lineTo(centerX - 8, m.y + m.height + walkOffset);
    ctx.moveTo(centerX, bodyBottom);
    ctx.lineTo(centerX + 8, m.y + m.height - walkOffset);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Draw faint platform indicators
    ctx.globalAlpha = 0.08;
    mascotPlatforms.forEach(plat => {
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(plat.x, plat.y, plat.width, 4);
    });
    ctx.globalAlpha = 1;
}

function mascotLoop() {
    updateMascot();
    drawMascot();
    requestAnimationFrame(mascotLoop);
}

// Function to trigger mascot falling (called on jackpot)
function mascotFallIntoGame() {
    mascot.state = 'falling';
    mascot.vy = 3; // Start with gentler fall
    mascot.vx = 0; // Fall straight down for cleaner animation
    mascot.onGround = false;
    mascot.isRunning = false;
    if (mascot.y > mascotCanvas.height) {
        mascot.y = mascotCanvas.height / 2;
    }
}

// Function to trigger mascot rising (called when platformer won)
function mascotRiseFromGame() {
    mascot.state = 'rising';
    mascot.x = window.innerWidth / 2 - mascot.width / 2;
    mascot.y = window.innerHeight + 50;
    mascot.vy = -5;
}

// Initialize mascot
initMascotPlatforms();
mascotLoop();

window.addEventListener('resize', () => {
    initMascotPlatforms();
});
