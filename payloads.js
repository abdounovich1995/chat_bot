// postbackHandler.js
const firebaseService = require('./firebaseService'); // Import your Firebase service module here
const messageManager = require('./messageManager'); // Import your message manager module here

function handlePostback(webhookEvent) {
  if (webhookEvent.postback) {
    if (webhookEvent.postback.payload === 'GET_STARTED_PAYLOAD') {
      const senderPsid = webhookEvent.sender.id;
      firebaseService.addUserToClientCollection(senderPsid);
    } else if (webhookEvent.postback.payload === "TAKE_APPOINTEMENT") {
      const senderPsid = webhookEvent.sender.id;
      messageManager.sendTextMessage(senderPsid, 'pas encore.');
    }
  }
}

module.exports = { handlePostback };
