// ========================================
// PRIZE BLASTER - Space Invaders Style Shooter
// ========================================
const shooterCanvas = document.createElement('canvas');
shooterCanvas.id = 'shooterGame';
shooterCanvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    display: none;
`;
document.body.appendChild(shooterCanvas);

const shooterCtx = shooterCanvas.getContext('2d');

// Create shooter UI
const shooterUI = document.createElement('div');
shooterUI.id = 'shooterUI';
shooterUI.style.display = 'none';
shooterUI.innerHTML = `
    <div class="shooter-title">PRIZE BLASTER</div>
    <div class="shooter-score">Score: <span id="shooterScore">0</span></div>
    <div class="shooter-time">Time: <span id="shooterTime">30</span>s</div>
    <div class="shooter-instructions shooter-instructions-desktop">Use <kbd>A</kbd>/<kbd>D</kbd> or <kbd>&larr;</kbd>/<kbd>&rarr;</kbd> to move, <kbd>Space</kbd> to shoot</div>
    <div class="shooter-instructions shooter-instructions-mobile">Tap left/right to move, tap center to shoot</div>
`;
document.body.appendChild(shooterUI);

// Add shooter styles
const shooterStyles = document.createElement('style');
shooterStyles.textContent = `
    #shooterUI {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2001;
        text-align: center;
        color: #fff;
        font-family: 'Inter', sans-serif;
        pointer-events: none;
    }
    .shooter-title {
        font-size: 1.8rem;
        font-weight: 700;
        color: #fbbf24;
        text-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
        margin-bottom: 10px;
    }
    .shooter-score {
        font-size: 1.2rem;
        color: #10b981;
        margin-bottom: 5px;
    }
    .shooter-time {
        font-size: 1rem;
        color: #f59e0b;
        margin-bottom: 10px;
    }
    .shooter-instructions {
        font-size: 0.85rem;
        color: #888;
    }
    .shooter-instructions kbd {
        background: rgba(255,255,255,0.1);
        padding: 2px 8px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.2);
    }
    .shooter-instructions-mobile {
        display: none;
    }
    @media (hover: none) and (pointer: coarse) {
        .shooter-instructions-desktop { display: none; }
        .shooter-instructions-mobile { display: block; }
    }
    @media (max-width: 480px) {
        .shooter-title { font-size: 1.4rem; }
        .shooter-score { font-size: 1rem; }
        .shooter-time { font-size: 0.9rem; }
        .shooter-instructions { font-size: 0.75rem; }
    }
