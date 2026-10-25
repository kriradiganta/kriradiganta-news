
const SITE_URL = "https://kriradiganta-news.vercel.app";
const SUPABASE_URL = "https://tbktqpbvrqyoqjvdkesm.supabase.co";
const SUPABASE_KEY = "sb_publishable_NAfSTNt2-L5m0yanG3UeBQ_Uh-9Bojv";

function escapeXML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

module.exports = async (req, res) => {
  try {
    const news = [];
    const pageSize = 500;
    let offset = 0;

    while (true) {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/news?select=id&published=eq.true&order=id.desc`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Range: `${offset}-${offset + pageSize - 1}`,
            "Range-Unit": "items"
          }
        }
      );

      if (!response.ok) {
        return res.status(502).send("Could not load published news.");
      }

      const batch = await response.json();
      news.push(...batch);

      if (batch.length < pageSize) break;
      offset += pageSize;
    }

    const urls = [
      `${SITE_URL}/`,
      ...news.map(item => `${SITE_URL}/news.html?id=${item.id}`)
    ];

    const uniqueUrls = [...new Set(urls)];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(url => `  <url>
    <loc>${escapeXML(url)}</loc>
  </url>`).join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).send(xml);
  } catch (error) {
    return res.status(500).send("Sitemap generation failed.");
  }
};
