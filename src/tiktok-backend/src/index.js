import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ingestTop1 } from './handlers/ingest.js';
import { cutsSuggest } from './handlers/cuts.js';
import { renderClip } from './handlers/render.js';
import { publishTikTok } from './handlers/publish.js';
import { metricsDaily } from './handlers/metrics.js';

// Configuração do __dirname no ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega variáveis de ambiente
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();

// Middleware de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de logging
app.use(morgan('[:date[iso]] :method :url :status :response-time ms'));

// Middleware de parse JSON
app.use(express.json());

// Middleware de autenticação
export function requireAuth(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token || token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

// Rotas
app.get('/health', (req, res) => res.json({ ok: true }));
app.post('/ingest/youtube/top1', requireAuth, ingestTop1);
app.post('/cuts/suggest', requireAuth, cutsSuggest);
app.post('/render', requireAuth, renderClip);
app.post('/tiktok/publish', requireAuth, publishTikTok);
app.get('/metrics/daily', requireAuth, metricsDaily);

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});