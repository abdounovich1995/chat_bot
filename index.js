// index.js

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const senderAction = require('./senderAction');
const persistentMenu = require('./persistentMenu');
const messageManager = require('./messageManager');
const payloads = require('./payloads');
const verifyWebhook = require('./webhookVerification');
const firebaseService = require('./firebaseService'); // Import the Firebase service module

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Set the persistent menu using the imported configuration
function setPersistentMenu() {
  axios.post('https://graph.facebook.com/v13.0/me/messenger_profile', {
    persistent_menu: persistentMenu, // Use the imported persistent menu configuration
  }, {
    params: { access_token: PAGE_ACCESS_TOKEN },
  })
    .then(() => {
      console.log('Persistent menu set successfully');
    })
    .catch((error) => {
      console.error('Unable to set persistent menu:', error);
    });
}

// Create a route to set the menu when /setMenu is accessed in the browser
app.get('/setMenu', (req, res) => {
  // Set the persistent menu
  setPersistentMenu();

  res.send('Persistent menu set successfully');
});

// Handle Facebook Webhook verification using the imported function
app.get('/webhook', verifyWebhook);

// Handle Facebook Webhook events
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];

      if (webhookEvent.postback) {
        if (webhookEvent.postback.payload === payloads.GET_STARTED_PAYLOAD) {
          const senderPsid = webhookEvent.sender.id;

          // Check if the user already exists in the 'client' collection
          firebaseService.checkIfUserExists(senderPsid)
            .then(async (userExists) => {
              if (userExists) {
                // User already exists, no need to save again
                messageManager.sendTextMessage(senderPsid, 'Welcome back to the Messenger bot!');
              } else {
                // User does not exist, save their information
                const username = await getUserName(senderPsid);

                // Get user's additional information (name, first name, last name, profile pic)
                const userInfo = await getUserInfo(senderPsid); // Implement this function

                // Save the user's information to the 'client' collection
                firebaseService.addUserToClientCollection(
                  senderPsid,
                  userInfo.name,
                  userInfo.first_name,
                  userInfo.last_name,
                  userInfo.profile_pic
                )
                  .then((docRef) => {
                    console.log('User information added to Firebase: ', docRef.id);
                  })
                  .catch((error) => {
                    console.error('Error adding user information to Firebase: ', error);
                  });

                // Send a welcome message to the user
                messageManager.sendTextMessage(senderPsid, `Hello, ${username}! Welcome to the Messenger bot.`);
              }
            })
            .catch((error) => {
              console.error('Error checking if user exists:', error);
            });
        }
      } else if (webhookEvent.message) {
        const senderPsid = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;

        if (messageText.toLowerCase() === 'aaa') {
          messageManager.sendQuickReply(senderPsid, 'Choose an option:');
        } else if (messageText.toLowerCase() === 'hello') {
          messageManager.sendTextMessage(senderPsid, 'Hi');
        } else if (messageText.toLowerCase() === 'b') {
          messageManager.sendTextMessage(senderPsid, 'B selected');
        } else {
          messageManager.sendTextMessage(senderPsid, "I don't understand");
        }
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Function to get the user's name
async function getUserName(senderPsid) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v13.0/${senderPsid}?fields=name&access_token=${PAGE_ACCESS_TOKEN}`
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

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
