const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const facebook = require('../lib/facebook');
const { storeAccount, storeEmailVerification } = require('../lib/cache');
const { createAccountLimiter } = require('../lib/rate-limiter');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.post('/api/fbcreate', createAccountLimiter, async (req, res) => {
  try {
    const { email, firstName, lastName, gender, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Create Facebook account
    const result = await facebook.createAccount({
      email,
      firstName,
      lastName,
      gender,
      password
    });

    if (result.success) {
      // Store account with timestamp
      const account = {
        ...result.account,
        createdAt: new Date().toISOString(),
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
      };
      
      storeAccount(account);
      
      // Store for verification if needed
      storeEmailVerification(email, {
        account: account,
        verified: false,
        createdAt: new Date().toISOString()
      });

      return res.json({
        success: true,
        data: account
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/accounts/recent', (req, res) => {
  try {
    const { getAllAccounts } = require('../lib/cache');
    const accounts = getAllAccounts();
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accounts'
    });
  }
});

module.exports = app;
