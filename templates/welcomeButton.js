const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;

async function sendGenericTemplate(userId, userRef) {
  try {
    const requestBody = {
      recipient: { id: userId },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: 'حـجـز مـوعـد 📅',
                subtitle: 'احجز موعد الآن',
                image_url: `${SITE_URL}/booking_image.jpg`, // Replace with the URL of an image
                default_action: {
                  type: 'web_url',
                  url: `${SITE_URL}/redirectPage?clientPSID=${userId}`,
                  messenger_extensions: true,
                  webview_height_ratio: 'tall',
                  webview_share_button: false,
                },
                buttons: [
                  {
                    type: 'web_url',
                    url: `${SITE_URL}/redirectPage?clientPSID=${userId}`,
                    title: 'احجز الآن',
                    messenger_extensions: true,
                    webview_height_ratio: 'tall',
                    webview_share_button: false,
                  },
                ],
              },
              {
                title: 'حسابي 👔',
                subtitle: 'عرض حساب المستخدم',
                image_url: `${SITE_URL}/profile_image.jpg`, // Replace with the URL of an image
                default_action: {
                  type: 'web_url',
                  url: `${SITE_URL}/client-profile-show?clientRef=${userRef}`,
                  messenger_extensions: true,
                  webview_height_ratio: 'tall',
                  webview_share_button: false,
                },
                buttons: [
                  {
                    type: 'web_url',
                    url: `${SITE_URL}/client-profile-show?clientRef=${userRef}`,
                    title: 'عرض الحساب',
                    messenger_extensions: true,
                    webview_height_ratio: 'tall',
                    webview_share_button: false,
                  },
                ],
              },
            ],
          },
        },
      },
    };

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
        requestBody
      );
      console.log('Generic template sent:', response.data);
    } catch (error) {
      console.error('Error sending generic template:', error.response.data);
    }
  } catch (error) {
    // Handle any other errors that might occur
  }
}

module.exports = {
  sendGenericTemplate,
};