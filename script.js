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

// Function to set weather background based on condition
function setWeatherBackground(weatherCondition) {
    const weatherWidget = document.getElementById('weather-widget');
    switch (weatherCondition) {
        case 'Clear':
            weatherWidget.style.background = 'linear-gradient(135deg, #6dd5ed, #2193b0)'; // Sunny
            break;
        case 'Clouds':
            weatherWidget.style.background = 'linear-gradient(135deg, #bdc3c7, #2c3e50)'; // Cloudy
            break;
        case 'Rain':
            weatherWidget.style.background = 'linear-gradient(135deg, #4ca1af, #2c3e50)'; // Rainy
            break;
        default:
            weatherWidget.style.background = 'linear-gradient(135deg, #f5f7fa, #c3cfe2)'; // Default
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

                // Set background based on weather condition
                setWeatherBackground(data.weather[0].main);
            } else {
                weatherWidget.innerHTML = `<p>Wetterdaten konnten nicht geladen werden.</p>`;
            }
        })
        .catch(() => {
            weatherWidget.innerHTML = `<p>Wetterdaten konnten nicht geladen werden.</p>`;
        });
}

// Function to fetch weather forecast
function fetchWeatherForecast(latitude, longitude) {
    const forecastWidget = document.getElementById('forecast-widget');

    // Fetch weather forecast data from OpenWeatherMap API
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=de&appid=${API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod === '200') { // Check if the request was successful
                forecastWidget.innerHTML = data.list.slice(0, 5).map((forecast) => `
                    <div class="forecast-item">
                        <p>${new Date(forecast.dt * 1000).toLocaleDateString('de-DE', { weekday: 'short' })}</p>
                        <p>${Math.round(forecast.main.temp)}°C</p>
                        <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${
