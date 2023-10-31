const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // Replace with your actual Page Access Token

function setPersistentMenu(psid) {
    const userMenu = [
      // Define your user-specific menu here
      // This should be an array of menu items for the specific user
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
    ];
  
    axios.post(`https://graph.facebook.com/v18.0/${psid}/custom_user_settings?access_token=${PAGE_ACCESS_TOKEN}`, {
      persistent_menu: userMenu,
    })
      .then(() => {
        console.log('User-level persistent menu set successfully');
      })
      .catch((error) => {
        console.error('Unable to set user-level persistent menu:', error);
      });
  }
  
  
  