const admin = require('firebase-admin');
const axios = require('axios'); // Import the axios library
const firebaseService = require('../firebaseService'); // Import your Firebase service module here

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;





admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://chatbotapp-3e7c8.firebaseio.com',
});

const db = admin.firestore();


const clientsCollection = db.collection('clients');



async function getClientReferenceByPSID(userPSID) {
  try {
    const querySnapshot = await clientsCollection.where('userID', '==', userPSID).get();

    if (!querySnapshot.empty) {
      // User with the given PSID exists, return the reference to the client document
      const clientDocument = querySnapshot.docs[0];
      const clientReference = clientDocument.id;
      return clientReference;
    } else {
      // User with the given PSID does not exist
      return null;
    }
  } catch (error) {
    console.error('Error retrieving client reference:', error);
    throw error; // You can choose to handle the error differently
  }
}

  async function sendButtonTemplate(userId) {
    const clientRef = await getClientReferenceByPSID(userId);

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