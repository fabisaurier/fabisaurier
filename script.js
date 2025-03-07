// Datum aktualisieren
function updateDateTime() {
    const now = new Date();
    const dateTimeElement = document.getElementById('current-date-time');
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleString();
    }
}

// Dashboard initialisieren
function initDashboard() {
    console.log('Dashboard wird initialisiert...');
    
    // Füge ein Datums-Widget hinzu
    const firstWidget = document.querySelector('.dashboard-item:first-child .widget-content');
    if (firstWidget) {
        firstWidget.innerHTML = `
            <p>Aktuelle Zeit:</p>
            <p id="current-date-time"></p>
        `;
        
        // Aktualisiere das Datum jede Sekunde
        updateDateTime();
        setInterval(updateDateTime, 1000);
    }
}

// Wenn die Seite vollständig geladen ist
document.addEventListener('DOMContentLoaded', initDashboard);

// Wetter-Widget
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
    }
}

// Füge diesen Aufruf in die initDashboard-Funktion ein
function initDashboard() {
    console.log('Dashboard wird initialisiert...');
    
    // Datum-Widget
    updateDateWidget();
    
    // Wetter-Widget
    addWeatherWidget();
}

// Notizen-Widget
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
        
        // Lade gespeicherte Notizen
        const savedNotes = localStorage.getItem('dashboard-notes');
        if (savedNotes) {
            document.getElementById('notes-area').value = savedNotes;
        }
        
        // Speichern-Button
        document.getElementById('save-notes').addEventListener('click', function() {
            const notes = document.getElementById('notes-area').value;
            localStorage.setItem('dashboard-notes', notes);
            alert('Notizen gespeichert!');
        });
    }
}

// Füge diesen Aufruf in die initDashboard-Funktion ein
function initDashboard() {
    // ... andere Widget-Initialisierungen
    addNotesWidget();
}
