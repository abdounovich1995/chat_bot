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
      const clientReference = clientDocument.ref;
      await welcomeButton.sendButtonTemplate(userId, clientReference.id);
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
    // You can handle the error as needed
  }
}


const algeriaTimeZone = 'Africa/Algiers';

// Schedule a cron job to run every day at 16:00 in Algeria time zone
cron.schedule('25 20 * * *', async () => {
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
    // Get the current date in Algeria time zone
    const currentDate = new Date().toLocaleString('en-US', { timeZone: algeriaTimeZone });

    // Convert currentDate to a JavaScript Date object
    const today = new Date(currentDate);

    // Set hours and minutes to 0:00:00 to compare only days, months, and years
    today.setHours(0, 0, 0, 0);

    // Reference to the appointments collection
    const appointmentsCollection = db.collection('appointments');

    // Query appointments for today with type = 1
    const querySnapshot = await appointmentsCollection
      .where('type', '==', "1")
      .get();

    // Update "type" field to 0 for each document with appointment date equal to today
    const updatePromises = querySnapshot.docs.map(async (doc) => {
      const appointmentDate = doc.data().date.toDate(); // Convert Firestore Timestamp to JavaScript Date
      appointmentDate.setHours(0, 0, 0, 0); // Set hours and minutes to 0:00:00

      if (appointmentDate.getTime() === today.getTime()) {
        const appointmentType = doc.data().type;
        const clientId = doc.data().client; // Assuming there is a 'client' field in the appointment document that references the client document

        // Update appointment type to 0
        await doc.ref.update({ type: "0" });

        // Reference to the clients collection
        const clientsCollection = db.collection('clients');
        const clientDoc = await clientsCollection.doc(clientId).get();

        if (appointmentType === "0") {
          // If appointment type is 0, subtract 50 points
          const currentPoints = clientDoc.data().points || 0;
          const updatedPoints = currentPoints - 50;
          await clientsCollection.doc(clientId).update({ points: updatedPoints });
        } else if (appointmentType === "1") {
          // If appointment type is 1, add 50 points
          const currentPoints = clientDoc.data().points || 0;
          const updatedPoints = currentPoints + 50;
          await clientsCollection.doc(clientId).update({ points: updatedPoints });
        }
      }
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    console.log('Updated "type" field to 0 for today\'s appointments where type = 1 and updated points in clients collection');
  } catch (error) {
    console.error('Error updating "type" field and points:', error.message);
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