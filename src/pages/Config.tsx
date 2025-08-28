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
import { saveConfig } from "@/lib/actions";
import { Settings, Globe, Target, Clock, Key, Plus, X } from "lucide-react";
import type { Config } from "@/lib/store";

export default function ConfigPage() {
  const { config } = useAppStore();
  const [localConfig, setLocalConfig] = useState<Config>({ ...config });
  const [newCategory, setNewCategory] = useState("");

  const updateLocalConfig = (updates: Partial<Config>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    saveConfig(localConfig);
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !localConfig.categories.includes(newCategory.trim())) {
      updateLocalConfig({
        categories: [...localConfig.categories, newCategory.trim()]
      });
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    updateLocalConfig({
      categories: localConfig.categories.filter(c => c !== category)
    });
  };

  const hasChanges = JSON.stringify(config) !== JSON.stringify(localConfig);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuração</h1>
          <p className="text-muted-foreground">
            Gerenciar preferências do sistema e credenciais
          </p>
        </div>
        <Button 
          variant="gradient" 
          onClick={handleSave}
          disabled={!hasChanges}
        >
          <Settings className="h-4 w-4 mr-1" />
          Salvar Configurações
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sources */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Fontes de Conteúdo
            </CardTitle>
            <CardDescription>
              Configure quais plataformas usar para coleta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>YouTube</Label>
                <p className="text-xs text-muted-foreground">Vídeos do YouTube Brasil</p>
              </div>
              <Switch
                checked={localConfig.sources.youtube}
                onCheckedChange={(checked) => 
                  updateLocalConfig({
                    sources: { ...localConfig.sources, youtube: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Podcasts</Label>
                <p className="text-xs text-muted-foreground">Podcasts públicos relevantes</p>
              </div>
              <Switch
                checked={localConfig.sources.podcasts}
                onCheckedChange={(checked) => 
                  updateLocalConfig({
                    sources: { ...localConfig.sources, podcasts: checked }
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Twitch</Label>
                <p className="text-xs text-muted-foreground">Lives e clipes da Twitch</p>
              </div>
              <Switch
                checked={localConfig.sources.twitch}
                onCheckedChange={(checked) => 
                  updateLocalConfig({
                    sources: { ...localConfig.sources, twitch: checked }
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Categorias Alvo
            </CardTitle>
            <CardDescription>
              Definir que tipos de conteúdo coletar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {localConfig.categories.map((category) => (
                <Badge key={category} variant="outline" className="gap-2">
                  {category}
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Nova categoria..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCategory}
                disabled={!newCategory.trim() || localConfig.categories.includes(newCategory.trim())}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Limits */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Limites Operacionais
            </CardTitle>
            <CardDescription>
              Configurar limites de coleta e processamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Candidatos por dia</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={localConfig.limits.candidatesPerDay}
                onChange={(e) => 
                  updateLocalConfig({
                    limits: { 
                      ...localConfig.limits, 
                      candidatesPerDay: parseInt(e.target.value) || 1 
                    }
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Máximo de cortes por vídeo</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={localConfig.limits.maxCutsPerVideo}
                onChange={(e) => 
                  updateLocalConfig({
                    limits: { 
                      ...localConfig.limits, 
                      maxCutsPerVideo: parseInt(e.target.value) || 1 
                    }
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duração mínima (s)</Label>
                <Input
                  type="number"
                  min="5"
                  max="60"
                  value={localConfig.limits.clipMinSec}
                  onChange={(e) => 
                    updateLocalConfig({
                      limits: { 
                        ...localConfig.limits, 
                        clipMinSec: parseInt(e.target.value) || 15 
                      }
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Duração máxima (s)</Label>
                <Input
                  type="number"
                  min="15"
                  max="180"
                  value={localConfig.limits.clipMaxSec}
                  onChange={(e) => 
                    updateLocalConfig({
                      limits: { 
                        ...localConfig.limits, 
                        clipMaxSec: parseInt(e.target.value) || 60 
                      }
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TikTok Credentials */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Credenciais TikTok
            </CardTitle>
            <CardDescription>
              Configurar acesso à TikTok Business API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business Account ID</Label>
              <Input
                type="password"
                placeholder="ID da conta business..."
                value={localConfig.tiktok.businessAccountId}
                onChange={(e) => 
                  updateLocalConfig({
                    tiktok: { 
                      ...localConfig.tiktok, 
                      businessAccountId: e.target.value 
                    }
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Access Token</Label>
              <Input
                type="password"
                placeholder="Token de acesso..."
                value={localConfig.tiktok.accessToken}
                onChange={(e) => 
                  updateLocalConfig({
                    tiktok: { 
                      ...localConfig.tiktok, 
                      accessToken: e.target.value 
                    }
                  })
                }
              />
            </div>

            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">
                ⚠️ As credenciais são salvas localmente. Configure através do painel de desenvolvedor do TikTok.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Default Settings */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Configurações Padrão
            </CardTitle>
            <CardDescription>
              Template padrão, timezone e janelas de postagem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Template Padrão</Label>
                <Select 
                  value={localConfig.defaultTemplate} 
                  onValueChange={(value: any) => 
                    updateLocalConfig({ defaultTemplate: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Clean">Clean</SelectItem>
                    <SelectItem value="Bold">Bold</SelectItem>
                    <SelectItem value="Podcast">Podcast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={localConfig.timezone} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">America/Sao_Paulo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Janelas de Postagem Padrão</Label>
              <div className="flex flex-wrap gap-2">
                {localConfig.postingWindows.map((window, index) => (
                  <Badge key={index} variant="outline">
                    {window}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Horários configurados para {localConfig.timezone}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}