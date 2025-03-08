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
function renderNews(newsData) {
    // Clear the news widget
    newsWidget.innerHTML = '';

    // Loop through the news data and create HTML elements for each news item
    newsData.forEach((item) => {
        const newsItem = document.createElement('div');
        newsItem.classList.add('news-item');

        // Create the HTML structure for a news item
        newsItem.innerHTML = `
            <a href="${item.link}" target="_blank">
                <h3>${item.title}</h3>
                <div>${item.description}</div>
            </a>
        `;

        // Append the news item to the news widget
        newsWidget.appendChild(newsItem);
    });
}

async function fetchNews(source) {
    console.log('Fetching news for:', source); // Debugging
    const rssUrl = NEWS_SOURCES[source].rss;
    if (!rssUrl) return;

    // Show loading indicator
    newsWidget.innerHTML = `<p>Lade Nachrichten...</p>`;

    try {
        const url = `${PROXY_URL}${encodeURIComponent(rssUrl)}`;
        console.log('Fetching URL:', url); // Debugging
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Raw response:', data); // Debugging

        let xmlContent;

        if (data.contents && data.contents.startsWith('data:application/rss+xml; charset=utf-8;base64,')) {
            // Handle base64-encoded data
            try {
                const base64Data = data.contents.split('base64,')[1];
                console.log('Base64 data:', base64Data); // Debugging

                // Decode the base64 data
                const decodedData = atob(base64Data);
                console.log('Decoded data:', decodedData); // Debugging

                // Convert the decoded data to a UTF-8 string
                const utf8Decoder = new TextDecoder('utf-8');
                xmlContent = utf8Decoder.decode(new Uint8Array([...decodedData].map((char) => char.charCodeAt(0)));
                console.log('UTF-8 XML content:', xmlContent); // Debugging
            } catch (error) {
                console.error('Error decoding base64 data:', error);
                showError(newsWidget, 'Fehler beim Dekodieren der Nachrichten.');
                return;
            }
        } else if (data.contents) {
            // Handle non-encoded (plain XML) data
            xmlContent = data.contents;
            console.log('Plain XML data:', xmlContent); // Debugging
        } else {
            console.error('Invalid or missing data in response:', data);
            showError(newsWidget, 'Ungültiges Nachrichtenformat.');
            return;
        }

        // Parse the XML content
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        console.log('Parsed XML:', xmlDoc); // Debugging

        // Check for XML parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            console.error('Error parsing XML:', parserError.textContent);
            showError(newsWidget, 'Fehler beim Verarbeiten der Nachrichten.');
            return;
        }

        // Process the XML document
        const items = xmlDoc.querySelectorAll('item');
        const newsData = [];
        items.forEach((item) => {
            const title = item.querySelector('title')?.textContent || 'No title';
            const link = item.querySelector('link')?.textContent || '#';
            let description = item.querySelector('description')?.textContent || item.querySelector('content\\:encoded')?.textContent || 'No description';

            // Remove images and other HTML tags from the description
            description = description.replace(/<img[^>]*>/g, ''); // Remove <img> tags
            description = description.replace(/<[^>]+>/g, ''); // Remove all HTML tags

            newsData.push({ title, link, description });
        });

        // Render the news
        renderNews(newsData);
    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        showError(newsWidget, 'Nachrichten konnten nicht geladen werden.');
    }
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
    updateNewspaperLogo('tagesschau'); // Update the logo
});
