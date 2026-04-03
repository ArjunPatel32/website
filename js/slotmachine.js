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
            slotResult.textContent = '\u2728 Nice! \u2728';
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

    // Slot machine glow effect
    slotMachine.classList.add('winning');
    setTimeout(() => slotMachine.classList.remove('winning'), 3000);

    // Update result text
    slotResult.textContent = '\uD83C\uDF89 JACKPOT! \uD83C\uDF89';
    slotResult.style.color = '#fbbf24';
    slotResult.classList.add('jackpot');

    // Confetti burst (smaller, quicker)
    for (let i = 0; i < 30; i++) {
        createSlotConfetti();
    }

    // Start dimming the screen (except mascot) almost immediately
    setTimeout(() => {
        createDimOverlayAndFall();
    }, 600);
}

function createDimOverlayAndFall() {
    // Create a dark overlay that dims everything except the mascot
    const dimOverlay = document.createElement('div');
    dimOverlay.className = 'jackpot-dim-overlay';
    dimOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0);
        z-index: 1400;
        pointer-events: none;
        transition: background 0.8s ease;
    `;
    document.body.appendChild(dimOverlay);

    // Make sure the mascot canvas is above the dim overlay
    const mascotCanvas = document.getElementById('mascot');
    mascotCanvas.style.zIndex = '1500';

    // Gradually dim the screen
    requestAnimationFrame(() => {
        dimOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
    });

    // After dimming, create trapdoor and drop
    setTimeout(() => {
        createTrapdoorAndFall();

        // Remove dim overlay when mascot falls through
        setTimeout(() => {
            dimOverlay.style.background = 'rgba(0, 0, 0, 0)';
            setTimeout(() => {
                dimOverlay.remove();
                mascotCanvas.style.zIndex = '';
            }, 800);
        }, 1500);
    }, 800);
}

function createTrapdoorAndFall() {
    // Create trapdoor overlay under the mascot
    const trapdoor = document.createElement('div');
    trapdoor.className = 'trapdoor-container';
    trapdoor.innerHTML = `
        <div class="trapdoor-left"></div>
        <div class="trapdoor-right"></div>
        <div class="trapdoor-void"></div>
    `;
    document.body.appendChild(trapdoor);

    // Position trapdoor around the mascot (canvas is fixed at 0,0 so mascot coords are viewport coords)
    trapdoor.style.cssText = `
        position: fixed;
        left: ${mascot.x + mascot.width / 2 - 60}px;
        top: ${mascot.y + mascot.height - 20}px;
        width: 120px;
        height: 60px;
        z-index: 1500;
        pointer-events: none;
    `;

    // Style the trapdoor pieces
    const leftDoor = trapdoor.querySelector('.trapdoor-left');
    const rightDoor = trapdoor.querySelector('.trapdoor-right');
    const voidBg = trapdoor.querySelector('.trapdoor-void');

    const doorStyle = `
        position: absolute;
        width: 50%;
        height: 20px;
        background: linear-gradient(180deg, #2d1f3d 0%, #1a1225 100%);
        border: 2px solid #fbbf24;
        top: 0;
        transition: transform 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53);
        transform-origin: top;
        box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
    `;

    leftDoor.style.cssText = doorStyle + 'left: 0; border-radius: 4px 0 0 4px; transform-origin: top left;';
    rightDoor.style.cssText = doorStyle + 'right: 0; border-radius: 0 4px 4px 0; transform-origin: top right;';

    voidBg.style.cssText = `
        position: absolute;
        top: 20px;
        left: 10%;
        width: 80%;
        height: 40px;
        background: radial-gradient(ellipse, #000 0%, #050508 50%, transparent 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    // Animate trapdoor opening
    setTimeout(() => {
        leftDoor.style.transform = 'rotateX(-110deg)';
        rightDoor.style.transform = 'rotateX(-110deg)';
        voidBg.style.opacity = '1';

        // Screen shake when trapdoor opens
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 300);

        // Start mascot falling after doors open
        setTimeout(() => {
            mascotFallIntoGame();

            // Remove trapdoor after mascot falls through
            setTimeout(() => {
                trapdoor.style.transition = 'opacity 0.5s ease';
                trapdoor.style.opacity = '0';
                setTimeout(() => trapdoor.remove(), 500);
            }, 800);
        }, 400);
    }, 100);
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
