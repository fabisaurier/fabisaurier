// OpenWeatherMap API Key
const API_KEY = 'd1ce329d16cbfd561e667f32bbafbe5a'; // Replace with your API key

// Clock
let clockInterval;

function startClock() {
    updateClock(); // Run immediately
    updateDate(); // Run immediately
    clockInterval = setInterval(() => {
        updateClock();
        updateDate(); // Update date every second (optional)
    }, 1000); // Update every second
}

function updateClock() {
    const now = new Date();
    const localTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const mainClockElement = document.getElementById('main-clock');
    if (mainClockElement) {
        mainClockElement.textContent = localTime;
    }
}

// Date
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('de-DE', options);
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = dateString;
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
                const temperature = Math.round(data.main.temp);
                const weatherCondition = data.weather[0].description;
                const icon = data.weather[0].icon;

                // Update the weather widget
                weatherWidget.innerHTML = `
                    <div class="weather-info">
                        <div class="weather-icon">
                            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${weatherCondition}">
                        </div>
                        <div class="weather-details">
                            <p>
                                <span id="temperature">${temperature}°C</span> |
                                <span id="weather-condition">${weatherCondition}</span>
                            </p>
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

// UPDATED: Google Search Functionality using form
// This code ensures the form behaves consistently, even though native form behavior
// would handle most of this functionality
document.getElementById('search-form').addEventListener('submit', (event) => {
    const searchQuery = document.getElementById('search-input').value.trim();
    
    // We have 'required' on the input, but this is a backup validation
    if (!searchQuery) {
        event.preventDefault(); // Prevents form submission if empty
        alert('Bitte geben Sie einen Suchbegriff ein.');
    }
    // If searchQuery is not empty, the form will submit normally to Google
});

// Cleanup function to remove event listeners and intervals if needed
function cleanup() {
    // Clear the clock interval when the page is unloaded
    if (clockInterval) {
        clearInterval(clockInterval);
    }
}

// Google News RSS Feed URL
const GOOGLE_NEWS_RSS_URL = 'https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de';

// Fetch and Parse RSS Feed
function fetchGoogleNews() {
    const newsWidget = document.querySelector('.news-list');

    // Use a proxy to avoid CORS issues
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const url = `${proxyUrl}${encodeURIComponent(GOOGLE_NEWS_RSS_URL)}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');

            const uniqueTitles = new Set(); // Track unique titles to avoid duplicates
            newsWidget.innerHTML = ''; // Clear existing content

            items.forEach((item) => {
                const title = item.querySelector('title').textContent;
                const link = item.querySelector('link').textContent;
                const description = item.querySelector('description').textContent;

                // Filter out alternative articles (e.g., those with " - " in the title)
                if (!title.includes(' - ') && !uniqueTitles.has(title)) {
                    uniqueTitles.add(title); // Add title to the set to avoid duplicates

                    const newsItem = document.createElement('div');
                    newsItem.classList.add('news-item');

                    newsItem.innerHTML = `
                        <a href="${link}" target="_blank">
                            <h3>${title}</h3>
                            <p>${description}</p>
                        </a>
                    `;

                    newsWidget.appendChild(newsItem);
                }
            });
        })
        .catch(() => {
            newsWidget.innerHTML = `<p>Nachrichten konnten nicht geladen werden.</p>`;
        });
}

// Initialize News Widget
window.addEventListener('load', () => {
    fetchGoogleNews();
});

// Initialize
window.addEventListener('load', () => {
    startClock();
    getLocation();
});

// Add cleanup on page unload to prevent memory leaks
window.addEventListener('unload', cleanup);
