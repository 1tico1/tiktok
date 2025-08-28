import { toast } from "@/hooks/use-toast";
import { useAppStore } from "./store";
import type { Candidate, CutProposal, RenderedClip, PostJob, Config } from "./store";

export const runDailyCycle = () => {
  const store = useAppStore.getState();
  const { config, addLog, setCandidates, setCutProposals, addRenderedClip, addPostJob } = store;

  addLog("info", "coleta", "Iniciando ciclo diário", { timestamp: new Date().toISOString() });

  // Generate candidates based on active sources and categories
  const mockCandidates: Candidate[] = [];
  const activeCategories = config.categories;
  
  let candidateCounter = 1;
  
  // Create exactly one top 1 per category
  activeCategories.forEach(category => {
    const sources = [];
    if (config.sources.youtube) sources.push("YouTube");
    if (config.sources.podcasts) sources.push("Podcasts");
    if (config.sources.twitch) sources.push("Twitch");
    
    if (sources.length === 0) return;
    
    const randomSource = sources[Math.floor(Math.random() * sources.length)] as any;
    
    mockCandidates.push({
      id: `yt_${candidateCounter}`,
      source: randomSource,
      url: `https://youtu.be/mock${candidateCounter}`,
      title: `Top ${category} do momento - Episódio ${candidateCounter}`,
      channel: `Canal ${category} BR`,
      category,
      views: Math.floor(Math.random() * 1000000) + 100000,
      duration_sec: Math.floor(Math.random() * 3600) + 600,
      isTop1InCategory: true,
      transcriptReady: Math.random() > 0.3
    });
    candidateCounter++;
  });

  // Add additional candidates (not top 1)
  const remainingSlots = config.limits.candidatesPerDay - activeCategories.length;
  for (let i = 0; i < Math.max(0, remainingSlots); i++) {
    const randomCategory = activeCategories[Math.floor(Math.random() * activeCategories.length)];
    const sources = [];
    if (config.sources.youtube) sources.push("YouTube");
    if (config.sources.podcasts) sources.push("Podcasts");
    if (config.sources.twitch) sources.push("Twitch");
    
    if (sources.length === 0) continue;
    
    const randomSource = sources[Math.floor(Math.random() * sources.length)] as any;
    
    mockCandidates.push({
      id: `yt_${candidateCounter}`,
      source: randomSource,
      url: `https://youtu.be/mock${candidateCounter}`,
      title: `Conteúdo ${randomCategory} interessante ${candidateCounter}`,
      channel: `Canal Alternativo ${candidateCounter}`,
      category: randomCategory,
      views: Math.floor(Math.random() * 500000) + 10000,
      duration_sec: Math.floor(Math.random() * 3600) + 300,
      isTop1InCategory: false,
      transcriptReady: Math.random() > 0.5
    });
    candidateCounter++;
  }

  setCandidates(mockCandidates);

  // Generate some cut proposals for 2 candidates
  if (mockCandidates.length >= 2) {
    const proposals: CutProposal[] = [];
    for (let i = 0; i < 2; i++) {
      const candidate = mockCandidates[i];
      const numCuts = Math.min(config.limits.maxCutsPerVideo, Math.floor(Math.random() * 2) + 1);
      
      for (let j = 0; j < numCuts; j++) {
        const start = Math.floor(Math.random() * candidate.duration_sec * 0.7);
        const duration = Math.floor(Math.random() * (config.limits.clipMaxSec - config.limits.clipMinSec)) + config.limits.clipMinSec;
        
        proposals.push({
          id: `cut_${i}_${j}`,
          candidateId: candidate.id,
          start,
          end: start + duration,
          score: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
          reason: ["frase de impacto + risos", "momento viral", "reação épica", "insight interessante"][Math.floor(Math.random() * 4)],
          status: "proposed"
        });
      }
    }
    setCutProposals(proposals);
  }

  // Create one example rendered clip
  if (mockCandidates.length > 0) {
    const exampleClip: RenderedClip = {
      id: "rc_example",
      cutId: "cut_0_0",
      template: config.defaultTemplate,
      titleInVideo: "Ninguém esperava!",
      subtitled: true,
      mp4Url: "https://files.local/rc_example.mp4",
      caption: "Você concorda? 👀",
      hashtags: ["#entretenimento", "#podcast", "#viral", "#tiktokbr", "#brasil"],
      variant: "A"
    };
    addRenderedClip(exampleClip);

    // Add a scheduled post
    const scheduledPost: PostJob = {
      id: "post_example",
      renderedClipId: "rc_example",
      when: "2025-08-29T09:30:00-03:00",
      status: "scheduled"
    };
    addPostJob(scheduledPost);
  }

  addLog("info", "coleta", "Ciclo diário concluído", { 
    candidatesCreated: mockCandidates.length,
    cutProposalsCreated: store.cutProposals.length 
  });

  toast({
    title: "Ciclo Executado",
    description: `${mockCandidates.length} candidatos coletados com sucesso!`
  });
};

