
const axios = require('axios'); // Import the axios library
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function sendButtonTemplate(userId) {
  
    const requestBody = {
      recipient: { id: userId },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: 'كيف يمكنني خدمتك ؟',
            buttons: [
                {
                    type:"postback",
                    title:"HHHHH",
                    payload:"GET_STARTED_PAYLOAD"
                  }
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