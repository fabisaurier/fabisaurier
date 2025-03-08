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

// ===== Functions =====
function updateNewspaperLogo(source) {
    const logoPath = NEWS_SOURCES[source].logo;
    newspaperLogo.src = logoPath;
    newspaperLogo.alt = `${source} Logo`;
}

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

        // Extract the thumbnail URL from the description (if available)
        const thumbnailMatch = item.description?.match(/<img[^>]+src="([^">]+)"/);
        const thumbnailUrl = thumbnailMatch ? thumbnailMatch[1] : 'https://via.placeholder.com/120x80'; // Fallback image

        // Extract the date and time from the pubDate field (if available)
        const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }) : 'Datum nicht verfügbar';

        // Create the HTML structure for a news item
        newsItem.innerHTML = `
            <a href="${item.link}" target="_blank" class="news-link">
                <div class="news-thumbnail">
                    <img src="${thumbnailUrl}" alt="${item.title}">
                </div>
                <div class="news-content">
                    <h3 class="news-title">${item.title}</h3>
                    <p class="news-date">${pubDate}</p>
                    <p class="news-description">${item.description ? item.description.replace(/<[^>]+>/g, '') : ''}</p>
                </div>
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
                // Extract the base64 data
                const base64Data = data.contents.split('base64,')[1];
                console.log('Base64 data:', base64Data); // Debugging

                // Decode the base64 data
                const binaryString = atob(base64Data);
                console.log('Binary string:', binaryString); // Debugging

                // Convert the binary string to a UTF-8 string
                const utf8Decoder = new TextDecoder('utf-8');
                xmlContent = utf8Decoder.decode(new Uint8Array([...binaryString].map((char) => char.charCodeAt(0))));
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

            // Check if the content starts with '<' (valid XML)
            if (!xmlContent.startsWith('<')) {
                throw new Error('Invalid XML content: Start tag expected');
            }
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
            const description = item.querySelector('description')?.textContent || '';
            const contentEncoded = item.querySelector('content\\:encoded')?.textContent || '';

            // Debugging: Log the contentEncoded field
            console.log('Content Encoded:', contentEncoded); // Debugging

            // Remove CDATA tags (if present)
            const cdataContent = contentEncoded.replace(/<!\[CDATA\[|\]\]>/g, '');
            console.log('CDATA Removed:', cdataContent); // Debugging

            // Try to extract the thumbnail from <content:encoded>
            let thumbnailMatch = cdataContent.match(/<img\s+[^>]*src\s*=\s*"([^">]*)"[^>]*>/i);
            let thumbnailUrl = thumbnailMatch ? thumbnailMatch[1] : '';

            // If no thumbnail found in <content:encoded>, try the <description> field
            if (!thumbnailUrl) {
                const descriptionContent = description.replace(/<!\[CDATA\[|\]\]>/g, '');
                thumbnailMatch = descriptionContent.match(/<img\s+[^>]*src\s*=\s*"([^">]*)"[^>]*>/i);
                thumbnailUrl = thumbnailMatch ? thumbnailMatch[1] : 'https://via.placeholder.com/120x80'; // Fallback image
            }

            console.log('Thumbnail Match:', thumbnailMatch); // Debugging
            console.log('Thumbnail URL:', thumbnailUrl); // Debugging

            // Extract the publication date from <pubDate> or <dc:date>
            const pubDate = item.querySelector('pubDate')?.textContent || item.querySelector('dc\\:date')?.textContent || '';

            // Clean up the description (remove HTML tags)
            const cleanDescription = description.replace(/<[^>]+>/g, '');

            // Add the news item to the array
            newsData.push({ title, link, description: cleanDescription, thumbnailUrl, pubDate });
        });

        // Render the news
        renderNews(newsData);
    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        showError(newsWidget, 'Nachrichten konnten nicht geladen werden.');
    }
}
// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Script loaded'); // Debugging
    startClock();
    getLocation();
    // Load default news source (Tagesschau)
    fetchNews('tagesschau');
    updateNewspaperLogo('tagesschau'); // Update the logo

    // Attach event listeners to tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    console.log('Tab buttons:', tabButtons); // Debugging

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            console.log('Button clicked:', button.getAttribute('data-source')); // Debugging
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
});
