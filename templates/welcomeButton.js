
const axios = require('axios'); // Import the axios library

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;



  async function sendButtonTemplate(userId) {

try {

  

  
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
                url: `${SITE_URL}/redirectPage?clientPSID=${userId} `,
                title: ' حـجـز مـوعـد 📅',
                messenger_extensions :'true',
                webview_height_ratio:'tall',
              },

                  {
                    type:"web_url",
                    title:"تصفح مواعيدي 📋 ",
                    url: `https://facebook-bot-demo-production.up.railway.app/close`,
                    messenger_extensions :'true',
                    webview_height_ratio:'tall',
                    webview_share_button:'hide'
                  }
            ]
            
          }
        }
      }
    };
  
  
    try {
      const response = await axios.post(`https://graph.facebook.com/v16.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
      console.log('Button template sent:', response.data);
    } catch (error) {
      console.error('Error sending button template:', error.response.data);
    }
  } catch (error) {
  
  }
  }


  module.exports = {
    sendButtonTemplate,
  
  };