const express = require('express');
const router = express.Router();
const db = require('../db');

// Створення нового замовлення
router.post('/', async (req, res) => {
    const { product_id, product_name, quantity, total_amount, user_firstname, user_lastname, user_email, user_phone, region_id, district_id, post_office_id, department } = req.body;

    // Логування вхідних даних для діагностики
    console.log("Received order data:", req.body);

    // Перевірка наявності всіх обов'язкових полів
    if (!product_id || !quantity || !total_amount || !user_firstname || !user_lastname || !user_email || !user_phone || !region_id || !district_id || !post_office_id || !department) {
        console.error("Missing fields:", { product_id, quantity, total_amount, user_firstname, user_lastname, user_email, user_phone, region_id, district_id, post_office_id, department });
        return res.status(400).json({ error: "Всі поля обов'язкові!" });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO orders (product_id, product_name, quantity, total_amount, user_firstname, user_lastname, user_email, user_phone, region_id, district_id, post_office_id, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [product_id, product_name, quantity, total_amount, user_firstname, user_lastname, user_email, user_phone, region_id, district_id, post_office_id, department]
        );
        console.log("Order created successfully:", result);
        res.json({ success: true, message: 'Замовлення успішно створене!' });
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;