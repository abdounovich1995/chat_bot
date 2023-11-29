// postbackHandler.js
const firebaseService = require('./firebaseService'); // Import your Firebase service module here
const messageManager = require('./messageManager'); // Import your message manager module here
const setMenu = require('./setPersistMenu'); // Import your message manager module here
const welcomeButton = require('./templates/welcomeButton'); // Import the messageManager module

async function handlePostback(webhookEvent) {
  if (webhookEvent.postback) {
    if (webhookEvent.postback.payload === 'GET_STARTED_PAYLOAD') {
      const senderPsid = webhookEvent.sender.id; 

      await firebaseService.addUserToClientCollection(senderPsid);
const userRef= await  firebaseService.getClientReferenceByPSID(senderPsid);
      welcomeButton.sendButtonTemplate(senderPsid,userRef);
      setMenu.setPersistentMenu(senderPsid,userRef);

    } else if (webhookEvent.postback.payload === "TAKE_APPOINTEMENT") {
      const senderPsid = webhookEvent.sender.id;
      messageManager.sendQuickReply(senderPsid, '    ⬇ إخـتـر يومـا مـن القائمة:');
    }
  }
}

module.exports = { handlePostback };
