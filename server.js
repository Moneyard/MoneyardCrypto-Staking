const express = require('express');
  const sqlite3 = require('sqlite3').verbose();
  const app = express();

  // Use an in-memory SQLite database (no setup needed)
  const db = new sqlite3.Database(':memory:');

  app.get('/', (req, res) => {
    res.send('Moneyard is working!');
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });