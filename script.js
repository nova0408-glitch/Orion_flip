document.addEventListener('DOMContentLoaded', () => {
    const modes = ['clock', 'timer', 'stopwatch', 'alarm'];
    let currentMode = 'clock';
    let interval;
    let timerEnd = 0;
    let stopwatchStart = 0;
    let stopwatchElapsed = 0;
    let isRunning = false;
    let alarms = [];
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const flipSound = document.getElementById('flip-sound');
    const alarmSound = document.getElementById('alarm-sound');
    const soundToggle = document.getElementById('sound-toggle');

    // Populate timezones
    const tzSelect = document.getElementById('timezone-select');
    const timezones = Intl.supportedValuesOf('timeZone');
    timezones.forEach(tz => {
        const opt = document.createElement('option');
        opt.value = tz;
        opt.textContent = tz;
        tzSelect.appendChild(opt);
    });
    tzSelect.value = timezone;
    tzSelect.addEventListener('change', () => { timezone = tzSelect.value; updateTime(); });

    // Theme switcher
    document.getElementById('theme-select').addEventListener('change', (e) => {
        document.body.className = e.target.value;
    });

    // Fullscreen
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });

    // Mode switcher
    document.getElementById('mode-select').addEventListener('change', (e) => {
        currentMode = e.target.value;
        hideAllControls();
        clearInterval(interval);
        resetDisplay();
        switch (currentMode) {
            case 'clock': startClock(); break;
            case 'timer': showTimerControls(); break;
            case 'stopwatch': showStopwatchControls(); break;
            case 'alarm': showAlarmControls(); break;
        }
    });

    function hideAllControls() {
        document.getElementById('timer-input').style.display = 'none';
        document.getElementById('stopwatch-controls').style.display = 'none';
        document.getElementById('alarm-controls').style.display = 'none';
    }

    function showTimerControls() {
        document.getElementById('timer-input').style.display = 'block';
        document.getElementById('start-timer').addEventListener('click', startTimer);
        document.getElementById('pomodoro').addEventListener('click', () => {
            document.getElementById('timer-min').value = 25;
            document.getElementById('timer-sec').value = 0;
            startTimer();
        });
    }

    function showStopwatchControls() {
        document.getElementById('stopwatch-controls').style.display = 'block';
        const startBtn = document.getElementById('start-stopwatch');
        startBtn.addEventListener('click', () => {
            if (!isRunning) {
                stopwatchStart = Date.now() - stopwatchElapsed;
                interval = setInterval(updateStopwatch, 10);
                isRunning = true;
                startBtn.textContent = 'Pause';
            } else {
                clearInterval(interval);
                stopwatchElapsed = Date.now() - stopwatchStart;
                isRunning = false;
                startBtn.textContent = 'Resume';
            }
        });
        document.getElementById('lap').addEventListener('click', () => {
            const lapTime = formatTime(Date.now() - stopwatchStart);
            const li = document.createElement('li');
            li.textContent = lapTime;
            document.getElementById('laps').appendChild(li);
        });
        document.getElementById('reset-stopwatch').addEventListener('click', resetStopwatch);
    }

    function showAlarmControls() {
        document.getElementById('alarm-controls').style.display = 'block';
        document.getElementById('set-alarm').addEventListener('click', () => {
            const time = document.getElementById('alarm-time').value;
            if (time) {
                alarms.push(time);
                updateAlarmsList();
                checkAlarms(); // Start checking
            }
        });
    }

    function updateAlarmsList() {
        const ul = document.getElementById('alarms');
        ul.innerHTML = '';
        alarms.forEach((alarm, idx) => {
            const li = document.createElement('li');
            li.textContent = alarm;
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.onclick = () => { alarms.splice(idx, 1); updateAlarmsList(); };
            li.appendChild(delBtn);
            ul.appendChild(li);
        });
    }

    function checkAlarms() {
        interval = setInterval(() => {
            const now = new Date().toLocaleTimeString('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit' });
            if (alarms.includes(now)) {
                alarmSound.play();
                Notification.requestPermission().then(perm => {
                    if (perm === 'granted') new Notification('Alarm!');
                });
                setTimeout(() => alarmSound.pause(), 10000); // Stop after 10s
            }
        }, 60000); // Check every minute
    }

    function startClock() {
        updateTime();
        interval = setInterval(updateTime, 1000);
    }

    function updateTime() {
        const date = new Date();
        const options = { timeZone: timezone, hour12: false };
        const timeStr = date.toLocaleTimeString('en-GB', options);
        const [h, m, s] = timeStr.split(':').map(Number);
        flipDigits(h, m, s);
        document.getElementById('date-display').textContent = date.toLocaleDateString('en-US', { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    function startTimer() {
        const min = parseInt(document.getElementById('timer-min').value) || 0;
        const sec = parseInt(document.getElementById('timer-sec').value) || 0;
        timerEnd = Date.now() + (min * 60000) + (sec * 1000);
        interval = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        const remaining = timerEnd - Date.now();
        if (remaining <= 0) {
            clearInterval(interval);
            alarmSound.play();
            setTimeout(() => alarmSound.pause(), 5000);
            return;
        }
        const m = Math.floor(remaining / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        flipDigits(0, m, s); // Hours fixed at 0 for timer
    }

    function updateStopwatch() {
        stopwatchElapsed = Date.now() - stopwatchStart;
        const ms = stopwatchElapsed % 1000;
        const s = Math.floor(stopwatchElapsed / 1000) % 60;
        const m = Math.floor(stopwatchElapsed / 60000) % 60;
        const h = Math.floor(stopwatchElapsed / 3600000);
        flipDigits(h, m, s); // Could add ms if needed
    }

    function resetStopwatch() {
        clearInterval(interval);
        stopwatchElapsed = 0;
        isRunning = false;
        document.getElementById('start-stopwatch').textContent = 'Start';
        document.getElementById('laps').innerHTML = '';
        resetDisplay();
    }

    function formatTime(ms) {
        const s = Math.floor(ms / 1000) % 60;
        const m = Math.floor(ms / 60000) % 60;
        const h = Math.floor(ms / 3600000);
        return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }

    function resetDisplay() {
        flipDigits(0, 0, 0);
    }

    function flipDigits(h, m, s) {
        flip('hours-tens', Math.floor(h / 10));
        flip('hours-ones', h % 10);
        flip('minutes-tens', Math.floor(m / 10));
        flip('minutes-ones', m % 10);
        flip('seconds-tens', Math.floor(s / 10));
        flip('seconds-ones', s % 10);
    }

    const prevDigits = {};
    function flip(id, newDigit) {
        const group = document.getElementById(id);
        const oldDigit = prevDigits[id] || 0;
        if (newDigit === oldDigit) return;

        // Clear existing cards
        group.innerHTML = '';

        // Top half (old)
        const top = document.createElement('div');
        top.classList.add('flip-card', 'top');
        top.textContent = oldDigit;

        // Bottom half (old, will flip to new)
        const bottom = document.createElement('div');
        bottom.classList.add('flip-card', 'bottom');
        bottom.textContent = newDigit; // Back side is new

        // New top half (appears after flip)
        const newTop = document.createElement('div');
        newTop.classList.add('flip-card', 'top');
        newTop.textContent = newDigit;
        newTop.style.transform = 'rotateX(180deg)';

        group.appendChild(top);
        group.appendChild(bottom);
        group.appendChild(newTop);

        // Trigger flip
        requestAnimationFrame(() => {
            group.classList.add('flipping');
            if (soundToggle.checked) flipSound.play();
            setTimeout(() => {
                group.classList.remove('flipping');
                // Clean up: Keep only new top and bottom
                group.innerHTML = '';
                const finalTop = document.createElement('div');
                finalTop.classList.add('flip-card', 'top');
                finalTop.textContent = newDigit;
                const finalBottom = document.createElement('div');
                finalBottom.classList.add('flip-card', 'bottom');
                finalBottom.textContent = newDigit;
                group.appendChild(finalTop);
                group.appendChild(finalBottom);
            }, 600);
        });

        prevDigits[id] = newDigit;
    }

    // Init
    startClock();
});
