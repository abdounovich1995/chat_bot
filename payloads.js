// postbackHandler.js
const firebaseService = require('./firebaseService'); // Import your Firebase service module here
const messageManager = require('./messageManager'); // Import your message manager module here
const setMenu = require('./setPersistMenu'); // Import your message manager module here

function handlePostback(webhookEvent) {
  if (webhookEvent.postback) {
    if (webhookEvent.postback.payload === 'GET_STARTED_PAYLOAD') {
      const senderPsid = webhookEvent.sender.id;
      setMenu.setPersistentMenu(senderPsid);
      firebaseService.addUserToClientCollection(senderPsid);
    } else if (webhookEvent.postback.payload === "TAKE_APPOINTEMENT") {
      const senderPsid = webhookEvent.sender.id;
      messageManager.sendQuickReply(senderPsid, ' ⬇ إخـتـر يومـا مـن القائمة:');
    }
  }
}

module.exports = { handlePostback };
