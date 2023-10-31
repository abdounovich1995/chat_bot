const axios = require('axios'); // Import the axios package for making HTTP requests
const getClientRefference = require('./firebaseService'); // Import the messageManager module

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;
 // Replace with your actual Page Access Token
async function setPersistentMenu(psid) {

    getClientRefference.getClientReferenceByPSID(psid,await getClientReferenceByPSID(psid))
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
                type: 'web_url', // Change the button type to 'web_url'
                url: `${SITE_URL}/clientChoiseDay?clientPSID=${ref} `,
                title: ' حـجـز مـوعـد 📅',
                messenger_extensions :'true',
                webview_height_ratio:'tall',
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

  
  
  