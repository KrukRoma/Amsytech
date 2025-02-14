const express = require('express');
const db = require('../db'); // Підключаємо базу даних
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Налаштування multer для збереження файлів
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Вказуємо папку для збереження
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Генеруємо унікальне ім'я файлу
    }
});

const upload = multer({ storage });

// Отримання всіх продуктів
router.get('/', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Отримання конкретного продукту за ID
router.get('/:id', async (req, res) => {
    try {
        const [product] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (product.length === 0) {
            return res.status(404).json({ message: 'Продукт не знайдено' });
        }
        res.json(product[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Додавання нового продукту
router.post('/', upload.single('photo'), async (req, res) => {
    const { name, subtitle, manufacturer, price, description, documentation_url } = req.body;

    // Перевірка на наявність обов'язкових полів
    if (!name || !price) {
        return res.status(400).json({ error: 'Назва і ціна є обов’язковими' });
    }

    // Якщо фото надано, отримаємо шлях до фото
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const [result] = await db.query(
            'INSERT INTO products (name, subtitle, manufacturer, price, description, documentation_url, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, subtitle, manufacturer, price, description, documentation_url, photo_url]
        );
        res.json({ id: result.insertId, message: 'Продукт додано' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Оновлення продукту
router.put('/:id', upload.single('photo'), async (req, res) => {
    const { name, subtitle, manufacturer, price, description, documentation_url } = req.body;

    // Якщо фото надано, отримаємо новий шлях до фото
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const [result] = await db.query(
            'UPDATE products SET name = ?, subtitle = ?, manufacturer = ?, price = ?, description = ?, documentation_url = ?, photo_url = ? WHERE id = ?',
            [name, subtitle, manufacturer, price, description, documentation_url, photo_url, req.params.id]
        );
        res.json({ message: 'Продукт оновлено' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Видалення продукту
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Продукт видалено' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
