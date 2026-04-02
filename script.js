// Animated star field with parallax
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

let stars = [];
let shootingStars = [];
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
}

function initStars() {
    stars = [];
    const numStars = Math.floor((canvas.width * canvas.height) / 6000);

    for (let i = 0; i < numStars; i++) {
        stars.push({
            baseX: Math.random() * canvas.width,
            baseY: Math.random() * canvas.height,
            x: 0,
            y: 0,
            radius: Math.random() * 1.8 + 0.3,
            opacity: Math.random() * 0.6 + 0.15,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinkleOffset: Math.random() * Math.PI * 2,
            depth: Math.random() * 3 + 1, // Parallax depth
            color: Math.random() > 0.92 ?
                `hsl(${Math.random() * 60 + 240}, 30%, 65%)` : // Subtle colored stars (more purple, less saturated)
                'white'
        });
    }
}

// Mouse tracking for parallax
document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
    targetMouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
});

function createShootingStar() {
    if (Math.random() < 0.003 && shootingStars.length < 3) {
        const startX = Math.random() * canvas.width;
        shootingStars.push({
            x: startX,
            y: Math.random() * canvas.height * 0.3,
            length: Math.random() * 100 + 60,
            speed: Math.random() * 10 + 8,
            angle: Math.PI / 4 + (Math.random() * 0.3 - 0.15),
            opacity: 1,
            hue: Math.random() * 60 + 200 // Blue to purple hue
        });
    }
}

