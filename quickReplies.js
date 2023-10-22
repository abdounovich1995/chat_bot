const request = require('request');

function sendQuickReplies(senderPsid, PAGE_ACCESS_TOKEN) {
  const quickReplies = [
    {
      content_type: 'text',
      title: 'A',
      payload: 'QUICK_REPLY_A',
    },
    {
      content_type: 'text',
      title: 'B',
      payload: 'QUICK_REPLY_B',
    },
    {
      content_type: 'text',
      title: 'C',
      payload: 'QUICK_REPLY_C',
    },
  ];

  const response = {
    text: 'Choose one of the following options:',
    quick_replies: quickReplies,
  };

  const requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: response,
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
        console.log('Quick replies sent');
      } else {
        console.error('Unable to send quick replies:', err);
      }
    }
  );
}

module.exports = {
  sendQuickReplies,
};
