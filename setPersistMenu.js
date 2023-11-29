const axios = require('axios'); // Import the axios package for making HTTP requests

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;
 // Replace with your actual Page Access Token
async function setPersistentMenu(psid,userRef) {

    const userPersistentMenu = {
      psid: psid,
      persistent_menu: [
        {
          locale: 'default',
          composer_input_disabled: false,
          call_to_actions: [
           
          {
            type: 'web_url', 
            url: `https://facebook-bot-demo-production.up.railway.app/close`,
            title: ' Close web',
            messenger_extensions :true,
            webview_height_ratio:'tall',
            webview_share_button:'hide'

        },
           
          ],
        },
      ],
    };
  
    const accessToken = PAGE_ACCESS_TOKEN; // Replace with your actual access token
  
    axios.post(`https://graph.facebook.com/v18.0/me/custom_user_settings?access_token=${accessToken}`, userPersistentMenu)
      .then(() => {
        console.log('User-level persistent menu set successfully for PSID:', psid);
      })
      .catch((error) => {
        console.error('Unable to set user-level persistent menu:', error);
      });
  }
  

  module.exports = { setPersistentMenu };

  
  
  