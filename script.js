// OpenWeatherMap API Key
const API_KEY = 'd1ce329d16cbfd561e667f32bbafbe5a'; // Replace with your API key

// Clock
let clockInterval;

function startClock() {
    updateClock(); // Run immediately
    clockInterval = setInterval(updateClock, 1000); // Update every second
}

function updateClock() {
    const now = new Date();
    const localTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const mainClockElement = document.getElementById('main-clock');
    if (mainClockElement) {
        mainClockElement.textContent = localTime;
    }
}

// Location
function getLocation() {
    const cityElement = document.getElementById('city');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=de`)
                    .then((response) => response.json())
                    .then((data) => {
                        const city = data.city || data.locality || "Unbekannter Ort";
                        cityElement.textContent = city;
                        fetchWeather(latitude, longitude); // Fetch weather after getting location
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

// Weather
function fetchWeather(latitude, longitude) {
    const weatherWidget = document.getElementById('weather-widget');

    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=de&appid=${API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod === 200) {
                const city = data.name;
                const temperature = Math.round(data.main.temp);
                const weatherDescription = data.weather[0].description;
                const icon = data.weather[0].icon;

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

                setWeatherBackground(data.weather[0].main);
            } else {
                weatherWidget.innerHTML = `<p>Wetterdaten konnten nicht geladen werden.</p>`;
            }
        })
        .catch(() => {
            weatherWidget.innerHTML = `<p>Wetterdaten konnten nicht geladen werden.</p>`;
        });
}

function setWeatherBackground(weatherCondition) {
    const weatherWidget = document.getElementById('weather-widget');
    switch (weatherCondition) {
        case 'Clear':
            weatherWidget.style.background = 'linear-gradient(135deg, #6dd5ed, #2193b0)';
            break;
        case 'Clouds':
            weatherWidget.style.background = 'linear-gradient(135deg, #bdc3c7, #2c3e50)';
            break;
        case 'Rain':
            weatherWidget.style.background = 'linear-gradient(135deg, #4ca1af, #2c3e50)';
            break;
        default:
            weatherWidget.style.background = 'linear-gradient(135deg, #f5f7fa, #c3cfe2)';
    }
}

// Notes
document.getElementById('save-notes').addEventListener('click', () => {
    const notes = document.getElementById('notes-area').value;
    localStorage.setItem('userNotes', notes);
    alert('Notizen gespeichert!');
});

window.addEventListener('load', () => {
    const savedNotes = localStorage.getItem('userNotes');
    if (savedNotes) {
        document.getElementById('notes-area').value = savedNotes;
    }
});

// Initialize
window.addEventListener('load', () => {
    startClock();
    getLocation();
});
