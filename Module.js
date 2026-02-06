const pxy = (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;

async function searchResults(keyword) {
    try {
        // We add a random number to the URL to bypass any "No Results" cache in Warrington
        const url = `https://hentaihaven.xxx/?s=${encodeURIComponent(keyword)}&post_type=wp-manga&random=${Math.random()}`;
        const res = await fetch(pxy(url));
        const html = await res.text();
        
        const results = [];
        // Hentai Haven 2026 uses 'c-tabs-item__content' for search results
        const items = html.split('c-tabs-item__content').slice(1);
        
        for (const item of items) {
            const link = item.match(/href="([^"]+)"/)?.[1];
            const title = item.match(/title="([^"]+)"/)?.[1];
            // Fix: Check 'data-src' first, then 'src'
            const image = item.match(/data-src="([^"]+)"/)?.[1] || item.match(/src="([^"]+)"/)?.[1] || "";
            
            if (link && title) {
                results.push({
                    title: title.trim(),
                    image: image,
                    href: link // YouTube module uses 'href' as the primary ID
                });
            }
        }
        
        // Final check: If results are empty, return a fake "No Results Found" card 
        // to see if the UI is at least working.
        if (results.length === 0) {
            return JSON.stringify([{
                title: "No Results Found - Try a different keyword",
                image: "https://hentaihaven.xxx/favicon.ico",
                href: "https://hentaihaven.xxx"
            }]);
        }

        return JSON.stringify(results);
    } catch (e) {
        return JSON.stringify([]);
    }
}

// 2. extractDetails - Required format: JSON object
async function extractDetails(ID) {
    try {
        const res = await fetch(pxy(ID)); // 'ID' here is the 'href' link from search
        const html = await res.text();
        const details = {
            description: "Hentai Haven Content",
            aliases: "HH Scraper",
            airdate: "N/A"
        };
        return JSON.stringify(details);
    } catch (err) {
        return JSON.stringify({ description: "Error fetching details" });
    }
}

// 3. extractEpisodes - Required format: JSON array
async function extractEpisodes(ID) {
    // Mimics the YouTube module's simple episode push
    const results = [{
        href: ID,
        number: 1 // Sora requires integers for episode numbers
    }];
    return JSON.stringify(results);
}

// 4. extractStreamUrl - Required format: Direct URL string
async function extractStreamUrl(ID) {
    try {
        const res = await fetch(pxy(ID));
        const html = await res.text();
        const stream = html.match(/<source src="([^"]+)"/)?.[1] || "";
        return stream.replace(/\\/g, '');
    } catch (err) {
        return "https://error.org/"; // Standard fallback from YouTube module
    }
}
