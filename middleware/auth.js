// middleware/auth.js — Authentication middleware

// Check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'Please log in to access this page.');
  res.redirect('/login');
}

// Check if user is a teacher
function isTeacher(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'teacher') {
    return next();
  }
  req.flash('error', 'Only teachers can access this page.');
  res.redirect('/dashboard');
}

// Check if user is an admin
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Admin access required.');
  res.redirect('/');
}

module.exports = { isAuthenticated, isTeacher, isAdmin };
