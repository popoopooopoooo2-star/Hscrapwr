const pxy = (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;

// 1. searchResults (Fixed for 2026 Hentai Haven Layout)
async function searchResults(keyword) {
    try {
        const res = await fetch(pxy(`https://hentaihaven.xxx/?s=${encodeURIComponent(keyword)}&post_type=wp-manga`));
        const html = await res.text();
        
        // New logic: Look for the specific "post-title" class used in 2026
        const items = html.split('class="post-title"').slice(1);
        
        const results = items.map(item => {
            // Extracts the link and title from the H3 or H4 header
            const link = item.match(/href="([^"]+)"/)?.[1];
            const title = item.match(/>([^<]+)<\/a>/)?.[1];
            
            // Reaches back to find the nearest image tag
            // HH often lazy-loads images, so we check 'src' and 'data-src'
            const image = item.match(/src="([^"]+)"/)?.[1] || item.match(/data-src="([^"]+)"/)?.[1];
            
            return {
                title: title ? title.trim() : "Unknown Title",
                link: link,
                image: image || ""
            };
        }).filter(i => i.link && i.title !== "Unknown Title");

        // Fallback: If the above fails, try a generic regex
        if (results.length === 0) {
            const genericMatches = html.matchAll(/<a href="(https:\/\/hentaihaven\.xxx\/hentai\/[^"]+)"[^>]*>([^<]+)<\/a>/g);
            for (const match of genericMatches) {
                results.push({ title: match[2].trim(), link: match[1], image: "" });
            }
        }

        return results;
    } catch (e) { 
        return []; 
    }
}

// 2. extractDetails (Required by Sora Doc)
async function extractDetails(url) {
    try {
        const res = await fetch(pxy(url));
        const html = await res.text();
        return {
            title: html.match(/<h1>([^<]+)<\/h1>/)?.[1] || "Video",
            image: html.match(/property="og:image" content="([^"]+)"/)?.[1],
            description: "Hentai Haven Video",
            genres: [] 
        };
    } catch (e) { return {}; }
}

// 3. extractEpisodes (Required by Sora Doc)
async function extractEpisodes(url) {
    // For Hentai Haven, the "episode" is usually the page itself
    return [{ name: "Episode 1", url: url }];
}

// 4. extractStreamUrl (Required by Sora Doc)
async function extractStreamUrl(url) {
    try {
        const res = await fetch(pxy(url));
        const html = await res.text();
        const videoSource = html.match(/<source src="([^"]+)"/)?.[1] || html.match(/file":"([^"]+)"/)?.[1];
        return videoSource ? videoSource.replace(/\\/g, '') : "";
    } catch (e) { return ""; }
}
