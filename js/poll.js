// ========================================
// POLL PRANK SYSTEM
// ========================================
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const pollButtons = document.getElementById('pollButtons');
const pollResult = document.getElementById('pollResult');
const poll = document.getElementById('poll');

let thumbsCount = 0;
const maxThumbs = 30;

function moveNoButton(mouseX, mouseY) {
    const boxWidth = 300;
    const boxHeight = 160;

    const newLeft = (Math.random() - 0.5) * boxWidth;
    const newTop = (Math.random() - 0.5) * boxHeight;

    noBtn.style.position = 'relative';
    noBtn.style.left = newLeft + 'px';
    noBtn.style.top = newTop + 'px';
    noBtn.style.transform = `rotate(${(Math.random() - 0.5) * 20}deg)`;

    if (thumbsCount < maxThumbs) {
        spawnThumbsDown();
    }
}

function spawnThumbsDown() {
    const thumb = document.createElement('span');
    thumb.textContent = '\uD83D\uDC4E';
    thumb.className = 'floating-thumb';

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
    permanentThumb.textContent = '\uD83D\uDC4E';
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
    const allThumbs = poll.querySelectorAll('span');
    allThumbs.forEach(thumb => {
        if (thumb.textContent === '\uD83D\uDC4E') {
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
        vy += 0.3;
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
