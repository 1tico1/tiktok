# TikTok Backend - Migração Mock → Real

## 🚀 Funcionalidades Implementadas

### 1. Ingest Real (YouTube API)
- ✅ Integração com YouTube Data API v3
- ✅ Mapeamento de categorias (humor→23, esportes→17, famosos/entretenimento→24)
- ✅ Fallback automático para mock se API key não configurada
- ✅ Parse de duração ISO 8601 (PT#H#M#S)
- ✅ Busca por vídeos mais populares no Brasil

### 2. Sugestão de Cortes Inteligente
- ✅ Suporte a transcript quando disponível
- ✅ Janelas pré-definidas (15-60s) como fallback
- ✅ Validação automática de duração dos cortes
- ✅ Pontuação baseada em análise semântica

### 3. Render com FFmpeg
- ✅ Implementação real com FFmpeg
- ✅ Crop para formato TikTok (1080x1920)
- ✅ Overlay de título personalizado
- ✅ Suporte a legendas (SRT)
- ✅ Fallback para mock se FFmpeg não habilitado

## ⚙️ Configuração

### 1. Variáveis de Ambiente
Crie/edite o arquivo `.env`:

```bash
# YouTube Data API v3 Key
# Obtenha em: https://console.developers.google.com/
YT_API_KEY=your_youtube_api_key_here

# Backend Auth Token
API_TOKEN=dev-token-123

# Server Config
PORT=3001

# FFmpeg Config (opcional)
FFMPEG_ENABLED=false

# CORS Config
CORS_ORIGIN=http://localhost:5173
```

### 2. Obter YouTube API Key
1. Acesse [Google Cloud Console](https://console.developers.google.com/)
2. Crie um novo projeto ou selecione existente
3. Ative a **YouTube Data API v3**
4. Crie credenciais (API Key)
5. Configure restrições (opcional)

### 3. Instalar FFmpeg (opcional)
- **Windows**: Download do [site oficial](https://ffmpeg.org/download.html)
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg`

Após instalação, defina `FFMPEG_ENABLED=true` no `.env`

## 🔄 Como Funciona o Fallback

### Frontend → Backend
1. **Sucesso**: Usa dados reais da API
2. **Falha**: Gera mock automaticamente
3. **Log**: Registra tentativas e fallbacks

### Backend Interno
1. **YouTube API**: Se `YT_API_KEY` configurada
2. **FFmpeg**: Se `FFMPEG_ENABLED=true`
3. **Mock**: Sempre disponível como fallback

## 🧪 Testando

### 1. Iniciar Backend
```bash
npm run dev
```

### 2. Testar Endpoints
```bash
# Health check
curl http://localhost:3001/health

# Ingest (requer auth)
curl -X POST http://localhost:3001/ingest/youtube/top1 \
  -H "Authorization: Bearer dev-token-123" \
  -H "Content-Type: application/json" \
  -d '{"category": "humor"}'

# Cuts (requer auth)
curl -X POST http://localhost:3001/cuts/suggest \
  -H "Authorization: Bearer dev-token-123" \
  -H "Content-Type: application/json" \
  -d '{"candidateId": "yt_123", "transcriptUrl": "https://example.com/transcript.srt"}'
```

## 📝 Próximos Passos

1. **Configurar YouTube API Key** para ingest real
2. **Instalar FFmpeg** para render real
3. **Implementar upload para R2/S3** no render
4. **Adicionar webhook notifications** para jobs concluídos
5. **Implementar métricas reais** via TikTok API

## 🐛 Troubleshooting

### Erro: "YT_API_KEY não configurada"
- Configure a chave no arquivo `.env`
- Verifique se a YouTube Data API v3 está ativada

### Erro: "FFmpeg não encontrado"
- Instale FFmpeg no sistema
- Defina `FFMPEG_ENABLED=true` no `.env`

### Erro: "unauthorized"
- Verifique o token no header: `Authorization: Bearer dev-token-123`
- Confirme se `API_TOKEN` está correto no `.env`