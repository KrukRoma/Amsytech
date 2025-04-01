const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const passResetRoutes = require('./routes/passResetRoutes');
const orderRoutes = require('./routes/orderRoutes');
const regionRoutes = require('./routes/regionRoutes');
const postalServiceRoutes = require('./routes/postalServiceRoutes');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/password-reset', passResetRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/postal_services', postalServiceRoutes);

app.post('/api/process_payment', async (req, res) => {
    console.log('Received payment request:', req.body); // Додавання логування
    const { card_number, expiry_date, cvv, total_amount, user_email } = req.body;

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

    try {
        const response = await axios.post('https://api.fondy.eu/api/checkout/ajax', paymentData);
        console.log('Payment response:', response.data); // Додавання логування
        if (response.data && response.data.response && response.data.response.status === 'success') {
            res.json({ success: true, paymentData: response.data.response });
        } else if (response.data && response.data.response && response.data.response.error_message) {
            throw new Error(response.data.response.error_message);
        } else {
            throw new Error('Невідома помилка при обробці платежу');
        }
    } catch (error) {
        console.error('Payment error:', error); // Додавання логування
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});