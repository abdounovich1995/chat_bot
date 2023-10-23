// welcomePayload.js
const messageManager = require('./messageManager');
const payloads = require('./payloads');
const axios = require('axios');

async function handleGetStartedPayload(senderPsid, PAGE_ACCESS_TOKEN) {
  const username = await getUserName(senderPsid, PAGE_ACCESS_TOKEN);
  messageManager.sendTextMessage(senderPsid, `Hello, ${username}! Welcome to the Messenger bot.`);
}

async function getUserName(senderPsid, PAGE_ACCESS_TOKEN) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v13.0/${senderPsid}?fields=name&access_token=${PAGE_ACCESS_TOKEN}`
    );

    if (response.data.name) {
      return response.data.name;
    } else {
      return 'User';
    }
  } catch (error) {
    console.error('Error getting user name:', error);
    return 'User';
  }
}

module.exports = {
  handleGetStartedPayload,
};
