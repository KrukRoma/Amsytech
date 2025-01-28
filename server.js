const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes'); // Маршрути для реєстрації
const authRoutes = require('./routes/authRoutes'); // Маршрути для логіну

const app = express();

// Дозволяємо запити з інших доменів
app.use(cors());

// Для роботи з JSON
app.use(bodyParser.json());

// Підключення маршрутів
app.use('/api/users', userRoutes); // Реєстрація користувачів
app.use('/api/users', authRoutes); // Логін користувачів

// Сервер слухає порт
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
