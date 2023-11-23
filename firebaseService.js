const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const axios = require('axios');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const messageManager = require('./messageManager');
const welcomeButton = require('./templates/welcomeButton');
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
      throw new Error("No client document found with the specified PSID.");
    }

    const clientDocument = querySnapshot.docs[0];
    const clientReference = clientDocument.id;
    return clientReference;
  } catch (error) {
    console.error("An error occurred:", error.message);
    throw error;
  }
}

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
  }
}

const algeriaTimeZone = 'Africa/Algiers';

cron.schedule('0 0 * * *', async () => {
  try {
    await updateAppointmentsType();
    console.log('Cron job executed successfully');
  } catch (error) {
    console.error('Error executing cron job:', error.message);
  }
}, {
  timezone: algeriaTimeZone,
});


cron.schedule('*/1 * * * *', async () => {
  try {
    await updateAppointmentsType();
    console.log('Cron job executed successfully');
  } catch (error) {
    console.error('Error executing cron job:', error.message);
  }
}, {
  timezone: algeriaTimeZone,
});




async function updateAppointmentsType() {
  try {
    const currentDate = new Date().toLocaleString('en-US', { timeZone: algeriaTimeZone });
    const algeriaDate = new Date(currentDate);
    algeriaDate.setHours(0, 0, 0, 0);

    const appointmentsCollection = db.collection('appointments');
    const PresentQuerySnapshot = await appointmentsCollection
      .where('date', '==', algeriaDate)
      .where('type', '==', 1)
      .get();

    const updatePromises = PresentQuerySnapshot.docs.map(async (doc) => {
      await appointmentsCollection.doc(doc.id).update({ type: 0 });
      await updateClientsPoints(appointmentsCollection.doc(doc.id));
    });

    await Promise.all(updatePromises);

    console.log('Updated "type" field to 0 for today\'s appointments');
  } catch (error) {
    console.error('Error updating "type" field:', error.message);
    throw error;
  }
}

async function updateClientsPoints(clientRef) {
  try {
    const ClientCollection = db.collection('clients');
    const PresentQuerySnapshot = await ClientCollection
      .where("clientRef", "==", clientRef)
      .get();

    await PresentQuerySnapshot.docs[0].ref.update({ points: 1000 });
  } catch (error) {
    console.error('Error updating client points:', error.message);
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

    return { firstName, lastName, profilePicture };
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