`;
document.head.appendChild(shooterStyles);

let shooterActive = false;
let shooterAnimationId = null;

// Game state
const shooter = {
    player: {
        x: 0,
        y: 0,
        width: 50,
        height: 30,
        speed: 18
    },
    bullets: [],
    prizes: [],
    particles: [],
    explosions: [],
    score: 0,
    timeLeft: 30,
    gameStartTime: 0,
    bgStars: [],
    combo: 0,
    lastHitTime: 0
};

// Prize types with different point values
const PRIZE_TYPES = [
    { emoji: '💰', points: 100, color: '#fbbf24', size: 35 },
    { emoji: '💎', points: 150, color: '#60a5fa', size: 32 },
    { emoji: '👑', points: 200, color: '#f59e0b', size: 38 },
    { emoji: '⭐', points: 75, color: '#fcd34d', size: 30 },
    { emoji: '🏆', points: 250, color: '#10b981', size: 40 },
    { emoji: '💵', points: 50, color: '#22c55e', size: 28 },
    { emoji: '🎁', points: 300, color: '#ec4899', size: 42 }
];

// Input state
const shooterKeys = {
    left: false,
    right: false,
    shoot: false
};

let canShoot = true;
let shootHeld = false;
let autoFireInterval = null;
const SHOOT_COOLDOWN = 80; // ms between shots (fast fire!)

function initShooter() {
    shooterCanvas.width = window.innerWidth;
    shooterCanvas.height = window.innerHeight;

    // Reset game state
    shooter.player.x = shooterCanvas.width / 2 - shooter.player.width / 2;
    shooter.player.y = shooterCanvas.height - 80;
    shooter.bullets = [];
    shooter.prizes = [];
    shooter.particles = [];
    shooter.explosions = [];
    shooter.score = 0;
    shooter.timeLeft = 30;
    shooter.combo = 0;
    shooter.lastHitTime = 0;
    shooter.gameStartTime = Date.now();

    // Generate background stars
    shooter.bgStars = [];
    for (let i = 0; i < 80; i++) {
        shooter.bgStars.push({
            x: Math.random() * shooterCanvas.width,
            y: Math.random() * shooterCanvas.height,
            radius: Math.random() * 1.5 + 0.5,
            twinkleSpeed: Math.random() * 0.03 + 0.01,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }

    // Spawn initial prizes
    for (let i = 0; i < 5; i++) {
        spawnPrize();
    }
}

function spawnPrize() {
    const type = PRIZE_TYPES[Math.floor(Math.random() * PRIZE_TYPES.length)];
    const prize = {
        x: 50 + Math.random() * (shooterCanvas.width - 100),
        y: -50 - Math.random() * 100,
        type: type,
        speed: 1.5 + Math.random() * 2,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.02,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.1
    };
    shooter.prizes.push(prize);
}

function startShooterGame() {
    if (shooterActive) return;
    shooterActive = true;

    initShooter();

    // Show game canvas and UI
    shooterCanvas.style.display = 'block';
    shooterUI.style.display = 'block';

    // Hide main site elements
    const mainElements = [
        document.querySelector('.container'),
        document.querySelector('.poll-container'),
        document.querySelector('.slot-machine'),
        document.querySelector('.poker-card-wrapper'),
        document.querySelector('.floating-objects'),
        document.querySelector('.aurora'),
        document.querySelector('.spiral-galaxy'),
        document.querySelector('#stars'),
        document.querySelector('#mascot'),
        document.querySelector('.site-version')
    ].filter(el => el);

    mainElements.forEach(el => {
        el.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease';
        el.style.transform = 'translateY(-100vh)';
        el.style.opacity = '0';
    });

    // Add event listeners
    window.addEventListener('keydown', handleShooterKeyDown);
    window.addEventListener('keyup', handleShooterKeyUp);

    // Start game loop
    shooterLoop();

    // Spawn prizes periodically
    shooter.spawnInterval = setInterval(() => {
        if (shooterActive && shooter.prizes.length < 12) {
            spawnPrize();
            if (Math.random() > 0.5) spawnPrize(); // Sometimes spawn 2
        }
    }, 800);
}

function handleShooterKeyDown(e) {
    if (!shooterActive) return;

    switch(e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
            shooterKeys.left = true;
            break;
        case 'd':
        case 'arrowright':
            shooterKeys.right = true;
            break;
        case ' ':
            e.preventDefault();
            if (!shootHeld) {
                shootHeld = true;
                // Fire immediately
                if (canShoot) {
                    shootBullet();
                    canShoot = false;
                    setTimeout(() => canShoot = true, SHOOT_COOLDOWN);
                }
                // Start auto-fire while holding
                autoFireInterval = setInterval(() => {
                    if (shooterActive && canShoot) {
                        shootBullet();
                        canShoot = false;
                        setTimeout(() => canShoot = true, SHOOT_COOLDOWN);
                    }
                }, SHOOT_COOLDOWN + 10);
            }
            break;
    }
}

function handleShooterKeyUp(e) {
    switch(e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
            shooterKeys.left = false;
            break;
        case 'd':
        case 'arrowright':
            shooterKeys.right = false;
            break;
        case ' ':
            shootHeld = false;
            if (autoFireInterval) {
                clearInterval(autoFireInterval);
                autoFireInterval = null;
            }
            break;
    }
}

// Touch controls
let touchAutoFire = null;

shooterCanvas.addEventListener('touchstart', (e) => {
    if (!shooterActive) return;
    e.preventDefault();

    const touch = e.touches[0];
    const screenThird = shooterCanvas.width / 3;

    if (touch.clientX < screenThird) {
        shooterKeys.left = true;
    } else if (touch.clientX > screenThird * 2) {
        shooterKeys.right = true;
    } else {
        // Center tap = shoot with auto-fire
        if (canShoot) {
            shootBullet();
            canShoot = false;
            setTimeout(() => canShoot = true, SHOOT_COOLDOWN);
        }
        // Start auto-fire for touch
        if (!touchAutoFire) {
            touchAutoFire = setInterval(() => {
                if (shooterActive && canShoot) {
                    shootBullet();
                    canShoot = false;
                    setTimeout(() => canShoot = true, SHOOT_COOLDOWN);
                }
            }, SHOOT_COOLDOWN + 10);
        }
    }
}, { passive: false });

shooterCanvas.addEventListener('touchmove', (e) => {
    if (!shooterActive) return;
    e.preventDefault();

    const touch = e.touches[0];
    const screenThird = shooterCanvas.width / 3;

    shooterKeys.left = touch.clientX < screenThird;
    shooterKeys.right = touch.clientX > screenThird * 2;
}, { passive: false });

shooterCanvas.addEventListener('touchend', (e) => {
    if (!shooterActive) return;
    e.preventDefault();
    shooterKeys.left = false;
    shooterKeys.right = false;
    // Stop touch auto-fire
    if (touchAutoFire) {
        clearInterval(touchAutoFire);
        touchAutoFire = null;
    }
}, { passive: false });

function shootBullet() {
    const bullet = {
        x: shooter.player.x + shooter.player.width / 2,
        y: shooter.player.y,
        width: 4,
        height: 15,
        speed: 12
    };
    shooter.bullets.push(bullet);

    // Muzzle flash particles
    for (let i = 0; i < 5; i++) {
        shooter.particles.push({
            x: bullet.x,
            y: bullet.y,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3 - 1,
            life: 0.5,
            color: '#fbbf24',
            size: 3 + Math.random() * 3
        });
    }
}

function updateShooter() {
    const p = shooter.player;

    // Player movement
    if (shooterKeys.left) {
        p.x -= p.speed;
    }
    if (shooterKeys.right) {
        p.x += p.speed;
    }

    // Keep player in bounds
    p.x = Math.max(0, Math.min(shooterCanvas.width - p.width, p.x));

    // Update bullets
    shooter.bullets = shooter.bullets.filter(b => {
        b.y -= b.speed;
        return b.y > -b.height;
    });

    // Update prizes
    shooter.prizes = shooter.prizes.filter(prize => {
        prize.y += prize.speed;
        prize.wobblePhase += prize.wobbleSpeed;
        prize.x += Math.sin(prize.wobblePhase) * 1.5;
        prize.rotation += prize.rotationSpeed;

        // Check collision with bullets
        for (let i = shooter.bullets.length - 1; i >= 0; i--) {
            const b = shooter.bullets[i];
            const prizeSize = prize.type.size;

            if (b.x > prize.x - prizeSize/2 && b.x < prize.x + prizeSize/2 &&
                b.y > prize.y - prizeSize/2 && b.y < prize.y + prizeSize/2) {

                // Hit! Remove bullet
                shooter.bullets.splice(i, 1);

                // Calculate combo
                const now = Date.now();
                if (now - shooter.lastHitTime < 1000) {
                    shooter.combo = Math.min(shooter.combo + 1, 10);
                } else {
                    shooter.combo = 1;
                }
                shooter.lastHitTime = now;

                // Add score with combo multiplier
                const points = prize.type.points * shooter.combo;
                shooter.score += points;

                // Create explosion effect
                shooter.explosions.push({
                    x: prize.x,
                    y: prize.y,
                    radius: 5,
                    maxRadius: prizeSize * 1.5,
                    color: prize.type.color,
                    life: 1
                });

                // Score popup particles
                for (let j = 0; j < 12; j++) {
                    const angle = (Math.PI * 2 * j) / 12;
                    shooter.particles.push({
                        x: prize.x,
                        y: prize.y,
                        vx: Math.cos(angle) * (3 + Math.random() * 3),
                        vy: Math.sin(angle) * (3 + Math.random() * 3),
                        life: 1,
                        color: prize.type.color,
                        size: 4 + Math.random() * 4
                    });
                }

                // Floating score text
                shooter.particles.push({
                    x: prize.x,
                    y: prize.y,
                    vx: 0,
                    vy: -2,
                    life: 1.5,
                    isText: true,
                    text: '+' + points + (shooter.combo > 1 ? ' x' + shooter.combo : ''),
                    color: shooter.combo > 1 ? '#fbbf24' : '#fff'
                });

                return false; // Remove prize
            }
        }

        // Remove if off screen (missed)
        if (prize.y > shooterCanvas.height + 50) {
            shooter.combo = 0; // Reset combo on miss
            return false;
        }

        return true;
    });

    // Update particles
    shooter.particles = shooter.particles.filter(p => {
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        if (p.vy !== undefined && !p.isText) p.vy += 0.1;
        p.life -= 0.02;
        return p.life > 0;
    });

    // Update explosions
    shooter.explosions = shooter.explosions.filter(e => {
        e.radius += (e.maxRadius - e.radius) * 0.2;
        e.life -= 0.05;
        return e.life > 0;
    });

    // Update time
    const elapsed = (Date.now() - shooter.gameStartTime) / 1000;
    shooter.timeLeft = Math.max(0, 30 - Math.floor(elapsed));

    // Update UI
    document.getElementById('shooterScore').textContent = shooter.score;
    document.getElementById('shooterTime').textContent = shooter.timeLeft;

    // Check game over
    if (shooter.timeLeft <= 0) {
        endShooterGame();
    }
}

function drawShooter() {
    const ctx = shooterCtx;
    const time = Date.now() * 0.001;

    // Dark space background
    ctx.fillStyle = '#0a0612';
    ctx.fillRect(0, 0, shooterCanvas.width, shooterCanvas.height);

    // Ambient glow
    const glow = ctx.createRadialGradient(
        shooterCanvas.width / 2, shooterCanvas.height / 2, 0,
        shooterCanvas.width / 2, shooterCanvas.height / 2, shooterCanvas.width * 0.7
    );
    glow.addColorStop(0, 'rgba(251, 191, 36, 0.08)');
    glow.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, shooterCanvas.width, shooterCanvas.height);

    // Draw stars
    shooter.bgStars.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.5 * twinkle})`;
        ctx.fill();
    });

    // Draw explosions
    shooter.explosions.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = e.color + Math.floor(e.life * 100).toString(16).padStart(2, '0');
        ctx.fill();

        // Outer ring
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * 1.3, 0, Math.PI * 2);
        ctx.strokeStyle = e.color + Math.floor(e.life * 60).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw prizes
    shooter.prizes.forEach(prize => {
        ctx.save();
        ctx.translate(prize.x, prize.y);
        ctx.rotate(prize.rotation);

        // Glow effect
        ctx.shadowColor = prize.type.color;
        ctx.shadowBlur = 15;

        // Draw emoji
        ctx.font = `${prize.type.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(prize.type.emoji, 0, 0);

        ctx.shadowBlur = 0;
        ctx.restore();
    });

    // Draw bullets
    shooter.bullets.forEach(b => {
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;

        const bulletGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.height);
        bulletGrad.addColorStop(0, '#fff');
        bulletGrad.addColorStop(0.5, '#fbbf24');
        bulletGrad.addColorStop(1, '#f59e0b');

        ctx.fillStyle = bulletGrad;
        ctx.fillRect(b.x - b.width/2, b.y, b.width, b.height);

        // Bullet trail
        ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
        ctx.fillRect(b.x - b.width/2 - 1, b.y + b.height, b.width + 2, 20);

        ctx.shadowBlur = 0;
    });

    // Draw particles
    shooter.particles.forEach(p => {
        if (p.isText) {
            ctx.font = 'bold 18px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = p.color + Math.floor(p.life * 255 / 1.5).toString(16).padStart(2, '0');
            ctx.fillText(p.text, p.x, p.y);
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            ctx.fill();
        }
    });

    // Draw player ship
    const p = shooter.player;
    ctx.save();
    ctx.translate(p.x + p.width/2, p.y + p.height/2);

    // Ship glow
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 20;

    // Ship body
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, -p.height/2);
    ctx.lineTo(-p.width/2, p.height/2);
    ctx.lineTo(-p.width/4, p.height/3);
    ctx.lineTo(0, p.height/2);
    ctx.lineTo(p.width/4, p.height/3);
    ctx.lineTo(p.width/2, p.height/2);
    ctx.closePath();
    ctx.fill();

    // Ship details
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.moveTo(0, -p.height/3);
    ctx.lineTo(-p.width/4, p.height/4);
    ctx.lineTo(p.width/4, p.height/4);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Engine glow
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(-p.width/4, p.height/2 + 5, 4, 8 + Math.sin(time * 20) * 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(p.width/4, p.height/2 + 5, 4, 8 + Math.sin(time * 20 + 1) * 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Draw combo indicator
    if (shooter.combo > 1) {
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fillText(`COMBO x${shooter.combo}!`, shooterCanvas.width / 2, shooterCanvas.height - 30);
        ctx.shadowBlur = 0;
    }

    // Time warning
    if (shooter.timeLeft <= 5 && shooter.timeLeft > 0) {
        ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + Math.sin(time * 10) * 0.2})`;
        ctx.fillRect(0, 0, shooterCanvas.width, shooterCanvas.height);
    }

    // Version display (bottom right)
    ctx.save();
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.textAlign = 'right';
    ctx.fillText('v1.5.1', shooterCanvas.width - 15, shooterCanvas.height - 15);
    ctx.restore();
}

