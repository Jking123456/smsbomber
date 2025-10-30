// server.js
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const UPSTREAM = 'https://toshismsbmbapi.up.railway.app/api';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy POST register
app.post('/api/register', async (req, res) => {
  try {
    const r = await fetch(`${UPSTREAM}/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({success:false, message:'Proxy error', error: err.message});
  }
});

// Proxy POST login
app.post('/api/login', async (req, res) => {
  try {
    const r = await fetch(`${UPSTREAM}/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({success:false, message:'Proxy error', error: err.message});
  }
});

// Proxy GET profile (requires Authorization)
app.get('/api/profile', async (req, res) => {
  try {
    const token = req.header('Authorization') || '';
    const r = await fetch(`${UPSTREAM}/profile`, {
      method: 'GET',
      headers: {'Authorization': token}
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({success:false, message:'Proxy error', error: err.message});
  }
});

// Proxy POST send-sms (requires Authorization)
app.post('/api/send-sms', async (req, res) => {
  try {
    const token = req.header('Authorization') || '';
    const r = await fetch(`${UPSTREAM}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(req.body)
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({success:false, message:'Proxy error', error: err.message});
  }
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
