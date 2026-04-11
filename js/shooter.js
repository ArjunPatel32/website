// ========================================
// STAR DESTROYER - Space Shooter Game
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
    cursor: crosshair;
`;
document.body.appendChild(shooterCanvas);

const shooterCtx = shooterCanvas.getContext('2d');

// Create shooter UI
const shooterUI = document.createElement('div');
shooterUI.id = 'shooterUI';
shooterUI.style.display = 'none';
shooterUI.innerHTML = `
    <div class="shooter-title">STAR DESTROYER</div>
    <div class="shooter-stats">
        <div class="shooter-score">Score: <span id="shooterScore">0</span></div>
        <div class="shooter-health">Health: <span id="shooterHealth">❤️❤️❤️</span></div>
        <div class="shooter-time">Time: <span id="shooterTime">30</span>s</div>
    </div>
    <div class="shooter-instructions shooter-instructions-desktop">Use <kbd>A</kbd>/<kbd>D</kbd> to move, <kbd>Space</kbd> or <kbd>Click</kbd> to shoot</div>
    <div class="shooter-instructions shooter-instructions-mobile">Tap sides to move, tap center to shoot</div>
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
        color: #60a5fa;
        text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
        margin-bottom: 10px;
    }
    .shooter-stats {
        display: flex;
        gap: 20px;
        justify-content: center;
        flex-wrap: wrap;
        margin-bottom: 10px;
    }
    .shooter-score {
        font-size: 1.2rem;
        color: #10b981;
    }
    .shooter-health {
        font-size: 1.2rem;
        color: #ef4444;
    }
    .shooter-time {
        font-size: 1rem;
        color: #f59e0b;
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
        height: 35,
        speed: 14,
        health: 3,
        maxHealth: 3,
        invincible: 0
    },
    bullets: [],
    enemies: [],
    bombs: [],
    particles: [],
    explosions: [],
    powerups: [],
    score: 0,
    timeLeft: 30,
    gameStartTime: 0,
    bgStars: [],
    combo: 0,
    lastHitTime: 0,
    wave: 1
};

// Enemy types - SLOWED DOWN MORE
const ENEMY_TYPES = [
    { type: 'scout', points: 50, color: '#ef4444', size: 28, speed: 0.8, health: 1 },
    { type: 'fighter', points: 100, color: '#f59e0b', size: 32, speed: 0.65, health: 2 },
    { type: 'bomber', points: 150, color: '#8b5cf6', size: 38, speed: 0.5, health: 3, dropsBomb: true },
    { type: 'elite', points: 250, color: '#ec4899', size: 42, speed: 1, health: 2 }
];

const MISSION_SUCCESS_SCORE = 1000;

// Input state
const shooterKeys = {
    left: false,
    right: false,
    shoot: false
};

let canShoot = true;
let shootHeld = false;
let autoFireInterval = null;
const SHOOT_COOLDOWN = 100;

