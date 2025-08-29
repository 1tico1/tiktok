function renderClip(req, res) {
  const { cutId, template, titleInVideo, subtitled } = req.body || {};
  if (!titleInVideo || titleInVideo.trim().split(/\s+/).length > 8) {
    return res.status(400).json({ error: "Título in-video obrigatório e ≤ 8 palavras" });
  }
  const rc = {
    id: `rc_${Math.random().toString(36).slice(2,8)}`,
    cutId, template, titleInVideo, subtitled: !!subtitled,
    mp4Url: `https://files.local/${cutId}.mp4`,
    caption: `${titleInVideo} — Você concorda? 👀`,
    hashtags: ["#tiktokbr","#viral","#brasil","#podcast","#entretenimento"],
    variant: "A"
  };
  res.json(rc);
}

module.exports = { renderClip };