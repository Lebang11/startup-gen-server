Here's the updated README with the additional information:

# Startup-gen-server

## Overview
This project is a web application built with Node.js, Express.js, and TensorFlow.js. It provides APIs for managing trending products and topics, as well as a machine learning component for time series prediction using TensorFlow.js.

## Features
- **Express.js API:** Endpoints to manage trending products and topics
- **PostgreSQL Database:** Store and retrieve data about products and topics.
- **TensorFlow.js:** Load, preprocess data, train a model, and make predictions on time series data.

## Installation
### Prerequisites
- **Node.js (v14 or later)**
- **PostgreSQL**
- **TensorFlow.js**

To set up the project locally, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/Lebang11/startup-gen-server
   ```

2. Change into the project directory:
   ```sh
   cd startup-gen-server
   ```

3. Configure Environment Variables:
   ```sh
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

4. Install dependencies:
   ```sh
   npm install
   ```

5. Start the application:
   ```sh
   npm start
   ```

## Usage
To use the time series prediction feature, you can pass the `isazi_ts_dataset.csv` file to the `/csv` POST request. This will run the prediction model and return the predictions.

## Team: NerdsThinkCode_
- **Team Leader:** Lebang Nong (lebangnong@gmail.com)
- **Back-end Developer:** Katlego Barayi (katlegobarayi07@gmail.com)
- **Front-end Developer:** Fezeka Mabece (fmabece@gmail.com)

## License
This project is licensed under the MIT License - see the LICENSE file for details.

This README now includes the information on how to use the `isazi_ts_dataset.csv` file for running the prediction model. Let me know if there's anything else you'd like to add or modify!