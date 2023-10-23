const request = require('request');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;



function sendResponse(senderPsid, response) {
  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: {
      text: response,
    },
  };

  request(
    {
      uri: 'https://graph.facebook.com/v13.0/me/messages',
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: requestBody,
    },
    (err, _res, _body) => {
      if (!err) {
        console.log('Message sent');
      } else {
        console.error('Unable to send message:', err);
      }
    }
  );
}

module.exports = {
  sendResponse,
};
