const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const axios = require('axios'); // Import the axios library
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // Replace with your actual Page Access Token
const messageManager = require('./messageManager'); // Import the messageManager module
const welcomeButton = require('./templates/welcomeButton'); // Import the messageManager module
const cron = require('node-cron');


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

async function addUserToClientCollection(userId) {
  try {
    const existingUserQuery = await db.collection('clients').where('userID', '==', userId).get();

    if (existingUserQuery.empty) {
      const userInfo = await getUserInfo(userId);

      if (userInfo) {
        const userInformation = {
          userID: userId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          first_name: userInfo.firstName,
          last_name: userInfo.lastName,
          username: userInfo.firstName + ' ' + userInfo.lastName,
          profile_pic: userInfo.profilePicture,
          points: 0,
        };

        const clientCollection = db.collection('clients');
        const newUserDocument = await clientCollection.add(userInformation);

        const username = await getUserName(userId);
        const welcomeMessage = `🙋‍♂️ مرحبا بك , ${username}!`;

        await messageManager.sendTextMessage(userId, welcomeMessage);
        await welcomeButton.sendButtonTemplate(userId, newUserDocument.id);
      } else {
        console.error('Failed to fetch user information.');
        return null;
      }
    } else {
      const username = await getUserName(userId);
      const welcomeAgainMessage = `🙋‍♂️ أهلا بك مجددا , ${username}.`;
      await messageManager.sendTextMessage(userId, welcomeAgainMessage);

      const clientDocument = existingUserQuery.docs[0];
      const clientReference = clientDocument.id;
      await welcomeButton.sendButtonTemplate(userId, clientReference.id);
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
    // You can handle the error as needed
  }
}


const algeriaTimeZone = 'Africa/Algiers';

// Schedule a cron job to run every day at 16:00 in Algeria time zone
cron.schedule('31 21 * * *', async () => {
  try {
    // Call a function to update "type" field in appointments collection to 0 for today's appointments
    await updateAppointmentsType();

    console.log('Cron job executed successfully');
  } catch (error) {
    console.error('Error executing cron job:', error.message);
  }
}, {
  timezone: algeriaTimeZone, // Set the time zone
});





async function updateAppointmentsType() {
  try {
    const appointmentsCollection = db.collection('appointments');
    const clientsCollection = db.collection('clients');

    const currentDate = new Date().toLocaleString('en-US', { timeZone: algeriaTimeZone });
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    const querySnapshot = await appointmentsCollection.get();

    const updatePromises = querySnapshot.docs.map(async (doc) => {
      const appointmentDate = doc.data().date.toDate();
      appointmentDate.setHours(0, 0, 0, 0);

      if (appointmentDate.getTime() === today.getTime()) {
        const appointmentType = doc.data().type;
        const clientId = doc.data().clients; // Assuming the clients field holds the client reference

        // Check if clientId is defined and is a non-empty string
        if (clientId && typeof clientId === 'string' && clientId.trim() !== '') {
          // Get the client document reference
          const clientRef = clientsCollection.doc(clientId);

          // Get the current points value
          const clientSnapshot = await clientRef.get();

          // Check if the client document exists
          if (clientSnapshot.exists) {
            const currentPoints = clientSnapshot.data().points || 0;

            // Update points based on appointment type
            let updatedPoints = currentPoints;
            if (appointmentType === "1") {
              updatedPoints += 50;
            } else if (appointmentType === "0") {
              updatedPoints -= 50;
            }

            // Update the points field in the client collection
            await clientRef.update({ points: updatedPoints });
          } else {
            console.error(`Client document with ID ${clientId} does not exist.`);
          }
        } else {
          console.error('Invalid clientId:', clientId);
        }
      }
    });

    await Promise.all(updatePromises);

    console.log('Updated points field in clients collection based on appointment type');
  } catch (error) {
    console.error('Error updating points field:', error.message);
    throw error;
  }
}


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