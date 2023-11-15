const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import the axios package for making HTTP requests
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




app.get('/picture/:senderId', async (req, res) => {
  const senderId = req.params.senderId;

  try {
    // Make a request to the Facebook Graph API to get the user's profile picture
    const response = await axios.get(`https://graph.facebook.com/v13.0/${senderId}/picture`, {
      params: {
        access_token: PAGE_ACCESS_TOKEN,
        redirect: true, // Prevents redirection
        type: 'large', // Specify the picture type (you can adjust this based on your needs)
      },
    });

    // Check if the response contains the profile picture URL
    if (response.data && response.data.data && response.data.data.url) {
      let profilePictureUrl = response.data.data.url;

      // Append a default image extension (e.g., '.jpg') if the URL doesn't have one
      if (!profilePictureUrl.includes('.')) {
        profilePictureUrl += '.jpg'; // You can use a different extension if needed
      }

      // Log the profile picture URL for debugging
      console.log('Profile Picture URL:', profilePictureUrl);

      // Send the image tag with the profile picture URL in the response
  
      res.send(`<img src="${decodeURIComponent(profilePictureUrl)}" alt="Profile Picture">`);

    } else {
      // If the response does not contain the expected data, handle it accordingly
      console.error('Invalid or missing data in the profile picture response:', response.data);
      res.status(500).send('Error fetching profile picture111');
    }
  } catch (error) {
    // Handle errors during the API request
    console.error('Error fetching profile picture:', error);
    res.status(500).send('Error fetching profile picture');
  }
});


module.exports = {
  getUserName,
};





 



// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});