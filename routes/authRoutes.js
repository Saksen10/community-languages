// routes/authRoutes.js — Registration, login, logout
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// GET /register — Registration form
router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/register', { title: 'Register' });
});

// POST /register — Create new account
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, bio, spoken_languages, learning_interests, community_location } = req.body;

    // Check if email already exists
    const [[existing]] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      req.flash('error', 'An account with this email already exists.');
      return res.redirect('/register');
    }

    // Validate password length
    if (!password || password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/register');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, role, bio, spoken_languages, learning_interests, community_location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, password_hash, role || 'learner', bio || null, spoken_languages || null, learning_interests || null, community_location || null]
    );

    // Auto-login after registration
    const [[newUser]] = await db.query('SELECT id, name, email, role, points FROM users WHERE id = ?', [result.insertId]);
    req.session.user = newUser;

    req.flash('success', 'Welcome to Community Languages! Your account has been created.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error', 'Registration failed. Please try again.');
    res.redirect('/register');
  }
});

// GET /login — Login form
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('auth/login', { title: 'Login' });
});

// POST /login — Authenticate user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [[user]] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    // Store user in session (no password hash)
    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, points: user.points };

    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Login failed. Please try again.');
    res.redirect('/login');
  }
});

// POST /logout — Log out
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
