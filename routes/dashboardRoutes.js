// routes/dashboardRoutes.js — Learner and teacher dashboards with recommendations
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

// GET /dashboard — Route to appropriate dashboard
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;

    if (user.role === 'teacher') {
      // Teacher dashboard
      const [lessons] = await db.query(`
        SELECT l.*, lang.name AS language_name
        FROM lessons l JOIN languages lang ON l.language_id = lang.id
        WHERE l.teacher_id = ? ORDER BY l.created_at DESC
      `, [user.id]);

      const [[{ learnerCount }]] = await db.query(`
        SELECT COUNT(DISTINCT lp.learner_id) AS learnerCount
        FROM lesson_progress lp
        JOIN lessons l ON lp.lesson_id = l.id
        WHERE l.teacher_id = ?
      `, [user.id]);

      const [[{ quizAttempts }]] = await db.query(`
        SELECT COUNT(*) AS quizAttempts
        FROM quiz_attempts qa
        JOIN lessons l ON qa.lesson_id = l.id
        WHERE l.teacher_id = ?
      `, [user.id]);

      // Refresh points from DB
      const [[freshUser]] = await db.query('SELECT points FROM users WHERE id = ?', [user.id]);
      req.session.user.points = freshUser.points;

      res.render('dashboard/teacher', {
        title: 'Teacher Dashboard',
        lessons,
        lessonCount: lessons.length,
        learnerCount,
        quizAttempts
      });
    } else {
      // Learner dashboard
      const [completedLessons] = await db.query(`
        SELECT l.*, lang.name AS language_name, lp.completed_at
        FROM lesson_progress lp
        JOIN lessons l ON lp.lesson_id = l.id
        JOIN languages lang ON l.language_id = lang.id
        WHERE lp.learner_id = ? ORDER BY lp.completed_at DESC
      `, [user.id]);

      const [[{ quizCount }]] = await db.query(
        'SELECT COUNT(*) AS quizCount FROM quiz_attempts WHERE learner_id = ?', [user.id]
      );

      // Simple recommendation: lessons in user's learning interests, not yet completed
      const [[userInfo]] = await db.query('SELECT learning_interests FROM users WHERE id = ?', [user.id]);
      let recommended = [];
      if (userInfo && userInfo.learning_interests) {
        const interests = userInfo.learning_interests.split(',').map(i => i.trim());
        const placeholders = interests.map(() => 'lang.name LIKE ?').join(' OR ');
        const params = interests.map(i => `%${i}%`);
        [recommended] = await db.query(`
          SELECT l.*, lang.name AS language_name, u.name AS teacher_name
          FROM lessons l
          JOIN languages lang ON l.language_id = lang.id
          JOIN users u ON l.teacher_id = u.id
          WHERE (${placeholders})
          AND l.id NOT IN (SELECT lesson_id FROM lesson_progress WHERE learner_id = ?)
          ORDER BY l.created_at DESC LIMIT 6
        `, [...params, user.id]);
      }

      // Refresh points from DB
      const [[freshUser]] = await db.query('SELECT points FROM users WHERE id = ?', [user.id]);
      req.session.user.points = freshUser.points;

      res.render('dashboard/learner', {
        title: 'Learner Dashboard',
        completedLessons,
        completedCount: completedLessons.length,
        quizCount,
        recommended
      });
    }
  } catch (err) {
    console.error('Dashboard error:', err);
    req.flash('error', 'Could not load dashboard.');
    res.redirect('/');
  }
});

module.exports = router;