function initShooter() {
    shooterCanvas.width = window.innerWidth;
    shooterCanvas.height = window.innerHeight;

    shooter.player.x = shooterCanvas.width / 2 - shooter.player.width / 2;
    shooter.player.y = shooterCanvas.height - 80;
    shooter.player.health = 3;
    shooter.player.maxHealth = 3;
    shooter.player.invincible = 0;
    shooter.bullets = [];
    shooter.enemies = [];
    shooter.bombs = [];
    shooter.particles = [];
    shooter.explosions = [];
    shooter.powerups = [];
    shooter.score = 0;
    shooter.timeLeft = 30;
    shooter.combo = 0;
    shooter.lastHitTime = 0;
    shooter.wave = 1;
    shooter.gameStartTime = Date.now();
    shooter.screenShake = 0;
    shooter.damageFlash = 0; // Red flash when taking damage

    // Generate background stars
    shooter.bgStars = [];
    for (let i = 0; i < 100; i++) {
        shooter.bgStars.push({
            x: Math.random() * shooterCanvas.width,
            y: Math.random() * shooterCanvas.height,
            radius: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 2 + 0.5,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }

    // Spawn initial enemies
    for (let i = 0; i < 4; i++) {
        spawnEnemy();
    }
}

function spawnEnemy() {
    const typeIndex = Math.random() < 0.6 ? 0 : Math.random() < 0.8 ? 1 : Math.random() < 0.9 ? 2 : 3;
    const type = ENEMY_TYPES[typeIndex];

    const enemy = {
        x: 30 + Math.random() * (shooterCanvas.width - 60),
        y: -50 - Math.random() * 100,
        ...type,
        currentHealth: type.health,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.02,
        shootTimer: Math.random() * 100
    };
    shooter.enemies.push(enemy);
}

function spawnBomb(x, y) {
    shooter.bombs.push({
        x: x,
        y: y,
        radius: 12,
        speed: 2
    });
}

function playTransitionAnimation(callback) {
    const transitionCanvas = document.createElement('canvas');
    transitionCanvas.width = window.innerWidth;
    transitionCanvas.height = window.innerHeight;
    transitionCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 2500;
        pointer-events: none;
    `;
    document.body.appendChild(transitionCanvas);
    const ctx = transitionCanvas.getContext('2d');

    let frame = 0;
    const totalFrames = 150; // Extended from 90 to 150 (extra ~1 second)
    const stars = [];

    // Create hyperspace stars
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            angle: Math.random() * Math.PI * 2,
            speed: 2 + Math.random() * 8,
            length: 0
        });
    }

    function animate() {
        frame++;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, transitionCanvas.width, transitionCanvas.height);

        // Hyperspace effect
        stars.forEach(star => {
            star.length = Math.min(star.length + star.speed * 2, 150);
            const dist = star.length;
            const x1 = window.innerWidth / 2 + Math.cos(star.angle) * (dist - star.length * 0.8);
            const y1 = window.innerHeight / 2 + Math.sin(star.angle) * (dist - star.length * 0.8);
            const x2 = window.innerWidth / 2 + Math.cos(star.angle) * dist;
            const y2 = window.innerHeight / 2 + Math.sin(star.angle) * dist;

            const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, 'rgba(96, 165, 250, 0.8)');
            gradient.addColorStop(1, '#fff');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        });

        // Center glow
        const glowSize = Math.min(frame * 5, 300);
        const glow = ctx.createRadialGradient(
            window.innerWidth / 2, window.innerHeight / 2, 0,
            window.innerWidth / 2, window.innerHeight / 2, glowSize
        );
        glow.addColorStop(0, `rgba(96, 165, 250, ${Math.max(0, 0.3 - frame * 0.002)})`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, transitionCanvas.width, transitionCanvas.height);

        // Title text appears earlier and stays longer
        if (frame > 30) {
            const fadeIn = Math.min(1, (frame - 30) / 20);
            const fadeOut = frame > 120 ? Math.max(0, 1 - (frame - 120) / 30) : 1;
            const alpha = fadeIn * fadeOut;

            // Pulsing effect while holding
            const pulse = 1 + Math.sin(frame * 0.1) * 0.05;

            ctx.save();
            ctx.font = `bold ${48 * pulse}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
            ctx.shadowColor = '#60a5fa';
            ctx.shadowBlur = 30 + Math.sin(frame * 0.15) * 10;
            ctx.fillText('STAR DESTROYER', window.innerWidth / 2, window.innerHeight / 2);

            // Subtitle
            if (frame > 50) {
                ctx.font = 'bold 18px Inter, sans-serif';
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
                ctx.shadowBlur = 10;
                ctx.fillText('PREPARE FOR COMBAT', window.innerWidth / 2, window.innerHeight / 2 + 45);
            }
            ctx.restore();
        }

        if (frame < totalFrames) {
            requestAnimationFrame(animate);
        } else {
            transitionCanvas.style.transition = 'opacity 0.3s ease';
            transitionCanvas.style.opacity = '0';
            setTimeout(() => {
                transitionCanvas.remove();
                callback();
            }, 300);
        }
    }
    animate();
}

