const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware: Verify JWT token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Deposit funds
router.post('/deposit', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const user = await User.findById(req.userId);
    user.stakedBalance += amount;
    await user.save();

    res.json({ 
      message: 'Deposit successful',
      newBalance: user.stakedBalance
    });

  } catch (error) {
    res.status(500).json({ error: 'Deposit failed' });
  }
});

// Withdraw funds
router.post('/withdraw', authenticate, async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;
    const user = await User.findById(req.userId);

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    if (amount > user.stakedBalance) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    user.stakedBalance -= amount;
    await user.save();

    // TODO: Add actual blockchain withdrawal logic here
    res.json({ 
      message: 'Withdrawal request submitted',
      txHash: '0x...', // Replace with real TX hash
      newBalance: user.stakedBalance
    });

  } catch (error) {
    res.status(500).json({ error: 'Withdrawal failed' });
  }
});

// Get current balance
router.get('/balance', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ balance: user.stakedBalance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

module.exports = router;