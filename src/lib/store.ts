import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  when: string; // ISO 8601 with -03:00 offset
  status: "scheduled" | "done";
}

export interface KPI {
  date: string; // YYYY-MM-DD
  views: number;
  ret3s: number;
  followers: number;
}

export interface LogEntry {
  ts: string; // ISO 8601 with -03:00 offset
  stage: "coleta" | "transcricao" | "corte" | "render" | "post" | "config";
  level: "info" | "warn" | "error";
  message: string;
  payload?: any;
}

export interface Config {
  sources: {
    youtube: boolean;
    podcasts: boolean;
    twitch: boolean;
  };
  categories: string[];
  limits: {
    candidatesPerDay: number;
    maxCutsPerVideo: number;
    clipMinSec: number;
    clipMaxSec: number;
  };
  tiktok: {
    businessAccountId: string;
    accessToken: string;
  };
  defaultTemplate: "Clean" | "Bold" | "Podcast";
  timezone: string;
  postingWindows: string[];
}

interface AppState {
  candidates: Candidate[];
  cutProposals: CutProposal[];
  renderedClips: RenderedClip[];
  postJobs: PostJob[];
  kpis: KPI[];
  logs: LogEntry[];
  config: Config;
  
  // Actions
  setCandidates: (candidates: Candidate[]) => void;
  addCandidate: (candidate: Candidate) => void;
  setCutProposals: (proposals: CutProposal[]) => void;
  addCutProposal: (proposal: CutProposal) => void;
  updateCutProposal: (id: string, updates: Partial<CutProposal>) => void;
  setRenderedClips: (clips: RenderedClip[]) => void;
  addRenderedClip: (clip: RenderedClip) => void;
  setPostJobs: (jobs: PostJob[]) => void;
  addPostJob: (job: PostJob) => void;
  setKpis: (kpis: KPI[]) => void;
  addLog: (level: LogEntry['level'], stage: LogEntry['stage'], message: string, payload?: any) => void;
  clearLogs: () => void;
  updateConfig: (updates: Partial<Config>) => void;
}

const getCurrentTimestamp = (): string => {
  return new Date().toISOString().replace('Z', '-03:00');
};

const initialState = {
  candidates: [],
  cutProposals: [],
  renderedClips: [],
  postJobs: [],
  kpis: [
    { date: "2025-08-21", views: 2500, ret3s: 0.29, followers: 120 },
    { date: "2025-08-22", views: 3200, ret3s: 0.31, followers: 135 },
    { date: "2025-08-23", views: 1800, ret3s: 0.25, followers: 142 },
    { date: "2025-08-24", views: 4100, ret3s: 0.33, followers: 158 },
    { date: "2025-08-25", views: 2900, ret3s: 0.28, followers: 167 },
    { date: "2025-08-26", views: 3700, ret3s: 0.35, followers: 184 },
    { date: "2025-08-27", views: 2100, ret3s: 0.27, followers: 192 }
  ],
  logs: [
    {
      ts: getCurrentTimestamp(),
      stage: "config" as const,
      level: "info" as const,
      message: "Sistema inicializado",
      payload: { version: "1.0.0" }
    }
  ],
  config: {
    sources: { youtube: true, podcasts: true, twitch: true },
    categories: ["humor", "esportes", "famosos", "entretenimento"],
    limits: { candidatesPerDay: 8, maxCutsPerVideo: 2, clipMinSec: 15, clipMaxSec: 60 },
    tiktok: { businessAccountId: "", accessToken: "" },
    defaultTemplate: "Clean" as const,
    timezone: "America/Sao_Paulo",
    postingWindows: ["09:30", "14:00", "20:00"]
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCandidates: (candidates) => set({ candidates }),
      
      addCandidate: (candidate) => set((state) => ({
        candidates: [...state.candidates, candidate]
      })),

      setCutProposals: (cutProposals) => set({ cutProposals }),
      
      addCutProposal: (proposal) => set((state) => ({
        cutProposals: [...state.cutProposals, proposal]
      })),

      updateCutProposal: (id, updates) => set((state) => ({
        cutProposals: state.cutProposals.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),

      setRenderedClips: (renderedClips) => set({ renderedClips }),
      
      addRenderedClip: (clip) => set((state) => ({
        renderedClips: [...state.renderedClips, clip]
      })),

      setPostJobs: (postJobs) => set({ postJobs }),
      
      addPostJob: (job) => set((state) => ({
        postJobs: [...state.postJobs, job]
      })),

      setKpis: (kpis) => set({ kpis }),

      addLog: (level, stage, message, payload) => {
        const log: LogEntry = {
          ts: getCurrentTimestamp(),
          stage,
          level,
          message,
          payload
        };
        set((state) => ({
          logs: [...state.logs, log]
        }));
      },

      clearLogs: () => set({ logs: [] }),

      updateConfig: (updates) => set((state) => ({
        config: { ...state.config, ...updates }
      }))
    }),
    {
      name: 'tiktok-automation-store',
      version: 1
    }
  )
);