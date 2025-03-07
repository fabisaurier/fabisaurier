// Datum aktualisieren
function updateDateTime() {
    const now = new Date();
    const dateTimeElement = document.getElementById('current-date-time');
    if (dateTimeElement) {
        dateTimeElement.textContent = now.toLocaleString();
    }
}

// Datum-Widget hinzufügen
function addDateWidget() {
    const firstWidget = document.querySelector('.dashboard-item:first-child .widget-content');
    if (firstWidget) {
        firstWidget.innerHTML = `
            <p>Aktuelle Zeit:</p>
            <p id="current-date-time"></p>
        `;
        
        // Aktualisiere das Datum jede Sekunde
        updateDateTime();
        setInterval(updateDateTime, 1000);
    } else {
        console.error("Datum-Widget konnte nicht gefunden werden");
    }
}

// Wetter-Widget hinzufügen
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

// Notizen-Widget hinzufügen
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
        
        console.log("Notizen-Widget wurde hinzugefügt");
    } else {
        console.error("Notizen-Widget konnte nicht gefunden werden");
    }
}

// Dashboard initialisieren - Hauptfunktion
function initDashboard() {
    console.log('Dashboard wird initialisiert...');
    
    // Widgets hinzufügen
    addDateWidget();
    addWeatherWidget();
    addNotesWidget();
    
    console.log('Dashboard-Initialisierung abgeschlossen');
}

// Wenn die Seite vollständig geladen ist, Dashboard initialisieren
document.addEventListener('DOMContentLoaded', initDashboard);
