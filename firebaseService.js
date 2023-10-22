// firebaseService.js

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Replace with your own service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://chatbotapp-3e7c8.firebaseio.com', // Replace with your Firebase project URL
});

const db = admin.firestore();

// Function to add user information to the 'client' collection
function addUserToClientCollection(userId, name, firstName, lastName, profilePic) {
  const userInformation = {
    userId,
    name,
    firstName,
    lastName,
    profilePic,
    timestamp: new Date().toISOString(),
  };

  const clientCollection = db.collection('client');

  return clientCollection.add(userInformation);
}

// Function to check if a user exists in the 'client' collection
function checkIfUserExists(userId) {
  const clientCollection = db.collection('client');

  return clientCollection
    .where('userId', '==', userId)
    .get()
    .then((querySnapshot) => {
      return !querySnapshot.empty;
    })
    .catch((error) => {
      console.error('Error checking if user exists:', error);
      return false;
    });
}

module.exports = {
  addUserToClientCollection,
  checkIfUserExists,
};
