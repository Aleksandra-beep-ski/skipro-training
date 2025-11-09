// script.js - статическая версия для GitHub Pages
class SkiProApp {
    constructor() {
        this.currentUser = null;
        this.trainings = [
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
        ];
        
        this.resorts = [
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
            }
        ];
        
        this.bookings = JSON.parse(localStorage.getItem('skipro-bookings')) || [];
        this.users = JSON.parse(localStorage.getItem('skipro-users')) || [
            {
                id: 1,
                name: "Администратор",
                email: "admin@skipro.ru",
                password: "admin123",
                phone: "+7 981 891 93 55",
                role: "admin",
                registrationDate: new Date().toISOString()
            }
        ];
        
        this.currentCalendarDate = new Date();
        this.init();
    }

    init() {
        this.loadInitialData();
        this.initAuth();
        this.initEventListeners();
        this.initCalendar();
    }

    loadInitialData() {
        this.renderTrainings();
        this.renderResorts();
    }

    renderTrainings() {
        const container = document.getElementById('trainings-container');
        if (!container) return;

        container.innerHTML = this.trainings.map(training => `
            <article id="${training.type}" class="product-card">
                <h2>${training.name}</h2>
                <div class="image-container">
                    <img src="images/${training.image}" alt="${training.name}" onerror="this.style.display='none'">
                </div>
                <p><strong>Описание:</strong> ${training.description}</p>
                ${training.program ? `<p><strong>Программа включает:</strong> ${training.program}</p>` : ''}
                ${training.result ? `<p><strong>Результат:</strong> ${training.result}</p>` : ''}
                <p><strong>Продолжительность:</strong> ${training.duration}</p>
                <p class="price"><strong>Стоимость:</strong> ${training.price}</p>
                <button onclick="app.showBookingModal('${training.name}')" class="booking-btn">
                    Забронировать тренировку
                </button>
            </article>
        `).join('');
    }

    renderResorts() {
        const grid = document.getElementById('resortsGrid');
        if (!grid) return;

        grid.innerHTML = this.resorts.map(resort => `
            <div class="resort-card">
                <div class="resort-image">
                    <img src="images/${resort.image}" alt="${resort.name}" onerror="this.style.display='none'">
                </div>
                <div class="resort-content">
                    <div class="resort-header">
                        <h3>${resort.name}</h3>
                        <div class="temperature">${resort.temperature}</div>
                    </div>
                    <div class="weather-details">
                        <div class="weather-item">
                            <span class="label">Погода:</span>
                            <span class="value">${resort.weather}</span>
                        </div>
                        <div class="weather-item">
                            <span class="label">Снежный покров:</span>
                            <span class="value">${resort.snow}</span>
                        </div>
                        <div class="weather-item">
                            <span class="label">Влажность:</span>
                            <span class="value">${resort.humidity}</span>
                        </div>
                        <div class="weather-item">
                            <span class="label">Ветер:</span>
                            <span class="value">${resort.wind}</span>
                        </div>
                        <div class="weather-item conditions">
                            <span class="label">Условия для катания:</span>
                            <span class="value ${resort.conditions === 'Идеальные' || resort.conditions === 'Превосходные' ? 'excellent' : 'good'}">
                                ${resort.conditions}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Остальные методы остаются практически такими же, но используют localStorage вместо API
    // ... (все остальные методы из оригинального script.js)

    saveData() {
        localStorage.setItem('skipro-bookings', JSON.stringify(this.bookings));
        localStorage.setItem('skipro-users', JSON.stringify(this.users));
    }

    async processBooking(trainingType) {
        const date = document.getElementById('bookingDate').value;
        const time = document.getElementById('bookingTime').value;
        const notes = document.getElementById('bookingNotes').value;

        // Проверяем доступность времени
        const isAvailable = !this.bookings.find(booking => 
            booking.date === date && 
            booking.time === time && 
            booking.status === 'confirmed'
        );

        if (!isAvailable) {
            this.showNotification('Это время уже занято!', 'error');
            return;
        }

        const bookingData = {
            id: Date.now(),
            userId: this.currentUser.id,
            trainingType,
            date,
            time,
            notes: notes || '',
            status: 'confirmed',
            bookingDate: new Date().toISOString()
        };

        this.bookings.push(bookingData);
        this.saveData();

        this.showNotification('Тренировка успешно забронирована!', 'success');
        this.closeModal();
        this.sendBookingEmail(bookingData);
        
        if (this.renderCalendar) {
            this.renderCalendar(this.currentCalendarDate);
        }
    }

    async cancelBooking(bookingId) {
        if (!confirm('Вы уверены, что хотите отменить эту тренировку?')) {
            return;
        }

        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.status = 'cancelled';
            this.saveData();
            this.showNotification('Тренировка отменена', 'success');
            this.renderCalendar(this.currentCalendarDate);
        }
    }

    async register() {
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const phone = document.getElementById('regPhone').value;

        if (this.users.find(user => user.email === email)) {
            this.showNotification('Пользователь с таким email уже существует', 'error');
            return;
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

        this.users.push(newUser);
        this.saveData();

        this.showNotification('Регистрация успешна! Теперь войдите в систему.', 'success');
        this.closeModal();
        this.showLoginModal();
    }

    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = { ...user, password: undefined };
            this.showNotification(`Добро пожаловать, ${this.currentUser.name}!`, 'success');
            this.closeModal();
            this.updateAuthUI();
            if (this.renderCalendar) {
                this.renderCalendar(this.currentCalendarDate);
            }
        } else {
            this.showNotification('Неверный email или пароль', 'error');
        }
    }
}

const app = new SkiProApp();
