import { saveCandidate, saveCut, saveRenderedClip, savePost } from './storage.js';

// Ingest (mock → real)
export async function ingestTop1(req, res) {
  try {
    const { category } = req.body;
    // MOCK primeiro:
    const top = {
      id: `yt_${category}_${Date.now()}`,
      source: "YouTube",
      url: "https://youtu.be/xxxx",
      title: `TOP 1 ${category} — Corte do dia`,
      channel: `${category.toUpperCase()} Cast`,
      category,
      views: 500000 + Math.floor(Math.random()*600000),
      duration_sec: 3600,
      isTop1InCategory: true,
      transcriptReady: false
    };
    await saveCandidate(top);
    return res.json([top]);
  } catch (error) {
    console.error('Error in ingestTop1:', error);
    res.status(500).json({ error: error.message });
  }
}

// Cuts (heurística)
export async function suggestCuts(req, res) {
  try {
    const { candidateId } = req.body;
    const mk = (s,e,reason,score) => ({
      id: `cut_${Math.random().toString(36).slice(2,8)}`,
      candidateId, start:s, end:e, score, reason, status:"proposed"
    });
    const cut = mk(62.4, 88.9, "frase de impacto + risos", 0.87);
    const cuts = [await saveCut(cut)];
    
    if (Math.random() > 0.5) {
      const secondCut = mk(121, 149, "reação inesperada", 0.79);
      cuts.push(await saveCut(secondCut));
    }
    
    return res.json(cuts);
  } catch (error) {
    console.error('Error in suggestCuts:', error);
    res.status(500).json({ error: error.message });
  }
}

// Render (mock)
export async function renderClip(req, res) {
  try {
    const { cutId, template, titleInVideo, subtitled } = req.body;
    if (!titleInVideo || titleInVideo.trim().split(/\s+/).length > 8)
      return res.status(400).json({error:"Título in-video obrigatório (≤ 8 palavras)"});
    
    const rc = {
      id: `rc_${Math.random().toString(36).slice(2,8)}`,
      cutId, template, titleInVideo, subtitled: !!subtitled,
      mp4Url: `https://files.local/${cutId}.mp4`,
      caption: `${titleInVideo} — Você concorda? 👀`,
      hashtags: ["#tiktokbr","#viral","#brasil","#podcast","#entretenimento"],
      variant: "A"
    };
    
    const savedClip = await saveRenderedClip(rc);
    res.json(savedClip);
  } catch (error) {
    console.error('Error in renderClip:', error);
    res.status(500).json({ error: error.message });
  }
}

// Publish (mock)
export async function publishTikTok(req,res){
  try {
    const { renderedClipId, whenISO } = req.body;
    const post = { 
      id:`post_${Date.now()}`, 
      renderedClipId, 
      when: whenISO, 
      status: "scheduled" 
    };
    
    const savedPost = await savePost(post);
    return res.json(savedPost);
  } catch (error) {
    console.error('Error in publishTikTok:', error);
    res.status(500).json({ error: error.message });
  }
}

// Metrics (mock)
export async function metricsDaily(req,res){
  try {
    const { start, end } = req.query;
    const days = 7, today = new Date();
    const out = [...Array(days)].map((_,i)=> {
      const d = new Date(today); d.setDate(today.getDate()- (days-1-i));
      return { 
        date: d.toISOString().slice(0,10), 
        views: 2000+i*250, 
        ret3s: +(0.24+i*0.01).toFixed(2), 
        followers: 100+i*15 
      };
    });
    res.json(out);
  } catch (error) {
    console.error('Error in metricsDaily:', error);
    res.status(500).json({ error: error.message });
  }
}