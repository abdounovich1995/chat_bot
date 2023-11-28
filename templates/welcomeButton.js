const axios = require('axios');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;

async function setWhitelistedDomains() {
  const appSettings = {
    whitelisted_domains: ["https://facebook-bot-demo-production.up.railway.app/close"],
  };

  const accessToken = PAGE_ACCESS_TOKEN;

  try {
    // Update Messenger Profile with whitelisted domains
    await axios.post(`https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${accessToken}`, appSettings);

    console.log('Whitelisted domains set successfully.');
  } catch (error) {
    console.error('Unable to set whitelisted domains:', error.response.data);
  }
}

async function sendButtonTemplate(userId, userRef) {
  try {
    // Set whitelisted domains before sending the button template
    await setWhitelistedDomains();

    const requestBody = {
      recipient: { id: userId },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: '🤖كيف يمكنني خدمتك ؟',
            buttons: [
             
              {
                type: 'web_url',
                url: `https://facebook-bot-demo-production.up.railway.app/close`,
                title: ' Close',
                messenger_extensions: true,
                webview_height_ratio: 'tall',
                webview_share_button: 'hide',
              },
            ],
          },
        },
      },
    };

    try {
      // Send the button template
      const response = await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
      console.log('Button template sent:', response.data);
    } catch (error) {
      console.error('Error sending button template:', error.response.data);
    }
  } catch (error) {
    console.error('Error setting whitelisted domains:', error);
  }
}

module.exports = {
  sendButtonTemplate,
};
