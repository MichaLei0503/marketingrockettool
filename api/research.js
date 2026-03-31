import * as cheerio from "cheerio";

/**
 * Research endpoint — gathers intelligence before the main analysis.
 * Data sources (all optional — errors never block):
 * 1. Website scraping (if URL provided)
 * 2. Web search via Serper API (if SERPER_API_KEY set)
 * 3. Reddit Forum Foraging (free JSON API — no key needed)
 * 4. YouTube comment analysis (if YOUTUBE_API_KEY set)
 * 5. Meta Ad Library (if META_AD_TOKEN set)
 */

const MAX_HTML_BYTES = 500_000;
const FETCH_TIMEOUT = 10_000;

function isValidUrl(str) {
  try {
    const u = new URL(str);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    const host = u.hostname;
    if (
      host === "localhost" ||
      host.startsWith("127.") ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      host.startsWith("172.16.") ||
      host.startsWith("0.")
    ) return false;
    return true;
  } catch {
    return false;
  }
}

async function scrapeWebsite(url) {
  if (!url || !isValidUrl(url)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ScaleEngine/2.0; +https://scale-engine.vercel.app)",
        Accept: "text/html",
      },
    });
    clearTimeout(timer);
    if (!resp.ok) return null;

    const text = await resp.text();
    const html = text.slice(0, MAX_HTML_BYTES);
    const $ = cheerio.load(html);
    $("script, style, nav, footer, iframe, noscript, svg").remove();

    const title = $("title").first().text().trim();
    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() || "";

    const headings = [];
    $("h1, h2, h3").each((_, el) => {
      const t = $(el).text().trim();
      if (t && headings.length < 20) headings.push(t);
    });

    const mainEl = $("main, article, [role='main']").first();
    let content = mainEl.length ? mainEl.text() : $("body").text();
    content = content.replace(/\s+/g, " ").trim().slice(0, 4000);

    return { title, description, headings, content };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function searchWeb(industry, product) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey || (!industry && !product)) return [];

  const queries = [];
  if (industry && product) {
    queries.push(`${industry} ${product} best performing ads marketing`);
    queries.push(`${industry} marketing trends 2025 2026`);
  } else if (industry) {
    queries.push(`${industry} best marketing strategies ads`);
  } else {
    queries.push(`${product} marketing best practices`);
  }

  const results = [];
  for (const q of queries) {
    try {
      const resp = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ q, gl: "de", hl: "de", num: 5 }),
      });
      if (!resp.ok) continue;
      const data = await resp.json();
      if (data.organic) {
        for (const item of data.organic.slice(0, 5)) {
          results.push({ title: item.title, snippet: item.snippet, link: item.link });
        }
      }
    } catch { continue; }
  }
  return results;
}

/**
 * Forum Foraging — Reddit search (free JSON API, no key needed)
 * Searches for real pain points, frustrations, and desires from the target audience.
 */
async function forageReddit(industry, product, targetAudience, painPoints) {
  if (!industry && !product) return [];

  // Build search queries focused on pain points and problems
  const searchTerms = [];
  if (painPoints) searchTerms.push(painPoints.split(/[,;.]/).slice(0, 2).map(s => s.trim()).filter(Boolean));
  if (product) searchTerms.push([product]);
  if (industry) searchTerms.push([industry]);

  const queries = searchTerms.flat().slice(0, 3).map(term =>
    `${term} problem OR frustrated OR help OR recommendation OR alternative`
  );

  const allComments = [];

  for (const query of queries) {
    try {
      const searchUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=10&t=year`;
      const resp = await fetch(searchUrl, {
        headers: {
          "User-Agent": "ScaleEngine/2.0 (marketing research tool)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!resp.ok) continue;
      const data = await resp.json();
      const posts = data?.data?.children || [];

      for (const post of posts.slice(0, 5)) {
        const p = post.data;
        if (!p || p.over_18 || p.score < 2) continue;

        const entry = {
          source: "reddit",
          subreddit: p.subreddit || "",
          title: p.title || "",
          text: (p.selftext || "").slice(0, 500),
          score: p.num_comments || 0,
          url: `https://reddit.com${p.permalink}`,
        };

        if (entry.title || entry.text) allComments.push(entry);
      }
    } catch { continue; }
  }

  // Also try German Reddit queries
  if (industry || product) {
    try {
      const deQuery = `${product || industry} Erfahrung OR Problem OR Hilfe OR Empfehlung`;
      const resp = await fetch(
        `https://www.reddit.com/search.json?q=${encodeURIComponent(deQuery)}&sort=relevance&limit=5&t=year`,
        {
          headers: { "User-Agent": "ScaleEngine/2.0", Accept: "application/json" },
          signal: AbortSignal.timeout(8000),
        }
      );
      if (resp.ok) {
        const data = await resp.json();
        for (const post of (data?.data?.children || []).slice(0, 3)) {
          const p = post.data;
          if (!p || p.over_18 || p.score < 1) continue;
          allComments.push({
            source: "reddit_de",
            subreddit: p.subreddit || "",
            title: p.title || "",
            text: (p.selftext || "").slice(0, 500),
            score: p.num_comments || 0,
          });
        }
      }
    } catch {}
  }

  return allComments.slice(0, 15);
}

