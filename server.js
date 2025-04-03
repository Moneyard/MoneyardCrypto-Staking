const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(express.json()); // Enable JSON body parsing

// Initialize SQLite database
const db = new sqlite3.Database('moneyard.db');

// Create users table
db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, email TEXT, password TEXT)');
});

// Signup endpoint
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], (err) => {
    if (err) return res.status(500).json({ error: 'Signup failed' });
    res.json({ message: 'User created!' });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});