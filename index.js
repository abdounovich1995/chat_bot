const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import the axios package for making HTTP requests
const senderAction = require('./senderAction');
const persistentMenu = require('./persistentMenu'); // Import the persistentMenu module
const messageManager = require('./messageManager'); // Import the messageManager module
const payloads = require('./payloads'); // Import the payloads module
const verifyWebhook = require('./webhookVerification'); // Import the webhook verification module
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

          // Get the user's info
          const userInfo = await getUserInfo(senderPsid);
          const first_name = userInfo.first_name;
          const last_name = userInfo.last_name;
          const profile_pic = userInfo.profile_pic;
          const username = userInfo.name;

          // Now you can use `firstName`, `lastName`, `profilePic`, and `username` as needed.
          // ...

          // Get the user's name
          messageManager.sendTextMessage(senderPsid, `Hello, ${username}! Welcome to the Messenger bot.`);
        } else if (webhookEvent.postback.payload === payloads.CARE_HELP) {
          const senderPsid = webhookEvent.sender.id;
          messageManager.sendTextMessage(senderPsid, 'If you need assistance, please reach out to our support team.');
        }
      } else if (webhookEvent.message) {
        const senderPsid = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;

        if (messageText.toLowerCase() === 'aaa') {
          messageManager.sendQuickReply(senderPsid, 'Choose an option:');
        } else if (messageText.toLowerCase() === 'hello') {
          messageManager.sendTextMessage(senderPsid, 'Hi');
        } else if (messageText.toLowerCase() === 'b') {
          // Add user information to Firebase
          firebaseService.addUserToClientCollection(senderPsid, userInfo.first_name, userInfo.last_name, userInfo.profile_pic)
            .then((docRef) => {
              console.log('User information added to Firebase: ', docRef.id);
            })
            .catch((error) => {
              console.error('Error adding user information to Firebase: ', error);
            });

          // Respond to the user
          messageManager.sendTextMessage(senderPsid, 'User information added to Firebase "client" collection.');
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
async function getUserInfo(senderPsid) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v13.0/${senderPsid}?fields=id,name,first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`
    );

    if (response.data.id) {
      return {
        id: response.data.id,
        name: response.data.name,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        profile_pic: response.data.profile_pic
      };
    } else {
      return {
        id: senderPsid,
        name: 'User',
        first_name: 'User',
        last_name: 'User',
        profile_pic: ''
      };
    }
  } catch (error) {
    console.error('Error getting user info:', error);
    return {
      id: senderPsid,
      name: 'User',
      first_name: 'User',
      last_name: 'User',
      profile_pic: ''
    };
  }
}

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
