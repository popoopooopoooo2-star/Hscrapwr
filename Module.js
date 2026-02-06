const pxy = (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;

// 1. searchResults - Adapted from the YouTube module's structure
async function searchResults(keyword) {
    try {
        const res = await fetch(pxy(`https://hentaihaven.xxx/?s=${encodeURIComponent(keyword)}&post_type=wp-manga`));
        const html = await res.text();
        const items = html.split('class="post-title"').slice(1);
        
        const results = items.map(item => {
            const link = item.match(/href="([^"]+)"/)?.[1] || "";
            const title = item.match(/>([^<]+)<\/a>/)?.[1] || "Untitled";
            const image = item.match(/src="([^"]+)"/)?.[1] || item.match(/data-src="([^"]+)"/)?.[1] || "";
            
            return {
                title: title.trim(),
                image: image,
                href: link // The YouTube module uses 'href' as the unique ID
            };
        }).filter(i => i.href !== "");

        // Essential: Sora requires a stringified JSON array
        return JSON.stringify(results);
    } catch (err) {
        // Log-Fix: Return an empty stringified array instead of nothing to avoid Code=3840
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
