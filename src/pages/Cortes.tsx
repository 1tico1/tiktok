import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store";
import { adjustCut, approveCut } from "@/lib/actions";
import { Edit2, CheckCircle, Clock, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Cortes() {
  const { cutProposals, candidates } = useAppStore();
  const [editingCut, setEditingCut] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Group proposals by candidate
  const groupedProposals = cutProposals.reduce((acc, proposal) => {
    const candidate = candidates.find(c => c.id === proposal.candidateId);
    if (candidate) {
      if (!acc[candidate.id]) {
        acc[candidate.id] = {
          candidate,
          proposals: []
        };
      }
      acc[candidate.id].proposals.push(proposal);
    }
    return acc;
  }, {} as Record<string, { candidate: any, proposals: typeof cutProposals }>);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (start: number, end: number) => {
    const duration = end - start;
    return `${Math.floor(duration)}s`;
  };

  const handleEditCut = (cut: any) => {
    setEditingCut(cut.id);
    setStartTime(cut.start.toString());
    setEndTime(cut.end.toString());
  };

  const handleSaveCut = () => {
    if (!editingCut) return;
    
    const start = parseFloat(startTime);
    const end = parseFloat(endTime);
    
    if (isNaN(start) || isNaN(end)) {
      toast({
        title: "Erro de Validação",
        description: "Insira valores numéricos válidos",
        variant: "destructive"
      });
      return;
    }

    const success = adjustCut(editingCut, start, end);
    if (success) {
      setEditingCut(null);
      setStartTime("");
      setEndTime("");
    }
  };

  const handleApproveCut = (cutId: string) => {
    approveCut(cutId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-success";
    if (score >= 0.6) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cortes</h1>
          <p className="text-muted-foreground">
            Revisar e aprovar propostas de corte
          </p>
        </div>
      </div>

      {Object.keys(groupedProposals).length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum corte proposto</h3>
            <p className="text-muted-foreground text-center mb-4">
              Vá para "Candidatos" e gere algumas propostas de corte primeiro.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedProposals).map(([candidateId, group]) => (
            <Card key={candidateId} className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{group.candidate.title}</h3>
                    <p className="text-sm text-muted-foreground">{group.candidate.channel}</p>
                  </div>
                  <Badge variant="outline">{group.candidate.category}</Badge>
                </CardTitle>
                <CardDescription>
                  {group.proposals.length} proposta(s) de corte disponível(is)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.proposals.map((proposal) => (
                    <div key={proposal.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <div className="font-medium flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {formatTime(proposal.start)} - {formatTime(proposal.end)}
                            </div>
                            <div className="text-muted-foreground">
                              Duração: {formatDuration(proposal.start, proposal.end)}
                            </div>
                          </div>
                          
                          <div className="text-sm">
                            <div className={`font-medium ${getScoreColor(proposal.score)}`}>
                              Score: {(proposal.score * 100).toFixed(0)}%
                            </div>
                            <div className="text-muted-foreground">
                              {proposal.reason}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={proposal.status === "approved" ? "success" : "secondary"}
                          >
                            {proposal.status === "approved" ? "Aprovado" : "Proposto"}
                          </Badge>
                        </div>
                      </div>

                      {/* Preview placeholder */}
                      <div className="w-full h-24 bg-muted rounded-md flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">
                          Preview do corte {formatTime(proposal.start)}-{formatTime(proposal.end)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Dialog open={editingCut === proposal.id} onOpenChange={(open) => !open && setEditingCut(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditCut(proposal)}
                            >
                              <Edit2 className="h-4 w-4 mr-1" />
                              Ajustar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ajustar Tempos do Corte</DialogTitle>
                              <DialogDescription>
                                Modifique o início e fim do corte em segundos
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="start" className="text-right">
                                  Início (s)
                                </Label>
                                <Input
                                  id="start"
                                  type="number"
                                  step="0.1"
                                  value={startTime}
                                  onChange={(e) => setStartTime(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="end" className="text-right">
                                  Fim (s)
                                </Label>
                                <Input
                                  id="end"
                                  type="number"
                                  step="0.1"
                                  value={endTime}
                                  onChange={(e) => setEndTime(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setEditingCut(null)}
                              >
                                Cancelar
                              </Button>
                              <Button onClick={handleSaveCut}>
                                Salvar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApproveCut(proposal.id)}
                          disabled={proposal.status === "approved"}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {proposal.status === "approved" ? "Aprovado" : "Aprovar"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}