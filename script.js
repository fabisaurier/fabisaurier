// Function to update the clock
function updateClock() {
    const now = new Date();

    // Format time for your local time (MEZ)
    const localOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const localTime = now.toLocaleTimeString('de-DE', localOptions);

    // Update the DOM
    const mainClockElement = document.getElementById('main-clock');
    if (mainClockElement) {
        mainClockElement.textContent = localTime; // Local time (MEZ)
    }
}

// Function to get the user's location
function getLocation() {
    const locationElement = document.getElementById('location');

    if (navigator.geolocation) {
        // Fetch the user's location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Reverse geocoding to get the city name
                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=de`)
                    .then((response) => response.json())
                    .then((data) => {
                        const city = data.city || data.locality || "Unbekannter Ort";
                        locationElement.textContent = `Standort: ${city}`;
                    })
                    .catch(() => {
                        locationElement.textContent = "Standort: Unbekannt";
                    });
            },
            () => {
                locationElement.textContent = "Standort: Zugriff verweigert";
            }
        );
    } else {
        locationElement.textContent = "Standort: Nicht unterstützt";
    }
}

// Update the clock every second
setInterval(updateClock, 1000);

// Initialize the clock and location immediately
updateClock();
getLocation();

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
    addWeatherWidget();
    addNotesWidget();

    console.log('Dashboard-Initialisierung abgeschlossen');
}

// Initialize the dashboard when the page is fully loaded
document.addEventListener('DOMContentLoaded', initDashboard);