function startShooterGame() {
    if (shooterActive) return;

    // Hide main site elements first
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
        el.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease';
        el.style.transform = 'scale(0.8)';
        el.style.opacity = '0';
    });

    // Play transition animation then start game
    setTimeout(() => {
        playTransitionAnimation(() => {
            shooterActive = true;
            initShooter();

            shooterCanvas.style.display = 'block';
            shooterUI.style.display = 'block';

            window.addEventListener('keydown', handleShooterKeyDown);
            window.addEventListener('keyup', handleShooterKeyUp);
            shooterCanvas.addEventListener('mousedown', handleShooterMouseDown);
            shooterCanvas.addEventListener('mouseup', handleShooterMouseUp);

            shooterLoop();

            shooter.spawnInterval = setInterval(() => {
                if (shooterActive && shooter.enemies.length < 10) {
                    spawnEnemy();
                    if (Math.random() > 0.6) spawnEnemy();
                }
            }, 1200);
        });
    }, 600);
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
            startAutoFire();
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
            stopAutoFire();
            break;
    }
}

function handleShooterMouseDown(e) {
    if (!shooterActive) return;
    e.preventDefault();
    startAutoFire();
}

function handleShooterMouseUp(e) {
    stopAutoFire();
}

function startAutoFire() {
    if (shootHeld) return;
    shootHeld = true;

    if (canShoot) {
        shootBullet();
        canShoot = false;
        setTimeout(() => canShoot = true, SHOOT_COOLDOWN);
    }

    autoFireInterval = setInterval(() => {
        if (shooterActive && canShoot) {
            shootBullet();
            canShoot = false;
            setTimeout(() => canShoot = true, SHOOT_COOLDOWN);
        }
    }, SHOOT_COOLDOWN + 10);
}

function stopAutoFire() {
    shootHeld = false;
    if (autoFireInterval) {
        clearInterval(autoFireInterval);
        autoFireInterval = null;
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
        if (canShoot) {
            shootBullet();
            canShoot = false;
            setTimeout(() => canShoot = true, SHOOT_COOLDOWN);
        }
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
        speed: 14
    };
    shooter.bullets.push(bullet);

    // Muzzle flash
    for (let i = 0; i < 4; i++) {
        shooter.particles.push({
            x: bullet.x,
            y: bullet.y,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 2 - 1,
            life: 0.4,
            color: '#60a5fa',
            size: 2 + Math.random() * 2
        });
    }
}

