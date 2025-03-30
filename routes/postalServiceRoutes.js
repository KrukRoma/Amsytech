const express = require('express');
const router = express.Router();
const db = require('../db');

// Отримати всі поштові сервіси
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM postal_services');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;