// routes/lessonRoutes.js — Lesson listing, detail, CRUD, quiz, progress
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAuthenticated, isTeacher } = require('../middleware/auth');

// GET /lessons — Lessons listing with filters
router.get('/', async (req, res) => {
  try {
    const { search, language, category, difficulty } = req.query;
    let query = `
      SELECT l.*, u.name AS teacher_name, lang.name AS language_name, c.name AS category_name
      FROM lessons l
      JOIN users u ON l.teacher_id = u.id
      JOIN languages lang ON l.language_id = lang.id
      JOIN categories c ON l.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (l.title LIKE ? OR l.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (language) { query += ' AND l.language_id = ?'; params.push(language); }
    if (category) { query += ' AND l.category_id = ?'; params.push(category); }
    if (difficulty) { query += ' AND l.difficulty = ?'; params.push(difficulty); }

    query += ' ORDER BY l.created_at DESC';

    const [lessons] = await db.query(query, params);
    const [languages] = await db.query('SELECT * FROM languages ORDER BY name');
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name');

    res.render('lessons/index', {
      title: 'Browse Lessons', lessons, languages, categories,
      search: search || '', language: language || '',
      category: category || '', difficulty: difficulty || ''
    });
  } catch (err) {
    console.error('Lessons list error:', err);
    res.render('lessons/index', { title: 'Browse Lessons', lessons: [], languages: [], categories: [] });
  }
});

// GET /lessons/create — Create lesson form (teacher only)
router.get('/create', isAuthenticated, isTeacher, async (req, res) => {
  try {
    const [languages] = await db.query('SELECT * FROM languages ORDER BY name');
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
    res.render('lessons/create', { title: 'Create Lesson', languages, categories });
  } catch (err) {
    console.error('Create lesson form error:', err);
    res.redirect('/lessons');
  }
});

// POST /lessons/create — Submit new lesson
router.post('/create', isAuthenticated, isTeacher, async (req, res) => {
  try {
    const { title, language_id, category_id, difficulty, description, content, vocabulary, media_url, tags } = req.body;
    const [result] = await db.query(
      'INSERT INTO lessons (teacher_id, language_id, category_id, title, description, content, vocabulary, media_url, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.session.user.id, language_id, category_id, title, description, content, vocabulary || null, media_url || null, difficulty || 'beginner']
    );

    // Handle tags
    if (tags && tags.trim()) {
      const tagNames = tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
      for (const tagName of tagNames) {
        let [[existingTag]] = await db.query('SELECT id FROM tags WHERE name = ?', [tagName]);
        if (!existingTag) {
          const [tagResult] = await db.query('INSERT INTO tags (name) VALUES (?)', [tagName]);
          existingTag = { id: tagResult.insertId };
        }
        await db.query('INSERT IGNORE INTO lesson_tags (lesson_id, tag_id) VALUES (?, ?)', [result.insertId, existingTag.id]);
      }
    }

    // Award points for creating a lesson (+10)
    await db.query('UPDATE users SET points = points + 10 WHERE id = ?', [req.session.user.id]);
    req.session.user.points = (req.session.user.points || 0) + 10;

    req.flash('success', 'Lesson created successfully!');
    res.redirect(`/lessons/${result.insertId}`);
  } catch (err) {
    console.error('Create lesson error:', err);
    req.flash('error', 'Could not create lesson. Please try again.');
    res.redirect('/lessons/create');
  }
});

// GET /lessons/:id — Lesson detail
router.get('/:id', async (req, res) => {
  try {
    const [[lesson]] = await db.query(`
      SELECT l.*, u.name AS teacher_name, lang.name AS language_name, c.name AS category_name
      FROM lessons l
      JOIN users u ON l.teacher_id = u.id
      JOIN languages lang ON l.language_id = lang.id
      LEFT JOIN categories c ON l.category_id = c.id
      WHERE l.id = ?
    `, [req.params.id]);

    if (!lesson) {
      return res.status(404).render('error', { title: 'Not Found', status: 404, message: 'Lesson not found.' });
    }

    // Get tags for this lesson
    const [tags] = await db.query(`
      SELECT t.* FROM tags t
      JOIN lesson_tags lt ON t.id = lt.tag_id
      WHERE lt.lesson_id = ?
    `, [req.params.id]);

    // Get quiz questions
    const [quiz] = await db.query('SELECT * FROM quiz_questions WHERE lesson_id = ?', [req.params.id]);

    // Parse vocabulary
    let vocabulary = [];
    if (lesson.vocabulary) {
      vocabulary = lesson.vocabulary.split('\n').filter(v => v.trim()).map(v => {
        const parts = v.split('-');
        return {
          term: parts[0] ? parts[0].trim() : '',
          translation: parts[1] ? parts[1].trim() : '',
          notes: parts.slice(2).join('-').trim()
        };
      });
    }

    // Enrollment count
    const [[enrollmentCountRow]] = await db.query('SELECT COUNT(*) as count FROM lesson_progress WHERE lesson_id = ?', [req.params.id]);
    const enrollmentCount = enrollmentCountRow.count;

    let userEnrolled = false;
    let userHasCompletedQuiz = false;
    let userQuizScore = 0;
    let isTeacher = false;

    if (req.session.user) {
      isTeacher = req.session.user.id === lesson.teacher_id;
      
      const [[progress]] = await db.query(
        'SELECT * FROM lesson_progress WHERE learner_id = ? AND lesson_id = ?',
        [req.session.user.id, req.params.id]
      );
      userEnrolled = !!progress;

      // Get latest quiz attempt
      const [[attempt]] = await db.query(
        'SELECT * FROM quiz_attempts WHERE learner_id = ? AND lesson_id = ? ORDER BY attempted_at DESC LIMIT 1',
        [req.session.user.id, req.params.id]
      );
      if (attempt) {
        userHasCompletedQuiz = true;
        userQuizScore = attempt.score;
      }
    }

    res.render('lessons/detail', {
      title: lesson.title, lesson, tags, quiz, vocabulary,
      userEnrolled, userHasCompletedQuiz, userQuizScore, isTeacher, enrollmentCount
    });
  } catch (err) {
    console.error('Lesson detail error:', err);
    res.status(500).render('error', { title: 'Error', status: 500, message: 'Could not load lesson.' });
  }
});

// GET /lessons/:id/edit — Edit lesson form (owner only)
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const [[lesson]] = await db.query('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
    if (!lesson || lesson.teacher_id !== req.session.user.id) {
      req.flash('error', 'You can only edit your own lessons.');
      return res.redirect('/lessons');
    }
    const [languages] = await db.query('SELECT * FROM languages ORDER BY name');
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
    res.render('lessons/edit', { title: 'Edit Lesson', lesson, languages, categories });
  } catch (err) {
    console.error('Edit lesson form error:', err);
    res.redirect('/lessons');
  }
});

// POST /lessons/:id/edit — Submit lesson edit
router.post('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const [[lesson]] = await db.query('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
    if (!lesson || lesson.teacher_id !== req.session.user.id) {
      req.flash('error', 'You can only edit your own lessons.');
      return res.redirect('/lessons');
    }
    const { title, language_id, category_id, difficulty, description, content, vocabulary, media_url } = req.body;
    await db.query(
      'UPDATE lessons SET title=?, language_id=?, category_id=?, difficulty=?, description=?, content=?, vocabulary=?, media_url=? WHERE id=?',
      [title, language_id, category_id, difficulty, description, content, vocabulary || null, media_url || null, req.params.id]
    );
    req.flash('success', 'Lesson updated successfully!');
    res.redirect(`/lessons/${req.params.id}`);
  } catch (err) {
    console.error('Edit lesson error:', err);
    req.flash('error', 'Could not update lesson.');
    res.redirect(`/lessons/${req.params.id}/edit`);
  }
});

// POST /lessons/:id/delete — Delete lesson (owner only)
router.post('/:id/delete', isAuthenticated, async (req, res) => {
  try {
    const [[lesson]] = await db.query('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
    if (!lesson || lesson.teacher_id !== req.session.user.id) {
      req.flash('error', 'You can only delete your own lessons.');
      return res.redirect('/lessons');
    }
    await db.query('DELETE FROM lessons WHERE id = ?', [req.params.id]);
    req.flash('success', 'Lesson deleted.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Delete lesson error:', err);
    req.flash('error', 'Could not delete lesson.');
    res.redirect('/lessons');
  }
});

// POST /lessons/:id/enroll — Enroll in a lesson
router.post('/:id/enroll', isAuthenticated, async (req, res) => {
  try {
    await db.query(
      'INSERT IGNORE INTO lesson_progress (learner_id, lesson_id) VALUES (?, ?)',
      [req.session.user.id, req.params.id]
    );
    req.flash('success', 'Successfully enrolled in the lesson!');
    res.redirect(`/lessons/${req.params.id}`);
  } catch (err) {
    console.error('Enroll lesson error:', err);
    res.redirect(`/lessons/${req.params.id}`);
  }
});

// POST /lessons/:id/quiz — Submit quiz answers
router.post('/:id/quiz', isAuthenticated, async (req, res) => {
  try {
    const [questions] = await db.query('SELECT * FROM quiz_questions WHERE lesson_id = ?', [req.params.id]);
    let score = 0;
    for (const q of questions) {
      if (req.body[`answer_${q.id}`] === q.correct_option) score++;
    }
    await db.query(
      'INSERT INTO quiz_attempts (learner_id, lesson_id, score, total_questions) VALUES (?, ?, ?, ?)',
      [req.session.user.id, req.params.id, score, questions.length]
    );
    // Award points (+5)
    await db.query('UPDATE users SET points = points + 5 WHERE id = ?', [req.session.user.id]);
    req.session.user.points = (req.session.user.points || 0) + 5;
    req.flash('success', `Quiz completed! You scored ${score}/${questions.length}. +5 points`);
    res.redirect(`/lessons/${req.params.id}`);
  } catch (err) {
    console.error('Quiz submission error:', err);
    res.redirect(`/lessons/${req.params.id}`);
  }
});

module.exports = router;
