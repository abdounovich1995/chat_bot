const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const axios = require('axios'); // Import the axios library
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // Replace with your actual Page Access Token
const messageManager = require('./messageManager'); // Import the messageManager module
const welcomeButton = require('./templates/welcomeButton'); // Import the messageManager module


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://chatbotapp-3e7c8.firebaseio.com',
});

const db = admin.firestore();

const typesCollection = db.collection('types');

const clientsCollection = db.collection('clients');


async function getClientReferenceByPSID(userPSID) {
  try {
    const querySnapshot = await clientsCollection.where('userID', '==', userPSID).get();

    if (querySnapshot.empty) {
      // If there are no matching documents, throw an exception
      throw new Error("No client document found with the specified PSID.");
    }

    // User with the given PSID exists, return the reference to the client document
    const clientDocument = querySnapshot.docs[0];
    const clientReference = clientDocument.id;
    return clientReference;
  } catch (error) {
    // Handle the exception
    console.error("An error occurred:", error.message);
    // You can rethrow the exception if needed
    throw error;
  }
}


// Fetch data from the "types" collection
async function getTypesData() {
  const snapshot = await typesCollection.get();
  const typesData = [];
  snapshot.forEach((doc) => {
    typesData.push(doc.data());
  });
  return typesData;
}


// Function to add user information to the 'client' collection
async function addUserToClientCollection(userId) {
  const existingUser = await db.collection('clients').where('userID', '==', userId).get();

  if (existingUser.empty) {
    const username = await getUserName(userId);
    const welcomeMessage = `🙋‍♂️ مرحبا بك , ${username}!`;
    
    messageManager.sendTextMessage(userId,welcomeMessage);
  const userInfo = await getUserInfo(userId);


  if (userInfo) {
    const userInformation = {
      userID:userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      username:userInfo.firstName+" "+userInfo.lastName,
      profile_pic: userInfo.profilePicture,
      points:0,


    };

    const clientCollection = db.collection('clients');

    clientCollection.add(userInformation);

    return   welcomeButton.sendButtonTemplate(userId,await getClientReferenceByPSID(userId));
 

  } else {
    console.error('Failed to fetch user information.');
    return null;
  }
}else{
  const username = await getUserName(userId);
  const welcomeAgainMessage = `🙋‍♂️ أهلا بك مجددا , ${username}.`;
  messageManager.sendTextMessage(userId,welcomeAgainMessage);

  welcomeButton.sendButtonTemplate(userId,await getClientReferenceByPSID(userId));



}}



async function getUserName(userId) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v13.0/${userId}?fields=name&access_token=${PAGE_ACCESS_TOKEN}`
    );

    if (response.data.name) {
      return response.data.name;
    } else {
      return 'User';
    }
  } catch (error) {
    console.error('Error getting user name:', error);
    return 'User';
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
  getTypesData,
  getClientReferenceByPSID,
};
