// ===== Constants =====
const API_KEY = 'd1ce329d16cbfd561e667f32bbafbe5a'; // Replace with your OpenWeatherMap API key
const NEWS_SOURCES = {
    tagesschau: {
        rss: 'https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml',
        logo: 'images/tagesschau_logo.png',
    },
    zeit: {
        rss: 'https://newsfeed.zeit.de/index',
        logo: 'images/zeit_logo.png',
    },
    spiegel: {
        rss: 'https://www.spiegel.de/schlagzeilen/tops/index.rss',
        logo: 'images/spiegel_logo.png',
    },
    sueddeutsche: {
        rss: 'https://rss.sueddeutsche.de/rss/Topthemen',
        logo: 'images/süddeutsche_logo.png',
    },
};
const PROXY_URL = 'https://api.allorigins.win/get?url=';

// ===== DOM Elements =====
const mainClockElement = document.getElementById('main-clock');
const dateElement = document.getElementById('current-date');
const cityElement = document.getElementById('city');
const weatherWidget = document.getElementById('weather-widget');
const newsWidget = document.querySelector('.news-list');
const tabButtons = document.querySelectorAll('.tab-button');
const newspaperLogo = document.getElementById('newspaper-logo');
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

// ===== News Widget =====
tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        tabButtons.forEach((btn) => btn.classList.remove('active'));
        // Add active class to the clicked button
        button.classList.add('active');
        // Fetch news for the selected source
        const source = button.getAttribute('data-source');
        fetchNews(source);
        // Update the newspaper logo
        updateNewspaperLogo(source);
    });
});

function updateNewspaperLogo(source) {
    const logoPath = NEWS_SOURCES[source].logo;
    newspaperLogo.src = logoPath;
    newspaperLogo.alt = `${source} Logo`;
}

async function fetchNews(source) {
    const rssUrl = NEWS_SOURCES[source].rss;
    if (!rssUrl) return;

    // Show loading indicator
    newsWidget.innerHTML = `<p>Lade Nachrichten...</p>`;

    try {
        const url = `${PROXY_URL}${encodeURIComponent(rssUrl)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');

        const newsData = [];
        items.forEach((item) => {
            const title = item.querySelector('title').textContent;
            const link = item.querySelector('link').textContent;
            let description = item.querySelector('description').textContent;

            // Remove images and other HTML tags from the description
            description = description.replace(/<img[^>]*>/g, ''); // Remove <img> tags
            description = description.replace(/<[^>]+>/g, ''); // Remove all HTML tags

            newsData.push({ title, link, description });
        });

        // Render the news
        renderNews(newsData);
    } catch (error) {
        console.error('Error fetching or parsing RSS feed:', error);
        showError(newsWidget, 'Nachrichten konnten nicht geladen werden.');
    }
}

function renderNews(newsData) {
    newsWidget.innerHTML = ''; // Clear loading indicator
    newsData.forEach((item) => {
        const newsItem = document.createElement('div');
        newsItem.classList.add('news-item');
        newsItem.innerHTML = `
            <a href="${item.link}" target="_blank">
                <h3>${item.title}</h3>
                <div>${item.description}</div>
            </a>
        `;
        newsWidget.appendChild(newsItem);
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
    // Load default news source (Tagesschau)
    fetchNews('tagesschau');
    updateNewspaperLogo('tagesschau');
});
