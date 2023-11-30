const axios = require('axios'); // Import the axios library

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;

  async function sendButtonTemplate(userId) {
const fullUrl=SITE_URL+"/redirectPage?clientPSID="+userId+"&pageAccessToken="+PAGE_ACCESS_TOKEN+"&siteUrl="+SITE_URL;

console.log(fullUrl);
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
                type: 'web_url', // Change the button type to 'web   _url'
                url: fullUrl,
                title: ' حـجـز مـوعـد 📅',
                messenger_extensions :true,
                webview_height_ratio:'tall',
              },

                 
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