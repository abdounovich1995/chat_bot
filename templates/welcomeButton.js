
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
            text: '🤖كيف يمكنني خدمتك ؟',
            buttons: [
              {
                type: 'web_url', // Change the button type to 'web_url'
                url: 'https://chat.openai.com/c/bb5523f9-10e1-4832-a13a-492b0fc61fd2', // Replace with the URL you want to open in the webview
                title: 'now',
              },

                  {
                    type:"postback",
                    title:"تصفح مواعيدي 📋 ",
                    payload:"SHOW_MY_APPOINTEMENTS"
                  }
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