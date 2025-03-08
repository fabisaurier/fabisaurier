// ===== Constants =====
const API_KEY = 'd1ce329d16cbfd561e667f32bbafbe5a'; // Replace with your API key
const GOOGLE_NEWS_RSS_URL = 'https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de';
const PROXY_URL = 'https://api.allorigins.win/get?url=';

// ===== DOM Elements =====
const mainClockElement = document.getElementById('main-clock');
const dateElement = document.getElementById('current-date');
const cityElement = document.getElementById('city');
const weatherWidget = document.getElementById('weather-widget');
const newsWidget = document.querySelector('.news-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// ===== Clock =====
let clockInterval;

function startClock() {
    updateClock(); // Run immediately
    updateDate(); // Run immediately
    clockInterval = setInterval(() => {
        updateClock();
        updateDate(); // Update date every second
    }, 1000); // Update every second
}

function updateClock() {
    const now = new Date();
    const localTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (mainClockElement) {
        mainClockElement.textContent = localTime;
    }
}

function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('de-DE', options);
    if (dateElement) {
        dateElement.textContent = dateString;
    }
}

// ===== Location =====
function getLocation() {
    if (!navigator.geolocation) {
        cityElement.textContent = "Nicht unterstützt";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchCityName(latitude, longitude);
            fetchWeather(latitude, longitude);
        },
        () => {
            cityElement.textContent = "Zugriff verweigert";
        }
    );
}

function fetchCityName(latitude, longitude) {
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=de`)
        .then((response) => response.json())
        .then((data) => {
            const city = data.city || data.locality || "Unbekannter Ort";
            cityElement.textContent = city;
        })
        .catch(() => {
            cityElement.textContent = "Unbekannt";
        });
}

// ===== Weather =====
function fetchWeather(latitude, longitude) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=de&appid=${API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod === 200) {
                const temperature = Math.round(data.main.temp);
                const weatherCondition = data.weather[0].description;
                const icon = data.weather[0].icon;

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
                showError(weatherWidget, 'Wetterdaten konnten nicht geladen werden.');
            }
        })
        .catch(() => {
            showError(weatherWidget, 'Wetterdaten konnten nicht geladen werden.');
        });
}

// ===== Google Search =====
searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

function handleSearch() {
    const searchQuery = searchInput.value.trim();
    if (searchQuery) {
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        window.open(googleSearchUrl, '_blank'); // Open in a new tab
    } else {
        alert('Bitte geben Sie einen Suchbegriff ein.');
    }
}

// ===== News =====
function fetchGoogleNews() {
    const url = `${PROXY_URL}${encodeURIComponent(GOOGLE_NEWS_RSS_URL)}`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
            const items = xmlDoc.querySelectorAll('item');

            newsWidget.innerHTML = ''; // Clear existing content
            items.forEach((item, index) => {
                if (index >= 5) return; // Show only top 5 news items

                const title = item.querySelector('title').textContent;
                const link = item.querySelector('link').textContent;
                const description = item.querySelector('description').textContent;

                const newsItem = document.createElement('div');
                newsItem.classList.add('news-item');
                newsItem.innerHTML = `
                    <a href="${link}" target="_blank">
                        <h3>${title}</h3>
                        <p>${description}</p>
                    </a>
                `;

                newsWidget.appendChild(newsItem);
            });
        })
        .catch(() => {
            showError(newsWidget, 'Nachrichten konnten nicht geladen werden.');
        });
}

// ===== Utility Functions =====
function showError(element, message) {
    element.innerHTML = `<p>${message}</p>`;
}

// ===== Initialize =====
window.addEventListener('load', () => {
    startClock();
    getLocation();
    fetchGoogleNews();
});
