// Define the persistent menu configuration

const axios = require('axios'); // Import the axios library

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;

const persistentMenu = [
    {
      locale: 'default',
      composer_input_disabled: false,
      call_to_actions: [
        {
          type: 'web_url',
          title: ' حـجـز مـوعـد 📅',
          url: `${SITE_URL}/clientChoiseDay?clientPSID=${ref} `,
          webview_height_ratio: 'tall',
          webview_share_button:'hide'
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
          webview_height_ratio: 'tall',
          webview_share_button:'hide'


        },
      ],
    },
  ];
  
  // Export the persistent menu configuration
  module.exports = persistentMenu;
  