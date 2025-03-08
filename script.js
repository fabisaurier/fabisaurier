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
            // Extract relevant fields
            const title = item.querySelector('title')?.textContent || 'No title';
            const link = item.querySelector('link')?.textContent || '#';
            const description = item.querySelector('description')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || item.querySelector('dc\\:date')?.textContent || '';
            const contentEncoded = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0]?.textContent || '';

            // Debugging: Log the raw contentEncoded field
            console.log('Raw Content Encoded:', contentEncoded); // Debugging

            // Remove CDATA tags (if present)
            const cdataContent = contentEncoded.replace(/<!\[CDATA\[|\]\]>/g, '');
            console.log('CDATA Removed:', cdataContent); // Debugging

            // Decode HTML entities
            const decodedContent = decodeHTMLEntities(cdataContent);
            console.log('Decoded Content:', decodedContent); // Debugging

            // Extract the thumbnail URL from the decoded content
            const thumbnailMatch = decodedContent.match(/<img\s+[^>]*src\s*=\s*"([^">]*)"[^>]*>/i);
            const thumbnailUrl = thumbnailMatch ? thumbnailMatch[1] : 'https://via.placeholder.com/120x80'; // Fallback image
            console.log('Thumbnail URL:', thumbnailUrl); // Debugging

            // Clean up the description (remove HTML tags)
            const cleanDescription = description.replace(/<[^>]+>/g, '');

            // Add the cleaned news item to the array
            newsData.push({ title, link, description: cleanDescription, thumbnailUrl, pubDate });
        });

        // Render the news
        renderNews(newsData);
    } catch (error) {
        console.error('Error fetching RSS feed:', error);
        showError(newsWidget, 'Nachrichten konnten nicht geladen werden.');
    }
}
