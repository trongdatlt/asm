// config/passport-setup.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async function (email, password, done) {
    try {
      const user = await User.findOne({ email: email });

      if (!user || !user.validPassword(password)) {
        return done(null, false, { message: 'Email hoặc mật khẩu không chính xác' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);
