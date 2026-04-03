// ========================================
// INTERACTIVE NEBULA EFFECT
// ========================================
const spiralGalaxy = document.querySelector('.spiral-galaxy');

if (spiralGalaxy) {
    // Nebula drift state - NO MAX OFFSET (unlimited push)
    const nebulaState = {
        offsetX: 0,
        offsetY: 0,
        targetOffsetX: 0,
        targetOffsetY: 0,
        velocityX: 0,
        velocityY: 0,
        pushRadius: 200, // How close mouse needs to be to push nebula
        pushStrength: 0.15 // Much gentler push - like pushing a cloud
    };

    // Get nebula's original position
    const nebulaRect = spiralGalaxy.getBoundingClientRect();
    const originalX = nebulaRect.left + nebulaRect.width / 2;
    const originalY = nebulaRect.top + nebulaRect.height / 2;

    // Get nebula center position
    function getNebulaCenterPos() {
        return {
            x: originalX + nebulaState.offsetX,
            y: originalY + nebulaState.offsetY
        };
    }

    // Update nebula on mouse move - push it away like a cloud
    document.addEventListener('mousemove', (e) => {
        const nebulaCenter = getNebulaCenterPos();
        const dx = e.clientX - nebulaCenter.x;
        const dy = e.clientY - nebulaCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < nebulaState.pushRadius && distance > 0) {
            // Calculate push direction (away from mouse)
            // Use smooth falloff - stronger when closer
            const pushFactor = Math.pow(1 - distance / nebulaState.pushRadius, 2) * nebulaState.pushStrength;

            // Add velocity in the opposite direction of mouse
            // This creates a gentle "push" effect
            nebulaState.velocityX -= (dx / distance) * pushFactor * 3;
            nebulaState.velocityY -= (dy / distance) * pushFactor * 3;
        }
    });

    // Smooth animation loop for nebula drift - slow cloud-like movement
    function animateNebula() {
        // Apply very light friction - clouds drift slowly
        const friction = 0.995; // Very low friction for slow drift
        nebulaState.velocityX *= friction;
        nebulaState.velocityY *= friction;

        // Add tiny random drift for organic cloud movement
        nebulaState.velocityX += (Math.random() - 0.5) * 0.02;
        nebulaState.velocityY += (Math.random() - 0.5) * 0.02;

        // Clamp max velocity for smooth movement
        const maxVel = 2;
        const vel = Math.sqrt(nebulaState.velocityX ** 2 + nebulaState.velocityY ** 2);
        if (vel > maxVel) {
            nebulaState.velocityX = (nebulaState.velocityX / vel) * maxVel;
            nebulaState.velocityY = (nebulaState.velocityY / vel) * maxVel;
        }

        // Apply velocity to offset
        nebulaState.offsetX += nebulaState.velocityX;
        nebulaState.offsetY += nebulaState.velocityY;

        // Very gentle pull back toward original position
        // This prevents nebula from drifting off forever, but very slowly
        const returnStrength = 0.0003; // Extremely gentle return
        nebulaState.velocityX -= nebulaState.offsetX * returnStrength;
        nebulaState.velocityY -= nebulaState.offsetY * returnStrength;

        // Keep nebula on screen with soft bouncing at edges
        const padding = 50;
        const nebulaSize = 90; // Half the nebula size

        const currentX = originalX + nebulaState.offsetX;
        const currentY = originalY + nebulaState.offsetY;

        // Soft edge bouncing
        if (currentX < padding + nebulaSize) {
            nebulaState.velocityX += 0.1;
            nebulaState.offsetX = Math.max(nebulaState.offsetX, padding + nebulaSize - originalX);
        }
        if (currentX > window.innerWidth - padding - nebulaSize) {
            nebulaState.velocityX -= 0.1;
            nebulaState.offsetX = Math.min(nebulaState.offsetX, window.innerWidth - padding - nebulaSize - originalX);
        }
        if (currentY < padding + nebulaSize) {
            nebulaState.velocityY += 0.1;
            nebulaState.offsetY = Math.max(nebulaState.offsetY, padding + nebulaSize - originalY);
        }
        if (currentY > window.innerHeight - padding - nebulaSize) {
            nebulaState.velocityY -= 0.1;
            nebulaState.offsetY = Math.min(nebulaState.offsetY, window.innerHeight - padding - nebulaSize - originalY);
        }

        // Apply transform
        spiralGalaxy.style.transform = `translate(${nebulaState.offsetX}px, ${nebulaState.offsetY}px)`;

        requestAnimationFrame(animateNebula);
    }

    animateNebula();
}
