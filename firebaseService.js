// firebaseService.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Replace with your own service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://chatbotapp-3e7c8.firebaseio.com', // Replace with your Firebase project URL
});

const db = admin.firestore();

// Function to add user information to the 'client' collection
function addUserToClientCollection(userId,first_name,last_name,profile_pic) {
  const userInformation = {
    userId,
    timestamp: new Date().toISOString(),
    first_name,
    last_name,
    profile_pic
  };

  const clientCollection = db.collection('client');

  return clientCollection.add(userInformation);
}

module.exports = {
  addUserToClientCollection,
};
