// ===== Constants =====
const NEWS_SOURCES = {
    tagesschau: {
        rss: 'https://www.tagesschau.de/xml/rss2',
        logo: 'images/tagesschau_logo.png',
    },
    zeit: {
        rss: 'https://newsfeed.zeit.de/index',
        logo: 'images/zeit_logo.png',
    },
    spiegel: {
        rss: 'https://www.spiegel.de/schlagzeilen/index.rss',
        logo: 'images/spiegel_logo.png',
    },
    sueddeutsche: {
        rss: 'https://rss.sueddeutsche.de/rss/Topthemen',
        logo: 'images/süddeutsche_logo.png',
    },
};

const PROXY_URL = 'https://api.allorigins.win/get?url=';

// ===== DOM Elements =====
const newsWidget = document.querySelector('.news-list');
const tabButtons = document.querySelectorAll('.tab-button');
const newspaperLogo = document.getElementById('newspaper-logo');

// ===== Tab Switching =====
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

// ===== Update Newspaper Logo =====
function updateNewspaperLogo(source) {
    const logoPath = NEWS_SOURCES[source].logo;
    newspaperLogo.src = logoPath;
    newspaperLogo.alt = `${source} Logo`;
}

// ===== Fetch News =====
async function fetchNews(source) {
    const rssUrl = NEWS_SOURCES[source].rss;
    if (!rssUrl) return;

    // Show loading indicator
    newsWidget.innerHTML = `<p>Lade Nachrichten...</p>`;

    try {
        const url = `${PROXY_URL
