const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes'); // Підключаємо кошик
const passResetRoutes = require('./routes/passResetRoutes');
const orderRoutes = require('./routes/orderRoutes'); // Підключаємо маршрути замовлень
const regionRoutes = require('./routes/regionRoutes'); // Підключаємо маршрути регіонів
const postalServiceRoutes = require('./routes/postalServiceRoutes'); // Підключаємо маршрути поштових сервісів
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes); // Додаємо маршрут для кошика
app.use('/api/password-reset', passResetRoutes);
app.use('/api/orders', orderRoutes); // Додаємо маршрути замовлень
app.use('/api/regions', regionRoutes); // Додаємо маршрути регіонів
app.use('/api/postal_services', postalServiceRoutes); // Додаємо маршрути поштових сервісів

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});