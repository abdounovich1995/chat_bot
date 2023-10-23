const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const axios = require('axios'); // Import the axios library
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // Replace with your actual Page Access Token

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://chatbotapp-3e7c8.firebaseio.com',
});

const db = admin.firestore();

// Function to add user information to the 'client' collection
async function addUserToClientCollection(userId) {
  const userInfo = await getUserInfo(userId);

  if (userInfo) {
    const userInformation = {
      userId,
      timestamp: new Date().toISOString(),
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      username:userInfo.firstName+" "+userInfo.lastName,
      profile_picture: userInfo.profilePicture,


    };

    const clientCollection = db.collection('clients');

    return clientCollection.add(userInformation);
  } else {
    console.error('Failed to fetch user information.');
    return null;
  }
}

async function getUserInfo(psid) {
  try {
    const response = await axios.get(`https://graph.facebook.com/v13.0/${psid}`, {
      params: {
        fields: 'first_name,last_name,profile_pic',
        access_token: PAGE_ACCESS_TOKEN,
      },
    });
  

    const userData = response.data;
    const firstName = userData.first_name;
    const lastName = userData.last_name;
    const profilePicture = userData.profile_pic;



    return { firstName, lastName ,profilePicture};
  } catch (error) {
    console.error(`Error fetching user info: ${error.message}`);
    return null;
  }
}

module.exports = {
  addUserToClientCollection,
};
