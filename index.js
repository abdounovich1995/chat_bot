const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const messageManager = require('./messageManager'); // Import the messageManager module
const persistentMenu = require('./persistentMenu'); // Import the persistentMenu module

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
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

// Handle Facebook Webhook verification and incoming messages
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];

      if (webhookEvent.postback) {
        if (webhookEvent.postback.payload === 'GET_STARTED_PAYLOAD') {
          const senderPsid = webhookEvent.sender.id;
          const username = await getUserName(senderPsid); // Get the user's name
          messageManager.sendTextMessage(senderPsid, `Hello, ${username}! Welcome to the Messenger bot.`);
        }
      } else if (webhookEvent.message) {
        const senderPsid = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;

        if (messageText.toLowerCase() === 'aaa') {
          // Send quick replies from the quickReplies module
          const quickReplies = [
            {
              content_type: 'text',
              title: 'Option 1',
              payload: 'OPTION_1_PAYLOAD',
            },
            {
              content_type: 'text',
              title: 'Option 2',
              payload: 'OPTION_2_PAYLOAD',
            },
          ];
          messageManager.sendQuickReply(senderPsid, 'Select an option:', quickReplies);
        } else {
          if (messageText.toLowerCase() === 'hello') {
            messageManager.sendTextMessage(senderPsid, 'Hi');
          } else if (messageText.toLowerCase() === 'b') {
            messageManager.sendTextMessage(senderPsid, 'B selected');
          } else {
            messageManager.sendTextMessage(senderPsid, "I don't understand");
          }
        }
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// ... (Other code remains the same)

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
