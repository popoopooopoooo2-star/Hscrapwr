const pxy = (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;

// 1. searchResults (Matches Sora Required Functions)
async function searchResults(keyword) {
    try {
        const res = await fetch(pxy(`https://hentaihaven.xxx/?s=${encodeURIComponent(keyword)}&post_type=wp-manga`));
        const html = await res.text();
        
        const items = html.split('class="post-title"').slice(1);
        const results = items.map(item => {
            const link = item.match(/href="([^"]+)"/)?.[1];
            const title = item.match(/>([^<]+)<\/a>/)?.[1];
            const image = item.match(/src="([^"]+)"/)?.[1] || item.match(/data-src="([^"]+)"/)?.[1];
            return {
                title: title ? title.trim() : "Untitled",
                link: link || "",
                image: image || ""
            };
        }).filter(i => i.link);

        // STICKY FIX: Always return a stringified array to avoid Code=3840
        return JSON.stringify(results.length > 0 ? results : []);
    } catch (e) { 
        return JSON.stringify([]); // Never return empty/null
    }
}

// 2. extractDetails
async function extractDetails(url) {
    try {
        const res = await fetch(pxy(url));
        const html = await res.text();
        const details = {
            title: html.match(/<h1>([^<]+)<\/h1>/)?.[1] || "Video",
            image: html.match(/property="og:image" content="([^"]+)"/)?.[1] || "",
            description: "Hentai Haven Video",
            genres: [] 
        };
        return JSON.stringify(details);
    } catch (e) { 
        return JSON.stringify({ title: "Error" }); 
    }
}

// 3. extractEpisodes
async function extractEpisodes(url) {
    return JSON.stringify([{ name: "Episode 1", url: url }]);
}

// 4. extractStreamUrl
async function extractStreamUrl(url) {
    try {
        const res = await fetch(pxy(url));
        const html = await res.text();
        const videoSource = html.match(/<source src="([^"]+)"/)?.[1] || html.match(/file":"([^"]+)"/)?.[1];
        return videoSource ? videoSource.replace(/\\/g, '') : "";
    } catch (e) { 
        return ""; 
    }
}
