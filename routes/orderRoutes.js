const express = require('express');
const router = express.Router();
const db = require('../db');

// Створення нового замовлення
router.post('/', async (req, res) => {
    const { product_id, product_name, quantity, total_amount, user_firstname, user_lastname, user_email, user_phone, region_id, district, post_office_id, department } = req.body;

    if (!product_id || !quantity || !total_amount || !user_firstname || !user_lastname || !user_email || !user_phone || !region_id || !district || !post_office_id || !department) {
        return res.status(400).json({ error: "Всі поля обов'язкові!" });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO orders (product_id, product_name, quantity, total_amount, user_firstname, user_lastname, user_email, user_phone, region_id, district, post_office_id, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [product_id, product_name, quantity, total_amount, user_firstname, user_lastname, user_email, user_phone, region_id, district, post_office_id, department]
        );
        res.json({ success: true, message: 'Замовлення успішно створене!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;