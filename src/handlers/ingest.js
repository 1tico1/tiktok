const { YT_CAT, parseISODuration } = require('../utils/youtube');

async function ingestTop1(req, res) {
  const { category } = req.body || {};
  const catId = YT_CAT[category] ?? 24;
  const key = process.env.YT_API_KEY;
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos` +
      `?chart=mostPopular&regionCode=BR&videoCategoryId=${catId}` +
      `&maxResults=10&part=snippet,statistics,contentDetails&key=${key}`;

    const resp = await fetch(url);
    if (!resp.ok) return res.status(500).json({ error: `YT videos.list: ${resp.status}` });
    const data = await resp.json();

    const out = (data.items || []).map((it, idx) => ({
      id: `yt_${it.id}`,
      source: "YouTube",
      url: `https://youtu.be/${it.id}`,
      title: it.snippet?.title || "Sem título",
      channel: it.snippet?.channelTitle || "Canal",
      category,
      views: +(it.statistics?.viewCount || 0),
      duration_sec: parseISODuration(it.contentDetails?.duration || "PT0S"),
      isTop1InCategory: idx === 0,
      transcriptReady: false
    }));
    return res.json(out);
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}

module.exports = { ingestTop1 };