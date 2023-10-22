const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = env.VERIFY_TOKEN; // Replace with your own token
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
  
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });
  
  app.post('/webhook', (req, res) => {
    // Handle incoming messages here
  });
  