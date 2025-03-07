// Function to update the clock with flip animation
function updateClock() {
    const now = new Date();

    // Format time (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Update the DOM
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');

    if (hoursElement && minutesElement && secondsElement) {
        // Add flip animation
        flipDigit(hoursElement, hours);
        flipDigit(minutesElement, minutes);
        flipDigit(secondsElement, seconds);
    }
}

// Function to flip a single digit
function flipDigit(element, newValue) {
    if (element.textContent !== newValue) {
        element.classList.add('flip');
        element.setAttribute('data-value', newValue);

        // Remove the flip class after the animation completes
        setTimeout(() => {
            element.textContent = newValue;
            element.classList.remove('flip');
        }, 500); // Match the duration of the flip animation
    }
}

// Function to add the Time Widget
function addTimeWidget() {
    const firstWidget = document.querySelector('.dashboard-item:first-child .widget-content');
    if (firstWidget) {
        firstWidget.innerHTML = `
            <div id="clock" class="led-clock">
                <span id="hours" data-value="00">00</span>:
                <span id="minutes" data-value="00">00</span>:
                <span id="seconds" data-value="00">00</span>
            </div>
        `;

        // Update the clock immediately and every second
        updateClock();
        setInterval(updateClock, 1000);
    } else {
        console.error("Time Widget konnte nicht gefunden werden");
    }
}

// Function to add the Weather Widget
function addWeatherWidget() {
    const secondWidget = document.querySelector('.dashboard-item:nth-child(2) .widget-content');
    if (secondWidget) {
        secondWidget.innerHTML = `
            <div id="weather-widget">
                <p>Wetter (Beispieldaten):</p>
                <p>Berlin: 18°C, sonnig</p>
                <p>München: 15°C, teilweise bewölkt</p>
                <p>Hamburg: 14°C, Regen</p>
            </div>
        `;
        console.log("Wetter-Widget wurde hinzugefügt");
    } else {
        console.error("Wetter-Widget konnte nicht gefunden werden");
    }
}

// Function to add the Notes Widget
function addNotesWidget() {
    const thirdWidget = document.querySelector('.dashboard-item:nth-child(3) .widget-content');
    if (thirdWidget) {
        thirdWidget.innerHTML = `
            <div id="notes-widget">
                <h3>Meine Notizen</h3>
                <textarea id="notes-area" rows="4" placeholder="Notizen hier eingeben..."></textarea>
                <button id="save-notes">Speichern</button>
            </div>
        `;

        // Load saved notes from localStorage
        const savedNotes = localStorage.getItem('dashboard-notes');
        if (savedNotes) {
            document.getElementById('notes-area').value = savedNotes;
        }

        // Save notes when the button is clicked
        document.getElementById('save-notes').addEventListener('click', function () {
            const notes = document.getElementById('notes-area').value;
            localStorage.setItem('dashboard-notes', notes);
            alert('Notizen gespeichert!');
        });

        console.log("Notizen-Widget wurde hinzugefügt");
    } else {
        console.error("Notizen-Widget konnte nicht gefunden werden");
    }
}

// Function to initialize the dashboard
function initDashboard() {
    console.log('Dashboard wird initialisiert...');

    // Add widgets
    addTimeWidget();
    addWeatherWidget();
    addNotesWidget();

    console.log('Dashboard-Initialisierung abgeschlossen');
}

// Initialize the dashboard when the page is fully loaded
document.addEventListener('DOMContentLoaded', initDashboard);
