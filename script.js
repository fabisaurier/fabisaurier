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
