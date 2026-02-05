const pxy = (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;

// 1. searchResults (Required by Sora Doc)
async function searchResults(keyword) {
    try {
        const res = await fetch(pxy(`https://hentaihaven.xxx/?s=${encodeURIComponent(keyword)}&post_type=wp-manga`));
        const html = await res.text();
        const items = html.split('c-tabs-item__content').slice(1);
        return items.map(item => ({
            title: item.match(/title="([^"]+)"/)?.[1],
            link: item.match(/href="([^"]+)"/)?.[1],
            image: item.match(/src="([^"]+)"/)?.[1]
        })).filter(i => i.title);
    } catch (e) { return []; }
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
