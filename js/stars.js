// ========================================
// STAR FIELD ANIMATION
// ========================================
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

let stars = [];
let shootingStars = [];
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;

function resizeStarCanvas() {
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
            depth: Math.random() * 3 + 1,
            color: Math.random() > 0.92 ?
                `hsl(${Math.random() * 60 + 240}, 30%, 65%)` :
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
            hue: Math.random() * 60 + 200
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

function animateStars(time) {
    drawStars(time);
    requestAnimationFrame(animateStars);
}

// Add subtle parallax to container on mouse move
const container = document.querySelector('.container');
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    container.style.transform = `translate(${moveX}px, ${moveY}px)`;
});

// Initialize
window.addEventListener('resize', resizeStarCanvas);
resizeStarCanvas();
animateStars(0);
