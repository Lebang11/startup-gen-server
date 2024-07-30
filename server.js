const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({
        "message": "Bot is online :)"
    })
})

app.post('/webhook', (req, res) => {
    const data = req.body;
    // Process incoming data
    res.json({ message: 'Received' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
