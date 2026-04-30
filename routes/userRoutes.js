// routes/userRoutes.js — Users list and profile pages
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /users — Users list with filters
router.get('/', async (req, res) => {
  try {
    const { search, role, language } = req.query;
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR bio LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    if (language) {
      // Filter by spoken or learning languages using language name
      const [[lang]] = await db.query('SELECT name FROM languages WHERE id = ?', [language]);
      if (lang) {
        query += ' AND (spoken_languages LIKE ? OR learning_interests LIKE ?)';
        params.push(`%${lang.name}%`, `%${lang.name}%`);
      }
    }
    query += ' ORDER BY points DESC, name ASC';

    const [users] = await db.query(query, params);
    const [languages] = await db.query('SELECT * FROM languages ORDER BY name');

    res.render('users/index', {
      title: 'Community Members',
      users,
      languages,
      search: search || '',
      role: role || '',
      language: language || ''
    });
  } catch (err) {
    console.error('Users list error:', err);
    res.render('users/index', { title: 'Community Members', users: [], languages: [] });
  }
});

// GET /users/:id — User profile
router.get('/:id', async (req, res) => {
  try {
    const [[user]] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) {
      return res.status(404).render('error', { title: 'Not Found', status: 404, message: 'User not found.' });
    }

    let lessons = [];
    let completedLessons = [];

    if (user.role === 'teacher') {
      [lessons] = await db.query(`
        SELECT l.*, lang.name AS language_name
        FROM lessons l
        JOIN languages lang ON l.language_id = lang.id
        WHERE l.teacher_id = ?
        ORDER BY l.created_at DESC
      `, [user.id]);
    }

    if (user.role === 'learner') {
      [completedLessons] = await db.query(`
        SELECT l.*, lang.name AS language_name, lp.completed_at
        FROM lesson_progress lp
        JOIN lessons l ON lp.lesson_id = l.id
        JOIN languages lang ON l.language_id = lang.id
        WHERE lp.learner_id = ?
        ORDER BY lp.completed_at DESC
      `, [user.id]);
    }

    // Do not expose password hash
    delete user.password_hash;

    res.render('users/profile', { title: user.name, user, lessons, completedLessons });
  } catch (err) {
    console.error('User profile error:', err);
    res.status(500).render('error', { title: 'Error', status: 500, message: 'Could not load profile.' });
  }
});

module.exports = router;