function drawStars(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Smooth mouse movement
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Draw regular stars with twinkle and parallax
    stars.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;

        // Parallax effect based on mouse position
        const parallaxX = mouseX * star.depth * 20;
        const parallaxY = mouseY * star.depth * 20;

        star.x = star.baseX + parallaxX;
        star.y = star.baseY + parallaxY;

        // Draw star glow for larger stars
        if (star.radius > 1.2) {
            const glowGradient = ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, star.radius * 4
            );
            glowGradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * twinkle * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
            ctx.fillStyle = glowGradient;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color === 'white'
            ? `rgba(255, 255, 255, ${star.opacity * twinkle})`
            : star.color.replace('80%', `${80 * twinkle}%`);
        ctx.fill();
    });

    // Draw and update shooting stars
    shootingStars = shootingStars.filter(ss => {
        const vx = Math.cos(ss.angle) * ss.speed;
        const vy = Math.sin(ss.angle) * ss.speed;

        // Draw glowing trail
        const gradient = ctx.createLinearGradient(
            ss.x, ss.y,
            ss.x - Math.cos(ss.angle) * ss.length,
            ss.y - Math.sin(ss.angle) * ss.length
        );
        gradient.addColorStop(0, `hsla(${ss.hue}, 80%, 70%, ${ss.opacity})`);
        gradient.addColorStop(0.3, `hsla(${ss.hue}, 60%, 60%, ${ss.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        // Draw outer glow
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
            ss.x - Math.cos(ss.angle) * ss.length,
            ss.y - Math.sin(ss.angle) * ss.length
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw inner bright core
        const coreGradient = ctx.createLinearGradient(
            ss.x, ss.y,
            ss.x - Math.cos(ss.angle) * ss.length * 0.5,
            ss.y - Math.sin(ss.angle) * ss.length * 0.5
        );
        coreGradient.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
        coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
            ss.x - Math.cos(ss.angle) * ss.length * 0.5,
            ss.y - Math.sin(ss.angle) * ss.length * 0.5
        );
        ctx.strokeStyle = coreGradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Update position
        ss.x += vx;
        ss.y += vy;
        ss.opacity -= 0.006;

        return ss.opacity > 0 && ss.x < canvas.width + 100 && ss.y < canvas.height + 100;
    });

    createShootingStar();
}

function animate(time) {
    drawStars(time);
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
animate(0);

// Add subtle parallax to container on mouse move
const container = document.querySelector('.container');
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    container.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

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
    targetX: 0,
    particles: []
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
        { x: w * 0.1, y: h * 0.75, width: 80 },      // bottom left
        { x: w * 0.05, y: h * 0.55, width: 70 },     // left middle
        { x: w * 0.12, y: h * 0.35, width: 75 },     // left upper
        { x: w * 0.25, y: h * 0.2, width: 80 },      // top left area
        { x: w * 0.45, y: h * 0.12, width: 90 },     // top center
        { x: w * 0.65, y: h * 0.18, width: 80 },     // top right area
        { x: w * 0.8, y: h * 0.32, width: 75 },      // right upper
        { x: w * 0.88, y: h * 0.5, width: 70 },      // right middle
        { x: w * 0.82, y: h * 0.7, width: 80 },      // right lower
        { x: w * 0.6, y: h * 0.82, width: 85 },      // bottom right
        { x: w * 0.35, y: h * 0.78, width: 80 },     // bottom center
        // Inner platforms for variety
        { x: w * 0.25, y: h * 0.5, width: 70 },      // inner left
        { x: w * 0.4, y: h * 0.38, width: 75 },      // inner top-left
        { x: w * 0.55, y: h * 0.45, width: 70 },     // inner center
        { x: w * 0.7, y: h * 0.55, width: 75 },      // inner right
        { x: w * 0.5, y: h * 0.65, width: 80 }       // inner bottom
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
    if (mascot.state === 'playing') return; // Don't update when in platformer

    const m = mascot;

    if (m.state === 'looping') {
        // Get current platform
        const currentPlat = mascotPlatforms[m.currentPlatformIndex];

        // If on ground and waited enough, jump to a random nearby platform
        if (m.onGround) {
            m.waitTimer += 1;
            if (m.waitTimer > 120) { // Wait ~2 seconds before jumping
                m.waitTimer = 0;

                // Find all platforms within jump range
                const currentCenter = { x: currentPlat.x + currentPlat.width / 2, y: currentPlat.y };
                const maxJumpDist = 600; // Increased max distance
                const minJumpDist = 80; // Reduced min distance

                const reachablePlatforms = mascotPlatforms
                    .map((plat, idx) => {
                        const platCenter = { x: plat.x + plat.width / 2, y: plat.y };
                        const dist = Math.sqrt(
                            Math.pow(platCenter.x - currentCenter.x, 2) +
                            Math.pow(platCenter.y - currentCenter.y, 2)
                        );
                        // Lower weight for previous platform (less likely to go back)
                        const isPrevious = idx === m.previousPlatformIndex;
                        return { plat, idx, dist, weight: isPrevious ? 0.15 : 1 };
                    })
                    .filter(p => p.idx !== m.currentPlatformIndex && p.dist >= minJumpDist && p.dist <= maxJumpDist);

                // Pick a weighted random platform (previous platform less likely)
                let chosenIdx;
                if (reachablePlatforms.length === 0) {
                    // Fallback: pick any platform except current
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

                // Calculate proper projectile motion to land on target
                const startX = m.x + m.width / 2;
                const startY = m.y + m.height;
                const endX = nextPlat.x + nextPlat.width / 2;
                const endY = nextPlat.y;

                const dx = endX - startX;
                const dy = endY - startY;

                // Calculate jump arc - use a fixed apex height above the higher platform
                const apexHeight = Math.min(startY, endY) - 120; // 120px above higher platform
                const rise = startY - apexHeight; // How high we need to go

                // Time to reach apex: vy = vy0 - g*t, at apex vy=0, so t = vy0/g
                // Height: y = vy0*t - 0.5*g*t^2 = rise, substituting t = vy0/g:
                // rise = vy0^2/g - 0.5*vy0^2/g = 0.5*vy0^2/g
                // vy0 = sqrt(2 * g * rise)
                const vy0 = -Math.sqrt(2 * MASCOT_GRAVITY * rise);

                // Total flight time: use kinematic equation
                // dy = vy0*t + 0.5*g*t^2, solve for t
                // 0.5*g*t^2 + vy0*t - dy = 0
                // t = (-vy0 + sqrt(vy0^2 + 2*g*dy)) / g
                const discriminant = vy0 * vy0 + 2 * MASCOT_GRAVITY * dy;
                const totalTime = (-vy0 + Math.sqrt(Math.max(0, discriminant))) / MASCOT_GRAVITY;

                // Horizontal velocity to cover dx in totalTime
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

        // Apply gravity
        m.vy += MASCOT_GRAVITY;
        m.vy = Math.min(m.vy, 12);

        // Move (no friction during jump for accurate landing)
        m.x += m.vx;
        m.y += m.vy;

        // Check platform collision - land on the target platform
        m.onGround = false;
        const targetPlat = mascotPlatforms[m.currentPlatformIndex];
        if (m.x + m.width > targetPlat.x && m.x < targetPlat.x + targetPlat.width) {
            if (m.vy > 0 && m.y + m.height >= targetPlat.y && m.y + m.height < targetPlat.y + 25) {
                m.y = targetPlat.y - m.height;
                // Snap to center of platform
                m.x = targetPlat.x + targetPlat.width / 2 - m.width / 2;
                m.vy = 0;
                m.vx = 0;
                m.onGround = true;
            }
        }

        // Safety: if fell off screen, reset to first platform
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

        // Add trail particles
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
        m.vy -= 0.3; // Accelerate upward
        m.vy = Math.max(m.vy, -15);
        m.y += m.vy;

        // Drift toward first platform
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

        // When reached the platform level, land and resume looping
        if (m.y < targetPlat.y - m.height + 10) {
            m.y = targetPlat.y - m.height;
            m.vy = 0;
            m.vx = 0;
            m.onGround = true;
            m.currentPlatformIndex = 0;
            m.waitTimer = 0;
            m.state = 'looping';

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

    // Draw the mascot (same stick figure style as platformer)
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const headY = m.y + 10;
    const bodyTop = m.y + 16;
    const bodyBottom = m.y + 28;
    const centerX = m.x + m.width / 2;

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

    // Animation offsets
    const isMoving = Math.abs(m.vx) > 0.5 || !m.onGround;
    const walkOffset = m.onGround && Math.abs(m.vx) > 0.5 ? Math.sin(m.animTimer * Math.PI * 2) * 4 : 0;
    const jumpArmOffset = !m.onGround ? -8 : 0;

    // Arms
    ctx.beginPath();
    ctx.moveTo(centerX, bodyTop + 4);
    ctx.lineTo(centerX - 9, bodyTop + 12 + walkOffset + jumpArmOffset);
    ctx.moveTo(centerX, bodyTop + 4);
    ctx.lineTo(centerX + 9, bodyTop + 12 - walkOffset + jumpArmOffset);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(centerX, bodyBottom);
    ctx.lineTo(centerX - 8, m.y + m.height - walkOffset);
    ctx.moveTo(centerX, bodyBottom);
    ctx.lineTo(centerX + 8, m.y + m.height + walkOffset);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Draw faint platform indicators (optional - very subtle)
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

// Initialize mascot
initMascotPlatforms();
mascotLoop();

window.addEventListener('resize', () => {
    initMascotPlatforms();
});

// Function to trigger mascot falling (called on jackpot)
function mascotFallIntoGame() {
    mascot.state = 'falling';
    mascot.vy = 5; // Start with faster fall
    mascot.vx = (Math.random() - 0.5) * 3;
    mascot.onGround = false;
    // Make sure mascot is visible on screen before falling
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

// Poll prank - No button runs away and spawns thumbs down
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const pollButtons = document.getElementById('pollButtons');
const pollResult = document.getElementById('pollResult');
const poll = document.getElementById('poll');

let thumbsCount = 0;
const maxThumbs = 30;

function moveNoButton(mouseX, mouseY) {
    // Simply move to a random position within a box area
    // Box bounds: -150 to 150 horizontally, -80 to 80 vertically
    const boxWidth = 300;
    const boxHeight = 160;

    // Random position within the box
    const newLeft = (Math.random() - 0.5) * boxWidth;
    const newTop = (Math.random() - 0.5) * boxHeight;

    noBtn.style.position = 'relative';
    noBtn.style.left = newLeft + 'px';
    noBtn.style.top = newTop + 'px';
    noBtn.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg)`;

    // Spawn thumbs down emoji
    if (thumbsCount < maxThumbs) {
        spawnThumbsDown();
    }
}

function spawnThumbsDown() {
    const thumb = document.createElement('span');
    thumb.textContent = '👎';
    thumb.className = 'floating-thumb';

    // Random position around the poll
    const tx = (Math.random() - 0.5) * 200;
    const ty = (Math.random() - 0.5) * 150 - 50;
    const rot = (Math.random() - 0.5) * 360;

    thumb.style.setProperty('--tx', tx + 'px');
    thumb.style.setProperty('--ty', ty + 'px');
    thumb.style.setProperty('--rot', rot + 'deg');
    thumb.style.left = '50%';
    thumb.style.top = '50%';

    poll.appendChild(thumb);
    thumbsCount++;

    // Add a permanent thumb that stays
    const permanentThumb = document.createElement('span');
    permanentThumb.textContent = '👎';
    permanentThumb.style.cssText = `
        position: absolute;
        font-size: ${12 + Math.random() * 8}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${0.3 + Math.random() * 0.4};
        transform: rotate(${(Math.random() - 0.5) * 60}deg);
        pointer-events: none;
    `;
    poll.appendChild(permanentThumb);

    // Remove the floating animation thumb after animation
    setTimeout(() => thumb.remove(), 2000);
}

let lastMouseX = 0;
let lastMouseY = 0;

document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

noBtn.addEventListener('mouseenter', (e) => moveNoButton(e.clientX, e.clientY));
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    moveNoButton(touch.clientX, touch.clientY);
});

