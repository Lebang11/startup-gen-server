const tf = require('@tensorflow/tfjs');
const Papa = require('papaparse');
const moment = require('moment');
const fs = require("fs");
const { error } = require('console');

// Define constants
const TIME_SERIES_ID_COL = 'product_code';
const DATE_COL = 'sales_date';
const TARGET_COL = 'volume';
const FREQUENCY = '1D';
const PREDICTION_LENGTH = 28;

// Load data from CSV
async function loadData(csvPath) {
  const csvFile = "./isazi_ts_dataset.csv";
  const csvData = fs.readFileSync(csvFile, "utf8");
  const csvRows = csvData.split('\n');
  const results = Papa.parse(csvRows.join('\n'), { 
    header: true,
    dynamicTyping: true,
    skipEmptyLines:true,
   });
  // console.log(results)
  return results.data
}
// loadData("./isazi_ts_dataset.csv").then((data)=> {
//   preprocessData(data);
//   }).catch((error) => {
//     console.error("Error loading data:", error);
//   });

// Preprocess data
function preprocessData(data) {
  // Convert date column to datetime format
  console.log("Preprocessing data");
  data.forEach((row) => {
    row[DATE_COL] = moment(row[DATE_COL], 'YYYY-MM-DD');
  });

  // Create additional features
  data.forEach((row) => {
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
    row['lag_1'] = row[TARGET_COL] - row[TARGET_COL];
    row['lag_7'] = row[TARGET_COL] - row[TARGET_COL];
    row['rolling_mean_7'] = row[TARGET_COL] - row[TARGET_COL];
    row['rolling_std_7'] = row[TARGET_COL] - row[TARGET_COL];
    row['rolling_min_7'] = row[TARGET_COL] - row[TARGET_COL];
    row['rolling_max_7'] = row[TARGET_COL] - row[TARGET_COL];
    row['cumulative_sales'] = row[TARGET_COL] - row[TARGET_COL];
    row['yoy_growth'] = row[TARGET_COL] - row[TARGET_COL];
  });

  return data;
}

// Split data into training and testing sets
function splitData(data) {
  const trainData = [];
  const testData = [];

  data.forEach((row) => {
    if (row[DATE_COL] < moment().subtract(PREDICTION_LENGTH, 'days')) {
      trainData.push(row);
    } else {
      testData.push(row);
    }
  });

  return { trainData, testData };
}

// Create and train model
async function trainModel(trainData) {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [trainData.length] }));
  model.add(tf.layers.dense({ units: 1 }));
  model.compile({ optimizer: tf.optimizers.adam(), loss: 'meanSquaredError' });

  const xs = tf.tensor2d(trainData.map((row) => row.slice(1)));
  const ys = tf.tensor2d(trainData.map((row) => row[TARGET_COL]));

  await model.fit(xs, ys, { epochs: 10 });

  return model;
}

// Make predictions
async function makePredictions(model, testData) {
  const predictions = [];

  testData.forEach((row) => {
    const input = tf.tensor2d([row.slice(1)]);
    const prediction = model.predict(input);
    predictions.push(prediction.dataSync()[0]);
  });

  return predictions;
}

module.exports = {
  loadData,
  preprocessData,
  splitData,
  trainModel,
  makePredictions,
};