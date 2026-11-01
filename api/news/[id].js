export default async function handler(req, res) {
  const { id } = req.query;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!id || !supabaseUrl || !supabaseKey) {
    return res.status(400).send("Missing configuration.");
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/news?id=eq.${encodeURIComponent(id)}&status=eq.published&select=id,title_kh,title_en,summary_kh,summary_en,image_url&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Unable to retrieve article.");
    }

    const articles = await response.json();
    const article = articles[0];

    if (!article) {
      return res.status(404).send("Article not found.");
    }

    const title =
      article.title_en || article.title_kh || "Police Academy of Cambodia";

    const description =
      article.summary_en ||
      article.summary_kh ||
      "Official news from the Police Academy of Cambodia.";

const image =
  article.image_url ||
  "https://cambodia-police-news.vercel.app/share-image.jpg";

const articleUrl =
  `https://cambodia-police-news.vercel.app/news/${article.id}`;

    const escapeHTML = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600",
    );

    return res.status(200).send(`<!DOCTYPE html>

<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${escapeHTML(title)}</title>

  <meta name="description" content="${escapeHTML(description)}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHTML(title)}" />
  <meta property="og:description" content="${escapeHTML(description)}" />
  <meta property="og:image" content="${escapeHTML(image)}" />
  <meta property="og:image:secure_url" content="${escapeHTML(image)}" />
  <meta property="og:url" content="${escapeHTML(articleUrl)}" />
  <meta property="og:site_name" content="Police Academy of Cambodia" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHTML(title)}" />
  <meta name="twitter:description" content="${escapeHTML(description)}" />
  <meta name="twitter:image" content="${escapeHTML(image)}" />

  <meta http-equiv="refresh" content="0;url=${escapeHTML(articleUrl)}" />
</head>
<body>
  <h1>${escapeHTML(title)}</h1>
  <p>${escapeHTML(description)}</p>
  <img src="${escapeHTML(image)}" alt="${escapeHTML(title)}" />
  <a href="${escapeHTML(articleUrl)}">Read article</a>
</body>
</html>`);
  } catch (error) {
    console.error("News metadata error:", error);
    return res.status(500).send("Unable to generate article preview.");
  }
}
