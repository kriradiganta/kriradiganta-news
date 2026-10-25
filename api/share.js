
const SITE_URL = "https://kriradiganta-news.vercel.app";
const SUPABASE_URL = "https://tbktqpbvrqyoqjvdkesm.supabase.co";
const SUPABASE_KEY = "sb_publishable_NAfSTNt2-L5m0yanG3UeBQ_Uh-9Bojv";

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function safeImage(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

module.exports = async (req, res) => {
  try {
    const id = String(req.query.id || "");

    if (!/^\d+$/.test(id)) {
      return res.status(400).send("Invalid news ID.");
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/news?select=id,title,summary,image_url,published&id=eq.${id}&published=eq.true`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      return res.status(502).send("Could not load news.");
    }

    const rows = await response.json();
    const news = rows[0];

    if (!news) {
      return res.status(404).send("Published news not found.");
    }

    const title = news.title || "ক্রীড়াদিগন্ত";
    const description = news.summary || title;
    const image = safeImage(news.image_url);

    const articleURL = `${SITE_URL}/news.html?id=${news.id}`;
    const shareURL = `${SITE_URL}/api/share?id=${news.id}`;

    const imageTag = image
      ? `<meta property="og:image" content="${escapeHTML(image)}">
         <meta name="twitter:image" content="${escapeHTML(image)}">`
      : "";

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    return res.status(200).send(`<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHTML(title)} | ক্রীড়াদিগন্ত</title>
  <meta name="description" content="${escapeHTML(description)}">
  <link rel="canonical" href="${escapeHTML(articleURL)}">

  <meta property="og:site_name" content="ক্রীড়াদিগন্ত">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="bn_BD">
  <meta property="og:title" content="${escapeHTML(title)}">
  <meta property="og:description" content="${escapeHTML(description)}">
  <meta property="og:url" content="${escapeHTML(shareURL)}">
  ${imageTag}

  <meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">
  <meta name="twitter:title" content="${escapeHTML(title)}">
  <meta name="twitter:description" content="${escapeHTML(description)}">

  <meta http-equiv="refresh" content="0;url=${escapeHTML(articleURL)}">
</head>
<body>
  <p>সংবাদটি খুলছে...</p>
  <p><a href="${escapeHTML(articleURL)}">সংবাদ পড়ুন — ক্রীড়াদিগন্ত</a></p>
  <script>window.location.replace(${JSON.stringify(articleURL)});</script>
</body>
</html>`);
  } catch (error) {
    return res.status(500).send("Unable to load the news page.");
  }
};
