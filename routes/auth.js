// routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user');

// Đăng ký người dùng mới
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }

    // Tạo người dùng mới và lưu vào cơ sở dữ liệu
    const newUser = new User({ email, password });
    await newUser.save();

    // Trả về thông tin người dùng sau khi đăng ký thành công
    return res.status(201).json({ message: 'Đăng ký thành công', user: newUser });
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi khi đăng ký', error: error.message });
  }
});

// Đăng nhập người dùng
router.post('/login', passport.authenticate('local'), (req, res) => {
  return res.status(200).json({ message: 'Đăng nhập thành công', user: req.user });
});

// Đăng xuất người dùng
router.get('/logout', (req, res) => {
  req.logout();
  return res.status(200).json({ message: 'Đăng xuất thành công' });
});

module.exports = router;
