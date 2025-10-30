// server.js - простой сервер на Node.js/Express
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Простые "базы данных" в памяти (в реальном проекте используйте настоящую БД)
let users = [];
let bookings = [];

// API endpoints

// Проверка здоровья сервиса
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SkiPro Training API работает нормально',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Получение всех пользователей
app.get('/api/users', (req, res) => {
    res.json(users);
});

// Регистрация пользователя
app.post('/api/register', (req, res) => {
    const { name, email, password, phone } = req.body;
    
    // Проверка существующего пользователя
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password, // В реальном проекте хэшируйте пароль!
        phone,
        registrationDate: new Date()
    };
    
    users.push(newUser);
    res.status(201).json({ message: 'Регистрация успешна', user: newUser });
});

// Авторизация
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ message: 'Авторизация успешна', user });
    } else {
        res.status(401).json({ error: 'Неверный email или пароль' });
    }
});

// Бронирование тренировки
app.post('/api/bookings', (req, res) => {
    const { userId, trainingType, date, time, notes } = req.body;
    
    // Проверка доступности времени
    const conflictingBooking = bookings.find(booking => 
        booking.date === date && 
        booking.time === time && 
        booking.status !== 'cancelled'
    );
    
    if (conflictingBooking) {
        return res.status(400).json({ error: 'Это время уже занято' });
    }
    
    const bookingData = {
        id: Date.now(),
        userId,
        trainingType,
        date,
        time,
        notes,
        status: 'confirmed',
        bookingDate: new Date()
    };
    
    bookings.push(bookingData);
    res.status(201).json({ message: 'Тренировка забронирована', booking: bookingData });
});

// Получение бронирований пользователя
app.get('/api/bookings/user/:userId', (req, res) => {
    const userBookings = bookings.filter(booking => booking.userId == req.params.userId);
    res.json(userBookings);
});

// Получение всех бронирований (для админа)
app.get('/api/bookings', (req, res) => {
    res.json(bookings);
});

// Отмена бронирования
app.put('/api/bookings/:id/cancel', (req, res) => {
    const bookingId = parseInt(req.params.id);
    const booking = bookings.find(b => b.id === bookingId);
    
    if (booking) {
        booking.status = 'cancelled';
        res.json({ message: 'Бронирование отменено', booking });
    } else {
        res.status(404).json({ error: 'Бронирование не найдено' });
    }
});

// Проверка доступности времени
app.get('/api/availability', (req, res) => {
    const { date, time } = req.query;
    
    const isAvailable = !bookings.find(booking => 
        booking.date === date && 
        booking.time === time && 
        booking.status !== 'cancelled'
    );
    
    res.json({ date, time, available: isAvailable });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`SkiPro Training Server запущен на порту ${PORT}`);
    console.log(`API доступно по адресу: http://localhost:${PORT}/api`);
});