// Yes button shows result and clears all thumbs
yesBtn.addEventListener('click', () => {
    // Clear all the thumbs down emojis
    const allThumbs = poll.querySelectorAll('span');
    allThumbs.forEach(thumb => {
        if (thumb.textContent === '👎') {
            thumb.style.transition = 'all 0.5s ease';
            thumb.style.opacity = '0';
            thumb.style.transform += ' scale(0)';
            setTimeout(() => thumb.remove(), 500);
        }
    });

    pollButtons.style.display = 'none';
    pollResult.style.display = 'block';

    // Add confetti effect
    for (let i = 0; i < 20; i++) {
        createConfetti();
    }
});

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: hsl(${Math.random() * 360}, 80%, 60%);
        top: ${poll.getBoundingClientRect().top}px;
        left: ${poll.getBoundingClientRect().left + poll.offsetWidth / 2}px;
        pointer-events: none;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        z-index: 1000;
    `;
    document.body.appendChild(confetti);

    const angle = (Math.random() * Math.PI * 2);
    const velocity = Math.random() * 8 + 4;
    let vx = Math.cos(angle) * velocity;
    let vy = Math.sin(angle) * velocity - 8;
    let x = parseFloat(confetti.style.left);
    let y = parseFloat(confetti.style.top);
    let rotation = 0;

    function animateConfetti() {
        vy += 0.3; // gravity
        x += vx;
        y += vy;
        rotation += vx * 2;

        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        confetti.style.transform = `rotate(${rotation}deg)`;
        confetti.style.opacity = Math.max(0, 1 - (y - poll.getBoundingClientRect().top) / 300);

        if (y < window.innerHeight + 50 && parseFloat(confetti.style.opacity) > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            confetti.remove();
        }
    }
    requestAnimationFrame(animateConfetti);
}

// Slot machine - poker/casino theme
const symbols = ['♠️', '♥️', '♦️', '♣️', '🃏', '👑', '💰', '7️⃣'];
const spinBtn = document.getElementById('spinBtn');
const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const slotResult = document.getElementById('slotResult');

let isSpinning = false;

spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;
    slotResult.textContent = '';

    reel1.classList.add('spinning');
    reel2.classList.add('spinning');
    reel3.classList.add('spinning');

    // Spin animation
    let spinCount = 0;
    const spinInterval = setInterval(() => {
        reel1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        spinCount++;
    }, 100);

    // Stop reels one by one
    setTimeout(() => {
        reel1.classList.remove('spinning');
        reel1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    }, 1000);

    setTimeout(() => {
        reel2.classList.remove('spinning');
        reel2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    }, 1500);

    setTimeout(() => {
        clearInterval(spinInterval);
        reel3.classList.remove('spinning');

        // ~20% chance to force a jackpot
        const forceJackpot = Math.random() < 0.2;

        if (forceJackpot) {
            const jackpotSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reel1.textContent = jackpotSymbol;
            reel2.textContent = jackpotSymbol;
            reel3.textContent = jackpotSymbol;
        } else {
            reel3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        }

        // Check for win
        const results = [reel1.textContent, reel2.textContent, reel3.textContent];
        if (results[0] === results[1] && results[1] === results[2]) {
            triggerJackpot();
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            slotResult.textContent = '✨ Nice! ✨';
            slotResult.style.color = '#10b981';
            slotResult.classList.remove('jackpot');
        } else {
            slotResult.textContent = 'Try again!';
            slotResult.style.color = '#888';
            slotResult.classList.remove('jackpot');
        }

        isSpinning = false;
        spinBtn.disabled = false;
    }, 2000);
});

function triggerJackpot() {
    const slotMachine = document.getElementById('slotMachine');

    // Screen flash
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 500);

    // Big jackpot text
    const jackpotText = document.createElement('div');
    jackpotText.className = 'jackpot-text';
    jackpotText.textContent = '💰 JACKPOT! 💰';
    document.body.appendChild(jackpotText);
    setTimeout(() => jackpotText.remove(), 2000);

    // Slot machine glow effect
    slotMachine.classList.add('winning');
    setTimeout(() => slotMachine.classList.remove('winning'), 3000);

    // Update result text
    slotResult.textContent = '🎉 JACKPOT! 🎉';
    slotResult.style.color = '#fbbf24';
    slotResult.classList.add('jackpot');

    // Massive confetti explosion - multiple waves
    for (let wave = 0; wave < 3; wave++) {
        setTimeout(() => {
            for (let i = 0; i < 40; i++) {
                createSlotConfetti();
            }
        }, wave * 300);
    }

    // Extra confetti from corners
    for (let i = 0; i < 20; i++) {
        setTimeout(() => createCornerConfetti(), i * 50);
    }

    // Start the mascot falling animation, which will trigger the platformer
    setTimeout(() => {
        mascotFallIntoGame();
    }, 2500);
}

// Called when mascot finishes falling
function actuallyStartPlatformer() {
    startPlatformerGame();
}

function createCornerConfetti() {
    const confetti = document.createElement('div');
    const startFromLeft = Math.random() > 0.5;
    confetti.style.cssText = `
        position: fixed;
        width: ${Math.random() * 10 + 8}px;
        height: ${Math.random() * 10 + 8}px;
        background: hsl(${Math.random() * 60 + 30}, 90%, 60%);
        top: ${window.innerHeight}px;
        left: ${startFromLeft ? 0 : window.innerWidth}px;
        pointer-events: none;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        z-index: 1000;
    `;
    document.body.appendChild(confetti);

    let vx = (startFromLeft ? 1 : -1) * (Math.random() * 8 + 5);
    let vy = -(Math.random() * 15 + 12);
    let x = parseFloat(confetti.style.left);
    let y = parseFloat(confetti.style.top);
    let rotation = 0;

    function animateCornerConfetti() {
        vy += 0.4;
        x += vx;
        y += vy;
        rotation += vx * 3;
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        confetti.style.transform = `rotate(${rotation}deg)`;

        if (y < window.innerHeight + 50) {
            requestAnimationFrame(animateCornerConfetti);
        } else {
            confetti.remove();
        }
    }
    requestAnimationFrame(animateCornerConfetti);
}

function createSlotConfetti() {
    const slotMachine = document.getElementById('slotMachine');
    const confetti = document.createElement('div');
    confetti.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: hsl(${Math.random() * 60 + 30}, 90%, 60%);
        top: ${slotMachine.getBoundingClientRect().top + 50}px;
        left: ${slotMachine.getBoundingClientRect().left + slotMachine.offsetWidth / 2}px;
        pointer-events: none;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        z-index: 1000;
    `;
    document.body.appendChild(confetti);

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 6 + 3;
    let vx = Math.cos(angle) * velocity;
    let vy = Math.sin(angle) * velocity - 6;
    let x = parseFloat(confetti.style.left);
    let y = parseFloat(confetti.style.top);

    function animateSlotConfetti() {
        vy += 0.25;
        x += vx;
        y += vy;
        confetti.style.left = x + 'px';
        confetti.style.top = y + 'px';
        confetti.style.opacity = Math.max(0, 1 - (y - slotMachine.getBoundingClientRect().top) / 200);

        if (parseFloat(confetti.style.opacity) > 0) {
            requestAnimationFrame(animateSlotConfetti);
        } else {
            confetti.remove();
        }
    }
    requestAnimationFrame(animateSlotConfetti);
}

