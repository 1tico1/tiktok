import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAppStore } from "@/lib/store";
import { FileText, Search, Trash2, Eye, AlertCircle, Info, AlertTriangle } from "lucide-react";
import type { LogEntry } from "@/lib/store";

export default function Logs() {
  const { logs, clearLogs } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLog, setExpandedLog] = useState<LogEntry | null>(null);

  const filteredLogs = logs
    .filter(log => 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.stage.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-info" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getLevelBadge = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return "info";
      case 'warn':
        return "warning";
      case 'error':
        return "destructive";
    }
  };

  const getStageBadge = (stage: LogEntry['stage']) => {
    const stageColors = {
      coleta: "default",
      transcricao: "secondary",
      corte: "outline",
      render: "info",
      post: "success",
      config: "warning"
    } as const;

    return stageColors[stage] || "outline";
  };

  const handleClearLogs = () => {
    clearLogs();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground">
            Histórico de atividades do sistema ({logs.length} entradas)
          </p>
        </div>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={logs.length === 0}>
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar Logs
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar todos os logs?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os logs serão permanentemente removidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearLogs}>
                  Limpar Logs
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>
            Entradas de Log ({filteredLogs.length})
          </CardTitle>
          <CardDescription>
            Histórico cronológico das atividades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {logs.length === 0 ? "Nenhum log disponível" : "Nenhum resultado encontrado"}
              </h3>
              <p className="text-muted-foreground">
                {logs.length === 0 
                  ? "Execute algumas ações para gerar logs do sistema."
                  : "Tente ajustar os termos de busca."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Data/Hora</TableHead>
                    <TableHead className="w-[100px]">Etapa</TableHead>
                    <TableHead className="w-[80px]">Nível</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">
                        {formatTimestamp(log.ts)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStageBadge(log.stage) as any}>
                          {log.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getLevelIcon(log.level)}
                          <Badge variant={getLevelBadge(log.level) as any} className="text-xs">
                            {log.level}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {log.message}
                      </TableCell>
                      <TableCell>
                        <Dialog 
                          open={expandedLog?.ts === log.ts} 
                          onOpenChange={(open) => !open && setExpandedLog(null)}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setExpandedLog(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {getLevelIcon(log.level)}
                                Detalhes do Log
                              </DialogTitle>
                              <DialogDescription>
                                {formatTimestamp(log.ts)} • {log.stage} • {log.level}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Mensagem</h4>
                                <p className="text-sm bg-muted p-3 rounded-md">
                                  {log.message}
                                </p>
                              </div>
                              {log.payload && (
                                <div>
                                  <h4 className="font-medium mb-2">Payload (JSON)</h4>
                                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-60">
                                    {JSON.stringify(log.payload, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}