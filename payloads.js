const request = require('request');

function sendTextMessage(senderPsid, text) {
  const requestBody = {
    recipient: {
      id: senderPsid
    },
    message: {
      text
    }
  };

  callSendAPI(requestBody);
}

function handlePostback(senderPsid, postback) {
  const payload = postback.payload;

  if (payload === 'GET_STARTED_PAYLOAD') {
    sendTextMessage(senderPsid, 'Welcome! How can I assist you?');
  }
}

function callSendAPI(requestBody) {
  const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

  request({
    uri: 'https://graph.facebook.com/v13.0/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: requestBody
  }, (err, _res, _body) => {
    if (!err) {
      console.log('Message sent');
    } else {
      console.error('Unable to send message:', err);
    }
  });
}

module.exports = {
  sendTextMessage,
  handlePostback
};