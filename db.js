// db.js
const mysql = require('mysql2');

// Create a connection to the database
const db = mysql.createConnection({
    host: 'localhost',           // Your database host
    user: 'root',       // Your database username
    password: 'Ppatel@186',   // Your database password
    database: 'payroll_db'    // Your database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = db;
