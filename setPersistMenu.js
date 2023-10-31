const axios = require('axios'); // Import the axios package for making HTTP requests

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // Replace with your actual Page Access Token
function setPersistentMenu(psid) {
    const userPersistentMenu = {
      psid: psid,
      persistent_menu: [
        {
          locale: 'default',
          composer_input_disabled: false,
          call_to_actions: [
            {
              type: 'postback',
              title: 'Talk to an agent',
              payload: 'CARE_HELP',
            },
            {
              type: 'postback',
              title: 'Outfit suggestions',
              payload: 'CURATION',
            },
            {
              type: 'web_url',
              title: 'Shop now',
              url: 'https://www.originalcoastclothing.com/',
              webview_height_ratio: 'full',
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

  
  
  