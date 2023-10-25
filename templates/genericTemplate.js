
const axios = require('axios'); // Import the axios library
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

async function sendGenericTemplate(userId) {
  
  try {
    const messageData = {
      recipient: {
        id: userId,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: 'Welcome!',
                image_url: 'https://raw.githubusercontent.com/fbsamples/original-coast-clothing/main/public/styles/male-work.jpg',
                subtitle: 'We have the right hat for everyone.',
                default_action: {
                  type: 'web_url',
                  url: 'https://www.originalcoastclothing.com/',
                  webview_height_ratio: 'tall',
                },
                buttons: [
                  {
                    type: 'web_url',
                    url: 'https://www.originalcoastclothing.com/',
                    title: 'View Website',
                  },
                  {
                    type: 'postback',
                    title: 'Start Chatting',
                    payload: 'DEVELOPER_DEFINED_PAYLOAD',
                  },
                ],
              },
            ],
          },
        },
      },
    };

    const response = await axios.post(`https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData);

    // Handle the response here (e.g., check for success, log errors, etc.)
    if (response.status === 200) {
      console.log('Message sent successfully.');
    } else {
      console.error('Failed to send the message:', response.data);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
  }




  module.exports = {
    sendGenericTemplate,
  };