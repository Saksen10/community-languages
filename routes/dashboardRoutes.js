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

      // Match Algorithm: Recommend learners interested in what the teacher speaks
      const [[teacherInfo]] = await db.query('SELECT spoken_languages FROM users WHERE id = ?', [user.id]);
      let recommendedLearners = [];
      if (teacherInfo && teacherInfo.spoken_languages) {
        const languages = teacherInfo.spoken_languages.split(',').map(i => i.trim());
        const placeholders = languages.map(() => 'learning_interests LIKE ?').join(' OR ');
        const params = languages.map(l => `%${l}%`);
        [recommendedLearners] = await db.query(`
          SELECT id, name, bio, learning_interests, points
          FROM users
          WHERE role = 'learner' AND (${placeholders})
          ORDER BY points DESC LIMIT 6
        `, params);
      }

      res.render('dashboard/teacher', {
        title: 'Teacher Dashboard',
        lessons,
        lessonCount: lessons.length,
        learnerCount,
        quizAttempts,
        recommendedLearners
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
      let recommendedTeachers = [];
      
      if (userInfo && userInfo.learning_interests) {
        const interests = userInfo.learning_interests.split(',').map(i => i.trim());
        
        // Match Lessons
        const lessonPlaceholders = interests.map(() => 'lang.name LIKE ?').join(' OR ');
        const lessonParams = interests.map(i => `%${i}%`);
        [recommended] = await db.query(`
          SELECT l.*, lang.name AS language_name, u.name AS teacher_name
          FROM lessons l
          JOIN languages lang ON l.language_id = lang.id
          JOIN users u ON l.teacher_id = u.id
          WHERE (${lessonPlaceholders})
          AND l.id NOT IN (SELECT lesson_id FROM lesson_progress WHERE learner_id = ?)
          ORDER BY l.created_at DESC LIMIT 6
        `, [...lessonParams, user.id]);
        
        // Match Teachers
        const teacherPlaceholders = interests.map(() => 'spoken_languages LIKE ?').join(' OR ');
        const teacherParams = interests.map(i => `%${i}%`);
        [recommendedTeachers] = await db.query(`
          SELECT id, name, bio, spoken_languages, points
          FROM users
          WHERE role = 'teacher' AND (${teacherPlaceholders})
          ORDER BY points DESC LIMIT 6
        `, teacherParams);
      }

      // Refresh points from DB
      const [[freshUser]] = await db.query('SELECT points FROM users WHERE id = ?', [user.id]);
      req.session.user.points = freshUser.points;

      res.render('dashboard/learner', {
        title: 'Learner Dashboard',
        completedLessons,
        completedCount: completedLessons.length,
        quizCount,
        recommended,
        recommendedTeachers
      });
    }
  } catch (err) {
    console.error('Dashboard error:', err);
    req.flash('error', 'Could not load dashboard.');
    res.redirect('/');
  }
});

module.exports = router;
