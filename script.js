const prevDigits = {};

// Initial setup: Each group gets static top/bottom
function initDigits() {
    document.querySelectorAll('.flip-group').forEach(group => {
        const digit = 0;
        group.innerHTML = `
            <div class="flip-card top">${digit}</div>
            <div class="flip-card bottom">${digit}</div>
        `;
        prevDigits[group.id] = digit;
    });
}

function flip(id, newDigit) {
    const group = document.getElementById(id);
    const oldDigit = prevDigits[id] ?? 0;
    
    if (newDigit === oldDigit) return;

    // Set up flipping structure
    group.innerHTML = `
        <div class="flip-card top">${oldDigit}</div>
        <div class="flip-card bottom">${oldDigit}</div>
        <div class="flip-card top" style="transform: rotateX(-180deg);">${newDigit}</div>
        <div class="flip-card bottom" style="transform: rotateX(180deg);">${newDigit}</div>
    `;

    // Trigger animation
    requestAnimationFrame(() => {
        group.classList.add('flipping');
        if (soundToggle.checked) flipSound.play();
    });

    // Clean up after animation
    setTimeout(() => {
        group.innerHTML = `
            <div class="flip-card top">${newDigit}</div>
            <div class="flip-card bottom">${newDigit}</div>
        `;
        group.classList.remove('flipping');
        prevDigits[id] = newDigit;
    }, 800); // Matches animation duration
}

// In DOMContentLoaded, after other init:
initDigits();
startClock(); // Or your mode