// Easter egg - card rain (click the poker card)
const pokerCard = document.getElementById('pokerCard');
const cards = ['🂡', '🂢', '🂣', '🂤', '🂥', '🂦', '🂧', '🂨', '🂩', '🂪', '🂫', '🂭', '🂮',
               '🃁', '🃂', '🃃', '🃄', '🃅', '🃆', '🃇', '🃈', '🃉', '🃊', '🃋', '🃍', '🃎',
               '🃑', '🃒', '🃓', '🃔', '🃕', '🃖', '🃗', '🃘', '🃙', '🃚', '🃛', '🃝', '🃞'];

let easterEggTriggered = false;

pokerCard.addEventListener('click', () => {
    if (easterEggTriggered) return;
    easterEggTriggered = true;

    // Hide the card while raining
    pokerCard.style.opacity = '0';
    pokerCard.style.pointerEvents = 'none';

    // Rain cards for 5 seconds
    const cardRainInterval = setInterval(() => {
        for (let i = 0; i < 5; i++) {
            const card = document.createElement('div');
            card.className = 'raining-card';
            card.textContent = cards[Math.floor(Math.random() * cards.length)];
            card.style.left = Math.random() * window.innerWidth + 'px';
            card.style.top = '-50px';
            card.style.animationDuration = (Math.random() * 2 + 2) + 's';
            card.style.fontSize = (Math.random() * 20 + 25) + 'px';
            document.body.appendChild(card);

            setTimeout(() => card.remove(), 4000);
        }
    }, 80);

    setTimeout(() => {
        clearInterval(cardRainInterval);
        // Bring back the card
        setTimeout(() => {
            pokerCard.style.opacity = '1';
            pokerCard.style.pointerEvents = 'auto';
            easterEggTriggered = false;
        }, 1000);
    }, 5000);
});

// Interactive nebula effect
const spiralGalaxy = document.querySelector('.spiral-galaxy');
const nebulaClouds = document.querySelectorAll('.nebula-cloud');
let nebulaMouseX = 0, nebulaMouseY = 0;

if (spiralGalaxy) {
    spiralGalaxy.addEventListener('mousemove', (e) => {
        const rect = spiralGalaxy.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Mouse position relative to center (-1 to 1)
        const relX = (e.clientX - centerX) / (rect.width / 2);
        const relY = (e.clientY - centerY) / (rect.height / 2);

        nebulaMouseX = relX;
        nebulaMouseY = relY;

        // Move each cloud in different directions based on mouse
        nebulaClouds.forEach((cloud, i) => {
            const offsetX = relX * (15 + i * 8);
            const offsetY = relY * (12 + i * 6);
            const scale = 1 + Math.abs(relX * relY) * 0.15;
            cloud.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
            cloud.style.opacity = 0.6 + Math.abs(relX * relY) * 0.2;
            cloud.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        });

        // Brighten the galaxy core
        const galaxyCore = spiralGalaxy.querySelector('.galaxy-core');
        if (galaxyCore) {
            const dist = Math.sqrt(relX * relX + relY * relY);
            const glow = 15 + (1 - dist) * 20;
            galaxyCore.style.boxShadow = `0 0 ${glow}px ${glow/2}px rgba(255, 255, 255, ${0.3 + (1-dist) * 0.4})`;
        }
    });

    spiralGalaxy.addEventListener('mouseleave', () => {
        // Reset clouds to original position
        nebulaClouds.forEach((cloud) => {
            cloud.style.transform = '';
            cloud.style.opacity = '';
            cloud.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
        });

        const galaxyCore = spiralGalaxy.querySelector('.galaxy-core');
        if (galaxyCore) {
            galaxyCore.style.boxShadow = '';
        }
    });
}

// Black hole suck-in effect
const blackHole = document.querySelector('.black-hole');
let blackHoleActive = false;
let proximityWarningEl = null;
let screenBlackout = null;
let expandedBlackHole = null;
let storedBhCenter = null;

// Create overlay elements
function createBlackHoleOverlays() {
    proximityWarningEl = document.createElement('div');
    proximityWarningEl.className = 'proximity-warning';
    document.body.appendChild(proximityWarningEl);

    screenBlackout = document.createElement('div');
    screenBlackout.className = 'screen-blackout';
    document.body.appendChild(screenBlackout);
}
createBlackHoleOverlays();

