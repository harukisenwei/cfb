const express = require('express');
const axios = require('axios');
const { getEmailVerification } = require('../lib/cache');

const app = express();

app.get('/api/tempmail/inbox', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    try {
      const response = await axios.get(`https://api.internal.temp-mail.io/api/v3/email/${email}/messages`, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json'
        }
      });

      // Check if there's a Facebook verification code
      let verificationCode = null;
      let verificationLink = null;

      if (response.data && response.data.length > 0) {
        const messages = response.data;
        
        // Look for Facebook verification email
        for (const msg of messages) {
          if (msg.subject && msg.subject.includes('Facebook')) {
            // Extract verification code (simple regex, might need adjustment)
            const codeMatch = msg.body_text || msg.body_html;
            if (codeMatch) {
              const code = codeMatch.match(/\b\d{5,8}\b/);
              if (code) verificationCode = code[0];
              
              const linkMatch = codeMatch.match(/https?:\/\/[^\s]+/);
              if (linkMatch) verificationLink = linkMatch[0];
            }
            break;
          }
        }
      }

      // Check if we have a stored account for this email
      const storedData = getEmailVerification(email);

      res.json({
        success: true,
        data: {
          messages: response.data || [],
          count: response.data ? response.data.length : 0,
          email: email,
          verification: {
            code: verificationCode,
            link: verificationLink,
            hasAccount: !!storedData,
            account: storedData ? storedData.account : null
          }
        }
      });

    } catch (apiError) {
      // Return empty inbox with no error
      res.json({
        success: true,
        data: {
          messages: [],
          count: 0,
          email: email,
          verification: {
            code: null,
            link: null,
            hasAccount: false
          }
        }
      });
    }
  } catch (error) {
    console.error('Inbox fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inbox'
    });
  }
});

module.exports = app;
