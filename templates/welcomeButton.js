const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;

async function sendButtonTemplate (psid, userRef) {
  const genericTemplate = {
    recipient: {
      id: psid,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'Option 1',
              subtitle: 'Description for Option 1',
              buttons: [
                {
                  type: 'web_url',
                  url: `https://facebook-bot-demo-production.up.railway.app/close`,
                  title: 'Option 1 Title',
                  messenger_extensions: true,
                  webview_height_ratio: 'tall',
                  webview_share_button: 'hide',
                },
              ],
            },
            {
              title: 'Option 2',
              subtitle: 'Description for Option 2',
              buttons: [
                {
                  type: 'web_url',
                  url: `${SITE_URL}/option2?clientPSID=${psid}`,
                  title: 'Option 2 Title',
                  messenger_extensions: true,
                  webview_height_ratio: 'tall',
                  webview_share_button: 'hide',
                },
              ],
            },
            // Add more options as needed
          ],
        },
      },
    },
  };

  const accessToken = PAGE_ACCESS_TOKEN;

  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`, genericTemplate);
    console.log('Generic template sent successfully to PSID:', psid);
  } catch (error) {
    console.error('Unable to send generic template:', error.message || error);
  }
}

module.exports = { sendButtonTemplate  };
