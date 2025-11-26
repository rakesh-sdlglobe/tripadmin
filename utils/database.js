require('dotenv').config();
const mysql = require('mysql2');

// Establish a raw MySQL connection
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = connection;

connection.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to localhost MySQL Database");
    conn.release();
  }
});



// require('dotenv').config();
// const mysql = require('mysql2');

// // Establish a raw MySQL connection
// const connection = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER, 
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// connection.getConnection((err, conn) => {
//   if (err) {
//     console.error("❌ Database connection failed:", err.message);
//     console.log('DB Config:', {
//       host: process.env.DB_HOST,
//       user: process.env.DB_USER,
//       database: process.env.DB_NAME,
//       port: process.env.DB_PORT,
//       password: process.env.DB_PASSWORD
//     });
//   } else {
//     console.log("✅ Connected to Hostinger MySQL Database");
//     conn.release();
//   }
// });

// module.exports = connection;
