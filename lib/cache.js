const NodeCache = require('node-cache');

// Cache for storing recently created accounts
const accountCache = new NodeCache({ 
  stdTTL: 3600, // 1 hour
  checkperiod: 600 
});

// Cache for storing temp emails and their verification codes
const emailCache = new NodeCache({ 
  stdTTL: 1800, // 30 minutes
  checkperiod: 300 
});

function storeAccount(account) {
  const key = `acc_${account.userId}`;
  accountCache.set(key, account);
  return key;
}

function getAccount(userId) {
  return accountCache.get(`acc_${userId}`);
}

function storeEmailVerification(email, data) {
  emailCache.set(`email_${email}`, data);
}

function getEmailVerification(email) {
  return emailCache.get(`email_${email}`);
}

function getAllAccounts() {
  const keys = accountCache.keys();
  const accounts = [];
  keys.forEach(key => {
    if (key.startsWith('acc_')) {
      accounts.push(accountCache.get(key));
    }
  });
  return accounts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50);
}

module.exports = {
  storeAccount,
  getAccount,
  storeEmailVerification,
  getEmailVerification,
  getAllAccounts
};