export const generateCuts = (candidateId: string) => {
  const store = useAppStore.getState();
  const { candidates, config, addCutProposal, addLog } = store;
  
  const candidate = candidates.find(c => c.id === candidateId);
  if (!candidate) return;

  const numCuts = Math.min(config.limits.maxCutsPerVideo, Math.floor(Math.random() * 3) + 1);
  
  for (let i = 0; i < numCuts; i++) {
    const start = Math.floor(Math.random() * candidate.duration_sec * 0.8);
    const duration = Math.floor(Math.random() * (config.limits.clipMaxSec - config.limits.clipMinSec)) + config.limits.clipMinSec;
    
    const proposal: CutProposal = {
      id: `cut_${candidateId}_${Date.now()}_${i}`,
      candidateId,
      start,
      end: start + duration,
      score: Math.random() * 0.4 + 0.6,
      reason: ["frase de impacto + risos", "momento viral", "reação épica", "insight interessante", "clímax da história"][Math.floor(Math.random() * 5)],
      status: "proposed"
    };
    
    addCutProposal(proposal);
  }

  addLog("info", "corte", "Cortes gerados", { candidateId, cutsGenerated: numCuts });
  
  toast({
    title: "Cortes Gerados",
    description: `${numCuts} propostas de corte criadas para "${candidate.title}"`
  });
};

export const adjustCut = (cutId: string, start: number, end: number) => {
  const store = useAppStore.getState();
  const { updateCutProposal, addLog, config } = store;

  // Validations
  if (end <= start) {
    toast({
      title: "Erro de Validação",
      description: "O tempo final deve ser maior que o inicial",
      variant: "destructive"
    });
    return false;
  }

  const duration = end - start;
  if (duration < config.limits.clipMinSec || duration > config.limits.clipMaxSec) {
    toast({
      title: "Erro de Validação", 
      description: `Duração deve estar entre ${config.limits.clipMinSec}s e ${config.limits.clipMaxSec}s`,
      variant: "destructive"
    });
    return false;
  }

  updateCutProposal(cutId, { start, end });
  addLog("info", "corte", "Corte ajustado", { cutId, start, end });
  
  toast({
    title: "Corte Ajustado",
    description: "Tempos atualizados com sucesso"
  });
  return true;
};

export const approveCut = (cutId: string) => {
  const store = useAppStore.getState();
  const { updateCutProposal, addLog } = store;

  updateCutProposal(cutId, { status: "approved" });
  addLog("info", "corte", "Corte aprovado", { cutId });
  
  toast({
    title: "Corte Aprovado",
    description: "Corte pronto para renderização!"
  });
};

export const renderClip = (
  cutId: string, 
  template: RenderedClip['template'], 
  titleInVideo: string, 
  subtitled: boolean
) => {
  const store = useAppStore.getState();
  const { addRenderedClip, addLog } = store;

  if (!titleInVideo.trim()) {
    toast({
      title: "Erro de Validação",
      description: "Título no vídeo é obrigatório",
      variant: "destructive"
    });
    return false;
  }

  const wordCount = titleInVideo.trim().split(/\s+/).length;
  if (wordCount > 8) {
    toast({
      title: "Erro de Validação",
      description: "Título deve ter no máximo 8 palavras",
      variant: "destructive"  
    });
    return false;
  }

  const clipId = `rc_${Date.now()}`;
  const clip: RenderedClip = {
    id: clipId,
    cutId,
    template,
    titleInVideo,
    subtitled,
    mp4Url: `https://files.local/${clipId}.mp4`,
    caption: "Conteúdo incrível! O que vocês acham? 🔥",
    hashtags: ["#viral", "#entretenimento", "#tiktokbr", "#brasil", "#conteudo"],
    variant: "A"
  };

  addRenderedClip(clip);
  addLog("info", "render", "Render concluído (mock)", { cutId, renderedClipId: clipId });

  toast({
    title: "Render Concluído",
    description: "MP4 pronto para postagem!"
  });
  return true;
};

export const generateABVariant = (renderedClipId: string) => {
  const store = useAppStore.getState();
  const { renderedClips, addRenderedClip, addLog } = store;

  const originalClip = renderedClips.find(c => c.id === renderedClipId);
  if (!originalClip) return;

  // Create B variant with modified caption and shuffled hashtags
  const variantClip: RenderedClip = {
    ...originalClip,
    id: `${originalClip.id}_variant_b`,
    caption: originalClip.caption.replace(/🔥/g, '💯').replace(/vocês/g, 'você'),
    hashtags: [...originalClip.hashtags].sort(() => Math.random() - 0.5),
    variant: "B"
  };

  addRenderedClip(variantClip);
  addLog("info", "render", "Variação B criada", { originalId: renderedClipId, variantId: variantClip.id });

  toast({
    title: "Variação B Criada",
    description: "Caption e hashtags alternativas geradas"
  });
};

export const schedulePost = (renderedClipId: string, when: string) => {
  const store = useAppStore.getState();
  const { addPostJob, addLog } = store;

  const job: PostJob = {
    id: `post_${Date.now()}`,
    renderedClipId,
    when,
    status: "scheduled"
  };

  addPostJob(job);
  addLog("info", "post", "Post agendado (mock)", { renderedClipId, when });

  toast({
    title: "Post Agendado",
    description: `Publicação programada para ${new Date(when).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`
  });
};

export const publishNow = (renderedClipId: string) => {
  const store = useAppStore.getState();
  const { addPostJob, addLog } = store;

  const job: PostJob = {
    id: `post_${Date.now()}`,
    renderedClipId,
    when: new Date().toISOString().replace('Z', '-03:00'),
    status: "done"
  };

  addPostJob(job);
  addLog("info", "post", "Post publicado (mock)", { renderedClipId });

  toast({
    title: "Post Publicado",
    description: "Vídeo publicado no TikTok com sucesso! (mock)"
  });
};

export const saveConfig = (configPatch: Partial<Config>) => {
  const store = useAppStore.getState();
  const { updateConfig, addLog } = store;

  updateConfig(configPatch);
  addLog("info", "config", "Configuração salva", configPatch);

  toast({
    title: "Configuração Salva",
    description: "Preferências atualizadas com sucesso"
  });
};