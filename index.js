const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = 'YOUR_PAGE_ACCESS_TOKEN';

// Handle Facebook Webhook verification
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === 'YOUR_VERIFICATION_TOKEN') {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages and postbacks
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];

      if (webhookEvent.postback) {
        if (webhookEvent.postback.payload === 'GET_STARTED') {
          const senderPsid = webhookEvent.sender.id;

          // Get user information
          const userInfo = await getUserInfo(senderPsid);
          const firstName = userInfo.first_name;
          const lastName = userInfo.last_name;
          const profilePic = userInfo.profile_pic;

          // Send a welcome message
          const welcomeMessage = `Hello, ${firstName} ${lastName}! Welcome to the Messenger bot.`;
          sendMessage(senderPsid, welcomeMessage);
        }
      } else if (webhookEvent.message) {
        const senderPsid = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;

        if (messageText.toLowerCase() === 'hello') {
          sendMessage(senderPsid, 'Hi there!');
        }
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Function to get user information
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

// Function to send a text message
async function sendMessage(senderPsid, message) {
  try {
    await axios.post('https://graph.facebook.com/v13.0/me/messages', {
      recipient: { id: senderPsid },
      message: { text: message },
    }, {
      params: { access_token: PAGE_ACCESS_TOKEN },
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
