const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

// Створення нового замовлення
router.post('/', async (req, res) => {
    const { product_id, product_name, quantity, total_amount, user_firstname, user_lastname, user_email, user_phone, region_id, district_id, post_office_id, department, card_number, expiry_date, cvv } = req.body;

    // Логування вхідних даних для діагностики
    console.log("Received order data:", req.body);

    // Перевірка наявності всіх обов'язкових полів
    if (!product_id || !quantity || !total_amount || !user_firstname || !user_lastname || !user_email || !user_phone || !region_id || !district_id || !post_office_id || !department || !card_number || !expiry_date || !cvv) {
        console.error("Missing fields:", { product_id, quantity, total_amount, user_firstname, user_lastname, user_email, user_phone, region_id, district_id, post_office_id, department, card_number, expiry_date, cvv });
        return res.status(400).json({ error: "Всі поля обов'язкові!" });
    }

    try {
        // Обробка платежу
        const paymentData = {
            order_id: `${Date.now()}`,
            merchant_id: '1396424', // замініть на ваш тестовий мерчант ID
            amount: total_amount * 100, // сума у копійках
            currency: 'UAH',
            card_number: card_number,
            card_exp_month: expiry_date.split('/')[0],
            card_exp_year: expiry_date.split('/')[1],
            cvv: cvv,
            email: user_email,
            response_url: 'http://localhost:3000/payment_result'
        };

        const paymentResponse = await axios.post('https://api.fondy.eu/api/checkout/ajax', paymentData);
        console.log('Payment response:', paymentResponse.data);

        if (paymentResponse.data && paymentResponse.data.response && paymentResponse.data.response.status === 'success') {
            // Збереження замовлення в базі даних
            const [result] = await db.query(
                'INSERT INTO orders (product_id, product_name, quantity, total_amount, user_firstname, user_lastname, user_email, user_phone, region_id, district_id, post_office_id, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [product_id, product_name, quantity, total_amount, user_firstname, user_lastname, user_email, user_phone, region_id, district_id, post_office_id, department]
            );
            console.log("Order created successfully:", result);
            res.json({ success: true, message: 'Замовлення успішно створене!' });
        } else if (paymentResponse.data && paymentResponse.data.response && paymentResponse.data.response.error_message) {
            throw new Error(paymentResponse.data.response.error_message);
        } else {
            throw new Error('Невідома помилка при обробці платежу');
        }
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;