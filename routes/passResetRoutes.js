const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const db = require('../db'); // Підключення до MySQL
const router = express.Router();

// Налаштування Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
  }
});

// Генеруємо випадковий 6-значний код
const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// 📌 Відправлення коду на email
router.post('/request', async (req, res) => {
  const { email } = req.body;
  const resetCode = generateResetCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  try {
    await db.execute(
      'INSERT INTO password_reset (email, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = ?, expires_at = ?',
      [email, resetCode, expiresAt, resetCode, expiresAt]
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Код для скидання пароля',
      text: `Ваш код: ${resetCode}. Діє 15 хвилин.`
    });

    res.json({ message: 'Код відправлено!' });
  } catch (error) {
    console.error('Помилка відправки:', error);
    res.status(500).json({ message: 'Помилка при відправці коду' });
  }
});

// 📌 Перевірка коду
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM password_reset WHERE email = ? AND code = ? AND expires_at > NOW()',
      [email, code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Невірний або прострочений код' });
    }

    res.json({ message: 'Код правильний!' });
  } catch (error) {
    console.error('Помилка перевірки:', error);
    res.status(500).json({ message: 'Помилка перевірки коду' });
  }
});

// 📌 Зміна пароля
router.post('/reset', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Хешуємо новий пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Оновлюємо пароль у базі
    await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    // Видаляємо код скидання
    await db.execute('DELETE FROM password_reset WHERE email = ?', [email]);

    res.json({ message: 'Пароль змінено!' });
  } catch (error) {
    console.error('Помилка зміни пароля:', error);
    res.status(500).json({ message: 'Помилка при зміні пароля' });
  }
});

module.exports = router;