/**
 * YouTube comment analysis — find real audience pain points from video comments
 * Requires YOUTUBE_API_KEY environment variable
 */
async function searchYouTubeComments(industry, product, painPoints) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || (!industry && !product)) return [];

  try {
    // Step 1: Search for relevant videos
    const searchQuery = `${product || industry} ${painPoints ? painPoints.split(/[,;.]/)[0].trim() : "problem"}`;
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=5&relevanceLanguage=de&key=${apiKey}`;

    const searchResp = await fetch(searchUrl, { signal: AbortSignal.timeout(8000) });
    if (!searchResp.ok) return [];
    const searchData = await searchResp.json();
    const videoIds = (searchData.items || []).map(v => v.id.videoId).filter(Boolean);

    if (!videoIds.length) return [];

    // Step 2: Fetch comments from top videos
    const comments = [];
    for (const videoId of videoIds.slice(0, 3)) {
      try {
        const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=20&order=relevance&key=${apiKey}`;
        const commResp = await fetch(commentsUrl, { signal: AbortSignal.timeout(8000) });
        if (!commResp.ok) continue;
        const commData = await commResp.json();

        for (const item of (commData.items || []).slice(0, 10)) {
          const snippet = item.snippet?.topLevelComment?.snippet;
          if (!snippet?.textDisplay) continue;

          comments.push({
            source: "youtube",
            videoTitle: searchData.items.find(v => v.id.videoId === videoId)?.snippet?.title || "",
            text: snippet.textDisplay.replace(/<[^>]*>/g, "").slice(0, 400),
            likes: snippet.likeCount || 0,
          });
        }
      } catch { continue; }
    }

    return comments.slice(0, 20);
  } catch {
    return [];
  }
}

async function searchMetaAdLibrary(industry, product) {
  const token = process.env.META_AD_TOKEN;
  if (!token || !industry) return [];

  try {
    const searchTerm = `${industry} ${product || ""}`.trim();
    const params = new URLSearchParams({
      access_token: token,
      search_terms: searchTerm,
      ad_type: "ALL",
      ad_reached_countries: '["DE"]',
      ad_active_status: "ACTIVE",
      fields: "ad_creative_bodies,ad_creative_link_titles,ad_delivery_start_time,page_name,spend",
      limit: "25",
      sort_by: "DELIVERY_START_TIME_ASCENDING",
    });

    const resp = await fetch(
      `https://graph.facebook.com/v19.0/ads_archive?${params}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT) }
    );
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!data.data?.length) return [];

    return data.data.slice(0, 10).map((ad) => ({
      platform: "Meta",
      advertiser: ad.page_name || "",
      text: ad.ad_creative_bodies?.join(" ") || "",
      title: ad.ad_creative_link_titles?.join(" | ") || "",
      running_since: ad.ad_delivery_start_time || "",
    }));
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, industry, product, targetAudience, painPoints } = req.body || {};

  // Run all research in parallel — each source is independent
  const [siteData, searchResults, forumData, youtubeComments, adInsights] = await Promise.all([
    scrapeWebsite(url),
    searchWeb(industry, product),
    forageReddit(industry, product, targetAudience, painPoints),
    searchYouTubeComments(industry, product, painPoints),
    searchMetaAdLibrary(industry, product),
  ]);

  const hasData = siteData || searchResults.length > 0 || forumData.length > 0 || youtubeComments.length > 0 || adInsights.length > 0;

  return res.status(200).json({
    ok: hasData,
    data: hasData
      ? {
          siteData: siteData || undefined,
          searchResults: searchResults.length ? searchResults : undefined,
          forumData: forumData.length ? forumData : undefined,
          youtubeComments: youtubeComments.length ? youtubeComments : undefined,
          adInsights: adInsights.length ? adInsights : undefined,
        }
      : null,
  });
}