function updateShooter() {
    const p = shooter.player;

    // Player movement
    if (shooterKeys.left) p.x -= p.speed;
    if (shooterKeys.right) p.x += p.speed;
    p.x = Math.max(0, Math.min(shooterCanvas.width - p.width, p.x));

    // Update bullets
    shooter.bullets = shooter.bullets.filter(b => {
        b.y -= b.speed;
        return b.y > -b.height;
    });

    // Update background stars (scrolling)
    shooter.bgStars.forEach(star => {
        star.y += star.speed;
        if (star.y > shooterCanvas.height) {
            star.y = 0;
            star.x = Math.random() * shooterCanvas.width;
        }
    });

    // Update enemies
    shooter.enemies = shooter.enemies.filter(enemy => {
        enemy.y += enemy.speed;
        enemy.wobblePhase += enemy.wobbleSpeed;
        enemy.x += Math.sin(enemy.wobblePhase) * 2;

        // Bomber drops bombs
        if (enemy.dropsBomb) {
            enemy.shootTimer++;
            if (enemy.shootTimer > 120) {
                spawnBomb(enemy.x, enemy.y + enemy.size);
                enemy.shootTimer = 0;
            }
        }

        // Check collision with bullets
        for (let i = shooter.bullets.length - 1; i >= 0; i--) {
            const b = shooter.bullets[i];
            const hitDist = enemy.size / 2 + 5;

            if (Math.abs(b.x - enemy.x) < hitDist && Math.abs(b.y - enemy.y) < hitDist) {
                shooter.bullets.splice(i, 1);
                enemy.currentHealth--;

                // Hit particles
                for (let j = 0; j < 6; j++) {
                    shooter.particles.push({
                        x: enemy.x,
                        y: enemy.y,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        life: 0.6,
                        color: enemy.color,
                        size: 3 + Math.random() * 3
                    });
                }

                if (enemy.currentHealth <= 0) {
                    // Destroyed!
                    const now = Date.now();
                    if (now - shooter.lastHitTime < 1500) {
                        shooter.combo = Math.min(shooter.combo + 1, 10);
                    } else {
                        shooter.combo = 1;
                    }
                    shooter.lastHitTime = now;

                    const points = enemy.points * shooter.combo;
                    shooter.score += points;

                    // Explosion
                    shooter.explosions.push({
                        x: enemy.x,
                        y: enemy.y,
                        radius: 5,
                        maxRadius: enemy.size * 2,
                        color: enemy.color,
                        life: 1
                    });

                    // More particles
                    for (let j = 0; j < 15; j++) {
                        const angle = (Math.PI * 2 * j) / 15;
                        shooter.particles.push({
                            x: enemy.x,
                            y: enemy.y,
                            vx: Math.cos(angle) * (3 + Math.random() * 4),
                            vy: Math.sin(angle) * (3 + Math.random() * 4),
                            life: 1,
                            color: enemy.color,
                            size: 3 + Math.random() * 4
                        });
                    }

                    // Score popup
                    shooter.particles.push({
                        x: enemy.x,
                        y: enemy.y,
                        vx: 0,
                        vy: -2,
                        life: 1.5,
                        isText: true,
                        text: '+' + points + (shooter.combo > 1 ? ' x' + shooter.combo : ''),
                        color: shooter.combo > 1 ? '#fbbf24' : '#fff'
                    });

                    return false;
                }
                break;
            }
        }

        // Check collision with player
        if (p.invincible <= 0 &&
            enemy.y + enemy.size/2 > p.y &&
            enemy.x > p.x - enemy.size/2 &&
            enemy.x < p.x + p.width + enemy.size/2 &&
            enemy.y < p.y + p.height) {
            // Player hit - lose health
            p.health--;
            p.invincible = 90; // ~1.5 seconds invincibility
            shooter.combo = 0;

            // Push enemy away
            enemy.y -= 30;

            // Impact effect
            for (let j = 0; j < 15; j++) {
                shooter.particles.push({
                    x: p.x + p.width/2,
                    y: p.y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    life: 1,
                    color: '#ef4444',
                    size: 4 + Math.random() * 5
                });
            }

            // Screen shake and damage flash
            shooter.screenShake = 15;
            shooter.damageFlash = 1;

            // Check for death
            if (p.health <= 0) {
                endShooterGame(true); // true = died
                return false;
            }
        }

        return enemy.y < shooterCanvas.height + 50;
    });

    // Update bombs
    shooter.bombs = shooter.bombs.filter(bomb => {
        bomb.y += bomb.speed;

        // Check collision with player
        if (p.invincible <= 0) {
            const dx = (p.x + p.width/2) - bomb.x;
            const dy = (p.y + p.height/2) - bomb.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < bomb.radius + 20) {
                // Hit by bomb - lose health!
                p.health--;
                p.invincible = 90; // ~1.5 seconds invincibility
                shooter.combo = 0;

                // Explosion
                shooter.explosions.push({
                    x: bomb.x,
                    y: bomb.y,
                    radius: 5,
                    maxRadius: 50,
                    color: '#ef4444',
                    life: 1
                });

                for (let j = 0; j < 20; j++) {
                    shooter.particles.push({
                        x: bomb.x,
                        y: bomb.y,
                        vx: (Math.random() - 0.5) * 10,
                        vy: (Math.random() - 0.5) * 10,
                        life: 1,
                        color: '#ef4444',
                        size: 4 + Math.random() * 4
                    });
                }

                // Screen shake and damage flash
                shooter.screenShake = 12;
                shooter.damageFlash = 1;

                // Check for death
                if (p.health <= 0) {
                    endShooterGame(true); // true = died
                }

                return false;
            }
        }

        return bomb.y < shooterCanvas.height + 20;
    });

    // Update particles
    shooter.particles = shooter.particles.filter(p => {
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        if (p.vy !== undefined && !p.isText) p.vy += 0.1;
        p.life -= 0.025;
        return p.life > 0;
    });

    // Limit particles
    if (shooter.particles.length > 150) {
        shooter.particles = shooter.particles.slice(-150);
    }

    // Update explosions
    shooter.explosions = shooter.explosions.filter(e => {
        e.radius += (e.maxRadius - e.radius) * 0.2;
        e.life -= 0.05;
        return e.life > 0;
    });

    // Update invincibility
    if (p.invincible > 0) {
        p.invincible--;
    }

    // Update screen shake
    if (shooter.screenShake > 0) {
        shooter.screenShake *= 0.9;
        if (shooter.screenShake < 0.5) shooter.screenShake = 0;
    }

    // Update damage flash
    if (shooter.damageFlash > 0) {
        shooter.damageFlash -= 0.05;
        if (shooter.damageFlash < 0) shooter.damageFlash = 0;
    }

    // Update time
    const elapsed = (Date.now() - shooter.gameStartTime) / 1000;
    shooter.timeLeft = Math.max(0, 30 - Math.floor(elapsed));

    // Update UI
    document.getElementById('shooterScore').textContent = shooter.score;
    document.getElementById('shooterTime').textContent = shooter.timeLeft;

    // Update health display
    const healthDisplay = '❤️'.repeat(p.health) + '🖤'.repeat(p.maxHealth - p.health);
    document.getElementById('shooterHealth').textContent = healthDisplay;

    if (shooter.timeLeft <= 0) {
        endShooterGame(false); // false = time ran out, not died
    }
}

