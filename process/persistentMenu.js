// Define the persistent menu configuration
const persistentMenu = [
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
  
  // Export the persistent menu configuration
  module.exports = persistentMenu;
  