const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database/index.js');


const app = express();
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
  });

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());


app.get('/products', async (req, res) => {
    await db.query('SELECT * FROM "TrendingProducts"', (err, data) => {
        if (err) {
            console.log(err);
            res.send('Error')
            
        } else {
            console.log(data.rows);
            res.send(data.rows)
        }
    })
    
})

app.get('/topics', async (req, res) => {
    await db.query('SELECT * FROM "TrendingTopics"', (err, data) => {
        if (err) {
            console.log(err);
            res.send('Error')
            
        } else {
            console.log(data.rows);
            res.send(data.rows)
        }
    })
    
})

app.post('/products', async (req, res) => {
    const values = [
        req.body.product_name,
        req.body.image_url,
        req.body.price,
        req.body.source,
        req.body.date_scraped
    ];
    await db.query('INSERT INTO "TrendingProducts" (product_name, image_url, price, source, date_scraped) VALUES($1, $2, $3, $4, $5)  RETURNING *;',values ,(err, data) => {
        if (err) {
            console.log(err);
            res.send('Error')
            
        } else {
            console.log(data);
            res.send(data)
        }
    })
    
})

app.post('/topics', async (req, res) => {
    const values = [
        req.body.topic,
        req.body.summary,
        req.body.source,
        req.body.date_scraped
    ];
    await db.query('INSERT INTO "TrendingTopics" () VALUES($1, $2, $3, $4)  RETURNING *;', values ,(err, data) => {
        if (err) {
            console.log(err);
            res.send('Error')
            
        } else {
            console.log(data);
            res.send(data)
        }
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
