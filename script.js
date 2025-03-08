// ===== Constants =====
const GOOGLE_NEWS_RSS_URL = 'https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de';
const PROXY_URL = 'https://api.allorigins.win/get?url=';
const NEWS_CACHE_KEY = 'cachedNews';
const NEWS_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

// ===== DOM Elements =====
const newsWidget = document.querySelector('.news-list');

// ===== News =====
async function fetchGoogleNews() {
    // Show loading indicator
    newsWidget.innerHTML = `<p>Lade Nachrichten...</p>`;

    // Check for cached news
    const cachedNews = getCachedNews();
    if (cachedNews) {
        renderNews(cachedNews);
        return;
    }

    try {
        const url = `${PROXY_URL}${encodeURIComponent(GOOGLE_NEWS_RSS_URL)}`;
        const response = await fetch(url);
        const data = await response.json();

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');

        // Filter and process news items
        const newsData = Array.from(items)
            .filter((item) => {
                const title = item.querySelector('title').textContent;
                const description = item.querySelector('description').textContent;

                // Exclude alternative or related articles
                return !title.includes('Related:') && !description.includes('See also:');
            })
            .slice(0, 5) // Show only top 5 main articles
            .map((item) => ({
                title: item.querySelector('title').textContent,
                link: item.querySelector('link').textContent,
                description: item.querySelector('description').textContent,
            }));

        // Cache the news data
        cacheNews(newsData);

        // Render the news
        renderNews(newsData);
    } catch (error) {
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
    fetchGoogleNews();
});
