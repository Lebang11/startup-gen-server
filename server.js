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

// app.post('/products', async (req, res) => {
//     await db.query('SELECT * FROM "TrendingProducts"', (err, data) => {
//         if (err) {
//             console.log(err);
//             res.send('Error')
            
//         } else {
//             console.log(data.rows);
//             res.send(data.rows)
//         }
//     })
    
// })

// app.post('/topics', async (req, res) => {
//     // const values = [
//     //     req.body.
//     // ];
//     await db.query('INSERT INTO "TrendingTopics" () VALUES($1, $2, $3, $4, $5, $6)  RETURNING *;',  ,(err, data) => {
//         if (err) {
//             console.log(err);
//             res.send('Error')
            
//         } else {
//             console.log(data.rows);
//             res.send(data.rows)
//         }
//     })
    
// })

app.post('/webhook', (req, res) => {
    const data = req.body;
    // Process incoming data
    res.json({ message: 'Received' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
