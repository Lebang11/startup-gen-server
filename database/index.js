const Pool = require('pg').Pool
const pool = new Pool({
  connectionString: 'postgresql://nerdthinkcode_user:z6tGZ6B5Nmwfum7piyqovssphdhsTtbA@dpg-cqkb4jo8fa8c73cjgeng-a.frankfurt-postgres.render.com/nerdthinkcode',
  ssl: {
    rejectUnauthorized: false
  }
})

module.exports = pool;