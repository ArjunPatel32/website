// ========================================
// SLOT MACHINE & JACKPOT SYSTEM
// ========================================
const symbols = ['\u2660\uFE0F', '\u2665\uFE0F', '\u2666\uFE0F', '\u2663\uFE0F', '\uD83C\uDCCF', '\uD83D\uDC51', '\uD83D\uDCB0', '7\uFE0F\u20E3'];
const spinBtn = document.getElementById('spinBtn');
const reel1 = document.getElementById('reel1');
const reel2 = document.getElementById('reel2');
const reel3 = document.getElementById('reel3');
const slotResult = document.getElementById('slotResult');

let isSpinning = false;
let spinCount = 0;
let guaranteedJackpotSpin = 2 + Math.floor(Math.random() * 2); // Random spin 2 or 3

spinBtn.addEventListener('click', () => {
    if (isSpinning) return;
    spinCount++;
    isSpinning = true;
    spinBtn.disabled = true;
    slotResult.textContent = '';

    reel1.classList.add('spinning');
    reel2.classList.add('spinning');
    reel3.classList.add('spinning');

    // Spin animation
    let animCount = 0;
    const spinInterval = setInterval(() => {
        reel1.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel2.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        reel3.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        animCount++;
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

        // Guarantee jackpot on spin 2-3, otherwise 25% chance after that
        const isGuaranteedSpin = spinCount === guaranteedJackpotSpin;
        const forceJackpot = isGuaranteedSpin || (spinCount > 3 && Math.random() < 0.25);

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
            slotResult.textContent = 'So close!';
            slotResult.style.color = '#f59e0b';
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

    // Slot machine glow effect
    slotMachine.classList.add('winning');
    setTimeout(() => slotMachine.classList.remove('winning'), 3000);

    // Update result text with animated jackpot
    slotResult.textContent = '\uD83C\uDF89 JACKPOT! \uD83C\uDF89';
    slotResult.style.color = '#fbbf24';
    slotResult.classList.add('jackpot');

    // Quick jackpot banner animation on the slot machine
    const jackpotBanner = document.createElement('div');
    jackpotBanner.className = 'slot-jackpot-banner';
    jackpotBanner.innerHTML = '\uD83D\uDCB0 JACKPOT! \uD83D\uDCB0';
    jackpotBanner.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        font-size: 28px;
        font-weight: bold;
        color: #fbbf24;
        text-shadow: 0 0 10px #fbbf24, 0 0 20px #f59e0b, 0 0 30px #d97706;
        white-space: nowrap;
        z-index: 10;
        animation: jackpotPop 0.8s ease-out forwards;
    `;
    slotMachine.style.position = 'relative';
    slotMachine.appendChild(jackpotBanner);

    // Add the animation keyframes if not already present
    if (!document.getElementById('jackpotPopKeyframes')) {
        const style = document.createElement('style');
        style.id = 'jackpotPopKeyframes';
        style.textContent = `
            @keyframes jackpotPop {
                0% { transform: translate(-50%, -50%) scale(0) rotate(-10deg); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.3) rotate(5deg); opacity: 1; }
                70% { transform: translate(-50%, -50%) scale(1.1) rotate(-2deg); }
                100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    // Confetti burst (smaller, quicker)
    for (let i = 0; i < 30; i++) {
        createSlotConfetti();
    }

    // Remove banner and start dimming after quick animation
    setTimeout(() => {
        jackpotBanner.style.animation = 'none';
        jackpotBanner.style.transform = 'translate(-50%, -50%) scale(1)';
        jackpotBanner.style.opacity = '0';
        jackpotBanner.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            jackpotBanner.remove();
            // Reset slot machine position style
            slotMachine.style.position = '';
        }, 300);
        createDimOverlayAndFall();
    }, 1000);
}

function createDimOverlayAndFall() {
    // For jackpot, go directly to the shooter game's hyperspace transition
    // Skip the intermediate text - let the hyperspace animation handle it

    // Quick gold flash before transition
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at center, rgba(251, 191, 36, 0.6) 0%, rgba(251, 191, 36, 0.3) 50%, transparent 100%);
        z-index: 1500;
        pointer-events: none;
        animation: jackpotFlash 0.6s ease-out forwards;
    `;
    document.body.appendChild(flash);

    // Add flash animation
    if (!document.getElementById('jackpotFlashKeyframes')) {
        const style = document.createElement('style');
        style.id = 'jackpotFlashKeyframes';
        style.textContent = `
            @keyframes jackpotFlash {
                0% { opacity: 0; transform: scale(0.5); }
                30% { opacity: 1; transform: scale(1.2); }
                100% { opacity: 0; transform: scale(2); }
            }
        `;
        document.head.appendChild(style);
    }

    // Go directly to the shooter game (which has its own hyperspace transition)
    setTimeout(() => {
        flash.remove();

        // Start the shooter game!
        if (typeof startShooterGame === 'function') {
            startShooterGame();
        }
    }, 500);
}

function createIrisCloseEffect() {
    const mascotCanvas = document.getElementById('mascot');
    mascotCanvas.style.zIndex = '1500';

    // Create canvas for iris effect
    const irisCanvas = document.createElement('canvas');
    irisCanvas.id = 'irisCloseCanvas';
    irisCanvas.width = window.innerWidth;
    irisCanvas.height = window.innerHeight;
    irisCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1400;
        pointer-events: none;
    `;
    document.body.appendChild(irisCanvas);

    const ctx = irisCanvas.getContext('2d');

    // Lock mascot position at start of iris effect
    const lockedMascotX = mascot.x + mascot.width / 2;
    const lockedMascotY = mascot.y + mascot.height / 2;

    // Calculate max radius needed to cover entire screen
    const maxRadius = Math.sqrt(
        Math.pow(Math.max(lockedMascotX, window.innerWidth - lockedMascotX), 2) +
        Math.pow(Math.max(lockedMascotY, window.innerHeight - lockedMascotY), 2)
    ) + 100;

    let currentRadius = maxRadius;
    const targetRadius = 50;
    let phase = 'closing';
    let holdTimer = 0;

    function animateIris() {
        ctx.clearRect(0, 0, irisCanvas.width, irisCanvas.height);

        if (phase === 'closing') {
            currentRadius -= 12; // Steady fast close
            if (currentRadius <= targetRadius) {
                currentRadius = targetRadius;
                phase = 'holding';
            }
        } else if (phase === 'holding') {
            holdTimer++;
            currentRadius = targetRadius + Math.sin(holdTimer * 0.15) * 3;

            if (holdTimer > 40) {
                phase = 'complete';
                // Start the fall immediately
                mascotFallIntoGame();

                // Fade out iris
                setTimeout(() => {
                    irisCanvas.style.transition = 'opacity 0.4s ease';
                    irisCanvas.style.opacity = '0';
                    setTimeout(() => {
                        irisCanvas.remove();
                        mascotCanvas.style.zIndex = '';
                    }, 400);
                }, 800);
            }
        }

        if (phase !== 'complete') {
            // Draw iris centered on locked position
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.rect(0, 0, irisCanvas.width, irisCanvas.height);
            ctx.moveTo(lockedMascotX + currentRadius, lockedMascotY);
            ctx.arc(lockedMascotX, lockedMascotY, currentRadius, 0, Math.PI * 2, true);
            ctx.fill();

            ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(lockedMascotX, lockedMascotY, currentRadius + 2, 0, Math.PI * 2);
            ctx.stroke();

            requestAnimationFrame(animateIris);
        }
    }

    requestAnimationFrame(animateIris);
}

