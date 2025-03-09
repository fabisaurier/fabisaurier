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
    taz: {
        rss: 'https://taz.de/!p4608;rss/',
        logo: 'images/taz_logo.png',
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
const showMoreButton = document.getElementById('show-more-button');

// ===== Variables for Pagination =====
let currentNewsData = []; // Stores all fetched news items
let displayedItems = 10; // Number of items to display initially
const ITEMS_PER_PAGE = 10; // Number of items to load each time "Show More" is clicked

// ===== Functions =====

// Update the newspaper logo
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
    const localTime = now.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        timeZoneName: undefined // Remove time zone information
    });
    if (mainClockElement) {
        mainClockElement.textContent = localTime;
    }
}

function updateDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        timeZoneName: undefined // Remove time zone information
    };
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

function fetchWeather(latitude, longitude) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=de&appid=${API_KEY}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod === 200) {
                const temperature = Math.round(data.main.temp);
                const weatherCondition = data.weather[0].description;

                // Update the weather information
                document.getElementById('temperature').textContent = `${temperature}°C`;
                document.getElementById('weather-condition').textContent = weatherCondition;
            } else {
                console.error('Weather data could not be loaded.');
            }
        })
        .catch(() => {
            console.error('Error fetching weather data.');
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
            <a href="${item.link}" target="_blank" class="news-link">
                <div class="news-thumbnail">
                    <img src="${item.thumbnailUrl}" alt="${item.title}">
                </div>
                <div class="news-content">
                    <h3 class="news-title">${item.title}</h3>
                    <p class="news-date">${item.pubDate}</p>
                    <p class="news-description">${item.description}</p>
                </div>
            </a>
        `;

        // Append the news item to the news widget
        newsWidget.appendChild(newsItem);
    });

    // Show or hide the "Show More" button
    if (currentNewsData.length > displayedItems) {
        showMoreButton.style.display = 'block';
    } else {
        showMoreButton.style.display = 'none';
    }
}

// Decode HTML entities
function decodeHTMLEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// Format publication date to remove time zone
function formatPubDate(pubDate) {
    // Parse the pubDate string into a Date object
    const date = new Date(pubDate);

    // Format the date and time without the time zone
    const options = {
        weekday: 'short', // e.g., "Wed"
        year: 'numeric',  // e.g., "2023"
        month: 'short',   // e.g., "Oct"
        day: 'numeric',   // e.g., "25"
        hour: '2-digit',  // e.g., "12"
        minute: '2-digit', // e.g., "34"
        second: '2-digit', // e.g., "56"
        timeZoneName: undefined // Remove time zone
    };

    // Convert to a localized string
    return date.toLocaleString('de-DE', options);
}

// Function to sort news articles by publication date
function sortNewsByDate(newsData) {
    return newsData.sort((a, b) => {
        const dateA = new Date(a.pubDate);
        const dateB = new Date(b.pubDate);
        return dateB - dateA; // Sort in descending order (most recent first)
    });
}

// Display a subset of news items
function displayNewsItems() {
    // Sort the news data by publication date
    const sortedNewsData = sortNewsByDate(currentNewsData);
    // Display the first set of items
    const itemsToDisplay = sortedNewsData.slice(0, displayedItems);
    renderNews(itemsToDisplay);
}

async function fetchNews(source) {
    console.log('Fetching news for:', source);

    // Reset pagination variables
    currentNewsData = [];
    displayedItems = 10;

    // Show loading indicator
    newsWidget.innerHTML = `<p>Lade Nachrichten...</p>`;

    try {
        const url = `${PROXY_URL}${encodeURIComponent(NEWS_SOURCES[source].rss)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data);

        let xmlContent;

        if (data.contents && data.contents.startsWith('data:application/rss+xml;')) {
            // Handle base64-encoded data
            try {
                const base64Data = data.contents.split('base64,')[1];
                const binaryString = atob(base64Data);
                const utf8Decoder = new TextDecoder('utf-8');
                xmlContent = utf8Decoder.decode(new Uint8Array([...binaryString].map((char) => char.charCodeAt(0))));
                console.log('Decoded XML content:', xmlContent);
            } catch (error) {
                console.error('Error decoding base64 data:', error);
                showError(newsWidget, 'Fehler beim Dekodieren der Nachrichten.');
                return;
            }
        } else if (data.contents) {
            // Handle non-encoded (plain XML) data
            xmlContent = data.contents;
            if (!xmlContent.startsWith('<')) {
                throw new Error('Invalid XML content: Start tag expected');
            }
        } else {
            console.error('Invalid or missing data in response:', data);
            showError(newsWidget, 'Ungültiges Nachrichtenformat.');
            return;
        }

        // Verify if the content is XML
        if (!isXML(xmlContent)) {
            throw new Error('The fetched content is not valid XML.');
        }

        // Parse the XML content
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

        // Check for XML parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            console.error('Error parsing XML:', parserError.textContent);
            showError(newsWidget, 'Fehler beim Verarbeiten der Nachrichten.');
            return;
        }

        // Process the XML document
        const items = xmlDoc.querySelectorAll('item');
        currentNewsData = []; // Reset the news data array

        items.forEach((item) => {
            const title = item.querySelector('title')?.textContent || 'No title';
            const link = item.querySelector('link')?.textContent || '#';
            const description = item.querySelector('description')?.textContent || '';
            const contentEncoded = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0]?.textContent || '';

            // Remove CDATA tags (if present)
            const cdataContent = contentEncoded.replace(/<!\[CDATA\[|\]\]>/g, '');

            // Decode HTML entities
            const decodedContent = decodeHTMLEntities(cdataContent);

            // Try to extract the thumbnail from the decoded content
            let thumbnailMatch = decodedContent.match(/<img\s+[^>]*src\s*=\s*"([^">]*)"[^>]*>/i);
            let thumbnailUrl = thumbnailMatch ? thumbnailMatch[1] : '';

            // If no thumbnail found in <content:encoded>, try the <description> field
            if (!thumbnailUrl) {
                const descriptionContent = description.replace(/<!\[CDATA\[|\]\]>/g, '');
                thumbnailMatch = descriptionContent.match(/<img\s+[^>]*src\s*=\s*"([^">]*)"[^>]*>/i);
                thumbnailUrl = thumbnailMatch ? thumbnailMatch[1] : '';
            }

            // If no thumbnail found in <content:encoded> or <description>, check for <media:thumbnail>, <media:content>, or <enclosure>
            if (!thumbnailUrl) {
                const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail')?.getAttribute('url');
                const mediaContent = item.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content')[0]?.getAttribute('url');
                const enclosure = item.querySelector('enclosure')?.getAttribute('url');
                thumbnailUrl = mediaThumbnail || mediaContent || enclosure || 'https://via.placeholder.com/120x80'; // Fallback image
            }

            // Debugging: Log the extracted thumbnail URL and relevant XML content
            console.log('Extracted thumbnail URL:', thumbnailUrl);
            console.log('Item XML:', item.outerHTML);

            // Extract the publication date from <pubDate> or <dc:date>
            const pubDateRaw = item.querySelector('pubDate')?.textContent || item.querySelector('dc\\:date')?.textContent || '';
            const pubDate = pubDateRaw ? formatPubDate(pubDateRaw) : ''; // Format the date

            // Clean up the description (remove HTML tags)
            const cleanDescription = description.replace(/<[^>]+>/g, '');

            // Add the news item to the array
            currentNewsData.push({ title, link, description: cleanDescription, thumbnailUrl, pubDate });
        });

        // Display the first set of items
        displayNewsItems();
    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        showError(newsWidget, 'Nachrichten konnten nicht geladen werden.');
    }
}

// Function to check if the content is XML
function isXML(content) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/xml');
        return !parser.parseFromString(content, 'text/xml').querySelector('parsererror');
    } catch (e) {
        return false;
    }
}

// Define the showError function
function showError(element, message) {
    element.innerHTML = `<p>${message}</p>`;
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

    // "Show More" button event listener
    showMoreButton.addEventListener('click', () => {
        displayedItems += ITEMS_PER_PAGE; // Increase the number of displayed items
        displayNewsItems(); // Update the displayed items
    });
});
