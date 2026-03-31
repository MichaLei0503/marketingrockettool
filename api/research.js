import * as cheerio from "cheerio";

/**
 * Research endpoint — gathers intelligence before the main analysis.
 * Three optional data sources:
 * 1. Website scraping (if URL provided)
 * 2. Web search via Serper API (if SERPER_API_KEY set)
 * 3. Meta Ad Library (if META_AD_TOKEN set) — filters for longest-running, highest-spend ads
 *
 * All sources are optional — errors never block the response.
 */

const MAX_HTML_BYTES = 500_000;
const FETCH_TIMEOUT = 10_000;

function isValidUrl(str) {
  try {
    const u = new URL(str);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    // Block private IPs
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

    // Limit response size
    const text = await resp.text();
    const html = text.slice(0, MAX_HTML_BYTES);

    const $ = cheerio.load(html);

    // Remove noise
    $("script, style, nav, footer, iframe, noscript, svg").remove();

    const title = $("title").first().text().trim();
    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";
    const ogTags = {};
    $("meta[property^='og:']").each((_, el) => {
      const prop = $(el).attr("property")?.replace("og:", "");
      if (prop) ogTags[prop] = $(el).attr("content")?.trim();
    });

    const headings = [];
    $("h1, h2, h3").each((_, el) => {
      const t = $(el).text().trim();
      if (t && headings.length < 20) headings.push(t);
    });

    // Main content extraction
    const mainEl = $("main, article, [role='main']").first();
    let content = mainEl.length ? mainEl.text() : $("body").text();
    content = content.replace(/\s+/g, " ").trim().slice(0, 4000);

    return { title, description, headings, content, ogTags };
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
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q, gl: "de", hl: "de", num: 5 }),
      });

      if (!resp.ok) continue;
      const data = await resp.json();

      if (data.organic) {
        for (const item of data.organic.slice(0, 5)) {
          results.push({
            title: item.title,
            snippet: item.snippet,
            link: item.link,
          });
        }
      }
    } catch {
      continue;
    }
  }

  return results;
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
      sort_by: "DELIVERY_START_TIME_ASCENDING", // longest running first
    });

    const resp = await fetch(
      `https://graph.facebook.com/v19.0/ads_archive?${params}`,
      { signal: AbortSignal.timeout(FETCH_TIMEOUT) }
    );

    if (!resp.ok) return [];
    const data = await resp.json();

    if (!data.data?.length) return [];

    // Take the longest-running ads (already sorted by start date ascending = oldest first)
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

  const { url, industry, product } = req.body || {};

  // Run all research in parallel — each source is independent
  const [siteData, searchResults, adInsights] = await Promise.all([
    scrapeWebsite(url),
    searchWeb(industry, product),
    searchMetaAdLibrary(industry, product),
  ]);

  const hasData = siteData || searchResults.length > 0 || adInsights.length > 0;

  return res.status(200).json({
    ok: hasData,
    data: hasData
      ? {
          siteData: siteData || undefined,
          searchResults: searchResults.length ? searchResults : undefined,
          adInsights: adInsights.length ? adInsights : undefined,
        }
      : null,
  });
}
