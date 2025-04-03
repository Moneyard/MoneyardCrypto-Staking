const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  stakedBalance: { type: Number, default: 0 },
  referralCode: String
});

module.exports = mongoose.model('User', UserSchema);