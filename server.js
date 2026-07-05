/*
 * Trope and Tell Post Builder - local server
 *
 * Serves index.html and proxies API calls to Ghost and Anthropic so the app
 * never hits browser CORS restrictions, and never needs to be opened directly
 * as a file:// URL.
 *
 * Run with: npm start
 * Then open: http://localhost:3000
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// The Admin API must always be called on the underlying Ghost.io subdomain,
// even if the site also has a custom public domain (e.g. tropeandtell.com).
const GHOST_ADMIN_TARGET = 'https://trope-and-tell.ghost.io/ghost/api/admin/posts/';
const CLAUDE_TARGET = 'https://api.anthropic.com/v1/messages';

app.use(express.json({ limit: '2mb' }));

// --- Proxy: Ghost Admin API -------------------------------------------------
app.post('/api/ghost', async (req, res) => {
  const authHeader = req.get('authorization');
  if (!authHeader) {
    return res.status(400).json({ errors: [{ message: 'Missing Authorization header.' }] });
  }

  try {
    const ghostRes = await fetch(GHOST_ADMIN_TARGET, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept-Version': 'v5.0'
      },
      body: JSON.stringify(req.body)
    });

    const text = await ghostRes.text();
    res.status(ghostRes.status);
    res.set('Content-Type', ghostRes.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (err) {
    console.error('Ghost proxy error:', err);
    res.status(502).json({ errors: [{ message: `Failed to reach Ghost API: ${err.message}` }] });
  }
});

// --- Proxy: Anthropic (Claude) API ------------------------------------------
app.post('/api/claude', async (req, res) => {
  const apiKey = req.get('x-api-key');
  if (!apiKey) {
    return res.status(400).json({ error: { message: 'Missing x-api-key header.' } });
  }

  try {
    const claudeRes = await fetch(CLAUDE_TARGET, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const text = await claudeRes.text();
    res.status(claudeRes.status);
    res.set('Content-Type', claudeRes.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (err) {
    console.error('Claude proxy error:', err);
    res.status(502).json({ error: { message: `Failed to reach Anthropic API: ${err.message}` } });
  }
});

// --- Static site (must come after the /api routes) --------------------------
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Trope and Tell Post Builder running at http://localhost:${PORT}`);
});
