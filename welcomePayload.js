// getStartedHandler.js
const messageManager = require('./messageManager');

// Handle the "Get Started" payload
async function handleGetStarted(senderPsid) {
  try {
    // You can customize the response message here
    const response = "Welcome to the bot! You can start by typing a message or use the menu.";

    // Send the response to the user
    await messageManager.sendTextMessage(senderPsid, response);
  } catch (error) {
    console.error('Error handling Get Started:', error);
  }
}

// Export the function to be used in other files
module.exports = {
  handleGetStarted,
};



