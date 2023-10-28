const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import the axios package for making HTTP requests
const persistentMenu = require('./persistentMenu'); // Import the persistentMenu module
const messageManager = require('./messageManager'); // Import the messageManager module
const payloads = require('./payloads'); // Import the payloads module
const verifyWebhook = require('./webhookVerification'); // Import the webhook verification module
const genericTemplate = require('./templates/genericTemplate'); // Import the messageManager module



const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Set the persistent menu using the imported configuration
function setPersistentMenu() {
  axios.post('https://graph.facebook.com/v13.0/me/messenger_profile', {
    persistent_menu: persistentMenu, // Use the imported persistent menu configuration
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
app.get('/close', (req, res) => {
 // Define a route handler for '/close'
app.get('/close', (req, res) => {
  // Render an HTML page to display to the user
  
  console.log("here");
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Close Webview</title>
    </head>
    <body>
      <h1>Click the button to close the webview</h1>
      <button id="closeWebview">Close Webview</button>
      
     
    </body>
    </html>
  `);
  console.log("so");
});
});

// Handle Facebook Webhook events
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry.forEach(async (entry) => {
      const webhookEvent = entry.messaging[0];

      if (webhookEvent.postback) {
       

          payloads.handlePostback(webhookEvent);

  
      } else if (webhookEvent.message) {
        const senderPsid = webhookEvent.sender.id;
        const messageText = webhookEvent.message.text;

        if (messageText.toLowerCase() === 'TAKE_APPOINTEMENT') {
   
          // messageManager.sendQuickReply(senderPsid, ' ⬇ إخـتـر يومـا مـن القائمة:');


          
        } else if (messageText.toLowerCase() === 'الـيــوم') {
            genericTemplate.sendGenericTemplate(senderPsid,"today");

          } else if (messageText.toLowerCase() === 'tomorrow') {
            
         
          messageManager.sendTextMessage(senderPsid, 'b selected');
          } 
          else if (messageText.toLowerCase() === 'after tomorrow') {
            
         
            messageManager.sendTextMessage(senderPsid, 'after tomorrow');
            }
            else if (messageText.toLowerCase() === 'vip') {
            
         
              messageManager.sendTextMessage(senderPsid, 'vip');
              }
          else {
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


module.exports = {
  getUserName,
};





 



// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});