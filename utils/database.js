require('dotenv').config();
const mysql = require('mysql2');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust this based on your application's load
  queueLimit: 0,       // No limit to the number of queued requests
  ssl: {
    rejectUnauthorized: true, // Use this if your DB provider requires SSL
  },
});

// Function to get a connection from the pool
const connection = () => {
  return new Promise((resolve, reject) => {
    pool.connection((err, connection) => {
      if (err) {
        return reject(err); // Reject the promise if there's an error
      }
      resolve(connection); // Resolve the promise with the connection
    });
  });
};

// Export the getConnection function
module.exports = connection;
