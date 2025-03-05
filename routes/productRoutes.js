const express = require('express');
const db = require('../db'); // Підключаємо базу даних
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
    const { name, subtitle, manufacturer, price, description, documentation_url, photo_url } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Назва і ціна є обов’язковими' });
    }

    // Якщо файл завантажено, використовуємо його шлях, інакше залишаємо передане посилання
    const finalPhotoUrl = req.file ? `/uploads/${req.file.filename}` : photo_url || null;

    try {
        const [result] = await db.query(
            'INSERT INTO products (name, subtitle, manufacturer, price, description, documentation_url, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, subtitle, manufacturer, price, description, documentation_url, finalPhotoUrl]
        );
        res.json({ id: result.insertId, message: 'Продукт додано' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Оновлення продукту
router.put('/:id', upload.single('photo'), async (req, res) => {
    const { name, subtitle, manufacturer, price, description, documentation_url, photo_url } = req.body;
    const productId = req.params.id;

    if (!name || !manufacturer || !price) {
        return res.status(400).json({ error: 'Назва, виробник і ціна є обов’язковими полями.' });
    }

    if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: 'Ціна має бути коректним числом більше або рівним 0.' });
    }

    try {
        // Отримуємо поточне фото продукту
        const [product] = await db.query('SELECT photo_url FROM products WHERE id = ?', [productId]);

        if (product.length === 0) {
            return res.status(404).json({ error: 'Продукт не знайдено.' });
        }

        let oldPhotoUrl = product[0].photo_url;
        let finalPhotoUrl = oldPhotoUrl;

        console.log('Старе фото:', oldPhotoUrl);
        console.log('Новий файл:', req.file ? req.file.filename : 'Не завантажено');
        console.log('Нове посилання:', photo_url);

        // Якщо завантажено новий файл
        if (req.file) {
            finalPhotoUrl = `/uploads/${req.file.filename}`;
        } 
        // Якщо передано новий URL
        else if (photo_url && photo_url !== oldPhotoUrl) {
            finalPhotoUrl = photo_url;
        }

        // Оновлення даних у базі
        await db.query(
            'UPDATE products SET name = ?, subtitle = ?, manufacturer = ?, price = ?, description = ?, documentation_url = ?, photo_url = ? WHERE id = ?',
            [name, subtitle || '', manufacturer, price, description || '', documentation_url || '', finalPhotoUrl, productId]
        );

        // Видаляємо старий файл, якщо він більше ніде не використовується
        if (oldPhotoUrl && oldPhotoUrl.startsWith('/uploads/') && oldPhotoUrl !== finalPhotoUrl) {
            const [otherUses] = await db.query('SELECT COUNT(*) as count FROM products WHERE photo_url = ?', [oldPhotoUrl]);
            
            if (otherUses[0].count === 0) { // Фото ніде більше не використовується
                const oldPath = path.join(__dirname, '..', oldPhotoUrl);
                try {
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                        console.log('Старий файл видалено:', oldPhotoUrl);
                    }
                } catch (error) {
                    console.error('Помилка видалення старого файлу:', error);
                }
            } else {
                console.log('Фото використовується в інших продуктах, не видаляємо:', oldPhotoUrl);
            }
        }

        console.log('Продукт оновлено успішно:', productId);
        res.json({ message: 'Продукт оновлено успішно', photo_url: finalPhotoUrl });
    } catch (err) {
        console.error('Помилка під час оновлення продукту:', err);
        res.status(500).json({ error: 'Помилка сервера. Деталі див. у логах.' });
    }
});


// Видалення продукту
router.delete('/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        // Отримуємо фото перед видаленням
        const [product] = await db.query('SELECT photo_url FROM products WHERE id = ?', [productId]);

        if (product.length === 0) {
            return res.status(404).json({ message: 'Продукт не знайдено' });
        }

        // Видаляємо файл, якщо він локальний
        if (product[0].photo_url && product[0].photo_url.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '..', product[0].photo_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM products WHERE id = ?', [productId]);
        res.json({ message: 'Продукт видалено' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;