const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const messengerBot = require('./payloads'); // Import the messengerBot module

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // Replace with your own verify token
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // Replace with your Page Access Token

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

app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0];

      if (webhookEvent.postback) {
        // Handle the "Get Started" button click event
        if (webhookEvent.postback.payload === 'GET_STARTED_PAYLOAD') {
          const senderPsid = webhookEvent.sender.id;
          const username = "User's Name"; // Replace with the actual username if available
          messengerBot.sendWelcomeMessage(senderPsid, username);
        }
      } else if (webhookEvent.message) {
        // Handle incoming messages
        const senderPsid = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;

        if (messageText.toLowerCase() === 'hello') {
          messengerBot.sendResponse(senderPsid, 'hi');
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
