
const axios = require('axios'); // Import the axios library
const firebaseService = require('../firebaseService'); // Import your Firebase service module here

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;






async function sendGenericTemplate(userId,theday) {


  let day="";
  if(theday==="today"){
day="اليوم";

  }
    try {
    const typesData = await firebaseService.getTypesData();
    const clientRef = await firebaseService.getClientReferenceByPSID(userId);

    for (const type of typesData) {


  

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
                title: type.type,
                image_url: type.photo,
                subtitle: `السعر ${type.prix} !\n المكافأة ${type.points} ; ${day}`,
                default_action: {
                  type: 'web_url',
                  url: `${SITE_URL}/clientAddAppointement?clientPSID=${userId} `,
                  webview_height_ratio: 'tall',
                },
                buttons: [
                  {
                    type: 'web_url',
                    url: `${SITE_URL}/clientAddAppointement?clientPSID=${userId} `,
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
    }
    
    
    

    const response = await axios.post(`https://graph.facebook.com/v15.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData);

    // Handle the response here (e.g., check for success, log errors, etc.)
    if (response.status === 200) {
      console.log('Message sent successfully.');
    } else {
      console.error('Failed to send the message:', response.data);
    }
  } }catch (error) {
    console.error('An error occurred:', error);
  }
  }




  module.exports = {
    sendGenericTemplate,
  };