// routes/categoryRoutes.js — Categories, languages, tags page
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /categories — Browse languages, categories, tags
router.get('/', async (req, res) => {
  try {
    // Languages with lesson counts
    const [languages] = await db.query(`
      SELECT lang.*, COUNT(l.id) AS lesson_count
      FROM languages lang
      LEFT JOIN lessons l ON lang.id = l.language_id
      GROUP BY lang.id ORDER BY lang.name
    `);

    // Categories with lesson counts
    const [categories] = await db.query(`
      SELECT c.*, COUNT(l.id) AS lesson_count
      FROM categories c
      LEFT JOIN lessons l ON c.id = l.category_id
      GROUP BY c.id ORDER BY c.name
    `);

    // All tags
    const [tags] = await db.query('SELECT * FROM tags ORDER BY name');

    res.render('categories/index', { title: 'Browse Languages & Categories', languages, categories, tags });
  } catch (err) {
    console.error('Categories page error:', err);
    res.render('categories/index', { title: 'Browse', languages: [], categories: [], tags: [] });
  }
});

module.exports = router;
