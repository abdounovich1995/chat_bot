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

async function sendQuickReply(senderPsid, text) {
    const quickReplies = [
        {
          content_type: 'text',
          title: 'الـيــوم ',
          payload: 'TODAY',
        },
        {
          content_type: 'text',
          title: 'غــدا',
          payload: 'TOMORROW',
        },
        {
          content_type: 'text',
          title: 'بــعـد غــد',
          payload: 'AFTER_TOMORROW',
        },
        {
          content_type: 'text',
          title: 'VIP',
          payload: 'VIP',
        },
      ];
  
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
      console.log('Quick reply message sent');
    } catch (error) {
      console.error('Error sending quick reply message:', error);
    }
  }

module.exports = {
  sendTextMessage,
  sendQuickReply,
};



