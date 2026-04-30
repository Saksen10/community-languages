// app.js — Main application entry point
// Community Languages: Teach and Learn
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

// ============================================
// View engine setup — PUG
// ============================================
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ============================================
// Middleware
// ============================================

// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Method override for PUT/DELETE in forms
app.use(methodOverride('_method'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'community-languages-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Flash messages
app.use(flash());

// Global template variables — available in all PUG templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentPath = req.path;
  next();
});

// ============================================
// Routes
// ============================================
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const forumRoutes = require('./routes/forumRoutes');

app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/lessons', lessonRoutes);
app.use('/categories', categoryRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/forum', forumRoutes);

// ============================================
// Error handling
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    status: 404,
    message: 'The page you are looking for does not exist.'
  });
});

// General error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).render('error', {
    title: 'Error',
    status: err.status || 500,
    message: err.message || 'Something went wrong. Please try again later.'
  });
});

// ============================================
// Start server
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Community Languages app running on http://localhost:${PORT}`);
});

module.exports = app;