// Get black hole center position (accounts for the event horizon being centered)
function getBlackHoleCenter() {
    const eventHorizon = blackHole.querySelector('.event-horizon');
    const rect = eventHorizon.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

// Check proximity to black hole
document.addEventListener('mousemove', (e) => {
    if (blackHoleActive || window.innerWidth <= 480) return;

    const bhCenter = getBlackHoleCenter();
    const dx = e.clientX - bhCenter.x;
    const dy = e.clientY - bhCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const triggerDistance = 80;
    const warningDistance = 600;

    // Update CSS variables for gradient positioning
    const bhXPercent = (bhCenter.x / window.innerWidth) * 100;
    const bhYPercent = (bhCenter.y / window.innerHeight) * 100;

    proximityWarningEl.style.setProperty('--bh-x', bhXPercent + '%');
    proximityWarningEl.style.setProperty('--bh-y', bhYPercent + '%');

    // Proximity warning glow
    if (distance < warningDistance && distance > triggerDistance) {
        const intensity = 1 - (distance - triggerDistance) / (warningDistance - triggerDistance);
        proximityWarningEl.style.opacity = intensity;
    } else {
        proximityWarningEl.style.opacity = 0;
    }

    // Trigger the suck-in!
    if (distance < triggerDistance) {
        triggerBlackHoleSuckIn(bhCenter, bhXPercent, bhYPercent);
    }
});

function triggerBlackHoleSuckIn(bhCenter, bhXPercent, bhYPercent) {
    if (blackHoleActive) return;
    blackHoleActive = true;
    storedBhCenter = { ...bhCenter };

    proximityWarningEl.style.opacity = 0;
    document.body.classList.add('sucking');

    // Hide the original black hole
    blackHole.style.opacity = '0';

    // Clone the black hole for the expansion animation
    expandedBlackHole = blackHole.cloneNode(true);
    expandedBlackHole.className = 'black-hole-expanded';
    expandedBlackHole.style.left = bhCenter.x + 'px';
    expandedBlackHole.style.top = bhCenter.y + 'px';
    expandedBlackHole.style.opacity = '1';
    expandedBlackHole.style.width = '110px';
    expandedBlackHole.style.height = '110px';
    document.body.appendChild(expandedBlackHole);

    // Elements to suck in
    const elementsToSuck = [
        ...document.querySelectorAll('.floating-logo'),
        document.querySelector('.spiral-galaxy'),
        document.querySelector('.container'),
        document.querySelector('.poll-container'),
        document.querySelector('.slot-machine'),
        document.querySelector('.poker-card'),
        document.querySelector('.aurora')
    ].filter(el => el);

    // Store original transforms
    const originalTransforms = elementsToSuck.map(el => ({
        el,
        transform: el.style.transform || '',
        opacity: el.style.opacity || ''
    }));

    // Calculate suck-in transforms for each element
    elementsToSuck.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;

        const translateX = bhCenter.x - elCenterX;
        const translateY = bhCenter.y - elCenterY;

        // Add delay variation based on distance
        const distance = Math.sqrt(translateX * translateX + translateY * translateY);
        const delay = Math.min(distance / 2000, 0.3);

        el.style.transitionDelay = delay + 's';
        el.style.transform = `translate(${translateX}px, ${translateY}px) scale(0) rotate(${Math.random() * 720 - 360}deg)`;
        el.style.opacity = '0';
        el.style.filter = 'blur(10px)';
    });

    // Animate the black hole expansion
    let scale = 1;
    const maxScale = 80; // Scale big enough so event horizon covers entire screen
    const growInterval = setInterval(() => {
        scale += 1.2;
        expandedBlackHole.style.transform = `translate(-50%, -50%) scale(${scale})`;

        // Start blackout when black hole gets big
        if (scale > 30) {
            screenBlackout.classList.add('active');
        }

        if (scale >= maxScale) {
            clearInterval(growInterval);
        }
    }, 20);

    // After suck-in completes, do the collapse
    setTimeout(() => {
        collapseAndExplode(originalTransforms);
    }, 2000);
}

function collapseAndExplode(originalTransforms) {
    const bhCenter = storedBhCenter;

    // Create singularity point at original black hole center
    const singularity = document.createElement('div');
    singularity.className = 'singularity';
    singularity.style.left = bhCenter.x + 'px';
    singularity.style.top = bhCenter.y + 'px';
    document.body.appendChild(singularity);

    // Collapse the expanded black hole back to original position
    let scale = 80;
    expandedBlackHole.style.left = bhCenter.x + 'px';
    expandedBlackHole.style.top = bhCenter.y + 'px';

    const collapseInterval = setInterval(() => {
        scale -= 2.5;
        expandedBlackHole.style.transform = `translate(-50%, -50%) scale(${Math.max(0, scale)})`;

        if (scale <= 0) {
            clearInterval(collapseInterval);
            expandedBlackHole.remove();
            expandedBlackHole = null;
        }
    }, 20);

    // After collapse, BIG BANG!
    setTimeout(() => {
        screenBlackout.classList.remove('active');
        singularity.remove();
        bigBangExplosion(originalTransforms);
    }, 800);
}

