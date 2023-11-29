const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;

async function sendButtonTemplate(psid, userRef) {
  const buttonTemplate = {
    recipient: {
      id: psid,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'Choose an option:',
          buttons: [
            {
              type: 'web_url',
              url: `${SITE_URL}/redirectPage?clientPSID=${psid}`,
              title: 'حـجـز مـوعـد 📅',
              messenger_extensions: true,
              webview_height_ratio: 'tall',
              webview_share_button: 'hide',
            },
            {
              type: 'web_url',
              url: `${SITE_URL}/client-profile-show?clientRef=${userRef}`,
              title: 'حسابي 👔',
              messenger_extensions: true,
              webview_height_ratio: 'tall',
              webview_share_button: 'hide',
            },
            {
              type: 'web_url',
              url: `https://facebook-bot-demo-production.up.railway.app/close?siteUrl=${SITE_URL}`,
              title: 'Close web',
              messenger_extensions: true,
              webview_height_ratio: 'tall',
              webview_share_button: 'hide',
            },
          ],
        },
      },
    },
  };

  const accessToken = PAGE_ACCESS_TOKEN;

  try {
    await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`, buttonTemplate);
    console.log('Button template sent successfully to PSID:', psid);
  } catch (error) {
    console.error('Unable to send button template:', error.message || error);
  }
}


module.exports = {
  sendButtonTemplate,
};
