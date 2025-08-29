const { toISOWithBR } = require('../utils/time');

function publishTikTok(req, res) {
  const { renderedClipId, whenISO, caption, hashtags } = req.body || {};
  const when = whenISO || toISOWithBR(new Date());
  return res.json({
    id: `post_${Date.now()}`,
    renderedClipId, when, status: "scheduled",
    caption, hashtags
  });
}

module.exports = { publishTikTok };