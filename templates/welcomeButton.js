const axios = require('axios'); // Import the axios library

async function sendButtonTemplate(userId) {
  
    const requestBody = {
      recipient: { id: userId },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: 'What do you want to do next?',
            buttons: [
              {
                type: 'web_url',
                url: 'https://www.messenger.com',
                title: 'Visit Messenger'
              },
              // Add more buttons as needed.
            ]
          }
        }
      }
    };
  
    try {
      const response = await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
      console.log('Button template sent:', response.data);
    } catch (error) {
      console.error('Error sending button template:', error.response.data);
    }
  }

  module.exports = {
    sendButtonTemplate,
  };