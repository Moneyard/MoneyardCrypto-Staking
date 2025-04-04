const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Database setup
const db = new sqlite3.Database("moneyard.db");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

// Create users table with balance and referral fields
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      balance DECIMAL DEFAULT 0,
      referral_code TEXT UNIQUE,
      referred_by TEXT
    )
  `);
});

// Generate referral code
function generateReferralCode() {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

// Home route to prevent 404 error
app.get("/", (req, res) => {
  res.send("Welcome to Moneyard Staking Platform!");
});

// Signup endpoint with referral support
app.post("/signup", (req, res) => {
  const { email, password, referralCode } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newReferralCode = generateReferralCode();

  db.serialize(() => {
    db.run(
      "INSERT INTO users (email, password, referral_code) VALUES (?, ?, ?)",
      [email, hashedPassword, newReferralCode],
      function (err) {
        if (err) return res.status(500).json({ error: "Signup failed" });

        // Apply referral bonus if valid code
        if (referralCode) {
          db.run(
            "UPDATE users SET balance = balance + 10 WHERE referral_code = ?",
            [referralCode],
            (err) => {
              if (err) console.error("Referral bonus failed:", err);
            }
          );
        }

        res.json({
          message: "User created!",
          referralCode: newReferralCode,
        });
      }
    );
  });
});

// Login endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ token });
  });
});

// Protected dashboard endpoint
app.get("/dashboard", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });

    db.get(
      "SELECT email, balance, referral_code FROM users WHERE id = ?",
      [decoded.userId],
      (err, user) => {
        if (err || !user)
          return res.status(500).json({ error: "User not found" });
        res.json({
          email: user.email,
          balance: user.balance,
          referralCode: user.referral_code,
        });
      }
    );
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