function bigBangExplosion(originalTransforms) {
    const bhCenter = storedBhCenter;
    const centerX = bhCenter.x;
    const centerY = bhCenter.y;

    // Flash effect
    const flash = document.createElement('div');
    flash.className = 'big-bang-flash';
    flash.style.setProperty('--bh-x', (centerX / window.innerWidth * 100) + '%');
    flash.style.setProperty('--bh-y', (centerY / window.innerHeight * 100) + '%');
    document.body.appendChild(flash);

    // Create explosion particles
    const particleColors = [
        '#fff', '#ffd700', '#ff6b35', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981'
    ];

    for (let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        particle.className = 'big-bang-particle';

        const size = Math.random() * 15 + 5;
        const angle = (Math.PI * 2 * i) / 100 + Math.random() * 0.5;
        const velocity = Math.random() * 800 + 400;
        const color = particleColors[Math.floor(Math.random() * particleColors.length)];

        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = color;
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.boxShadow = `0 0 ${size}px ${color}`;

        document.body.appendChild(particle);

        // Animate particle outward
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        let x = centerX;
        let y = centerY;
        let opacity = 1;
        let currentSize = size;

        function animateParticle() {
            x += vx * 0.016;
            y += vy * 0.016;
            opacity -= 0.015;
            currentSize *= 0.99;

            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = opacity;
            particle.style.width = currentSize + 'px';
            particle.style.height = currentSize + 'px';

            if (opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }
        requestAnimationFrame(animateParticle);
    }

    // Clean up flash
    setTimeout(() => flash.remove(), 1500);

    // Reset everything - explode back into place
    setTimeout(() => {
        resetEverything(originalTransforms);
    }, 300);
}

function resetEverything(originalTransforms) {
    document.body.classList.remove('sucking');
    const bhCenter = storedBhCenter;

    // Show the original black hole again
    blackHole.style.opacity = '';

    // First, position elements at the black hole center (scaled down)
    originalTransforms.forEach(({ el }) => {
        const rect = el.getBoundingClientRect();
        // Elements are already at the black hole from the suck-in
        // Now we'll animate them explosively outward
        el.style.transition = 'none';
        el.style.filter = 'blur(5px)';
    });

    // Force reflow
    document.body.offsetHeight;

    // Animate elements flying out from center back to original positions
    originalTransforms.forEach(({ el }, index) => {
        // Stagger the explosion slightly based on element type
        const delay = Math.random() * 0.3;

        setTimeout(() => {
            el.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-out, filter 0.4s ease-out';
            el.style.transform = '';
            el.style.opacity = '';
            el.style.filter = '';
        }, delay * 1000);
    });

    // Allow re-triggering after animation completes
    setTimeout(() => {
        originalTransforms.forEach(({ el }) => {
            el.style.transition = '';
            el.style.transitionDelay = '';
        });
        blackHoleActive = false;
        storedBhCenter = null;
    }, 1500);
}

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
        width: 30,
        height: 50,
        vx: 0,
        vy: 0,
        onGround: false,
        facingRight: true,
        animFrame: 0,
        animTimer: 0
    },
    platforms: [],
    hazards: [],
    movingPlatforms: [],
    particles: [],
    bgStars: [],
    exitPortal: { x: 0, y: 0, radius: 60 },
    camera: { y: 0 },
    gameHeight: 0,
    won: false,
    fallTransition: 0,
    shakeIntensity: 0,
    lastCheckpoint: null // Track last checkpoint reached
};

// Physics constants
const GRAVITY = 0.4;
const JUMP_FORCE = -13;
const MOVE_SPEED = 3.5;
const FRICTION = 0.78;
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

    // Total game height (how far up to climb)
    game.gameHeight = window.innerHeight * 3;

    // Generate platforms - challenging but achievable
    game.platforms = [];
    const platformCount = 14; // Fewer platforms = harder
    const verticalSpacing = 110; // More spacing = need precise jumps
    const maxHorizontalJump = 160; // Tighter horizontal tolerance

    // Track last platform position to ensure reachability
    let lastX = gameCanvas.width / 2 - 80;
    let lastWidth = 160;

    // Checkpoint positions: at platform 4 and platform 9 (roughly 1/3 and 2/3 up)
    const checkpointIndices = [4, 9];

    for (let i = 0; i < platformCount; i++) {
        const y = game.gameHeight - 180 - (i * verticalSpacing);
        const isCheckpoint = checkpointIndices.includes(i);
        const width = isCheckpoint ? 140 : 100 + Math.random() * 50; // Checkpoints are wider

        // Calculate valid X range based on last platform (must be reachable)
        const lastCenter = lastX + lastWidth / 2;
        const minX = Math.max(40, lastCenter - maxHorizontalJump - width / 2);
        const maxX = Math.min(gameCanvas.width - width - 40, lastCenter + maxHorizontalJump - width / 2);

        // Random X within reachable range
        const x = minX + Math.random() * (maxX - minX);

        if (isCheckpoint) {
            // Checkpoint platform - green with special styling
            game.platforms.push({
                x: x,
                y: y,
                width: width,
                height: 18,
                color1: '#10b981',
                color2: '#059669',
                glowColor: 'rgba(16, 185, 129, 0.6)',
                isCheckpoint: true,
                checkpointId: i
            });
        } else {
            // Normal platform
            game.platforms.push({
                x: x,
                y: y,
                width: width,
                height: 16,
                // Gradient colors - neon theme
                color1: `hsl(${260 + (i * 8) % 60}, 80%, 60%)`,
                color2: `hsl(${280 + (i * 12) % 80}, 70%, 50%)`,
                glowColor: `hsla(${270 + (i * 10) % 70}, 80%, 60%, 0.5)`
            });
        }

        lastX = x;
        lastWidth = width;
    }

    // Starting platform (bottom) - decent size
    game.platforms.push({
        x: gameCanvas.width / 2 - 80,
        y: game.gameHeight - 50,
        width: 160,
        height: 20,
        color1: '#10b981',
        color2: '#059669',
        glowColor: 'rgba(16, 185, 129, 0.5)',
        isStart: true
    });

    // Add hazards (spikes) on some platforms - NOT on checkpoints!
    game.hazards = [];
    for (let i = 2; i < platformCount - 1; i += 2) {
        // Skip checkpoint platforms (indices 4 and 9)
        if (checkpointIndices.includes(i)) continue;

        const plat = game.platforms[i];
        // Add spikes on the left or right side of platform
        const spikeOnLeft = Math.random() > 0.5;
        const spikeWidth = 25;
        game.hazards.push({
            x: spikeOnLeft ? plat.x : plat.x + plat.width - spikeWidth,
            y: plat.y - 20,
            width: spikeWidth,
            height: 20,
            type: 'spike'
        });
    }

    // Add moving platforms for extra challenge
    game.movingPlatforms = [];
    for (let i = 3; i < platformCount - 1; i += 4) {
        const plat = game.platforms[i];
        const moveRange = 80 + Math.random() * 60;
        game.movingPlatforms.push({
            x: plat.x,
            y: plat.y - 60, // Position between platforms
            width: 70,
            height: 14,
            startX: plat.x,
            moveRange: moveRange,
            speed: 1.5 + Math.random(),
            direction: 1,
            color1: '#f59e0b',
            color2: '#d97706',
            glowColor: 'rgba(245, 158, 11, 0.5)'
        });
    }

    // Add floating fire hazards (move up and down) - NOT near checkpoints!
    for (let i = 1; i < platformCount - 2; i += 3) {
        // Skip if this or adjacent platform is a checkpoint
        if (checkpointIndices.includes(i) || checkpointIndices.includes(i + 1) || checkpointIndices.includes(i - 1)) continue;

        const plat = game.platforms[i];
        game.hazards.push({
            x: plat.x + plat.width / 2 - 15,
            y: plat.y - 80,
            width: 30,
            height: 30,
            baseY: plat.y - 80,
            moveRange: 40,
            speed: 0.02,
            phase: Math.random() * Math.PI * 2,
            type: 'fire'
        });
    }

    // Exit portal at top - positioned above the last platform
    const topPlatform = game.platforms[platformCount - 1];
    game.exitPortal = {
        x: topPlatform.x + topPlatform.width / 2,
        y: topPlatform.y - 120,
        radius: 60,
        pulsePhase: 0
    };

    // Player starts on the bottom platform
    game.player.x = gameCanvas.width / 2 - game.player.width / 2;
    game.player.y = game.gameHeight - 50 - game.player.height;
    game.player.vx = 0;
    game.player.vy = 0;

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
    game.fallTransition = 0;
    game.shakeIntensity = 0;
    game.slideOffset = window.innerHeight; // For slide-up effect
    game.lastCheckpoint = null; // Reset checkpoint for new game
}

