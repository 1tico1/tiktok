export interface Candidate {
  id: string;
  source: "YouTube" | "Podcasts" | "Twitch";
  url: string;
  title: string;
  channel: string;
  category: string;
  views: number;
  duration_sec: number;
  isTop1InCategory: boolean;
  transcriptReady: boolean;
}

export interface CutProposal {
  id: string;
  candidateId: string;
  start: number;
  end: number;
  score: number;
  reason: string;
  status: "proposed" | "approved";
}

export interface RenderedClip {
  id: string;
  cutId: string;
  template: "Clean" | "Bold" | "Podcast";
  titleInVideo: string;
  subtitled: boolean;
  mp4Url: string;
  caption: string;
  hashtags: string[];
  variant: "A" | "B";
}

export interface PostJob {
  id: string;
  renderedClipId: string;
  when: string; // "2025-08-29T09:30:00-03:00"
  status: "scheduled" | "done";
}

export interface KPI {
  date: string;
  views: number;
  ret3s: number;
  followers: number;
}

export interface LogEntry {
  ts: string;
  stage: "coleta" | "transcrição" | "corte" | "render" | "postagem" | "config";
  level: "info" | "warn" | "error";
  message: string;
  payload?: unknown;
}

export interface Config {
  sources: { youtube: boolean; podcasts: boolean; twitch: boolean };
  categories: string[];
  limits: { candidatesPerDay: number; maxCutsPerVideo: number; clipMinSec: number; clipMaxSec: number };
  tiktok: { businessAccountId: string; accessToken: string };
  defaultTemplate: "Clean" | "Bold" | "Podcast";
  timezone: "America/Sao_Paulo";
  postingWindows: string[]; // ["09:30","14:00","20:00"]
}

export interface AppState {
  config: Config;
  candidates: Candidate[];
  cutProposals: CutProposal[];
  renderedClips: RenderedClip[];
  postJobs: PostJob[];
  kpis: KPI[];
  logs: LogEntry[];
}