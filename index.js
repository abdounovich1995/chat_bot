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
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Set the persistent menu using the imported configuration
function setPersistentMenu(psid) {
  axios.post(`https://graph.facebook.com/v18.0/me/custom_user_settings?access_token=${PAGE_ACCESS_TOKEN}`, {
    psid: psid,
    persistent_menu: [/* Your menu configuration here */],
  })
  .then(() => {
    console.log('User-level persistent menu set successfully for PSID:', psid);
  })
  .catch((error) => {
    console.error('Unable to set user-level persistent menu:', error);
  });
}

// Create a route to set the menu when /setMenu is accessed in the browser
app.get('/setUserMenu', (req, res) => {
  // Get the PSID from the query parameter (e.g., /setUserMenu?psid=USER_PSID)
  const psid = req.query.psid;

  if (psid) {
    // Set the user-level persistent menu for the specified user
    setPersistentMenu(psid);
    res.send('User-level persistent menu set successfully');
  } else {
    res.status(400).send('Missing PSID parameter');
  }
});


// Handle Facebook Webhook verification using the imported function
app.get('/webhook', verifyWebhook);
app.set('view engine', 'ejs');

 // Define a route handler for '/close'
app.get('/close', (req, res) => {
  // Render an HTML page to display to the user
  
  res.render('closePage'); // Create a 'closePage.ejs' template

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
  setPersistentMenu
};





 



// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});