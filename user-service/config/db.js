const mysql = require('mysql2');
require('dotenv').config();

//Cấu hình kết nối MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Kết nối tới database
db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

module.exports = db;