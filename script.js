let zenMode = false;

// Init starry background (generate more dynamic stars)
function initStars() {
    const starsContainer = document.querySelector('.stars');
    for (let i = 0; i < 100; i++) { // Add JS-generated stars for variety
        const star = document.createElement('div');
        star.className = 'star';
        star.style.position = 'absolute';
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.background = '#fff';
        star.style.borderRadius = '50%';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animation = `twinkle ${Math.random() * 5 + 3}s infinite`;
        starsContainer.appendChild(star);
    }
}

// Shooting star random trigger
function triggerShootingStar() {
    const star = document.getElementById('shooting-star');
    star.style.top = `${Math.random() * 50}%`;
    star.style.left = `${Math.random() * 50}%`;
    star.style.display = 'block';
    setTimeout(() => { star.style.display = 'none'; }, 1000);
    setTimeout(triggerShootingStar, Math.random() * 20000 + 10000); // Every 10-30s
}

// Auto-theme cycle based on time
function autoTheme() {
    const hour = new Date().getHours();
    const theme = (hour >= 18 || hour < 6) ? 'orion' : 'classic';
    document.body.className = theme;
    setTimeout(autoTheme, 60000); // Check every minute
}

// Interactive: Click colon to toggle 12/24
document.querySelectorAll('.colon').forEach(colon => {
    colon.addEventListener('click', () => {
        // Toggle hour12 in options
        options.hour12 = !options.hour12;
        updateTime();
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'f') document.getElementById('fullscreen-btn').click();
    if (e.key === 't') cycleTheme();
});

// Cycle themes manually
function cycleTheme() {
    const themes = ['classic', 'sepia', 'neon', 'orion'];
    let current = themes.indexOf(document.body.className);
    document.body.className = themes[(current + 1) % themes.length];
}

// Zen mode: Intensify twinkling
document.getElementById('zen-mode').addEventListener('click', () => {
    zenMode = !zenMode;
    document.querySelector('.stars').style.animationDuration = zenMode ? '2s' : '5s';
    // Hide controls in zen
    document.getElementById('controls').style.display = zenMode ? 'none' : 'flex';
});

// Touch swipe for mode change
let touchStartX = 0;
document.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; });
document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) changeMode(1); // Swipe left: next mode
    if (touchEndX > touchStartX + 50) changeMode(-1); // Swipe right: prev
});

function changeMode(direction) {
    const select = document.getElementById('mode-select');
    let idx = Array.from(select.options).findIndex(opt => opt.value === currentMode);
    idx = (idx + direction + select.options.length) % select.options.length;
    select.value = select.options[idx].value;
    select.dispatchEvent(new Event('change'));
}

// Add to init
initStars();
triggerShootingStar();
autoTheme();
document.getElementById('theme-select').options.add(new Option('Orion', 'orion')); // Add new theme
