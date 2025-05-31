const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    // Create connection without database selected
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS cwsms');
    console.log('Database created or already exists');

    // Use the database
    await connection.query('USE cwsms');

    // Drop existing tables if they exist (in reverse order due to foreign keys)
    const dropStatements = [
      'DROP TABLE IF EXISTS Payment',
      'DROP TABLE IF EXISTS ServicePackage',
      'DROP TABLE IF EXISTS Package',
      'DROP TABLE IF EXISTS Car'
      // Note: We keep User table to preserve login credentials
    ];

    for (const statement of dropStatements) {
      await connection.query(statement);
    }

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../../database_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split the SQL statements
    const statements = schemaSql.split(';').filter(statement => statement.trim() !== '');

    // Execute each statement
    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log('Database schema initialized successfully');

    // Insert default admin user if not exists
    const [rows] = await connection.query('SELECT * FROM User WHERE Username = ?', ['admin']);

    if (rows.length === 0) {
      // Using bcrypt for password hashing
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await connection.query(
        'INSERT INTO User (Username, Password) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('Default admin user created');
    }

    // Close the connection
    await connection.end();
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
