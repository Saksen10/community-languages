// routes/forumRoutes.js — Forum posts and comments
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { isAuthenticated } = require('../middleware/auth');

// GET /forum — Forum listing with filters
router.get('/', async (req, res) => {
  try {
    const { search, language } = req.query;
    let query = `
      SELECT fp.*, u.name AS user_name, lang.name AS language_name,
        (SELECT COUNT(*) FROM forum_comments fc WHERE fc.post_id = fp.id) AS comment_count
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN languages lang ON fp.language_id = lang.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (fp.title LIKE ? OR fp.body LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (language) {
      query += ' AND fp.language_id = ?';
      params.push(language);
    }
    query += ' ORDER BY fp.created_at DESC';

    const [posts] = await db.query(query, params);
    const [languages] = await db.query('SELECT * FROM languages ORDER BY name');

    res.render('forum/index', {
      title: 'Community Forum', posts, languages,
      search: search || '', language: language || ''
    });
  } catch (err) {
    console.error('Forum list error:', err);
    res.render('forum/index', { title: 'Community Forum', posts: [], languages: [] });
  }
});

// GET /forum/create — Create post form
router.get('/create', isAuthenticated, async (req, res) => {
  try {
    const [languages] = await db.query('SELECT * FROM languages ORDER BY name');
    res.render('forum/create', { title: 'New Forum Post', languages });
  } catch (err) {
    console.error('Forum create form error:', err);
    res.redirect('/forum');
  }
});

// POST /forum/create — Submit new post
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { title, language_id, body } = req.body;
    await db.query(
      'INSERT INTO forum_posts (user_id, language_id, title, body) VALUES (?, ?, ?, ?)',
      [req.session.user.id, language_id || null, title, body]
    );
    // Award points (+3)
    await db.query('UPDATE users SET points = points + 3 WHERE id = ?', [req.session.user.id]);
    req.session.user.points = (req.session.user.points || 0) + 3;

    req.flash('success', 'Forum post created! +3 points');
    res.redirect('/forum');
  } catch (err) {
    console.error('Forum create error:', err);
    req.flash('error', 'Could not create post.');
    res.redirect('/forum/create');
  }
});

// GET /forum/:id — Post detail with comments
router.get('/:id', async (req, res) => {
  try {
    const [[post]] = await db.query(`
      SELECT fp.*, u.name AS user_name, lang.name AS language_name
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      LEFT JOIN languages lang ON fp.language_id = lang.id
      WHERE fp.id = ?
    `, [req.params.id]);

    if (!post) {
      return res.status(404).render('error', { title: 'Not Found', status: 404, message: 'Post not found.' });
    }

    const [comments] = await db.query(`
      SELECT fc.*, u.name AS user_name
      FROM forum_comments fc
      JOIN users u ON fc.user_id = u.id
      WHERE fc.post_id = ?
      ORDER BY fc.created_at ASC
    `, [req.params.id]);

    res.render('forum/detail', { title: post.title, post, comments });
  } catch (err) {
    console.error('Forum detail error:', err);
    res.status(500).render('error', { title: 'Error', status: 500, message: 'Could not load post.' });
  }
});

// POST /forum/:id/comment — Add comment
router.post('/:id/comment', isAuthenticated, async (req, res) => {
  try {
    await db.query(
      'INSERT INTO forum_comments (post_id, user_id, body) VALUES (?, ?, ?)',
      [req.params.id, req.session.user.id, req.body.body]
    );
    // Award points (+3)
    await db.query('UPDATE users SET points = points + 3 WHERE id = ?', [req.session.user.id]);
    req.session.user.points = (req.session.user.points || 0) + 3;

    req.flash('success', 'Comment added! +3 points');
    res.redirect(`/forum/${req.params.id}`);
  } catch (err) {
    console.error('Forum comment error:', err);
    res.redirect(`/forum/${req.params.id}`);
  }
});

module.exports = router;
