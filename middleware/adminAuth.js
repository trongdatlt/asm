// middleware/adminAuth.js
module.exports = function (req, res, next) {
    // Kiểm tra xem người dùng đã đăng nhập và có quyền admin hay không
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
  
    // Nếu không có quyền admin, chuyển hướng người dùng đến trang không cho phép hoặc trang chủ, tuỳ ý của bạn
    res.redirect('/');
  };
  