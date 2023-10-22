// Import axios for making HTTP requests
const axios = require('axios');

// Function to send a text message
async function sendTextMessage(senderPsid, text) {
  try {
    await axios.post('https://graph.facebook.com/v13.0/me/messages', {
      recipient: { id: senderPsid },
      message: { text },
    }, {
      params: { access_token: process.env.PAGE_ACCESS_TOKEN },
    });
    console.log('Text message sent');
  } catch (error) {
    console.error('Error sending text message:', error);
  }
}

// Function to send a message with quick replies
async function sendTextMessageWithQuickReplies(senderPsid, text, quickReplies) {
  try {
    await axios.post('https://graph.facebook.com/v13.0/me/messages', {
      recipient: { id: senderPsid },
      message: {
        text,
        quick_replies: quickReplies,
      },
    }, {
      params: { access_token: process.env.PAGE_ACCESS_TOKEN },
    });
    console.log('Text message with quick replies sent');
  } catch (error) {
    console.error('Error sending text message with quick replies:', error);
  }
}

module.exports = {
  sendTextMessage,
  sendTextMessageWithQuickReplies,
};