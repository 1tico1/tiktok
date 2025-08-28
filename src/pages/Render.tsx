import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/lib/store";
import { renderClip } from "@/lib/actions";
import { Video, Subtitles, Type, Palette } from "lucide-react";
import type { RenderedClip } from "@/lib/store";

export default function Render() {
  const { cutProposals, candidates } = useAppStore();
  const [selectedTemplate, setSelectedTemplate] = useState<RenderedClip['template']>("Clean");
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [titleInVideo, setTitleInVideo] = useState("");
  const [showTitle, setShowTitle] = useState(true);

  // Get approved cuts that are ready for rendering
  const approvedCuts = cutProposals.filter(cut => cut.status === "approved");

  const templates = [
    {
      id: "Clean" as const,
      name: "Clean",
      description: "Design minimalista com foco no conteúdo",
      preview: "bg-gradient-to-b from-gray-100 to-gray-200"
    },
    {
      id: "Bold" as const,
      name: "Bold",
      description: "Cores vibrantes e elementos chamativos",
      preview: "bg-gradient-primary"
    },
    {
      id: "Podcast" as const,
      name: "Podcast",
      description: "Estilo profissional para conversas",
      preview: "bg-gradient-secondary"
    }
  ];

  const handleRender = (cutId: string) => {
    if (showTitle && !titleInVideo.trim()) {
      return; // renderClip will handle the validation
    }

    const success = renderClip(cutId, selectedTemplate, titleInVideo, subtitlesEnabled);
    if (success) {
      setTitleInVideo("");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = titleInVideo.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Render</h1>
          <p className="text-muted-foreground">
            Configurar e renderizar vídeos no formato 9:16
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Template Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Template 9:16
              </CardTitle>
              <CardDescription>
                Escolha o estilo visual do vídeo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate === template.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className={`w-full h-16 rounded-md mb-3 ${template.preview}`} />
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground">{template.description}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Subtitle Settings */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Subtitles className="h-5 w-5" />
                Legendas
              </CardTitle>
              <CardDescription>
                Configurações de legenda automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="subtitles">Legendar automaticamente</Label>
                <Switch
                  id="subtitles"
                  checked={subtitlesEnabled}
                  onCheckedChange={setSubtitlesEnabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Legendas são recomendadas para melhor engajamento
              </p>
            </CardContent>
          </Card>

          {/* Title Settings */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Título no Vídeo
              </CardTitle>
              <CardDescription>
                Hook para os primeiros 2 segundos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showTitle">Exibir título no vídeo</Label>
                <Switch
                  id="showTitle"
                  checked={showTitle}
                  onCheckedChange={setShowTitle}
                />
              </div>
              
              {showTitle && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="titleText">Texto do título (máx. 8 palavras)</Label>
                    <Input
                      id="titleText"
                      placeholder="Ninguém esperava isso!"
                      value={titleInVideo}
                      onChange={(e) => setTitleInVideo(e.target.value)}
                      className={wordCount > 8 ? "border-destructive" : ""}
                    />
                    <div className="flex justify-between text-xs">
                      <span className={wordCount > 8 ? "text-destructive" : "text-muted-foreground"}>
                        {wordCount} / 8 palavras
                      </span>
                      <span className="text-muted-foreground">Posição: Top</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Approved Cuts */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Cortes Aprovados
              </CardTitle>
              <CardDescription>
                Cortes prontos para renderização ({approvedCuts.length} disponíveis)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedCuts.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum corte aprovado</h3>
                  <p className="text-muted-foreground">
                    Vá para "Cortes" e aprove algumas propostas primeiro.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedCuts.map((cut) => {
                    const candidate = candidates.find(c => c.id === cut.candidateId);
                    if (!candidate) return null;

                    return (
                      <div key={cut.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{candidate.title}</h4>
                            <p className="text-sm text-muted-foreground">{candidate.channel}</p>
                          </div>
                          <Badge variant="success">Aprovado</Badge>
                        </div>

                        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                          <span>
                            Tempo: {formatTime(cut.start)} - {formatTime(cut.end)}
                          </span>
                          <span>
                            Duração: {Math.floor(cut.end - cut.start)}s
                          </span>
                          <span>
                            Score: {(cut.score * 100).toFixed(0)}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="font-medium">Motivo:</div>
                            <div className="text-muted-foreground">{cut.reason}</div>
                          </div>
                          
                          <Button 
                            variant="gradient"
                            onClick={() => handleRender(cut.id)}
                            disabled={showTitle && !titleInVideo.trim()}
                          >
                            Renderizar (Mock)
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}