function shooterLoop() {
    if (!shooterActive) return;

    updateShooter();
    drawShooter();

    shooterAnimationId = requestAnimationFrame(shooterLoop);
}

function endShooterGame() {
    clearInterval(shooter.spawnInterval);
    if (autoFireInterval) {
        clearInterval(autoFireInterval);
        autoFireInterval = null;
    }
    shootHeld = false;

    // Show final score
    const finalScore = shooter.score;

    // Create end screen overlay with CSS-only confetti (no JS animation lag)
    const endScreen = document.createElement('div');
    endScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 2500;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: 'Inter', sans-serif;
    `;
    endScreen.innerHTML = `
        <div style="font-size: 3rem; color: #fbbf24; margin-bottom: 20px; text-shadow: 0 0 30px rgba(251, 191, 36, 0.5); animation: popIn 0.5s ease-out;">GAME OVER!</div>
        <div style="font-size: 1.5rem; margin-bottom: 10px; animation: popIn 0.5s ease-out 0.1s both;">Final Score</div>
        <div style="font-size: 4rem; color: #10b981; font-weight: bold; margin-bottom: 30px; animation: popIn 0.5s ease-out 0.2s both;">${finalScore}</div>
        <div style="font-size: 1rem; color: #888; animation: popIn 0.5s ease-out 0.3s both;">Returning to site...</div>
    `;
    document.body.appendChild(endScreen);

    // Simple flash effect instead of heavy confetti
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
        z-index: 2450;
        pointer-events: none;
        animation: flashOut 0.8s ease-out forwards;
    `;
    document.body.appendChild(flash);

    // Add animation keyframes if not present
    if (!document.getElementById('shooterEndKeyframes')) {
        const style = document.createElement('style');
        style.id = 'shooterEndKeyframes';
        style.textContent = `
            @keyframes flashOut {
                0% { opacity: 1; transform: scale(0.5); }
                100% { opacity: 0; transform: scale(2); }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => flash.remove(), 800);

    // Return to main site
    setTimeout(() => {
        endScreen.style.transition = 'opacity 0.5s ease';
        endScreen.style.opacity = '0';

        setTimeout(() => {
            endScreen.remove();

            // Restore main elements
            const mainElements = [
                document.querySelector('.container'),
                document.querySelector('.poll-container'),
                document.querySelector('.slot-machine'),
                document.querySelector('.poker-card-wrapper'),
                document.querySelector('.floating-objects'),
                document.querySelector('.aurora'),
                document.querySelector('.spiral-galaxy'),
                document.querySelector('#stars'),
                document.querySelector('#mascot'),
                document.querySelector('.site-version')
            ].filter(el => el);

            mainElements.forEach(el => {
                el.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease';
                el.style.transform = 'translateY(0)';
                el.style.opacity = '1';
            });

            shooterCanvas.style.transition = 'opacity 0.5s ease';
            shooterCanvas.style.opacity = '0';

            setTimeout(() => {
                shooterActive = false;
                cancelAnimationFrame(shooterAnimationId);
                window.removeEventListener('keydown', handleShooterKeyDown);
                window.removeEventListener('keyup', handleShooterKeyUp);

                shooterCanvas.style.display = 'none';
                shooterCanvas.style.opacity = '1';
                shooterCanvas.style.transition = '';
                shooterUI.style.display = 'none';

                // Reset element styles
                mainElements.forEach(el => {
                    el.style.transition = '';
                    el.style.transform = '';
                    el.style.opacity = '';
                });

                shooterKeys.left = false;
                shooterKeys.right = false;
                shooterKeys.shoot = false;

                // Reset slot machine completely
                const slotMachine = document.getElementById('slotMachine');
                slotMachine.classList.remove('winning');
                slotMachine.style.position = '';
                slotMachine.style.transform = '';
                slotMachine.style.transition = '';
                slotMachine.style.opacity = '';
                slotMachine.style.left = '';
                slotMachine.style.top = '';
                slotMachine.style.right = '';
                slotMachine.style.bottom = '';
                slotMachine.style.width = '';
                slotMachine.style.zIndex = '';
                document.getElementById('reel1').textContent = '♠️';
                document.getElementById('reel2').textContent = '♠️';
                document.getElementById('reel3').textContent = '♠️';
                document.getElementById('slotResult').textContent = '';
                document.getElementById('slotResult').classList.remove('jackpot');

                // Also reset the spin button and state
                const spinBtn = document.getElementById('spinBtn');
                if (spinBtn) {
                    spinBtn.disabled = false;
                }

                // Remove any leftover jackpot banners
                const leftoverBanners = document.querySelectorAll('.slot-jackpot-banner');
                leftoverBanners.forEach(b => b.remove());
            }, 500);
        }, 500);
    }, 3000);
}

// Handle window resize
window.addEventListener('resize', () => {
    if (shooterActive) {
        shooterCanvas.width = window.innerWidth;
        shooterCanvas.height = window.innerHeight;
        shooter.player.y = shooterCanvas.height - 80;
    }
});
