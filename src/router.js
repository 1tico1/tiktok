const express = require('express');
const { requireAuth } = require('./middleware/auth');
const { ingestTop1 } = require('./handlers/ingest');
const { cutsSuggest } = require('./handlers/cuts');
const { renderClip } = require('./handlers/render');
const { publishTikTok } = require('./handlers/publish');
const { metricsDaily } = require('./handlers/metrics');

const router = express.Router();

// Health check (sem auth)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas protegidas
router.post('/ingest/youtube/top1', requireAuth, ingestTop1);
router.post('/cuts/suggest', requireAuth, cutsSuggest);
router.post('/render', requireAuth, renderClip);
router.post('/tiktok/publish', requireAuth, publishTikTok);
router.get('/metrics/daily', requireAuth, metricsDaily);

module.exports = router;