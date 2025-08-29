// ⬇️ importe os tipos
import type { Candidate, CutProposal, RenderedClip, PostJob, KPI } from "./types";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "";
const API_TOKEN = (import.meta as any).env?.VITE_API_TOKEN || "";

async function req<T=any>(path: string, method: "GET"|"POST" = "POST", body?: any): Promise<T> {
  if (!API_BASE) throw new Error("VITE_API_BASE não configurado.");
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${API_TOKEN}` },
    body: method === "GET" ? undefined : JSON.stringify(body || {})
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text().catch(()=>res.statusText)}`);
  return res.json() as Promise<T>;
}

export const api = {
  health: () => req<{ok:boolean}>("/health", "GET"),
  ingestTop1: (category: string) => req<Candidate[]>("/ingest/youtube/top1", "POST", { category }),
  cutsSuggest: (candidateId: string, transcriptUrl?: string) =>
    req<CutProposal[]>("/cuts/suggest", "POST", { candidateId, transcriptUrl }),
  renderClip: (cutId: string, template: "Clean"|"Bold"|"Podcast", titleInVideo: string, subtitled: boolean) =>
    req<RenderedClip>("/render", "POST", { cutId, template, titleInVideo, subtitled }),
  publish: (renderedClipId: string, whenISO: string, caption?: string, hashtags?: string[]) =>
    req<PostJob>("/tiktok/publish", "POST", { renderedClipId, whenISO, caption, hashtags }),
  metricsDaily: (start: string, end: string) =>
    req<KPI[]>(`/metrics/daily?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`, "GET"),
};
// reexporte tipos para importar de um lugar só
export type { Candidate, CutProposal, RenderedClip, PostJob, KPI };