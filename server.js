const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Обслуживаем файлы из текущей директории

// Функции для работы с БД
function loadDatabase() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading database:', error);
    }
    
    // Инициализация базы данных по умолчанию
    const defaultData = {
        users: [
            {
                id: 1,
                name: "Администратор",
                email: "admin@skipro.ru",
                password: "admin123",
                phone: "+7 981 891 93 55",
                role: "admin",
                registrationDate: new Date().toISOString()
            }
        ],
        bookings: [],
        trainings: [
            {
                id: 1,
                name: "Техническая подготовка на склоне",
                description: "Интенсивные занятия по отработке карвинговой техники, управления скоростью и прохождения сложных участков трасс под руководством сертифицированных инструкторов FIS.",
                program: "Разминка, отработка техники поворотов, работа с рельефом, видеоразбор",
                duration: "2 часа",
                price: "8000 руб. - постановка трассы + скипасс",
                image: "product-ski.jpg",
                type: "ski"
            },
            {
                id: 2,
                name: "Функциональная подготовка лыжника",
                description: "Специализированные тренировки, направленные на развитие мышечного корсета, взрывной силы ног и выносливости, необходимых для горнолыжного спорта.",
                program: "TRX-тренировки, плиометрика, работа с собственным весом, упражнения на стабильность кора, имитационные движения лыжного спорта",
                result: "Улучшение техники, снижение риска травм, увеличение выносливости на склоне",
                duration: "2 часа",
                price: "от 3000 руб. / 2 часа",
                image: "product-gym.jpg",
                type: "gym"
            }
        ],
        resorts: [
            {
                id: 1,
                name: "Манжерок",
                temperature: "-15°C",
                weather: "Снежно, солнечно",
                snow: "120-150 см",
                humidity: "75%",
                wind: "3 м/с",
                conditions: "Идеальные",
                image: "resort-manzherok.jpg"
            },
            {
                id: 2,
                name: "Кировск",
                temperature: "-12°C",
                weather: "Пасмурно, снегопад",
                snow: "180-220 см",
                humidity: "85%",
                wind: "5 м/с",
                conditions: "Отличные",
                image: "resort-kirovsk.jpg"
            },
            {
                id: 3,
                name: "Сахалин",
                temperature: "-10°C",
                weather: "Ветрено, снег",
                snow: "100-130 см",
                humidity: "80%",
                wind: "8 м/с",
                conditions: "Хорошие",
                image: "resort-sakhalin.jpg"
            },
            {
                id: 4,
                name: "Камчатка",
                temperature: "-8°C",
                weather: "Переменная облачность",
                snow: "200-250 см",
                humidity: "70%",
                wind: "4 м/с",
                conditions: "Превосходные",
                image: "resort-kamchatka.jpg"
            },
            {
                id: 5,
                name: "Абзаково",
                temperature: "-18°C",
                weather: "Ясно, морозно",
                snow: "140-170 см",
                humidity: "65%",
                wind: "2 м/с",
                conditions: "Отличные",
                image: "resort-abzakovo.jpg"
            }
        ]
    };
    
    // Сохраняем данные по умолчанию
    saveDatabase(defaultData);
    return defaultData;
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving database:', error);
        return false;
    }
}

// Инициализация базы данных
let db = loadDatabase();

// API endpoints
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'SkiPro Training API работает нормально',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

app.get('/api/users', (req, res) => {
    res.json(db.users.map(user => ({ ...user, password: undefined })));
});

app.post('/api/register', (req, res) => {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
    }
    
    if (db.users.find(user => user.email === email)) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        phone,
        role: 'user',
        registrationDate: new Date().toISOString()
    };
    
    db.users.push(newUser);
    
    if (saveDatabase(db)) {
        res.status(201).json({ 
            message: 'Регистрация успешна', 
            user: { ...newUser, password: undefined } 
        });
    } else {
        res.status(500).json({ error: 'Ошибка сохранения данных' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = db.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({ 
            message: 'Авторизация успешна', 
            user: { ...user, password: undefined } 
        });
    } else {
        res.status(401).json({ error: 'Неверный email или пароль' });
    }
});

app.get('/api/trainings', (req, res) => {
    res.json(db.trainings);
});

app.get('/api/resorts', (req, res) => {
    res.json(db.resorts);
});

app.post('/api/bookings', (req, res) => {
    const { userId, trainingType, date, time, notes } = req.body;
    
    const user = db.users.find(u => u.id === parseInt(userId));
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Проверяем, нет ли уже забронированной тренировки на это время
    const conflictingBooking = db.bookings.find(booking => 
        booking.date === date && 
        booking.time === time && 
        booking.status === 'confirmed'
    );
    
    if (conflictingBooking) {
        return res.status(400).json({ 
            error: 'Это время уже занято. Пожалуйста, выберите другое время.' 
        });
    }
    
    const bookingData = {
        id: Date.now(),
        userId: parseInt(userId),
        trainingType,
        date,
        time,
        notes: notes || '',
        status: 'confirmed',
        bookingDate: new Date().toISOString()
    };
    
    db.bookings.push(bookingData);
    
    if (saveDatabase(db)) {
        res.status(201).json({ 
            message: 'Тренировка забронирована', 
            booking: bookingData 
        });
    } else {
        res.status(500).json({ error: 'Ошибка сохранения бронирования' });
    }
});

app.get('/api/bookings/user/:userId', (req, res) => {
    const userBookings = db.bookings.filter(booking => 
        booking.userId === parseInt(req.params.userId) &&
        booking.status === 'confirmed'
    );
    res.json(userBookings);
});

app.get('/api/bookings', (req, res) => {
    // Возвращаем только подтвержденные бронирования
    const confirmedBookings = db.bookings.filter(booking => 
        booking.status === 'confirmed'
    );
    res.json(confirmedBookings);
});

app.put('/api/bookings/:id/cancel', (req, res) => {
    const bookingId = parseInt(req.params.id);
    const booking = db.bookings.find(b => b.id === bookingId);
    
    if (booking) {
        booking.status = 'cancelled';
        
        if (saveDatabase(db)) {
            res.json({ message: 'Бронирование отменено', booking });
        } else {
            res.status(500).json({ error: 'Ошибка сохранения изменений' });
        }
    } else {
        res.status(404).json({ error: 'Бронирование не найдено' });
    }
});

app.get('/api/availability', (req, res) => {
    const { date, time } = req.query;
    
    if (!date || !time) {
        return res.status(400).json({ error: 'Дата и время обязательны' });
    }
    
    const isAvailable = !db.bookings.find(booking => 
        booking.date === date && 
        booking.time === time && 
        booking.status === 'confirmed'
    );
    
    res.json({ date, time, available: isAvailable });
});

// Статические страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/workouts', (req, res) => {
    res.sendFile(path.join(__dirname, 'workouts.html'));
});

app.get('/contacts', (req, res) => {
    res.sendFile(path.join(__dirname, 'contacts.html'));
});

// Обработка 404
app.use((req, res) => {
    res.status(404).send('Страница не найдена');
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Внутренняя ошибка сервера');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`SkiPro Training Server запущен на порту ${PORT}`);
    console.log(`Главная страница: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Админ: admin@skipro.ru / admin123`);
    console.log(`База данных: ${DB_FILE}`);
});