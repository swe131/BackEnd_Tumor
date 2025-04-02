// D:\mon_pre\backend\db.js
require("dotenv").config();
const mysql = require("mysql2/promise"); // Use promise-based version

const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
});

// Test connection (optional, using promises)
db.getConnection()
    .then(connection => {
        console.log("Connected to MySQL Database");
        connection.release();
    })
    .catch(err => {
        console.error("Database connection failed:", err);
    });

module.exports = db;