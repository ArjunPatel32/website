// ========================================
// BLACK HOLE SUCK-IN EFFECT
// ========================================
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

// Get black hole center position
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

    const triggerDistance = 120;
    const warningDistance = 400;

    // Update CSS variables for gradient positioning
    const bhXPercent = (bhCenter.x / window.innerWidth) * 100;
    const bhYPercent = (bhCenter.y / window.innerHeight) * 100;

    proximityWarningEl.style.setProperty('--bh-x', bhXPercent + '%');
    proximityWarningEl.style.setProperty('--bh-y', bhYPercent + '%');

    // Proximity warning glow with steep falloff - super obvious effect
    if (distance < warningDistance && distance > triggerDistance) {
        const normalizedDist = (distance - triggerDistance) / (warningDistance - triggerDistance);
        const intensity = Math.pow(1 - normalizedDist, 3); // Steeper falloff
        proximityWarningEl.style.opacity = Math.min(1, intensity * 1.5); // Boost intensity

        // Screen shake and vignette intensify as you get closer
        const shakeAmount = (1 - normalizedDist) * 3;
        document.body.style.transform = `translate(${(Math.random() - 0.5) * shakeAmount}px, ${(Math.random() - 0.5) * shakeAmount}px)`;

        // Pull cursor toward black hole visually (scale black hole)
        const bhScale = 1 + (1 - normalizedDist) * 0.3;
        blackHole.style.transform = `scale(${bhScale})`;

        // Intense glow on black hole itself
        const glowIntensity = (1 - normalizedDist) * 30;
        blackHole.style.filter = `drop-shadow(0 0 ${glowIntensity}px #8b5cf6) drop-shadow(0 0 ${glowIntensity * 2}px #ec4899)`;
    } else {
        proximityWarningEl.style.opacity = 0;
        document.body.style.transform = '';
        blackHole.style.transform = '';
        blackHole.style.filter = '';
    }

    // Trigger the suck-in!
    if (distance < triggerDistance) {
        document.body.style.transform = '';
        triggerBlackHoleSuckIn(bhCenter, bhXPercent, bhYPercent);
    }
});

function triggerBlackHoleSuckIn(bhCenter, bhXPercent, bhYPercent) {
    if (blackHoleActive) return;
    blackHoleActive = true;
    storedBhCenter = { ...bhCenter };

    proximityWarningEl.style.opacity = 0;
    document.body.classList.add('sucking');

    blackHole.style.opacity = '0';

    // Clone the black hole for expansion animation
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

    // Calculate suck-in transforms
    elementsToSuck.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;

        const translateX = bhCenter.x - elCenterX;
        const translateY = bhCenter.y - elCenterY;

        const distance = Math.sqrt(translateX * translateX + translateY * translateY);
        const delay = Math.min(distance / 2000, 0.3);

        el.style.transitionDelay = delay + 's';
        el.style.transform = `translate(${translateX}px, ${translateY}px) scale(0) rotate(${Math.random() * 720 - 360}deg)`;
        el.style.opacity = '0';
        el.style.filter = 'blur(10px)';
    });

    // Animate the black hole expansion
    let scale = 1;
    const maxScale = 80;
    const growInterval = setInterval(() => {
        scale += 1.2;
        expandedBlackHole.style.transform = `translate(-50%, -50%) scale(${scale})`;

        if (scale > 30) {
            screenBlackout.classList.add('active');
        }

        if (scale >= maxScale) {
            clearInterval(growInterval);
        }
    }, 20);

    // After suck-in completes, collapse
    setTimeout(() => {
        collapseAndExplode(originalTransforms);
    }, 2000);
}

function collapseAndExplode(originalTransforms) {
    const bhCenter = storedBhCenter;

    // Create singularity point
    const singularity = document.createElement('div');
    singularity.className = 'singularity';
    singularity.style.left = bhCenter.x + 'px';
    singularity.style.top = bhCenter.y + 'px';
    document.body.appendChild(singularity);

    // Collapse the expanded black hole
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

    // Reset everything
    setTimeout(() => {
        resetEverything(originalTransforms);
    }, 300);
}

function resetEverything(originalTransforms) {
    document.body.classList.remove('sucking');

    // Instead of resetting, start the platformer game!
    // The black hole has consumed everything - now escape the void!

    // Keep screen dark and transition to game
    screenBlackout.classList.add('active');

    // Brief pause in darkness before game starts
    setTimeout(() => {
        // Start the platformer game
        if (typeof startPlatformerGame === 'function') {
            startPlatformerGame();
        }

        // Fade out blackout
        setTimeout(() => {
            screenBlackout.classList.remove('active');
        }, 500);

        // Reset black hole state after game can be triggered again
        blackHoleActive = false;
        storedBhCenter = null;

        // Reset black hole visibility
        blackHole.style.opacity = '';

        // Elements will be restored when the platformer game ends
        // Store original transforms for later restoration
        window.blackHoleOriginalTransforms = originalTransforms;
    }, 800);
}

// Called when platformer game ends to restore elements (if triggered by black hole)
function restoreAfterPlatformer() {
    const originalTransforms = window.blackHoleOriginalTransforms;
    if (!originalTransforms) return;

    originalTransforms.forEach(({ el }) => {
        el.style.transition = 'none';
        el.style.filter = 'blur(5px)';
    });

    document.body.offsetHeight;

    originalTransforms.forEach(({ el }, index) => {
        const delay = Math.random() * 0.3;

        setTimeout(() => {
            el.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-out, filter 0.4s ease-out';
            el.style.transform = '';
            el.style.opacity = '';
            el.style.filter = '';
        }, delay * 1000);
    });

    setTimeout(() => {
        originalTransforms.forEach(({ el }) => {
            el.style.transition = '';
            el.style.transitionDelay = '';
        });
        window.blackHoleOriginalTransforms = null;
    }, 1500);
}
