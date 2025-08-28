import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { generateABVariant, schedulePost, publishNow } from "@/lib/actions";
import { Send, Clock, Edit2, Copy, Calendar } from "lucide-react";

export default function Postagem() {
  const { renderedClips, config } = useAppStore();
  const [editingClip, setEditingClip] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editHashtags, setEditHashtags] = useState<string[]>([]);
  const [schedulingClip, setSchedulingClip] = useState<string | null>(null);
  const [selectedWindow, setSelectedWindow] = useState("");
  const [customDateTime, setCustomDateTime] = useState("");

  const handleEditClip = (clip: any) => {
    setEditingClip(clip.id);
    setEditCaption(clip.caption);
    setEditHashtags([...clip.hashtags]);
  };

  const handleSaveEdit = () => {
    // In a real app, this would update the clip in the store
    setEditingClip(null);
    setEditCaption("");
    setEditHashtags([]);
  };

  const handleAddHashtag = () => {
    if (editHashtags.length < 10) {
      setEditHashtags([...editHashtags, ""]);
    }
  };

  const handleUpdateHashtag = (index: number, value: string) => {
    const newHashtags = [...editHashtags];
    newHashtags[index] = value;
    setEditHashtags(newHashtags);
  };

  const handleRemoveHashtag = (index: number) => {
    const newHashtags = editHashtags.filter((_, i) => i !== index);
    setEditHashtags(newHashtags);
  };

  const handleSchedulePost = () => {
    if (!schedulingClip) return;

    let scheduleTime: string;
    
    if (selectedWindow && selectedWindow !== "custom") {
      // Use predefined window for today
      const today = new Date();
      const [hours, minutes] = selectedWindow.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      scheduleTime = today.toISOString().replace('Z', '-03:00');
    } else if (customDateTime) {
      // Use custom date/time
      const customDate = new Date(customDateTime);
      scheduleTime = customDate.toISOString().replace('Z', '-03:00');
    } else {
      return; // No time selected
    }

    schedulePost(schedulingClip, scheduleTime);
    setSchedulingClip(null);
    setSelectedWindow("");
    setCustomDateTime("");
  };

  const getVariantLabel = (variant: string) => {
    return variant === "A" ? "Original" : "Variação B";
  };

  const getVariantBadge = (variant: string) => {
    return variant === "A" ? "default" : "secondary";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Postagem</h1>
          <p className="text-muted-foreground">
            Gerenciar e publicar clipes renderizados no TikTok
          </p>
        </div>
      </div>

      {renderedClips.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Send className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum clipe renderizado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Vá para "Render" e crie alguns clipes primeiro.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {renderedClips.map((clip) => (
            <Card key={clip.id} className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">{clip.titleInVideo}</h3>
                      <p className="text-sm text-muted-foreground">Template: {clip.template}</p>
                    </div>
                    <Badge variant={getVariantBadge(clip.variant) as any}>
                      {getVariantLabel(clip.variant)}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {clip.variant === "A" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateABVariant(clip.id)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Criar Variação B
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Preview */}
                <div className="aspect-[9/16] max-w-xs bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-medium mb-2">{clip.titleInVideo}</div>
                    <div className="text-xs text-muted-foreground">
                      Preview 9:16<br />
                      {clip.subtitled ? "Com legendas" : "Sem legendas"}
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Caption</Label>
                    <Dialog open={editingClip === clip.id} onOpenChange={(open) => !open && setEditingClip(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditClip(clip)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Caption e Hashtags</DialogTitle>
                          <DialogDescription>
                            Personalize o conteúdo antes da publicação
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Caption</Label>
                            <Textarea
                              value={editCaption}
                              onChange={(e) => setEditCaption(e.target.value)}
                              rows={3}
                              placeholder="Escreva uma caption envolvente..."
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Hashtags</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddHashtag}
                                disabled={editHashtags.length >= 10}
                              >
                                Adicionar
                              </Button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {editHashtags.map((hashtag, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <Input
                                    value={hashtag}
                                    onChange={(e) => handleUpdateHashtag(index, e.target.value)}
                                    placeholder={`#hashtag${index + 1}`}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveHashtag(index)}
                                  >
                                    ×
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingClip(null)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleSaveEdit}>
                            Salvar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {clip.caption}
                  </div>
                </div>

                {/* Hashtags */}
                <div className="space-y-2">
                  <Label>Hashtags</Label>
                  <div className="flex flex-wrap gap-2">
                    {clip.hashtags.map((hashtag, index) => (
                      <Badge key={index} variant="outline">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Dialog open={schedulingClip === clip.id} onOpenChange={(open) => !open && setSchedulingClip(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => setSchedulingClip(clip.id)}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Agendar (Mock)
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Agendar Postagem</DialogTitle>
                        <DialogDescription>
                          Escolha quando publicar este clipe no TikTok
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Janela de Postagem</Label>
                          <Select value={selectedWindow} onValueChange={setSelectedWindow}>
                            <SelectTrigger>
                              <SelectValue placeholder="Escolha um horário..." />
                            </SelectTrigger>
                            <SelectContent>
                              {config.postingWindows.map((window) => (
                                <SelectItem key={window} value={window}>
                                  Hoje às {window} (America/Sao_Paulo)
                                </SelectItem>
                              ))}
                              <SelectItem value="custom">Horário customizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedWindow === "custom" && (
                          <div className="space-y-2">
                            <Label>Data e Hora</Label>
                            <Input
                              type="datetime-local"
                              value={customDateTime}
                              onChange={(e) => setCustomDateTime(e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSchedulingClip(null)}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleSchedulePost}
                          disabled={!selectedWindow || (selectedWindow === "custom" && !customDateTime)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          Agendar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="gradient"
                    onClick={() => publishNow(clip.id)}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Publicar Agora (Mock)
                  </Button>

                  <Button variant="outline" asChild>
                    <a href={clip.mp4Url} download target="_blank" rel="noopener noreferrer">
                      Baixar MP4
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}