const axios = require('axios'); // Import the axios package for making HTTP requests
const getClientRefference = require('./firebaseService'); // Import the messageManager module

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
                type: 'web_url', // Change the button type to 'web_url'
                url: `${SITE_URL}/redirectPage?clientPSID=${psid} `,
                title: ' حـجـز مـوعـد 📅',
                messenger_extensions :'true',
                webview_height_ratio:'tall',
                webview_share_button:'hide'

            },
            {
              type: 'web_url', // Change the button type to 'web_url'
              url: `${SITE_URL}/client-profile-show?clientRef=${userRef} `,
              title: ' حسابي 👔',
              messenger_extensions :'true',
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

  
  
  