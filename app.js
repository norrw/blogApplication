const express = require('express');
const ejs = require('ejs');
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const articleRoutes = require('./routes/articles');
const session = require('express-session');
const CustomError = require('./utils/CustomError');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local');
const passport = require('passport');
const User = require('./models/users');
const userRoutes = require('./routes/users');
const dotenv = require('dotenv');
const connectToDatabase = require('./mongooseConnect');

dotenv.config();
connectToDatabase();
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

const sessionConfig = {
  secret: 'theSecretKeyIsHere',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/articles', articleRoutes);
app.use('/', userRoutes);

app.all('*', (req, res, next) => {
  next(new CustomError(404, 'Page not found'));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = 'Something went wrong';
  }
  res.status(statusCode).render('error', { err });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