function startPlatformerGame() {
    if (gameActive) return;
    gameActive = true;

    initGame();

    // Show game canvas
    gameCanvas.style.display = 'block';
    gameUI.style.display = 'block';

    // Slide-up transition - website slides up to reveal game below
    game.slideOffset = window.innerHeight;
    game.isSliding = true;

    // Animate the main content sliding up
    const mainElements = [
        document.querySelector('.container'),
        document.querySelector('.poll-container'),
        document.querySelector('.slot-machine'),
        document.querySelector('.poker-card'),
        document.querySelector('.floating-objects'),
        document.querySelector('.aurora'),
        document.querySelector('#stars'),
        document.querySelector('#mascot')
    ].filter(el => el);

    // Set mascot to playing state (hides it)
    mascot.state = 'playing';

    // Add slide-up animation to main content
    mainElements.forEach(el => {
        el.style.transition = 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.transform = 'translateY(-100vh)';
    });

    // Screen shake on "floor break"
    game.shakeIntensity = 20;

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Start game loop after slide completes
    setTimeout(() => {
        game.isSliding = false;
        game.slideOffset = 0;
    }, 1500);

    // Start game loop immediately (will draw during slide)
    gameLoop();
}

function handleKeyDown(e) {
    if (!gameActive) return;

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

    // Horizontal movement - lower acceleration for less sensitivity
    if (keys.left) {
        p.vx -= 0.35;
        p.facingRight = false;
    }
    if (keys.right) {
        p.vx += 0.35;
        p.facingRight = true;
    }

    // Apply friction
    p.vx *= FRICTION;

    // Clamp horizontal speed
    p.vx = Math.max(-MOVE_SPEED, Math.min(MOVE_SPEED, p.vx));

    // Jump
    if (keys.jump && p.onGround) {
        p.vy = JUMP_FORCE;
        p.onGround = false;
        // Jump particles
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

    // Gravity
    p.vy += GRAVITY;
    p.vy = Math.min(p.vy, MAX_FALL_SPEED);

    // Move
    p.x += p.vx;
    p.y += p.vy;

    // Screen wrap horizontally
    if (p.x + p.width < 0) {
        p.x = gameCanvas.width;
    } else if (p.x > gameCanvas.width) {
        p.x = -p.width;
    }

    // Platform collision
    p.onGround = false;
    for (const plat of game.platforms) {
        if (p.x + p.width > plat.x && p.x < plat.x + plat.width) {
            // Landing on top
            if (p.vy > 0 &&
                p.y + p.height > plat.y &&
                p.y + p.height < plat.y + plat.height + p.vy + 5) {
                p.y = plat.y - p.height;
                p.vy = 0;
                p.onGround = true;

                // Check if this is a checkpoint
                if (plat.isCheckpoint && (!game.lastCheckpoint || plat.checkpointId > game.lastCheckpoint.checkpointId)) {
                    game.lastCheckpoint = plat;
                    // Checkpoint reached particles
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

    // Moving platform collision and update
    for (const mp of game.movingPlatforms) {
        // Update position
        mp.x += mp.speed * mp.direction;
        if (mp.x > mp.startX + mp.moveRange || mp.x < mp.startX - mp.moveRange) {
            mp.direction *= -1;
        }

        // Collision with player
        if (p.x + p.width > mp.x && p.x < mp.x + mp.width) {
            if (p.vy > 0 &&
                p.y + p.height > mp.y &&
                p.y + p.height < mp.y + mp.height + p.vy + 5) {
                p.y = mp.y - p.height;
                p.vy = 0;
                p.onGround = true;
                // Move player with platform
                p.x += mp.speed * mp.direction;
            }
        }
    }

    // Update and check hazard collisions
    for (const h of game.hazards) {
        // Update floating fire hazards
        if (h.type === 'fire') {
            h.phase += h.speed;
            h.y = h.baseY + Math.sin(h.phase) * h.moveRange;
        }

        // Check collision with player (with some padding for fairness)
        const pad = 5;
        if (p.x + p.width - pad > h.x + pad &&
            p.x + pad < h.x + h.width - pad &&
            p.y + p.height - pad > h.y + pad &&
            p.y + pad < h.y + h.height - pad) {
            // Hit hazard - respawn!
            respawnPlayer();
            break;
        }
    }

    // Respawn on starting platform if fell to the floor
    if (p.y > game.gameHeight - 30) {
        respawnPlayer();
    }

    function respawnPlayer() {
        // Use last checkpoint if available, otherwise start platform
        const respawnPlatform = game.lastCheckpoint ||
            game.platforms.find(pl => pl.isStart) ||
            game.platforms[game.platforms.length - 1];

        p.x = respawnPlatform.x + respawnPlatform.width / 2 - p.width / 2;
        p.y = respawnPlatform.y - p.height;
        p.vx = 0;
        p.vy = 0;
        game.shakeIntensity = 12;

        // Death particles (red)
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

        // Respawn particles (green to show checkpoint)
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

    // Movement particles
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

    // Animation
    p.animTimer += 0.15;
    if (p.animTimer >= 1) {
        p.animTimer = 0;
        p.animFrame = (p.animFrame + 1) % 4;
    }

    // Check exit portal collision
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
    // Smooth camera follow player
    const targetY = game.player.y - gameCanvas.height / 2;
    const clampedTarget = Math.max(0, Math.min(game.gameHeight - gameCanvas.height, targetY));
    game.camera.y += (clampedTarget - game.camera.y) * 0.08;

    // Screen shake decay
    game.shakeIntensity *= 0.95;
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

    // Clear
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Apply camera transform with shake
    ctx.save();
    const shakeX = (Math.random() - 0.5) * game.shakeIntensity;
    const shakeY = (Math.random() - 0.5) * game.shakeIntensity;
    ctx.translate(shakeX, -game.camera.y + shakeY);

    // Draw background stars with parallax
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

    // Draw epic exit portal
    const portal = game.exitPortal;
    portal.pulsePhase += 0.03;
    const pulseSize = Math.sin(portal.pulsePhase) * 15;
    const rotationPhase = time * 0.5;

    // Outer energy ring glow
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

    // Swirling energy particles around portal
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

    // Portal outer glow
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

    // Portal core with spinning gradient
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

    // Inner bright core
    const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, portal.radius * 0.5);
    innerGrad.addColorStop(0, '#fff');
    innerGrad.addColorStop(0.5, 'rgba(255,255,255,0.8)');
    innerGrad.addColorStop(1, 'rgba(255,255,200,0.3)');
    ctx.beginPath();
    ctx.arc(0, 0, portal.radius * 0.5 + pulseSize * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = innerGrad;
    ctx.fill();

    ctx.restore();

    // Dynamic light rays
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

    // "EXIT" text floating above portal
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
        // Glow
        ctx.shadowColor = plat.glowColor;
        ctx.shadowBlur = 20;

        // Platform gradient
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

        // Direction indicator arrows
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(mp.direction > 0 ? '→' : '←', mp.x + mp.width / 2, mp.y + mp.height / 2 + 3);

        ctx.shadowBlur = 0;
    });

    // Draw hazards
    game.hazards.forEach(h => {
        if (h.type === 'spike') {
            // Draw spikes as triangles
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
            // Draw fire as animated circle with glow
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
            // Wavy fire shape
            const wobble = Math.sin(time * 5 + h.phase) * 3;
            ctx.ellipse(
                h.x + h.width / 2 + wobble,
                h.y + h.height / 2,
                h.width / 2 + Math.sin(time * 8) * 2,
                h.height / 2 + Math.cos(time * 6) * 2,
                0, 0, Math.PI * 2
            );
            ctx.fill();

            // Inner bright core
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(h.x + h.width / 2 + wobble, h.y + h.height / 2, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    });

    // Draw particles
    game.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
        ctx.fill();
    });

    // Draw player (stick figure with glow)
    const pl = game.player;

    // Player glow
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 15;

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const headY = pl.y + 12;
    const bodyTop = pl.y + 20;
    const bodyBottom = pl.y + 35;
    const centerX = pl.x + pl.width / 2;

    // Head
    ctx.beginPath();
    ctx.arc(centerX, headY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.stroke();

    // Body
    ctx.beginPath();
    ctx.moveTo(centerX, bodyTop);
    ctx.lineTo(centerX, bodyBottom);
    ctx.stroke();

    // Animation offsets
    const walkOffset = pl.onGround && Math.abs(pl.vx) > 0.5
        ? Math.sin(pl.animTimer * Math.PI * 2) * 5
        : 0;
    const jumpArmOffset = !pl.onGround ? -10 : 0;

    // Arms
    ctx.beginPath();
    ctx.moveTo(centerX, bodyTop + 5);
    ctx.lineTo(centerX - 12, bodyTop + 15 + walkOffset + jumpArmOffset);
    ctx.moveTo(centerX, bodyTop + 5);
    ctx.lineTo(centerX + 12, bodyTop + 15 - walkOffset + jumpArmOffset);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(centerX, bodyBottom);
    ctx.lineTo(centerX - 10, pl.y + pl.height - walkOffset);
    ctx.moveTo(centerX, bodyBottom);
    ctx.lineTo(centerX + 10, pl.y + pl.height + walkOffset);
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.restore();

    // Fall transition overlay
    if (game.fallTransition > 0) {
        game.fallTransition -= 0.02;
        ctx.fillStyle = `rgba(0, 0, 0, ${game.fallTransition})`;
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
    // Victory particles burst (gold themed)
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

    // Gentle golden glow instead of harsh white flash
    const winGlow = document.createElement('div');
    winGlow.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at 50% 20%, rgba(251, 191, 36, 0.4) 0%, transparent 60%);
        z-index: 2500; pointer-events: none;
        animation: winGlowAnim 1.5s ease-out forwards;
    `;
    document.body.appendChild(winGlow);
    setTimeout(() => winGlow.remove(), 1500);

    // Victory animation delay, then slide back
    setTimeout(() => {
        // Get main elements to slide back
        const mainElements = [
            document.querySelector('.container'),
            document.querySelector('.poll-container'),
            document.querySelector('.slot-machine'),
            document.querySelector('.poker-card'),
            document.querySelector('.floating-objects'),
            document.querySelector('.aurora'),
            document.querySelector('#stars'),
            document.querySelector('#mascot')
        ].filter(el => el);

        // Slide website back down
        mainElements.forEach(el => {
            el.style.transition = 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.transform = 'translateY(0)';
        });

        // Fade out game canvas
        gameCanvas.style.transition = 'opacity 1.2s ease';
        gameCanvas.style.opacity = '0';

        // Start mascot rising animation
        mascotRiseFromGame();

        // Clean up after slide completes
        setTimeout(() => {
            // Clean up
            gameActive = false;
            cancelAnimationFrame(gameAnimationId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);

            // Hide game
            gameCanvas.style.display = 'none';
            gameCanvas.style.opacity = '1';
            gameCanvas.style.transition = '';
            gameUI.style.display = 'none';

            // Reset main element transitions
            mainElements.forEach(el => {
                el.style.transition = '';
            });

            // Reset keys
            keys.left = false;
            keys.right = false;
            keys.jump = false;

            // Reset slot machine to initial state
            reel1.textContent = '♠️';
            reel2.textContent = '♠️';
            reel3.textContent = '♠️';
            slotResult.textContent = '';
            slotResult.classList.remove('jackpot');

            // Celebration on return
            for (let i = 0; i < 30; i++) {
                setTimeout(() => createSlotConfetti(), i * 30);
            }
        }, 1200);
    }, 800);
}

// Handle window resize for game
window.addEventListener('resize', () => {
    if (gameActive) {
        gameCanvas.width = window.innerWidth;
        gameCanvas.height = window.innerHeight;
    }
});
