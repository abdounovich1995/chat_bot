const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import the axios package for making HTTP requests
const messengerBot = require('./payloads');
const senderAction = require('./senderAction');
const persistentMenu = require('./persistentMenu'); // Import the persistentMenu module
const messageManager = require('./messageManager'); // Import the messageManager module

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
      console.log('Persistent menu is set successfully');
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
// ... (Your existing code for handling Webhook and messages)

// Send a text message using the messageManager module
app.get('/sendMessage', (req, res) => {
  const senderPsid = 'USER_PSID'; // Replace with the actual user's PSID
  const message = 'Hello from the messageManager module!';
  messageManager.sendTextMessage(senderPsid, message);
  res.send('Text message sent successfully');
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
