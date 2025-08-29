import { saveCandidate, saveCut, saveRenderedClip, savePost } from './storage.js';
import fetch from 'node-fetch';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const pexec = promisify(execFile);

const YT_BASE = "https://www.googleapis.com/youtube/v3";
const CAT = { humor: 23, esportes: 17, famosos: 24, entretenimento: 24 };

function parseISODuration(iso) {
  // PT#H#M#S -> segundos
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = +(m?.[1]||0), mm = +(m?.[2]||0), s = +(m?.[3]||0);
  return h*3600 + mm*60 + s;
}

// Ingest (YouTube API real)
export async function ingestTop1(req, res) {
  const { category } = req.body; // "humor" | "esportes" | "famosos" | "entretenimento"
  const id = CAT[category] ?? 24;
  const key = process.env.YT_API_KEY;
  
  if (!key) {
    console.warn('[ingestTop1] YT_API_KEY não configurada, usando mock');
    // Fallback para mock
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
  }
  
  try {
    // 1) vídeos mais populares no BR nessa categoria
    const v = await fetch(`${YT_BASE}/videos?chart=mostPopular&regionCode=BR&videoCategoryId=${id}&maxResults=10&part=snippet,statistics,contentDetails&key=${key}`);
    if (!v.ok) throw new Error(`YT videos.list: ${v.status}`);
    const data = await v.json();

    // 2) normalize → Candidate[]
    const out = (data.items || []).map((it, idx) => ({
      id: `yt_${it.id}`,
      source: "YouTube",
      url: `https://youtu.be/${it.id}`,
      title: it.snippet?.title || "Sem título",
      channel: it.snippet?.channelTitle || "Canal",
      category,
      views: +(it.statistics?.viewCount || 0),
      duration_sec: parseISODuration(it.contentDetails?.duration || "PT0S"),
      isTop1InCategory: idx === 0, // marque o primeiro como TOP 1
      transcriptReady: false
    }));
    
    // Salvar candidatos
    for (const candidate of out) {
      await saveCandidate(candidate);
    }
    
    return res.json(out);
  } catch (e) {
    console.error('[ingestTop1]', e);
    return res.status(500).json({ error: String(e.message || e) });
  }
}

// Cuts (heurística com transcript)
export async function suggestCuts(req, res) {
  const { candidateId, transcriptUrl } = req.body;
  try {
    let proposals = [];
    if (!transcriptUrl) {
      // Sem transcript: janelas pré-definidas 15–60s
      const blocks = [[62, 88], [120, 150], [210, 235]];
      proposals = blocks.slice(0, 2 + (Math.random()>0.5?1:0)).map(([start,end]) => ({
        id: `cut_${Math.random().toString(36).slice(2,8)}`,
        candidateId, start, end,
        score: +(0.75 + Math.random()*0.2).toFixed(2),
        reason: "frase de impacto + risos",
        status: "proposed"
      }));
    } else {
      // Com transcript: agrupar por frases e pontuação
      try {
        const srt = await fetch(transcriptUrl).then(r => r.text());
        // parse super simples
        const lines = srt.split(/\r?\n/).filter(Boolean);
        // gere janelas pseudo-semânticas (exemplo simplificado)
        const windows = [[30, 55], [65, 92], [105, 130]];
        proposals = windows.map(([start,end],i)=>({
          id: `cut_${i}_${Date.now()}`,
          candidateId, start, end,
          score: +(0.8 + Math.random()*0.15).toFixed(2),
          reason: "clímax/pausa semântica",
          status: "proposed"
        }));
      } catch (transcriptError) {
        console.warn('[suggestCuts] Erro ao processar transcript:', transcriptError);
        // Fallback para janelas pré-definidas
        const blocks = [[62, 88], [120, 150]];
        proposals = blocks.map(([start,end]) => ({
          id: `cut_${Math.random().toString(36).slice(2,8)}`,
          candidateId, start, end,
          score: +(0.75 + Math.random()*0.2).toFixed(2),
          reason: "frase de impacto + risos",
          status: "proposed"
        }));
      }
    }
    
    // valida 15–60s
    proposals = proposals.filter(p => p.end > p.start && (p.end - p.start) >= 15 && (p.end - p.start) <= 60);
    
    // Salvar cortes
    const savedCuts = [];
    for (const proposal of proposals) {
      savedCuts.push(await saveCut(proposal));
    }
    
    res.json(savedCuts);
  } catch (e) {
    console.error('[suggestCuts]', e);
    res.status(500).json({ error: String(e.message || e) });
  }
}

// Render (FFmpeg real com fallback para mock)
export async function renderClip(req, res) {
  const { cutId, template, titleInVideo, subtitled } = req.body;
  
  if (!titleInVideo || titleInVideo.trim().split(/\s+/).length > 8)
    return res.status(400).json({error:"Título in-video obrigatório (≤ 8 palavras)"});
  
  // Verificar se FFmpeg está disponível
  const hasFFmpeg = process.env.FFMPEG_ENABLED === 'true';
  
  if (!hasFFmpeg) {
    console.warn('[renderClip] FFmpeg não habilitado, usando mock');
    // Fallback para mock
    const rc = {
      id: `rc_${Math.random().toString(36).slice(2,8)}`,
      cutId, template, titleInVideo, subtitled: !!subtitled,
      mp4Url: `https://files.local/${cutId}.mp4`,
      caption: `${titleInVideo} — Você concorda? 👀`,
      hashtags: ["#tiktokbr","#viral","#brasil","#podcast","#entretenimento"],
      variant: "A"
    };
    const savedClip = await saveRenderedClip(rc);
    return res.json(savedClip);
  }
  
  try {
    // paths (exemplo)
    const input = `/tmp/${cutId}.mp4`;      // baixe seu VOD temporário
    const srt   = `/tmp/${cutId}.srt`;      // opcional
    const out   = `/tmp/${cutId}_out.mp4`;

    // monte filtro
    const title = (titleInVideo || "").replace(/[:;'"\`\\]/g, "");
    const draw  = `drawtext=text='${title}':fontcolor=white:fontsize=64:borderw=4:bordercolor=black@0.7:x=(w-text_w)/2:y=100`;
    const vf    = subtitled
      ? `scale=1080:-1,crop=1080:1920:0:0,${draw},subtitles=${srt}:force_style='Fontsize=42,Outline=2,MarginV=50'`
      : `scale=1080:-1,crop=1080:1920:0:0,${draw}`;

    await pexec("ffmpeg", ["-y","-ss","00:01:02","-to","00:01:28","-i", input, "-vf", vf, "-c:a","aac","-b:a","192k","-movflags","+faststart", out]);

    // faca upload para seu storage e gere URL assinada
    const mp4Url = `https://files.local/${cutId}.mp4`; // substitua pelo link real
    const rc = {
      id: `rc_${Math.random().toString(36).slice(2,8)}`,
      cutId, template, titleInVideo, subtitled: !!subtitled,
      mp4Url,
      caption: `${titleInVideo} — Você concorda? 👀`,
      hashtags: ["#tiktokbr","#viral","#brasil","#podcast","#entretenimento"],
      variant: "A"
    };
    
    const savedClip = await saveRenderedClip(rc);
    res.json(savedClip);
  } catch (e) {
    console.error('[renderClip]', e);
    res.status(500).json({ error: String(e.message || e) });
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