// OpenWeatherMap API Key
const API_KEY = 'd1ce329d16cbfd561e667f32bbafbe5a'; // Replace with your API key

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
    const cityElement = document.getElementById('city');

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
                        cityElement.textContent = city; // Update the city name
                    })
                    .catch(() => {
                        cityElement.textContent = "Unbekannt";
                    });
            },
            () => {
                cityElement.textContent = "Zugriff verweigert";
            }
        );
    } else {
        cityElement.textContent = "Nicht unterstützt";
    }
}

// Function to fetch weather data
function fetchWeather(latitude, longitude) {
    const weatherWidget = document.getElementById('weather-widget');

    // Fetch weather data from OpenWeatherMap API
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=de&appid=${API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod === 200) { // Check if the request was successful
                const city = data.name;
                const temperature = Math.round(data.main.temp);
                const weatherDescription = data.weather[0].description;
                const icon = data.weather[0].icon;

                // Update the weather widget
                weatherWidget.innerHTML = `
                    <div class="weather-info">
                        <div class="weather-icon">
                            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${weatherDescription}">
                        </div>
                        <div class="weather-details">
                            <p><strong>${city}</strong></p>
                            <p>${temperature}°C, ${weatherDescription}</p>
                        </div>
                    </div>
                `;
            } else {
                weatherWidget.innerHTML = `<p>Wetterdaten konnten nicht geladen werden.</p>`;
            }
        })
        .catch(() => {
            weatherWidget.innerHTML = `<p>Wetterdaten konnten nicht geladen werden.</p>`;
        });
}

// Function to get the user's location and fetch weather
function getWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                fetchWeather(latitude, longitude); // Fetch weather for the user's location
            },
            () => {
                const weatherWidget = document.getElementById('weather-widget');
                weatherWidget.innerHTML = `<p>Standortzugriff verweigert. Wetterdaten können nicht geladen werden.</p>`;
            }
        );
    } else {
        const weatherWidget = document.getElementById('weather-widget');
        weatherWidget.innerHTML = `<p>Standortzugriff wird nicht unterstützt. Wetterdaten können nicht geladen werden.</p>`;
    }
}

// Function to initialize the Notes Widget
function initNotesWidget() {
    const notesArea = document.getElementById('notes-area');
    const saveNotesButton = document.getElementById('save-notes');

    // Load saved notes from localStorage
    const savedNotes = localStorage.getItem('dashboard-notes');
    if (savedNotes) {
        notesArea.value = savedNotes;
    }

    // Save notes when the button is clicked
    saveNotesButton.addEventListener('click', () => {
        const notes = notesArea.value;
        localStorage.setItem('dashboard-notes', notes);
        alert('Notizen gespeichert!');
    });
}

// Initialize the dashboard when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    updateClock(); // Initialize the clock
    getLocation(); // Initialize the location
    getWeather(); // Initialize the weather widget
    initNotesWidget(); // Initialize the notes widget

    // Update the clock every second
    setInterval(updateClock, 1000);
});
