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
    state: 'looping', // 'looping', 'falling', 'playing', 'rising', 'landing', 'getting_up'
    currentPlatformIndex: 0,
    waitTimer: 0,
    particles: [],
    // Animation state for realistic movement
    legPhase: 0,
    jumpSquat: 0, // Squat amount when preparing to jump or landing
    bodyStretch: 1, // Body stretch/compression
    landingTimer: 0,
    getUpTimer: 0
};

// Platforms for mascot to jump around on the main site
const mascotPlatforms = [];

function initMascotPlatforms() {
    mascotCanvas.width = window.innerWidth;
    mascotCanvas.height = window.innerHeight;

    // Create platforms around the edges and inside for variety
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
        // Inner platforms for variety
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
}

const MASCOT_GRAVITY = 0.4;

function updateMascot() {
    if (mascot.state === 'playing') return;

    const m = mascot;

    if (m.state === 'looping') {
        const currentPlat = mascotPlatforms[m.currentPlatformIndex];

        if (m.onGround) {
            m.waitTimer += 1;

            // Animate leg idle movement when standing
            m.legPhase += 0.02;

            // Pre-jump squat animation
            if (m.waitTimer > 100 && m.waitTimer < 120) {
                m.jumpSquat = Math.sin((m.waitTimer - 100) / 20 * Math.PI) * 8;
                m.bodyStretch = 1 - m.jumpSquat / 40;
            }

            if (m.waitTimer > 120) {
                m.waitTimer = 0;
                m.jumpSquat = 0;
                m.bodyStretch = 1;

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
                m.bodyStretch = 1.2; // Stretch when jumping

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
        } else {
            // In air - animate legs cycling
            m.legPhase += 0.15;

            // Body compression/stretch based on velocity
            if (m.vy < 0) {
                m.bodyStretch = 1 + Math.min(Math.abs(m.vy) / 30, 0.15); // Stretch going up
            } else {
                m.bodyStretch = 1 - Math.min(m.vy / 30, 0.1); // Compress going down
            }
        }

        // Apply gravity
        m.vy += MASCOT_GRAVITY;
        m.vy = Math.min(m.vy, 12);

        m.x += m.vx;
        m.y += m.vy;

        // Platform collision
        m.onGround = false;
        const targetPlat = mascotPlatforms[m.currentPlatformIndex];
        if (m.x + m.width > targetPlat.x && m.x < targetPlat.x + targetPlat.width) {
            if (m.vy > 0 && m.y + m.height >= targetPlat.y && m.y + m.height < targetPlat.y + 25) {
                m.y = targetPlat.y - m.height;
                m.x = targetPlat.x + targetPlat.width / 2 - m.width / 2;
                m.vy = 0;
                m.vx = 0;
                m.onGround = true;
                m.jumpSquat = 6; // Landing squat
                m.bodyStretch = 0.85; // Compress on landing

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

        // Recover from landing squat
        if (m.onGround && m.jumpSquat > 0) {
            m.jumpSquat *= 0.85;
            m.bodyStretch += (1 - m.bodyStretch) * 0.15;
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
        }
    } else if (m.state === 'falling') {
        // Falling into the platformer
        m.vy += 0.5;
        m.y += m.vy;
        m.x += m.vx;
        m.legPhase += 0.2; // Flailing legs
        m.bodyStretch = 1.1;

        // Trail particles
        if (Math.random() > 0.5) {
            m.particles.push({
                x: m.x + m.width / 2,
                y: m.y,
                vx: (Math.random() - 0.5) * 2,
                vy: -2,
                life: 1,
                color: '#fbbf24'
            });
        }

        // When fallen far enough, start the actual game
        if (m.y > mascotCanvas.height + 50) {
            m.state = 'playing';
            actuallyStartPlatformer();
        }
    } else if (m.state === 'rising') {
        // Flying back up to the main site
        m.vy -= 0.3;
        m.vy = Math.max(m.vy, -15);
        m.y += m.vy;
        m.legPhase += 0.1;

        const targetPlat = mascotPlatforms[0];
        const targetX = targetPlat.x + targetPlat.width / 2 - m.width / 2;
        m.x += (targetX - m.x) * 0.02;

        // Trail particles
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

        // When reached the platform level, land
        if (m.y < targetPlat.y - m.height + 10) {
            m.y = targetPlat.y - m.height;
            m.vy = 0;
            m.vx = 0;
            m.onGround = true;
            m.currentPlatformIndex = 0;
            m.waitTimer = 0;
            m.state = 'looping';
            m.jumpSquat = 8;
            m.bodyStretch = 0.8;

            // Landing particles
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

    // Animation
    m.animTimer += 0.1;
    if (m.animTimer >= 1) {
        m.animTimer = 0;
        m.animFrame = (m.animFrame + 1) % 4;
    }
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

    // Draw the mascot with realistic animation
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const centerX = m.x + m.width / 2;
    const baseY = m.y + m.height;

    // Apply body compression/stretch
    const bodyHeight = 28 * m.bodyStretch;
    const squat = m.jumpSquat;

    // Adjusted positions with squat
    const headY = baseY - bodyHeight - 10 + squat * 0.5;
    const bodyTop = baseY - bodyHeight + squat * 0.3;
    const bodyBottom = baseY - 12 + squat * 0.5;
    const hipY = bodyBottom;

    // Head
    ctx.beginPath();
    ctx.arc(centerX, headY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();

    // Body (shorter when squatting)
    ctx.beginPath();
    ctx.moveTo(centerX, bodyTop + 6);
    ctx.lineTo(centerX, bodyBottom);
    ctx.stroke();

    // Realistic leg animation
    const isInAir = !m.onGround;
    const isMoving = Math.abs(m.vx) > 0.5;

    let leftLegAngle, rightLegAngle;
    let leftKneeBend, rightKneeBend;
    let leftFootAngle, rightFootAngle;

    if (isInAir) {
        // In-air leg animation - cycling/running motion
        const airPhase = m.legPhase;

        // Front leg goes forward, back leg goes back
        leftLegAngle = Math.sin(airPhase) * 0.8; // -0.8 to 0.8 radians
        rightLegAngle = Math.sin(airPhase + Math.PI) * 0.8;

        // Knee bends more when leg is forward
        leftKneeBend = 0.3 + Math.max(0, Math.sin(airPhase)) * 0.5;
        rightKneeBend = 0.3 + Math.max(0, Math.sin(airPhase + Math.PI)) * 0.5;

        // Feet angle
        leftFootAngle = Math.sin(airPhase) * 0.3;
        rightFootAngle = Math.sin(airPhase + Math.PI) * 0.3;
    } else if (squat > 2) {
        // Squatting - knees bent outward
        leftLegAngle = -0.3;
        rightLegAngle = 0.3;
        leftKneeBend = 0.5 + squat / 15;
        rightKneeBend = 0.5 + squat / 15;
        leftFootAngle = 0;
        rightFootAngle = 0;
    } else {
        // Standing/idle - subtle weight shift
        const idlePhase = m.legPhase;
        leftLegAngle = Math.sin(idlePhase * 0.5) * 0.05 - 0.15;
        rightLegAngle = Math.sin(idlePhase * 0.5 + 0.5) * 0.05 + 0.15;
        leftKneeBend = 0.1;
        rightKneeBend = 0.1;
        leftFootAngle = 0;
        rightFootAngle = 0;
    }

    const thighLength = 10 + squat * 0.3;
    const shinLength = 10 + squat * 0.2;

    // Draw legs with knees
    function drawLeg(angle, kneeBend, footAngle, side) {
        const hipOffset = side * 3;
        const hipX = centerX + hipOffset;

        // Thigh
        const kneeX = hipX + Math.sin(angle) * thighLength;
        const kneeY = hipY + Math.cos(angle) * thighLength;

        // Shin (bends at knee)
        const shinAngle = angle + kneeBend * side * 0.5;
        const footX = kneeX + Math.sin(shinAngle) * shinLength;
        const footY = kneeY + Math.cos(shinAngle) * shinLength;

        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(footX, footY);
        ctx.stroke();

        // Foot
        const footLength = 4;
        const footEndX = footX + Math.cos(footAngle) * footLength * (m.facingRight ? 1 : -1);
        const footEndY = footY + Math.sin(footAngle) * footLength * 0.3;
        ctx.beginPath();
        ctx.moveTo(footX, footY);
        ctx.lineTo(footEndX, footEndY + 1);
        ctx.stroke();
    }

    drawLeg(leftLegAngle, leftKneeBend, leftFootAngle, -1);
    drawLeg(rightLegAngle, rightKneeBend, rightFootAngle, 1);

    // Arms
    const armSwing = isInAir ? Math.sin(m.legPhase + Math.PI / 2) * 0.6 : (isMoving ? Math.sin(m.legPhase) * 0.3 : 0.1);
    const jumpArmRaise = isInAir ? -8 : 0;

    ctx.beginPath();
    ctx.moveTo(centerX, bodyTop + 10);
    ctx.lineTo(centerX - 8 - armSwing * 5, bodyTop + 18 + jumpArmRaise);
    ctx.moveTo(centerX, bodyTop + 10);
    ctx.lineTo(centerX + 8 + armSwing * 5, bodyTop + 18 + jumpArmRaise);
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
    mascot.vy = 5;
    mascot.vx = (Math.random() - 0.5) * 3;
    mascot.onGround = false;
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
