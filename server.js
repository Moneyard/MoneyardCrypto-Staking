const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  stakedBalance: { type: Number, default: 0 }
});
const User = mongoose.model('User', UserSchema);

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

app.listen(3000, () => console.log('Server running on port 3000'));