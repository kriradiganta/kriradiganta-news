
const SITE_URL = "https://kriradiganta-news.vercel.app";
const SUPABASE_URL = "https://tbktqpbvrqyoqjvdkesm.supabase.co";
const SUPABASE_KEY = "sb_publishable_NAfSTNt2-L5m0yanG3UeBQ_Uh-9Bojv";

module.exports = async (req, res) => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/news?select=id,created_at&published=eq.true&order=created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      return res.status(502).send("Could not load published news.");
    }

    const news = await response.json();

    const urls = [
      `${SITE_URL}/`,
      ...news.map(item => `${SITE_URL}/news.html?id=${item.id}`)
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).send(xml);
  } catch (error) {
    return res.status(500).send("Sitemap generation failed.");
  }
};