function createTrapdoorAndFall() {
    // Get the platform position FIRST before creating anything
    let trapdoorCenterX, trapdoorTopY;
    if (mascot.targetCenterPlatform) {
        const plat = mascot.targetCenterPlatform;
        trapdoorCenterX = plat.x + plat.width / 2;
        trapdoorTopY = plat.y;
    } else {
        trapdoorCenterX = mascot.x + mascot.width / 2;
        trapdoorTopY = mascot.y + mascot.height;
    }

    // Create trapdoor overlay - doors only, no void element
    const trapdoor = document.createElement('div');
    trapdoor.className = 'trapdoor-container';
    trapdoor.innerHTML = `
        <div class="trapdoor-left"></div>
        <div class="trapdoor-right"></div>
    `;
    document.body.appendChild(trapdoor);

    // Position trapdoor exactly at the platform
    trapdoor.style.cssText = `
        position: fixed;
        left: ${trapdoorCenterX - 70}px;
        top: ${trapdoorTopY - 10}px;
        width: 140px;
        height: 40px;
        z-index: 1450;
        pointer-events: none;
    `;

    // Style the trapdoor pieces
    const leftDoor = trapdoor.querySelector('.trapdoor-left');
    const rightDoor = trapdoor.querySelector('.trapdoor-right');

    const doorStyle = `
        position: absolute;
        width: 50%;
        height: 24px;
        background: linear-gradient(180deg, #2d1f3d 0%, #1a1225 100%);
        border: 2px solid #fbbf24;
        top: 0;
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform-origin: top;
        box-shadow: 0 0 15px rgba(251, 191, 36, 0.4);
    `;

    leftDoor.style.cssText = doorStyle + 'left: 0; border-radius: 4px 0 0 4px; transform-origin: top left;';
    rightDoor.style.cssText = doorStyle + 'right: 0; border-radius: 0 4px 4px 0; transform-origin: top right;';

    // Step 1: Open the trapdoor doors immediately
    setTimeout(() => {
        leftDoor.style.transform = 'rotateX(-100deg)';
        rightDoor.style.transform = 'rotateX(-100deg)';

        // Screen shake when trapdoor opens
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 200);
    }, 100);

    // Step 2: AFTER doors are open, make mascot fall
    setTimeout(() => {
        mascotFallIntoGame();
    }, 700);

    // Step 3: Remove trapdoor after mascot has fallen through
    setTimeout(() => {
        trapdoor.style.transition = 'opacity 0.5s ease';
        trapdoor.style.opacity = '0';
        setTimeout(() => trapdoor.remove(), 500);
    }, 1500);
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
const cards = ['\uD83C\uDCA1', '\uD83C\uDCA2', '\uD83C\uDCA3', '\uD83C\uDCA4', '\uD83C\uDCA5', '\uD83C\uDCA6', '\uD83C\uDCA7', '\uD83C\uDCA8', '\uD83C\uDCA9', '\uD83C\uDCAA', '\uD83C\uDCAB', '\uD83C\uDCAD', '\uD83C\uDCAE',
               '\uD83C\uDCC1', '\uD83C\uDCC2', '\uD83C\uDCC3', '\uD83C\uDCC4', '\uD83C\uDCC5', '\uD83C\uDCC6', '\uD83C\uDCC7', '\uD83C\uDCC8', '\uD83C\uDCC9', '\uD83C\uDCCA', '\uD83C\uDCCB', '\uD83C\uDCCD', '\uD83C\uDCCE',
               '\uD83C\uDCD1', '\uD83C\uDCD2', '\uD83C\uDCD3', '\uD83C\uDCD4', '\uD83C\uDCD5', '\uD83C\uDCD6', '\uD83C\uDCD7', '\uD83C\uDCD8', '\uD83C\uDCD9', '\uD83C\uDCDA', '\uD83C\uDCDB', '\uD83C\uDCDD', '\uD83C\uDCDE'];

let easterEggTriggered = false;

pokerCard.addEventListener('click', () => {
    if (easterEggTriggered) return;
    easterEggTriggered = true;

    pokerCard.style.opacity = '0';
    pokerCard.style.pointerEvents = 'none';

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
        setTimeout(() => {
            pokerCard.style.opacity = '1';
            pokerCard.style.pointerEvents = 'auto';
            easterEggTriggered = false;
        }, 1000);
    }, 5000);
});
