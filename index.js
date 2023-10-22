const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const messengerBot = require('./payloads');
const quickReplies = require('./quickReplies');
const senderAction = require('./senderAction'); // Import the senderAction module

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

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
          const username = await getUserName(senderPsid);
          senderAction(senderPsid, 'typing_on');
          messengerBot.sendWelcomeMessage(senderPsid, username);
          // Delay for a few seconds before showing typing action off
          setTimeout(() => {
            senderAction(senderPsid, 'typing_off');
          }, 3000); // 3000 milliseconds (3 seconds) delay
        }
      } else if (webhookEvent.message) {
        const senderPsid = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;

        if (messageText.toLowerCase() === 'hello') {
          setTimeout(() => {
            senderAction(senderPsid, 'typing_on');
          }, 8000); // 3000 milliseconds (3 seconds) delay
          messengerBot.sendResponse(senderPsid, 'hi');
          // Delay for a few seconds before showing typing action off
          setTimeout(() => {
            senderAction(senderPsid, 'typing_off');
          }, 3000); // 3000 milliseconds (3 seconds) delay
        } else if (messageText.toLowerCase() === 'b') {
          messengerBot.sendResponse(senderPsid, 'B selected');
        } else {
          
          messengerBot.sendResponse(senderPsid, "I don't understand");
        
        }
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
