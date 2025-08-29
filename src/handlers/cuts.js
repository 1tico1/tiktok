async function cutsSuggest(req, res) {
  const { candidateId, transcriptUrl } = req.body || {};
  try {
    let proposals = [];
    if (!transcriptUrl) {
      const blocks = [[62, 88], [120, 149], [210, 235]];
      proposals = blocks.slice(0, 2 + (Math.random()>0.5?1:0)).map(([start,end]) => ({
        id: `cut_${Math.random().toString(36).slice(2,8)}`,
        candidateId, start, end,
        score: +(0.75 + Math.random()*0.2).toFixed(2),
        reason: "frase de impacto + risos",
        status: "proposed"
      }));
    } else {
      const srt = await fetch(transcriptUrl).then(r => r.text());
      // parser simples só p/ ilustrar; melhore depois
      const windows = [[30, 55], [65, 92], [105, 130]];
      proposals = windows.map(([start,end],i)=>({
        id: `cut_${i}_${Date.now()}`,
        candidateId, start, end,
        score: +(0.8 + Math.random()*0.15).toFixed(2),
        reason: "clímax/pausa semântica",
        status: "proposed"
      }));
    }
    // valida 15–60s
    proposals = proposals.filter(p => p.end > p.start && (p.end - p.start) >= 15 && (p.end - p.start) <= 60);
    res.json(proposals);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}

module.exports = { cutsSuggest };