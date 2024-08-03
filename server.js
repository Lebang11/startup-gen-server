/**
 * Import required libraries
 */
const express = require('express'); // Express.js framework
const bodyParser = require('body-parser'); // Body-parser middleware
const db = require('./database/index.js'); // Database module
const tfjs = require("./tensorflow.js"); // TensorFlow.js module
const fileUpload = require('express-fileupload');
const Papa = require('papaparse');
const { readSync } = require('fs');


/**
 * Create an Express.js app
 */
const app = express();
const PORT = 3000;

// Enable files upload
app.use(fileUpload({
}));

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

app.post('/csv', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // Retrieve the uploaded file
  let uploadedFile = req.files.file;

  try {
    // Read the CSV file
    const csvData = uploadedFile.data.toString('utf8');

    // Parse CSV data
    const results = await tfjs.parseCSV(csvData)
    
    // Preprocess data
    const data = await tfjs.preprocessData(results.data);

    // Split data into training and testing sets
    const splitData = await tfjs.splitData(data);

    // Train the model
    const model = await tfjs.trainModel(splitData.trainData);

    // Make predictions on the test data
    const predictions = await tfjs.makePredictions(model, splitData.testData);

    // Send predictions as the response
    res.json({ predictions });

  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).send('Error processing file.');
  }

  
})

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
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});