// ===== Constants =====
const API_KEY = 'd1ce329d16cbfd561e667f32bbafbe5a'; // Replace with your OpenWeatherMap API key
const GOOGLE_NEWS_RSS_URL = 'https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de';
const PROXY_URL = 'https://api.allorigins.win/get?url=';
const NEWS_CACHE_KEY = 'cachedNews';
const NEWS_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

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
async function fetchGoogleNews() {
    console.log('fetchGoogleNews called'); // Debugging: Confirm the function is called

    // Show loading indicator
    newsWidget.innerHTML = `<p>Lade Nachrichten...</p>`;

    // Check for cached news
    const cachedNews = getCachedNews();
    if (cachedNews) {
        console.log('Using cached news data'); // Debugging: Log if cached data is used
        renderNews(cachedNews);
        return;
    }

    try {
        const url = `${PROXY_URL}${encodeURIComponent(GOOGLE_NEWS_RSS_URL)}`;
        console.log('Fetching RSS feed from:', url); // Debugging: Log the fetch URL

        const response = await fetch(url);
        console.log('Fetch response:', response); // Debugging: Log the fetch response

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('RSS feed data:', data); // Debugging: Log the parsed JSON data

        // Log the raw RSS feed data
        console.log('Raw RSS Feed Data:', data.contents);

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        console.log('Parsed XML document:', xmlDoc); // Debugging: Log the parsed XML document

        const items = xmlDoc.querySelectorAll('item');
        console.log('Number of items found:', items.length); // Debugging: Log the number of items

        // Log the first item to inspect its structure
        if (items.length > 0) {
            console.log('First Item:', items[0].querySelector('description').textContent);
        }

        // Filter and process news items
        const newsData = [];
        const uniqueTitles = new Set(); // To avoid duplicates

        Array.from(items).forEach((item, index) => {
            const title = item.querySelector('title').textContent;
            const description = item.querySelector('description').textContent;
            const link = item.querySelector('link').textContent;

            // Skip if the title is already in the set (duplicate)
            if (uniqueTitles.has(title)) return;

            // Add the article to the list (no filtering by bold text)
            newsData.push({
                title,
                link,
                description,
            });

            uniqueTitles.add(title); // Mark this title as seen

            // Stop after collecting 5 articles
            if (newsData.length >= 5) return;
        });

        // Cache the news data
        cacheNews(newsData);

        // Render the news
        renderNews(newsData);
    } catch (error) {
        console.error('Error fetching or parsing RSS feed:', error); // Debugging: Log any errors
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
                <p>${item.description}</p>
            </a>
        `;
        newsWidget.appendChild(newsItem);
    });
}

// ===== Caching =====
function getCachedNews() {
    const cachedData = localStorage.getItem(NEWS_CACHE_KEY);
    if (!cachedData) return null;

    const { timestamp, data } = JSON.parse(cachedData);
    const isExpired = Date.now() - timestamp > NEWS_CACHE_EXPIRY;

    return isExpired ? null : data;
}

function cacheNews(newsData) {
    const cache = {
        timestamp: Date.now(),
        data: newsData,
    };
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(cache));
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
