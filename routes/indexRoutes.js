// routes/indexRoutes.js — Home and About pages
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

// GET / — Home page
router.get('/', async (req, res) => {
  try {
    // Get stats
    const [[userCount]] = await db.query('SELECT COUNT(*) as count FROM users');
    const [[lessonCount]] = await db.query('SELECT COUNT(*) as count FROM lessons');
    const [[langCount]] = await db.query('SELECT COUNT(*) as count FROM languages');
    const [[teacherCount]] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['teacher']);

    // Get featured lessons (6 most recent)
    const [featuredLessons] = await db.query(`
      SELECT l.*, u.name AS teacher_name, lang.name AS language_name
      FROM lessons l
      JOIN users u ON l.teacher_id = u.id
      JOIN languages lang ON l.language_id = lang.id
      ORDER BY l.created_at DESC LIMIT 6
    `);

    // Get languages
    const [languages] = await db.query('SELECT * FROM languages ORDER BY name');

    res.render('index', {
      title: 'Home',
      stats: {
        users: userCount.count,
        lessons: lessonCount.count,
        languages: langCount.count,
        teachers: teacherCount.count
      },
      featuredLessons,
      languages
    });
  } catch (err) {
    console.error('Home page error:', err);
    res.render('index', { title: 'Home', stats: {}, featuredLessons: [], languages: [] });
  }
});

// GET /about — About page
router.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

// GET /settings — Profile settings page
router.get('/settings', isAuthenticated, (req, res) => {
  res.render('users/settings', { title: 'Settings' });
});

// POST /settings — Update profile settings
router.post('/settings', isAuthenticated, async (req, res) => {
  try {
    const { name, bio, spoken_languages, learning_interests, community_location } = req.body;
    
    await db.query(
      'UPDATE users SET name=?, bio=?, spoken_languages=?, learning_interests=?, community_location=? WHERE id=?',
      [name, bio || null, spoken_languages || null, learning_interests || null, community_location || null, req.session.user.id]
    );

    // Update session object
    req.session.user.name = name;
    req.session.user.bio = bio || null;
    req.session.user.spoken_languages = spoken_languages || null;
    req.session.user.learning_interests = learning_interests || null;
    req.session.user.community_location = community_location || null;

    req.flash('success', 'Profile settings updated successfully.');
    res.redirect(`/users/${req.session.user.id}`);
  } catch (err) {
    console.error('Settings update error:', err);
    req.flash('error', 'Could not update settings. Please try again.');
    res.redirect('/settings');
  }
});

module.exports = router;
