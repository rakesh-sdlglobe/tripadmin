require('dotenv').config();
const mysql = require('mysql2');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Set the number of connections in the pool
  queueLimit: 0 // No limit to queue of requests waiting for a connection
});

// Promisify the pool to use async/await
const connection = pool.promise();

module.exports = connection;
