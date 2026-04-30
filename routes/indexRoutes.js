// routes/indexRoutes.js — Home and About pages
const express = require('express');
const router = express.Router();
const db = require('../config/db');

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

module.exports = router;
