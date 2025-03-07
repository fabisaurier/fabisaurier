// Function to update the clock with time zones
function updateClock() {
    const now = new Date();

    // Format time for MEZ (your local time)
    const mezOptions = { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const mezTime = now.toLocaleTimeString('de-DE', mezOptions);

    // Format time for New York
    const nyOptions = { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const nyTime = now.toLocaleTimeString('de-DE', nyOptions);

    // Format time for Los Angeles
    const laOptions = { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const laTime = now.toLocaleTimeString('de-DE', laOptions);

    // Update the DOM
    const mainClockElement = document.getElementById('main-clock');
    const nyTimeElement = document.getElementById('ny-time');
    const laTimeElement = document.getElementById('la-time');

    if (mainClockElement && nyTimeElement && laTimeElement) {
        mainClockElement.textContent = `${mezTime} MEZ`;
        nyTimeElement.textContent = `New York: ${nyTime}`;
        laTimeElement.textContent = `Los Angeles: ${laTime}`;
    }
}

// Update the clock every second
setInterval(updateClock, 1000);

// Initialize the clock immediately
updateClock();

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
