const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  console.log('Connecting to MySQL...');
  try {
    // Connect without specifying database first to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      multipleStatements: true // Essential for running full schema/seed files
    });

    console.log('Connected to MySQL successfully.');

    // Read and execute schema.sql
    console.log('Executing schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('Schema created successfully.');

    // Switch to the newly created database
    await connection.changeUser({ database: process.env.DB_NAME || 'community_languages' });

    // Read and execute seed.sql
    console.log('Executing seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'db', 'seed.sql'), 'utf8');
    await connection.query(seedSql);
    console.log('Seed data inserted successfully.');

    await connection.end();
    console.log('Database setup complete!');
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
}

setupDatabase();