function drawShooter() {
    const ctx = shooterCtx;
    const time = Date.now() * 0.001;

    // Apply screen shake
    ctx.save();
    if (shooter.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * shooter.screenShake * 2;
        const shakeY = (Math.random() - 0.5) * shooter.screenShake * 2;
        ctx.translate(shakeX, shakeY);
    }

    // Dark space background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, shooterCanvas.width, shooterCanvas.height);

    // Draw scrolling stars
    shooter.bgStars.forEach(star => {
        const twinkle = Math.sin(time * 3 + star.twinkleOffset) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * twinkle})`;
        ctx.fill();
    });

    // Draw explosions
    shooter.explosions.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        const alpha = Math.floor(e.life * 180).toString(16).padStart(2, '0');
        ctx.fillStyle = e.color + alpha;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * 1.3, 0, Math.PI * 2);
        ctx.strokeStyle = e.color + Math.floor(e.life * 100).toString(16).padStart(2, '0');
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw bombs with warning indicators
    shooter.bombs.forEach(bomb => {
        ctx.save();
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 25;

        // Danger zone indicator (expanding ring)
        const dangerPulse = (time * 3) % 1;
        ctx.strokeStyle = `rgba(239, 68, 68, ${1 - dangerPulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bomb.x, bomb.y, bomb.radius + dangerPulse * 20, 0, Math.PI * 2);
        ctx.stroke();

        // Bomb body
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(bomb.x, bomb.y, bomb.radius, 0, Math.PI * 2);
        ctx.fill();

        // Warning glow
        const pulse = Math.sin(time * 10) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.beginPath();
        ctx.arc(bomb.x, bomb.y, bomb.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Danger text
        ctx.font = 'bold 8px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText('!', bomb.x, bomb.y + 3);

        ctx.restore();
    });

    // Draw enemies
    shooter.enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 15;

        // Pulsing outline to make enemies more visible
        const pulseScale = 1 + Math.sin(time * 5 + enemy.wobblePhase) * 0.1;
        ctx.strokeStyle = enemy.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size / 2 * pulseScale + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Enemy ship shape based on type
        ctx.fillStyle = enemy.color;
        ctx.beginPath();

        if (enemy.type === 'scout') {
            // Small triangle
            ctx.moveTo(0, -enemy.size/2);
            ctx.lineTo(-enemy.size/2, enemy.size/2);
            ctx.lineTo(enemy.size/2, enemy.size/2);
        } else if (enemy.type === 'fighter') {
            // Arrow shape
            ctx.moveTo(0, -enemy.size/2);
            ctx.lineTo(-enemy.size/2, enemy.size/3);
            ctx.lineTo(-enemy.size/4, enemy.size/2);
            ctx.lineTo(enemy.size/4, enemy.size/2);
            ctx.lineTo(enemy.size/2, enemy.size/3);
        } else if (enemy.type === 'bomber') {
            // Hexagon
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 * i) / 6 - Math.PI/2;
                const x = Math.cos(angle) * enemy.size/2;
                const y = Math.sin(angle) * enemy.size/2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
        } else {
            // Elite - diamond
            ctx.moveTo(0, -enemy.size/2);
            ctx.lineTo(-enemy.size/2, 0);
            ctx.lineTo(0, enemy.size/2);
            ctx.lineTo(enemy.size/2, 0);
        }
        ctx.closePath();
        ctx.fill();

        // Core glow
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Health indicator
        if (enemy.currentHealth < enemy.health) {
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-enemy.size/2, enemy.size/2 + 5, enemy.size * (enemy.currentHealth / enemy.health), 3);
        }

        // Enemy type label (small, above enemy)
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.8;
        const typeLabel = enemy.type === 'scout' ? 'SCOUT' :
                          enemy.type === 'fighter' ? 'FIGHTER' :
                          enemy.type === 'bomber' ? '⚠ BOMBER' :
                          '★ ELITE';
        ctx.fillText(typeLabel, 0, -enemy.size/2 - 8);
        ctx.globalAlpha = 1;

        ctx.restore();
    });

    // Draw bullets
    shooter.bullets.forEach(b => {
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 10;

        const bulletGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.height);
        bulletGrad.addColorStop(0, '#fff');
        bulletGrad.addColorStop(0.5, '#60a5fa');
        bulletGrad.addColorStop(1, '#3b82f6');

        ctx.fillStyle = bulletGrad;
        ctx.fillRect(b.x - b.width/2, b.y, b.width, b.height);

        ctx.shadowBlur = 0;
    });

    // Draw particles
    shooter.particles.forEach(p => {
        if (p.isText) {
            ctx.font = 'bold 18px Inter, sans-serif';
            ctx.textAlign = 'center';
            const alpha = Math.min(1, p.life / 0.5);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.fillText(p.text, p.x, p.y);
            ctx.globalAlpha = 1;
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            const alpha = Math.floor(p.life * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = p.color + alpha;
            ctx.fill();
        }
    });

    // Draw player ship
    const pl = shooter.player;

    // Skip drawing every other frame when invincible (flashing effect)
    const shouldDrawPlayer = pl.invincible <= 0 || Math.floor(pl.invincible / 4) % 2 === 0;

    if (shouldDrawPlayer) {
        ctx.save();
        ctx.translate(pl.x + pl.width/2, pl.y + pl.height/2);

        // Change color when invincible
        const shipColor = pl.invincible > 0 ? '#ff6b6b' : '#60a5fa';
        ctx.shadowColor = shipColor;
        ctx.shadowBlur = 20;

    // Ship body
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(0, -pl.height/2);
    ctx.lineTo(-pl.width/2, pl.height/2);
    ctx.lineTo(-pl.width/4, pl.height/3);
    ctx.lineTo(0, pl.height/2 - 5);
    ctx.lineTo(pl.width/4, pl.height/3);
    ctx.lineTo(pl.width/2, pl.height/2);
    ctx.closePath();
    ctx.fill();

        // Ship accent
        ctx.fillStyle = shipColor;
        ctx.beginPath();
        ctx.moveTo(0, -pl.height/3);
        ctx.lineTo(-pl.width/4, pl.height/4);
        ctx.lineTo(pl.width/4, pl.height/4);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#93c5fd';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        // Engine flames
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 15;
        const flameSize = 8 + Math.sin(time * 20) * 3;
        ctx.beginPath();
        ctx.ellipse(-pl.width/4, pl.height/2 + 5, 4, flameSize, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(pl.width/4, pl.height/2 + 5, 4, flameSize + 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Combo indicator
    if (shooter.combo > 1) {
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fillText(`COMBO x${shooter.combo}!`, shooterCanvas.width / 2, shooterCanvas.height - 30);
        ctx.shadowBlur = 0;
    }

    // Damage flash (red vignette when hit)
    if (shooter.damageFlash > 0) {
        const flashGrad = ctx.createRadialGradient(
            shooterCanvas.width / 2, shooterCanvas.height / 2, 0,
            shooterCanvas.width / 2, shooterCanvas.height / 2, shooterCanvas.width * 0.7
        );
        flashGrad.addColorStop(0, 'transparent');
        flashGrad.addColorStop(0.5, `rgba(239, 68, 68, ${shooter.damageFlash * 0.3})`);
        flashGrad.addColorStop(1, `rgba(239, 68, 68, ${shooter.damageFlash * 0.6})`);
        ctx.fillStyle = flashGrad;
        ctx.fillRect(0, 0, shooterCanvas.width, shooterCanvas.height);
    }

    // Time warning (yellow/orange pulsing border - different from damage)
    if (shooter.timeLeft <= 5 && shooter.timeLeft > 0) {
        const pulse = Math.sin(time * 8) * 0.5 + 0.5;
        const borderSize = 8 + pulse * 4;

        // Top border
        const warnGrad = ctx.createLinearGradient(0, 0, 0, borderSize * 3);
        warnGrad.addColorStop(0, `rgba(251, 191, 36, ${0.4 + pulse * 0.3})`);
        warnGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = warnGrad;
        ctx.fillRect(0, 0, shooterCanvas.width, borderSize * 3);

        // Bottom border
        const warnGrad2 = ctx.createLinearGradient(0, shooterCanvas.height, 0, shooterCanvas.height - borderSize * 3);
        warnGrad2.addColorStop(0, `rgba(251, 191, 36, ${0.4 + pulse * 0.3})`);
        warnGrad2.addColorStop(1, 'transparent');
        ctx.fillStyle = warnGrad2;
        ctx.fillRect(0, shooterCanvas.height - borderSize * 3, shooterCanvas.width, borderSize * 3);

        // "HURRY!" text
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(251, 191, 36, ${0.6 + pulse * 0.4})`;
        ctx.fillText('HURRY!', shooterCanvas.width / 2, 70);
    }

    // Version
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('v2.0', shooterCanvas.width - 15, shooterCanvas.height - 15);

    // Restore from screen shake
    ctx.restore();
}

function shooterLoop() {
    if (!shooterActive) return;

    updateShooter();
    drawShooter();

    shooterAnimationId = requestAnimationFrame(shooterLoop);
}

function endShooterGame(died = false) {
    clearInterval(shooter.spawnInterval);
    if (autoFireInterval) {
        clearInterval(autoFireInterval);
        autoFireInterval = null;
    }
    if (touchAutoFire) {
        clearInterval(touchAutoFire);
        touchAutoFire = null;
    }
    shootHeld = false;

    const finalScore = shooter.score;
    const missionSuccess = !died && finalScore >= MISSION_SUCCESS_SCORE;
    const missionFailed = died || finalScore < MISSION_SUCCESS_SCORE;

    const endScreen = document.createElement('div');
    endScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 2500;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: 'Inter', sans-serif;
    `;

    if (missionSuccess) {
        endScreen.innerHTML = `
            <div style="font-size: 3rem; color: #10b981; margin-bottom: 20px; text-shadow: 0 0 30px rgba(16, 185, 129, 0.5);">MISSION SUCCESS</div>
            <div style="font-size: 1.5rem; margin-bottom: 10px;">Final Score</div>
            <div style="font-size: 4rem; color: #10b981; font-weight: bold; margin-bottom: 30px;">${finalScore}</div>
            <div style="font-size: 1rem; color: #888;">Returning to base...</div>
        `;
    } else {
        const failReason = died ? 'Ship Destroyed!' : `Need ${MISSION_SUCCESS_SCORE} points to pass`;
        endScreen.innerHTML = `
            <div style="font-size: 3rem; color: #ef4444; margin-bottom: 20px; text-shadow: 0 0 30px rgba(239, 68, 68, 0.5);">MISSION FAILED</div>
            <div style="font-size: 1.2rem; margin-bottom: 15px; color: #f87171;">${failReason}</div>
            <div style="font-size: 1.5rem; margin-bottom: 10px;">Final Score</div>
            <div style="font-size: 3rem; color: #f87171; font-weight: bold; margin-bottom: 30px;">${finalScore}</div>
            <div style="font-size: 1rem; color: #888;">Returning to base...</div>
        `;
    }
    document.body.appendChild(endScreen);

    // Flash effect (green for success, red for fail)
    const flashColor = missionSuccess ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, ${flashColor} 0%, transparent 70%);
        z-index: 2450;
        pointer-events: none;
        animation: flashOut 0.8s ease-out forwards;
    `;
    document.body.appendChild(flash);

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

    setTimeout(() => {
        cleanupAndExit(endScreen);
    }, 3000);
}

function cleanupAndExit(endScreen) {
    endScreen.style.transition = 'opacity 0.5s ease';
    endScreen.style.opacity = '0';

    setTimeout(() => {
        endScreen.remove();

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
            el.style.transform = '';
            el.style.opacity = '';
        });

        shooterCanvas.style.transition = 'opacity 0.5s ease';
        shooterCanvas.style.opacity = '0';

        setTimeout(() => {
            shooterActive = false;
            cancelAnimationFrame(shooterAnimationId);
            window.removeEventListener('keydown', handleShooterKeyDown);
            window.removeEventListener('keyup', handleShooterKeyUp);
            shooterCanvas.removeEventListener('mousedown', handleShooterMouseDown);
            shooterCanvas.removeEventListener('mouseup', handleShooterMouseUp);

            shooterCanvas.style.display = 'none';
            shooterCanvas.style.opacity = '1';
            shooterCanvas.style.transition = '';
            shooterUI.style.display = 'none';

            mainElements.forEach(el => {
                el.style.transition = '';
                el.style.transform = '';
                el.style.opacity = '';
            });

            shooterKeys.left = false;
            shooterKeys.right = false;
            shooterKeys.shoot = false;

            // Reset slot machine
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

            const spinBtn = document.getElementById('spinBtn');
            if (spinBtn) spinBtn.disabled = false;

            const leftoverBanners = document.querySelectorAll('.slot-jackpot-banner');
            leftoverBanners.forEach(b => b.remove());
        }, 500);
    }, 500);
}

window.addEventListener('resize', () => {
    if (shooterActive) {
        shooterCanvas.width = window.innerWidth;
        shooterCanvas.height = window.innerHeight;
        shooter.player.y = shooterCanvas.height - 80;
    }
});
