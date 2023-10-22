const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); 
const senderAction = require('./senderAction');
const persistentMenu = require('./persistentMenu'); 
const messageManager = require('./messageManager'); 
const payloads = require('./payloads'); 
const verifyWebhook = require('./webhookVerification'); 
const firebaseService = require('./firebaseService'); 

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Set the persistent menu using the imported configuration
function setPersistentMenu() {
  axios.post('https://graph.facebook.com/v13.0/me/messenger_profile', {
    persistent_menu: persistentMenu,
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

      let first_name, last_name, profile_pic, username;

      if (webhookEvent.postback) {
        if (webhookEvent.postback.payload === payloads.GET_STARTED_PAYLOAD) {
          const senderPsid = webhookEvent.sender.id;
              messageManager.sendTextMessage(senderPsid, `Hello,  Welcome to the Messenger bot.`);

          // Get user information
         
          
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

          getUserInfo(senderPsid)
          .then(userInfo => {
            first_name = userInfo.first_name;
            last_name = userInfo.last_name;
            profile_pic = userInfo.profile_pic;
            username = userInfo.name;

            // Continue processing or sending messages
           


          })
          console.log(first_name);
          console.log(last_name);
          console.log(profile_pic);
          // Ensure first_name, last_name, and profile_pic are defined
          if (first_name && last_name && profile_pic) {
           
            firebaseService.addUserToClientCollection(senderPsid, first_name, last_name, profile_pic)
              .then((docRef) => {
                console.log('User information added to Firebase: ', docRef.id);
              })
              .catch((error) => {
                console.error('Error adding user information to Firebase: ', error);
              });

            messageManager.sendTextMessage(senderPsid, 'User information added to Firebase "client" collection.');
          } else {
            messageManager.sendTextMessage(senderPsid, 'User information is missing.');
          }
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
        profile_pic: 'User'
      };
    }
  } catch (error) {
    console.error('Error getting user information:', error);
    return {
      id: senderPsid,
      name: 'User',
      first_name: 'User',
      last_name: 'User',
      profile_pic: 'user'
    };
  }
}

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
