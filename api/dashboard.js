const express = require('express');
const os = require('os');
const { getAllAccounts } = require('../lib/cache');

const app = express();

app.get('/api/dashboard/stats', (req, res) => {
  try {
    const accounts = getAllAccounts();
    const now = new Date();
    const lastHour = accounts.filter(acc => 
      new Date(acc.createdAt) > new Date(now - 60 * 60 * 1000)
    ).length;

    const lastDay = accounts.filter(acc => 
      new Date(acc.createdAt) > new Date(now - 24 * 60 * 60 * 1000)
    ).length;

    res.json({
      success: true,
      data: {
        totalAccounts: accounts.length,
        lastHour,
        lastDay,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: os.loadavg(),
        platform: os.platform(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

app.get('/api/dashboard/recent', (req, res) => {
  try {
    const accounts = getAllAccounts();
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent accounts'
    });
  }
});

module.exports = app;
