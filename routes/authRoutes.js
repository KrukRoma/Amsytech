const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // Підключення до бази
const router = express.Router();

// Логін користувача
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Усі поля повинні бути заповнені' });
    }

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Невірний пароль' });
        }

        res.status(200).json({ message: 'Успішно залогінено!' });
    } catch (error) {
        console.error('Помилка при логіні:', error);
        res.status(500).json({ message: 'Помилка серверу' });
    }
});

module.exports = router;
