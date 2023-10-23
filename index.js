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
      console.error('Unable to set persistent m    enu:', error);
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
        if (webhookEvent.postback.payload === 'GET_STARTED_PAYLOAD') {
          const senderPsid = webhookEvent.sender.id;
          const username = await getUserName(senderPsid); // Get the user's name         
          const welcomeMessage = `Hello, ${username}! Welcome to the Messenger bot.`;

          messageManager.sendTextMessage(senderPsid,welcomeMessage);
        
      }  else if (webhookEvent.postback.payload === payloads.CARE_HELP) {
          const senderPsid = webhookEvent.sender.id;
          messageManager.sendTextMessage(senderPsid, 'If you need assistance, please reach out to our support team.');
        }
      } else if (webhookEvent.message) {
        const senderPsid = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;

        if (messageText.toLowerCase() === 'aaa') {
   
          messageManager.sendQuickReply(senderPsid, 'Choose an option:');
        } else
          if (messageText.toLowerCase() === 'hello') {
            messageManager.sendTextMessage(senderPsid, 'Hi');
          } else if (messageText.toLowerCase() === 'b') {
            firebaseService.addUserToClientCollection(senderPsid)
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