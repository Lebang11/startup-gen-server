/**
 * Import required libraries
 */
const express = require('express'); // Express.js framework
const bodyParser = require('body-parser'); // Body-parser middleware
const db = require('./database/index.js'); // Database module
const tfjs = require("./tensorflow.js"); // TensorFlow.js module

/**
 * Load data from TensorFlow.js module
 */
// tfjs.loadData().then((res) => console.log(res));

/**
 * Create an Express.js app
 */
const app = express();

/**
 * Enable CORS (Cross-Origin Resource Sharing)
 */
app.use((_req, res, next) => {
  /**
   * Set headers to allow CORS
   */
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

/**
 * Parse request bodies as JSON
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/**
 * Get all trending products
 * @route GET /products
 */
app.get('/products', async (req, res) => {
  /**
   * Query the database for all trending products
   */
  await db.query('SELECT * FROM "TrendingProducts"', (err, data) => {
    if (err) {
      /**
       * Log error and send error response
       */
      console.log(err);
      res.send('Error');
    } else {
      /**
       * Log data and send response
       */
      console.log(data.rows);
      res.send(data.rows);
    }
  });
});

/**
 * Get all trending topics
 * @route GET /topics
 */
app.get('/topics', async (req, res) => {
  /**
   * Query the database for all trending topics
   */
  await db.query('SELECT * FROM "TrendingTopics"', (err, data) => {
    if (err) {
      /**
       * Log error and send error response
       */
      console.log(err);
      res.send('Error');
    } else {
      /**
       * Log data and send response
       */
      console.log(data.rows);
      res.send(data.rows);
    }
  });
});

/**
 * Create a new trending product
 * @route POST /products
 */
app.post('/products', async (req, res) => {
  /**
   * Extract values from request body
   */
  const values = [
    req.body.product_name,
    req.body.image_url,
    req.body.source,
    req.body.date_scraped,
    req.body.category,
  ];

  /**
   * Insert new product into database
   */
  await db.query(
    'INSERT INTO "TrendingProducts" (product_name, image_url, source, date_scraped, category) VALUES($1, $2, $3, $4, $5) RETURNING *;',
    values,
    (err, data) => {
      if (err) {
        /**
         * Log error and send error response
         */
        console.log(err);
        res.send('Error');
      } else {
        /**
         * Log data and send response
         */
        console.log(data);
        res.send(data);
      }
    }
  );
});

/**
 * Create a new trending topic
 * @route POST /topics
 */
app.post('/topics', async (req, res) => {
  /**
   * Extract values from request body
   */
  const values = [
    req.body.topic,
    req.body.summary,
    req.body.source,
    req.body.date_scraped,
  ];

  /**
   * Insert new topic into database
   */
  await db.query(
    'INSERT INTO "TrendingTopics" () VALUES($1, $2, $3, $4) RETURNING *;',
    values,
    (err, data) => {
      if (err) {
        /**
         * Log error and send error response
         */
        console.log(err);
        res.send('Error');
      } else {
        /**
         * Log data and send response
         */
        console.log(data);
        res.send(data);
      }
    }
  );
});

/**
 * Handle incoming webhook data
 * @route POST /webhook
 */
app.post('/webhook', (req, res) => {
  /**
   * Process incoming data
   */
  const data = req.body;

  /**
   * Send response
   */
  res.json({ message: 'Received' });
});

/**
 * Start the server
 */
app.listen(3001, () => {
  console.log('Server running on port 3001');
});