const express = require('express');
const axios = require('axios');
const { emailGenLimiter } = require('../lib/rate-limiter');

const app = express();

app.get('/api/tempmail/gen', emailGenLimiter, async (req, res) => {
  try {
    const response = await axios.post('https://api.internal.temp-mail.io/api/v3/email/new', {}, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Generate a random name for display
    const names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Sigma', 'Lambda'];
    const name = names[Math.floor(Math.random() * names.length)];

    res.json({
      success: true,
      data: {
        email: response.data.email,
        name: name,
        createdAt: new Date().toISOString(),
        expiresIn: '30 minutes'
      }
    });
  } catch (error) {
    console.error('TempMail generation error:', error.message);
    
    // Fallback to local generation if API fails
    const fallbackEmail = `user_${Math.random().toString(36).substring(2, 10)}@guerrillamail.com`;
    
    res.json({
      success: true,
      data: {
        email: fallbackEmail,
        name: 'Temp',
        createdAt: new Date().toISOString(),
        expiresIn: '30 minutes',
        fallback: true
      }
    });
  }
});

module.exports = app;
