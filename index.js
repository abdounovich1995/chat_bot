const cloudinary = require('cloudinary').v2;
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const messageManager = require('./messageManager');
const payloads = require('./payloads');
const verifyWebhook = require('./webhookVerification');
const genericTemplate = require('./templates/genericTemplate');
const firebaseService = require('./firebaseService'); // Import your Firebase service module here

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL;


// Set up Cloudinary configuration
cloudinary.config({
  cloud_name: 'dx3s5gixo',
  api_key: '366137172543913',
  api_secret: 'ssxTXvA5jRAm1Y5lyH5xbacnjao',
  secure: true,
});

// Handle Facebook Webhook verification using the imported function
app.get('/webhook', verifyWebhook);
app.set('view engine', 'ejs');

// Define a route handler for '/close'
app.get('/close', (req, res) => {
  res.render('closePage',{SITE_URL,
  }); // Create a 'closePage.ejs' template
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
          genericTemplate.sendGenericTemplate(senderPsid, 'today');
        } else if (messageText.toLowerCase() === 'tomorrow') {
          messageManager.sendTextMessage(senderPsid, 'b selected');
        } else if (messageText.toLowerCase() === 'after tomorrow') {
          messageManager.sendTextMessage(senderPsid, 'after tomorrow');
        } else if (messageText.toLowerCase() === 'vip') {
          messageManager.sendTextMessage(senderPsid, 'vip');
        } else {
          messageManager.sendTextMessage(senderPsid, "I don't understand");
        }
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});


app.post('/send-message', async (req, res) => {
  try {
const appointmentDetails=req.body.appointmentDetails;


const appointmentData = await firebaseService.getAppointmentDetails(appointmentDetails);
const appointmentDay = appointmentData.day; 
const appointmentDate = appointmentData.date; 

console.log(appointmentData);
console.log("date"+appointmentDate);

    const link= SITE_URL+"/appointment?appointmentDetails="+appointmentDetails;
    console.log(link);
    const response = await axios.post('https://graph.facebook.com/v18.0/me/messages', {
      recipient: { id: req.body.senderPsid },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: `${req.body.text} ✅\nيوم : ${appointmentDay} ${appointmentDate}`,
            buttons: [
              {
                type: 'web_url',
                title: '📅 تفاصيل الموعد',
                url: link,
              },
              
            ],
          },
        },
      },
    }, {
      params: { access_token: process.env.PAGE_ACCESS_TOKEN },
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});








// Function to get the user's name
async function getUserName(senderPsid) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${senderPsid}?fields=name&access_token=${PAGE_ACCESS_TOKEN}`
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

// Route to get and upload the user's profile picture to Cloudinary
app.get('/picture/:senderId', async (req, res) => {
  const senderId = req.params.senderId;

  try {
    // Fetch user's profile picture from Facebook
    const response = await axios.get(`https://graph.facebook.com/v18.0/${senderId}/picture`, {
      params: {
        access_token: PAGE_ACCESS_TOKEN,
        redirect: false,
      },
    });

    const profilePictureUrl = response.data.data.url;

    // Upload profile picture to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(profilePictureUrl, {
      folder: 'profile_pictures', // Optional: specify a folder in Cloudinary
    });

    // Log the Cloudinary response
    console.log('Cloudinary Response:', cloudinaryResponse);

    // Send a response to the client
    res.status(200).send('Profile picture uploaded to Cloudinary');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error uploading profile picture to Cloudinary');
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
