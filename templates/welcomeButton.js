
const axios = require('axios'); // Import the axios library
const firebaseService = require('../firebaseService'); 


const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;

const { getClientReferenceByPSID } = firebaseService;












  async function sendButtonTemplate(userId) {
    const clientRef = firebaseService.getClientReferenceByPSID("3406277326168614");

try {

  

  
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
                type: 'web_url', // Change the button type to 'web_url'
                url: `${SITE_URL}/clientAddAppointement?clientPSID=${clientRef} `,
                title: 'now',
              },

                  {
                    type:"postback",
                    title:"تصفح مواعيدي 📋 ",
                    payload:"SHOW_MY_APPOINTEMENTS"
                  }
            ]
            
          }
        }
      }
    };
  
  
    try {
      const response = await axios.post(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, requestBody);
      console.log('Button template sent:', response.data);
    } catch (error) {
      console.error('Error sending button template:', error.response.data);
    }
  } catch (error) {
  
  }
  }


  module.exports = {
    sendButtonTemplate,
    getClientReferenceByPSID
  };