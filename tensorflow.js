const tf = require('@tensorflow/tfjs');
const Papa = require('papaparse');
const moment = require('moment');
const fs = require("fs");

// Define constants
const TIME_SERIES_ID_COL = 'product_code';
const DATE_COL = 'sales_date';
const TARGET_COL = 'volume';
const FREQUENCY = '1D';
const PREDICTION_LENGTH = 28;

/**
 * Load data from a CSV file and parse it into a JSON format.
 * 
 * @param {string} csvPath - The path to the CSV file.
 * @returns {Promise<Array>} - A promise that resolves to an array of objects representing the parsed data.
 */
async function loadData(csvPath) {
  const csvFile = "./isazi_ts_dataset.csv";
  const csvData = fs.readFileSync(csvFile, "utf8");
  const csvRows = csvData.split('\n');
  const results = Papa.parse(csvRows.join('\n'), { 
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return results.data;
}

/**
 * Parse CSV data provided as a string and return the parsed results.
 * 
 * @param {string} csvFile - The CSV data as a string.
 * @returns {Promise<Object>} - A promise that resolves to the parsed CSV data.
 */
async function parseCSV(csvFile) {
  const csvRows = csvFile.split('\n');
  const results = Papa.parse(csvRows.join('\n'), { 
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return results;
}

/**
 * Preprocess the data by converting date columns, adding additional features, 
 * and handling missing values.
 * 
 * @param {Array} data - The data to preprocess.
 * @returns {Array} - The preprocessed data.
 */
async function preprocessData(data) {
  console.log("Preprocessing data");

  // Convert date column to datetime format
  data.forEach((row) => {
    row[DATE_COL] = moment(row[DATE_COL], 'YYYY-MM-DD');
  });

  console.log('Adding additional features');

  // Create additional features
  await data.forEach((row) => {
    row['day'] = row[DATE_COL].date();
    row['month'] = row[DATE_COL].month() + 1;
    row['quarter'] = row[DATE_COL].quarter();
    row['black_friday_month'] = row['month'] === 11 ? 1 : 0;
    row['is_dec_holiday'] = row['month'] === 12 || row['month'] === 11 ? 1 : 0;
    row['start_of_year'] = row['month'] === 1 ? 1 : 0;
    row['discount_per'] = row['rel_promo_price'] / row['rsp'];
    row['promo_length'] = row['is_promo'] ? 1 : 0;
    row['is_weekend'] = row[DATE_COL].day() >= 5 ? 1 : 0;
    row['is_after_payday'] = row[DATE_COL].date() >= 25 ? 1 : 0;
    row['start_of_month'] = row[DATE_COL].date() === 1 ? 1 : 0;
  });

  console.log("Replacing NaN values with 0");

  // Replace NaN values with 0
  data.forEach((row) => {
    for (let key in row) {
      if (isNaN(row[key]) && typeof row[key] === 'number') {
        row[key] = 0;
      }
    }
  });

  return data;
}

/**
 * Split the data into training and testing sets based on a time threshold.
 * 
 * @param {Array} data - The full dataset to split.
 * @returns {Object} - An object containing `trainData` and `testData` arrays.
 */
async function splitData(data) {
  console.log("Splitting data");
  const trainData = [];
  const testData = [];

  // Split data based on a threshold date
  data.forEach((row) => {
    if (row[DATE_COL] < moment().subtract(16, 'months')) {
      trainData.push(row);
    } else {
      testData.push(row);
    }
  });

  console.log("Training data length: " + trainData.length);
  console.log("Test data length: " + testData.length);

  return { trainData, testData };
}

/**
 * Create and train a neural network model using the training data.
 * 
 * @param {Array} trainData - The data used for training the model.
 * @returns {Promise<Object>} - A promise that resolves to the trained model.
 */
async function trainModel(trainData) {
  console.log("Training model");

  // Ensure trainData is not empty
  if (trainData.length === 0) {
    throw new Error("trainData is empty.");
  }

  // Extract the list of input feature keys
  const rowKeys = Object.keys(trainData[0]);
  const inputKeys = rowKeys.filter(key => key !== TARGET_COL && key !== DATE_COL && key !== 'sales_date');
  const inputShape = inputKeys.length;

  console.log("Input keys:", inputKeys);
  console.log("Input shape:", inputShape);

  // Prepare the input (xs) and output (ys) data for the model
  const xsData = trainData.map(row => inputKeys.map(key => row[key]));
  const ysData = trainData.map(row => [row[TARGET_COL]]);

  console.log("Sample of xsData:", xsData[0]);
  console.log("Sample of ysData:", ysData[0]);

  // Ensure xsData and ysData are not empty and have consistent lengths
  if (xsData.length === 0 || ysData.length === 0) {
    throw new Error("xsData or ysData is empty.");
  }

  // Log the shapes of xsData and ysData
  console.log("xsData length:", xsData.length);
  console.log("ysData length:", ysData.length);
  console.log("xsData[0] shape:", xsData[0].length);
  console.log("ysData[0] shape:", ysData[0].length);

  // Create tensors for input and output data
  const xs = tf.tensor2d(xsData, [xsData.length, inputShape]);
  const ys = tf.tensor2d(ysData, [ysData.length, 1]);

  console.log("xs shape:", xs.shape);
  console.log("ys shape:", ys.shape);

  // Define and compile the model
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [inputShape] }));
  model.add(tf.layers.dense({ units: 1 }));
  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  console.log("Model compiled, starting training");

  // Train the model
  await model.fit(xs, ys, { epochs: 10 });

  console.log("Model training completed");

  return model;
}

/**
 * Print predictions in a formatted way for easy viewing.
 * 
 * @param {Array} testData - The test data used for making predictions.
 * @param {Array} predictions - The predictions made by the model.
 */
function printPredictions(testData, predictions) {
  console.log("Predictions:");
  console.log("Date\t\t\tActual\t\tPredicted");

  testData.forEach((row, index) => {
    const date = row['sales_date'].format('YYYY-MM-DD');
    const actual = row[TARGET_COL];
    const predicted = predictions[index];

    console.log(`${date}\t${actual.toFixed(2)}\t\t${predicted.toFixed(2)}`);
  });
}

/**
 * Make predictions on the test data using the trained model and calculate various metrics.
 * 
 * @param {Object} model - The trained model.
 * @param {Array} testData - The data to make predictions on.
 * @returns {Promise<Array>} - A promise that resolves to the predictions.
 */
async function makePredictions(model, testData) {
  console.log("Making predictions");
  const predictions = [];

  // Ensure testData is not empty
  if (testData.length === 0) {
    throw new Error("testData is empty.");
  }

  // Extract input features from test data
  const inputKeys = Object.keys(testData[0]).filter(key => key !== TARGET_COL && key !== DATE_COL && key !== 'sales_date');
  console.log("Input keys for prediction:", inputKeys);

  testData.forEach((row) => {
    // Convert row to array of input features
    const rowArray = inputKeys.map(key => row[key]);

    // Create a tensor from the input array
    const input = tf.tensor2d([rowArray], [1, rowArray.length]);

    // Predict using the model
    const prediction = model.predict(input);
    predictions.push(prediction.dataSync()[0]);
  });

  console.log("Calculating forecast accuracy and bias");

  // Calculate various metrics
  const actuals = testData.map(row => row[TARGET_COL]);
  const predictionsTensor = tf.tensor1d(predictions);
  const actualsTensor = tf.tensor1d(actuals);

  // Mean Squared Error (MSE)
  const mse = predictionsTensor.sub(actualsTensor).square().mean().arraySync();
  console.log(`Mean Squared Error (MSE): ${mse.toFixed(2)}`);

  // Mean Absolute Error (MAE)
  const mae = predictionsTensor.sub(actualsTensor).abs().mean().arraySync();
  console.log(`Mean Absolute Error (MAE): ${mae.toFixed(2)}`);

  // Mean Absolute Percentage Error (MAPE)
  const epsilon = 1e-10; // Small value to avoid division by zero
  const percentageErrors = actuals.map((actual, index) => {
    return actual === 0
      ? Math.abs(predictions[index])
      : Math.abs((predictions[index] - actual) / (actual + epsilon));
  });

  const mape = percentageErrors.reduce((sum, error) => sum + error, 0) / percentageErrors.length;
  console.log(`Forecast accuracy (MAPE): ${(mape * 100).toFixed(2)}%`);

  // Forecast Bias
  const forecastBias = predictionsTensor.sub(actualsTensor).mean().arraySync();
  console.log(`Forecast Bias: ${forecastBias.toFixed(2)}`);

  return predictions;
}

module.exports = {
  loadData,
  preprocessData,
  splitData,
  trainModel,
  makePredictions,
  printPredictions,
  parseCSV
};
