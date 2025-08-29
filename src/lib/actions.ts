import { toast } from "@/hooks/use-toast";
import { useAppStore } from "./store";
import type { Config } from "./store";
import { api, type Candidate, type CutProposal, type RenderedClip, type PostJob, type KPI } from "@/lib/api";
import type { AppState } from "@/lib/types";

export const runDailyCycle = async () => {
  const store = useAppStore.getState();
  const { config, addLog, setCandidates } = store;

  addLog("info", "coleta", "Iniciando ciclo diário", { timestamp: new Date().toISOString() });

  try {
    const cats = config.categories;
    let all: Candidate[] = [];
    
    for (const c of cats) {
      try {
        const arr = await api.ingestTop1(c);
        all = all.concat(arr);
      } catch (apiError) {
        console.warn(`[runDailyCycle] API falhou para categoria ${c}, usando fallback:`, apiError);
        // Fallback: gerar mock para essa categoria
        const mockCandidate: Candidate = {
          id: `mock_${c}_${Date.now()}`,
          source: "YouTube",
          url: "https://youtu.be/mock",
          title: `TOP 1 ${c} — Corte do dia (mock)`,
          channel: `${c.toUpperCase()} Cast`,
          category: c,
          views: 500000 + Math.floor(Math.random()*600000),
          duration_sec: 3600,
          isTop1InCategory: true,
          transcriptReady: false
        };
        all.push(mockCandidate);
      }
    }
    
    setCandidates(all);
    addLog("info", "coleta", "Ingest concluído (YouTube)", { total: all.length, cats });

    toast({
      title: "Ciclo Executado",
      description: `${all.length} candidatos coletados com sucesso!`
    });
  } catch (error) {
    addLog("error", "coleta", "Erro no ciclo diário", { error });
    
    toast({
      title: "Erro no Ciclo",
      description: error instanceof Error ? error.message : "Erro desconhecido",
      variant: "destructive"
    });
  }
};

export const generateCuts = async (candidateId: string) => {
  const store = useAppStore.getState();
  const { candidates, setCutProposals, addLog } = store;
  
  const candidate: Candidate | undefined = candidates.find((c: Candidate) => c.id === candidateId);
  if (!candidate) return;

  try {
    const proposals: CutProposal[] = await api.cutsSuggest(candidateId);
    setCutProposals(proposals);

    addLog("info", "corte", "Cortes gerados", { 
      candidateId, 
      cutsGenerated: proposals.length 
    });
    
    toast({
      title: "Cortes Gerados",
      description: `${proposals.length} propostas de corte criadas para "${candidate.title}"`
    });
  } catch (error) {
    addLog("error", "corte", "Erro ao gerar cortes", { error });
    throw error;
  }
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

export const renderClip = async (
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

  try {
    const clip: RenderedClip = await api.renderClip(cutId, template, titleInVideo, subtitled);

    addRenderedClip(clip);
    addLog("info", "render", "Render concluído", { 
      cutId, 
      renderedClipId: clip.id 
    });

    toast({
      title: "Render Concluído",
      description: "MP4 pronto para postagem!"
    });
    return true;
  } catch (error) {
    addLog("error", "render", "Erro ao renderizar", { error });
    return false;
  }
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

export const schedulePost = async (renderedClipId: string, when: string) => {
  const store = useAppStore.getState();
  const { renderedClips, addPostJob, addLog } = store;

  const clip: RenderedClip | undefined = renderedClips.find((c: RenderedClip) => c.id === renderedClipId);
  if (!clip) return;

  try {
    const result: PostJob = await api.publish(renderedClipId, when, clip.caption, clip.hashtags);

    const job: PostJob = {
      id: result.id,
      renderedClipId,
      when,
      status: "scheduled"
    };

    addPostJob(job);
    addLog("info", "post", "Post agendado", { renderedClipId, when });

    toast({
      title: "Post Agendado",
      description: `Publicação programada para ${new Date(when).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`
    });
  } catch (error) {
    addLog("error", "post", "Erro ao agendar", { error });
    throw error;
  }
};

export const publishNow = async (renderedClipId: string) => {
  const store = useAppStore.getState();
  const { renderedClips, addPostJob, addLog } = store;

  const clip: RenderedClip | undefined = renderedClips.find((c: RenderedClip) => c.id === renderedClipId);
  if (!clip) return;

  try {
    const result: PostJob = await api.publish(renderedClipId, new Date().toISOString().replace('Z', '-03:00'), clip.caption, clip.hashtags);

    const job: PostJob = {
      id: result.id,
      renderedClipId,
      when: new Date().toISOString().replace('Z', '-03:00'),
      status: "done"
    };

    addPostJob(job);
    addLog("info", "post", "Post publicado", { renderedClipId });

    toast({
      title: "Post Publicado",
      description: "Vídeo publicado no TikTok com sucesso!"
    });
  } catch (error) {
    addLog("error", "post", "Erro ao publicar", { error });
    throw error;
  }
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