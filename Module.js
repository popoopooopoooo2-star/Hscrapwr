const baseUrl = "https://hentaihaven.xxx";
// This proxy tunnels through UK ISP blocks
const pxy = (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`;

/** 1. SEARCH */
async function search(query, page) {
    const p = page || 1;
    const searchUrl = `${baseUrl}/?s=${encodeURIComponent(query)}&post_type=wp-manga&paged=${p}`;
    
    try {
        const res = await fetch(pxy(searchUrl));
        const html = await res.text();
        
        // Scraping the search results
        const items = html.split('c-tabs-item__content').slice(1);
        const results = items.map(item => {
            const title = item.match(/title="([^"]+)"/)?.[1];
            const link = item.match(/href="([^"]+)"/)?.[1];
            const image = item.match(/src="([^"]+)"/)?.[1];
            return { title, link, image };
        }).filter(i => i.title && i.link);

        return { results, nextPage: results.length > 0 ? p + 1 : null };
    } catch (e) { return { results: [], nextPage: null }; }
}

/** 2. DISCOVER */
async function discover() {
    try {
        const res = await fetch(pxy(baseUrl));
        const html = await res.text();
        const items = html.split('page-item-detail').slice(1, 16);
        
        return items.map(item => ({
            title: item.match(/title="([^"]+)"/)?.[1],
            link: item.match(/href="([^"]+)"/)?.[1],
            image: item.match(/src="([^"]+)"/)?.[1]
        })).filter(i => i.title);
    } catch (e) { return []; }
}

/** 3. INFO */
async function info(url) {
    try {
        const res = await fetch(pxy(url));
        const html = await res.text();
        return {
            title: html.match(/<h1>([^<]+)<\/h1>/)?.[1] || "Video",
            image: html.match(/property="og:image" content="([^"]+)"/)?.[1],
            description: "Hentai Haven Video",
            genres: [] 
        };
    } catch (e) { return { title: "Error" }; }
}

/** 4. MEDIA */
async function media(url) {
    return [{ name: "Stream Video", url }];
}

/** 5. SOURCES */
async function sources(url) {
    try {
        const res = await fetch(pxy(url));
        const html = await res.text();
        // Finding the player frame/source
        const videoSource = html.match(/<source src="([^"]+)"/)?.[1] || html.match(/file":"([^"]+)"/)?.[1];
        
        if (!videoSource) return [];
        return [{ file: videoSource.replace(/\\/g, ''), label: "Full HD" }];
    } catch (e) { return []; }
}
