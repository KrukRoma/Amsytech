const express = require('express');
const router = express.Router();
const db = require('../db');

// Отримати всі регіони
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM regions');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Отримати всі райони за регіоном
router.get('/:regionId/districts', async (req, res) => {
    const regionId = req.params.regionId;
    try {
        const [rows] = await db.query('SELECT * FROM districts WHERE region_id = ?', [regionId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;