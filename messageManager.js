// Import the necessary dependencies
const axios = require('axios');

// Function to send a text message
async function sendTextMessage(senderPsid, message) {
  try {
    await axios.post('https://graph.facebook.com/v13.0/me/messages', {
      recipient: { id: senderPsid },
      message: { text: message },
    }, {
      params: { access_token: PAGE_ACCESS_TOKEN },
    });
  } catch (error) {
    console.error('Error sending text message:', error);
  }
}

// Function to send a quick reply message
async function sendQuickReply(senderPsid, message, quickReplies) {
  try {
    await axios.post('https://graph.facebook.com/v13.0/me/messages', {
      recipient: { id: senderPsid },
      message: {
        text: message,
        quick_replies: quickReplies,
      },
    }, {
      params: { access_token: PAGE_ACCESS_TOKEN },
    });
  } catch (error) {
    console.error('Error sending quick reply message:', error);
  }
}

// Export the message-related functions
module.exports = {
  sendTextMessage,
  sendQuickReply,
};
