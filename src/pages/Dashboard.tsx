import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { runDailyCycle } from "@/lib/actions";
import { PlayCircle, Users, Scissors, Video, Send } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { candidates, cutProposals, renderedClips, postJobs, kpis } = useAppStore();

  const todayStats = {
    candidatesCollected: candidates.length,
    cutsGenerated: cutProposals.length,
    videosRendered: renderedClips.length,
    postsScheduled: postJobs.filter(j => j.status === "scheduled").length,
    postsDone: postJobs.filter(j => j.status === "done").length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral da automação de conteúdo TikTok
          </p>
        </div>
        <Button 
          variant="hero" 
          size="lg" 
          onClick={runDailyCycle}
          className="gap-2"
        >
          <PlayCircle className="h-5 w-5" />
          Executar Ciclo de Hoje (Mock)
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Candidatos Coletados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{todayStats.candidatesCollected}</div>
            <p className="text-xs text-muted-foreground">
              {candidates.filter(c => c.isTop1InCategory).length} são TOP 1
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cortes Gerados
            </CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{todayStats.cutsGenerated}</div>
            <p className="text-xs text-muted-foreground">
              {cutProposals.filter(c => c.status === "approved").length} aprovados
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vídeos Renderizados
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{todayStats.videosRendered}</div>
            <p className="text-xs text-muted-foreground">
              Prontos para postagem
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Posts Agendados
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{todayStats.postsScheduled}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.postsDone} já publicados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="col-span-full shadow-card">
        <CardHeader>
          <CardTitle>Performance dos Últimos 7 Dias</CardTitle>
          <CardDescription>
            Views, retenção de 3s e novos seguidores
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={kpis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              />
              <YAxis />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                formatter={(value: any, name: any) => {
                  if (name === 'views') return [Number(value).toLocaleString(), 'Views'];
                  if (name === 'ret3s') return [(Number(value) * 100).toFixed(1) + '%', 'Retenção 3s'];
                  if (name === 'followers') return [Number(value), 'Seguidores'];
                  return [value, name];
                }}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))' }}
              />
              <Line 
                type="monotone" 
                dataKey="ret3s" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-2))' }}
                yAxisId="right"
              />
              <Line 
                type="monotone" 
                dataKey="followers" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-3))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}