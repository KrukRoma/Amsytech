const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // Підключення до бази
const router = express.Router();

// Реєстрація користувача
router.post('/register', async (req, res) => {
    const { name, surname, email, password } = req.body;  // Замінили firstName на name, lastName на surname

    // Перевірка на наявність даних
    if (!name || !surname || !email || !password) {
        return res.status(400).json({ message: 'Усі поля повинні бути заповнені' });
    }

    try {
        // Хешуємо пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Перевірка, чи існує користувач з таким email
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const existingUser = rows[0];

        if (existingUser) {
            return res.status(400).json({ message: 'Користувач з таким email вже існує' });
        }

        // Додаємо нового користувача в базу даних
        await db.execute('INSERT INTO users (name, surname, email, password) VALUES (?, ?, ?, ?)', 
            [name, surname, email, hashedPassword]);  // Замінили firstName на name, lastName на surname

        res.status(201).json({ message: 'Реєстрація успішна!' });
    } catch (error) {
        console.error('Помилка при реєстрації:', error);
        res.status(500).json({ message: 'Помилка серверу' });
    }
});

module.exports = router;
