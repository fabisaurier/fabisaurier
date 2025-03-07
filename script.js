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
