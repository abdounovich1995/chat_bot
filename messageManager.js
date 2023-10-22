// Import any required dependencies
const axios = require('axios');

// Function to send a text message
async function sendTextMessage(senderPsid, message) {
  try {
    await axios.post('https://graph.facebook.com/v13.0/me/messages', {
      recipient: { id: senderPsid },
      message: { text: message },
    }, {
      params: { access_token: process.env.PAGE_ACCESS_TOKEN },
    });
  } catch (error) {
    console.error('Error sending text message:', error);
  }
}

// Export the message-related functions
module.exports = {
  sendTextMessage,
};
