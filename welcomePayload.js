// getStartedHandler.js
const messageManager = require('./messageManager');

// Handle the "Get Started" payload
function handleGetStarted(senderPsid) {
  // You can customize the response message here
  const response = "Welcome to the bot! You can start by typing a message or use the menu.";

  // Send the response to the user
  messageManager.sendTextMessage(senderPsid, response);
}

// Export the function to be used in other files
module.exports = {
  handleGetStarted,
};