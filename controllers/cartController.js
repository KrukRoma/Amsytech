const pool = require('../db'); // Припускаємо, що у вас є модуль для роботи з базою даних

exports.addItemToCart = async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;

        if (!user_id || !product_id || !quantity) {
            return res.status(400).json({ error: "Всі поля обов'язкові!" });
        }

        // Вставка товару в кошик
        await pool.query(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
            [user_id, product_id, quantity]
        );

        res.json({ success: true, message: "Товар додано в кошик!" });
    } catch (error) {
        console.error("Помилка сервера:", error);
        res.status(500).json({ error: "Помилка сервера" });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const { product_id, action } = req.body;

        if (!product_id || !action) {
            return res.status(400).json({ error: "Всі поля обов'язкові!" });
        }

        if (action === "increase") {
            await pool.query("UPDATE cart SET quantity = quantity + 1 WHERE id = ?", [product_id]);
        } else if (action === "decrease") {
            await pool.query("UPDATE cart SET quantity = GREATEST(quantity - 1, 1) WHERE id = ?", [product_id]);
        }

        res.json({ success: true, message: "Кількість товару оновлено!" });
    } catch (error) {
        console.error("Помилка оновлення:", error);
        res.status(500).json({ error: "Помилка оновлення" });
    }
};

exports.deleteCartItem = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { user_id } = req.body;

        if (!cartId || !user_id) {
            return res.status(400).json({ error: "Всі поля обов'язкові!" });
        }

        const [existingCartItem] = await pool.query(
            "SELECT * FROM cart WHERE id = ? AND user_id = ?",
            [cartId, user_id]
        );

        if (existingCartItem.length === 0) {
            return res.status(404).json({ error: "Товар не знайдено в кошику" });
        }

        const [result] = await pool.query(
            "DELETE FROM cart WHERE id = ? AND user_id = ?",
            [cartId, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: "Не вдалося видалити товар" });
        }

        res.json({ success: true, message: "Товар видалено з кошика" });
    } catch (error) {
        console.error("Помилка видалення:", error);
        res.status(500).json({ error: "Помилка видалення" });
    }
};

exports.getCartItems = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: "Необхідний userId" });
        }

        const [rows] = await pool.query(
            "SELECT c.id, c.quantity, p.name, p.photo_url, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?",
            [userId]
        );

        res.json(rows);
    } catch (error) {
        console.error("Помилка завантаження кошика:", error);
        res.status(500).json({ error: "Помилка завантаження кошика" });
    }
};