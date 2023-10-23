const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const axios = require('axios'); // Import the axios library
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // Replace with your actual Page Access Token
const getUser = require('./index'); // Import the messageManager module
const messageManager = require('./messageManager'); // Import the messageManager module

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://chatbotapp-3e7c8.firebaseio.com',
});

const db = admin.firestore();

// Function to add user information to the 'client' collection
async function addUserToClientCollection(userId) {
  const existingUser = await db.collection('clients').where('userId', '==', userId).get();

  if (existingUser.empty) {
    const username = await getUser.getUserName(userId);
    const welcomeMessage = `Hello, ${username}! Welcome to the Messenger bot.`;
    messageManager.sendTextMessage(senderPsid,welcomeMessage);

  const userInfo = await getUserInfo(userId);

  if (userInfo) {
    const userInformation = {
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      username:userInfo.firstName+" "+userInfo.lastName,
      profile_pic: userInfo.profilePicture,


    };

    const clientCollection = db.collection('clients');

    return clientCollection.add(userInformation);
  } else {
    console.error('Failed to fetch user information.');
    return null;
  }
}else{
  const username = await getUser.getUserName(userId);
  const welcomeMessage = username;
  messageManager.sendTextMessage(senderPsid,welcomeMessage);



}}

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
