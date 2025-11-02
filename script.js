class SkiProApp {
    constructor() {
        this.API_BASE = window.location.origin + '/api';
        this.currentUser = null;
        this.trainings = [];
        this.resorts = [];
        this.currentCalendarDate = new Date();
        this.init();
    }

    async init() {
        console.log('Инициализация SkiPro App...');
        await this.loadInitialData();
        this.initAuth();
        this.initEventListeners();
        this.initCalendar();
        console.log('SkiPro App инициализирован');
    }

    async loadInitialData() {
        try {
            // Загружаем тренировки
            const trainingsResponse = await fetch(`${this.API_BASE}/trainings`);
            this.trainings = await trainingsResponse.json();
            this.renderTrainings();
            
            // Загружаем курорты
            const resortsResponse = await fetch(`${this.API_BASE}/resorts`);
            this.resorts = await resortsResponse.json();
            this.renderResorts();
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }
    async cancelBooking(bookingId) {
    if (!confirm('Вы уверены, что хотите отменить эту тренировку?')) {
        return;
    }

    try {
        const response = await fetch(`${this.API_BASE}/bookings/${bookingId}/cancel`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();

        if (response.ok) {
            this.showNotification('Тренировка отменена', 'success');
            this.renderCalendar(this.currentCalendarDate);
        } else {
            this.showNotification(result.error, 'error');
        }
    } catch (error) {
        this.showNotification('Ошибка отмены бронирования', 'error');
    }
    }

    renderTrainings() {
        const container = document.getElementById('trainings-container');
        if (!container) return;

        container.innerHTML = this.trainings.map(training => `
            <article id="${training.type}" class="product-card">
                <h2>${training.name}</h2>
                <div class="image-container">
                    <img src="images/${training.image}" alt="${training.name}">
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
                    <img src="images/${resort.image}" alt="${resort.name}">
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

    initAuth() {
        this.updateAuthUI();
    }

    updateAuthUI() {
        const nav = document.querySelector('nav ul');
        if (!nav) return;

        const oldAuthBtn = nav.querySelector('.auth-btn-item');
        if (oldAuthBtn) oldAuthBtn.remove();

        const authBtn = document.createElement('li');
        authBtn.className = 'auth-btn-item';
        
        if (this.currentUser) {
            authBtn.innerHTML = `
                <button class="auth-btn" onclick="app.logout()">
                    Выйти (${this.currentUser.name})
                </button>
            `;
        } else {
            authBtn.innerHTML = `
                <button class="auth-btn" onclick="app.showLoginModal()">
                    Войти
                </button>
            `;
        }
        
        nav.appendChild(authBtn);
    }

    showLoginModal() {
        const modal = this.createModal(`
            <div class="auth-form">
                <h2>Вход в систему</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email:</label>
                        <input type="email" id="loginEmail" required placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Пароль:</label>
                        <input type="password" id="loginPassword" required placeholder="Введите пароль">
                    </div>
                    <button type="submit" class="btn">Войти</button>
                </form>
                <p style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
                    Нет аккаунта? <a href="#" onclick="app.showRegisterModal()">Зарегистрироваться</a>
                </p>
            </div>
        `, 'auth-form');

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.login();
        });
    }

    showRegisterModal() {
        const modal = this.createModal(`
            <div class="auth-form">
                <h2>Регистрация</h2>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="regName">Имя:</label>
                        <input type="text" id="regName" required placeholder="Ваше полное имя">
                    </div>
                    <div class="form-group">
                        <label for="regEmail">Email:</label>
                        <input type="email" id="regEmail" required placeholder="your@email.com">
                    </div>
                    <div class="form-group">
                        <label for="regPassword">Пароль:</label>
                        <input type="password" id="regPassword" required minlength="6" placeholder="Минимум 6 символов">
                    </div>
                    <div class="form-group">
                        <label for="regPhone">Телефон:</label>
                        <input type="tel" id="regPhone" required placeholder="+7 XXX XXX XX XX">
                    </div>
                    <button type="submit" class="btn">Зарегистрироваться</button>
                </form>
            </div>
        `, 'auth-form');

        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.register();
        });
    }

    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${this.API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                this.currentUser = result.user;
                this.showNotification(`Добро пожаловать, ${this.currentUser.name}!`, 'success');
                this.closeModal();
                this.updateAuthUI();
                if (this.renderCalendar) {
                    this.renderCalendar(this.currentCalendarDate);
                }
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }

    async register() {
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const phone = document.getElementById('regPhone').value;

        try {
            const response = await fetch(`${this.API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone })
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification('Регистрация успешна! Теперь войдите в систему.', 'success');
                this.closeModal();
                this.showLoginModal();
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        this.showNotification('Вы вышли из системы', 'success');
        this.updateAuthUI();
        if (this.renderCalendar) {
            this.renderCalendar(this.currentCalendarDate);
        }
    }

    showBookingModal(trainingType) {
        if (!this.currentUser) {
            this.showNotification('Для бронирования необходимо войти в систему', 'error');
            this.showLoginModal();
            return;
        }

        const modal = this.createModal(`
            <div class="booking-form">
                <h2>Бронирование тренировки</h2>
                <form id="bookingForm">
                    <div class="form-group">
                        <label>Тип тренировки:</label>
                        <input type="text" value="${trainingType}" readonly style="background: #f8f9fa;">
                    </div>
                    <div class="form-group">
                        <label for="bookingDate">Дата тренировки:</label>
                        <input type="date" id="bookingDate" required>
                    </div>
                    <div class="form-group">
                        <label for="bookingTime">Время:</label>
                        <select id="bookingTime" required>
                            <option value="">Выберите время</option>
                            <option value="09:00">09:00</option>
                            <option value="11:00">11:00</option>
                            <option value="13:00">13:00</option>
                            <option value="15:00">15:00</option>
                            <option value="17:00">17:00</option>
                        </select>
                        <div id="timeAvailability" style="margin-top: 5px; font-size: 0.8rem; min-height: 1.2rem;"></div>
                    </div>
                    <div class="form-group">
                        <label for="bookingNotes">Дополнительные пожелания:</label>
                        <textarea id="bookingNotes" rows="3" placeholder="Ваши пожелания или комментарии..."></textarea>
                    </div>
                    <button type="submit" class="btn" id="submitBookingBtn">Забронировать</button>
                </form>
            </div>
        `, 'booking-form');

        const dateInput = document.getElementById('bookingDate');
        dateInput.min = new Date().toISOString().split('T')[0];

        const checkAvailability = async () => {
            const date = dateInput.value;
            const time = document.getElementById('bookingTime').value;
            const availabilityDiv = document.getElementById('timeAvailability');
            const submitBtn = document.getElementById('submitBookingBtn');

            if (date && time) {
                try {
                    const response = await fetch(`${this.API_BASE}/availability?date=${date}&time=${time}`);
                    const result = await response.json();
            
                    if (result.available) {
                        availabilityDiv.innerHTML = '<span style="color: green;">Время доступно</span>';
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Забронировать';
                    } else {
                        availabilityDiv.innerHTML = '<span style="color: red;">Время уже занято</span>';
                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Время занято';
                    }
                } catch (error) {
                    availabilityDiv.innerHTML = '<span style="color: orange;"> Не удалось проверить доступность</span>';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Забронировать';
                }
            } else {
                availabilityDiv.innerHTML = '';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Забронировать';
            }
        };

        dateInput.addEventListener('change', checkAvailability);
        document.getElementById('bookingTime').addEventListener('change', checkAvailability);

        document.getElementById('bookingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.processBooking(trainingType);
        });
    }

    async processBooking(trainingType) {
        const date = document.getElementById('bookingDate').value;
        const time = document.getElementById('bookingTime').value;
        const notes = document.getElementById('bookingNotes').value;

        try {
            const response = await fetch(`${this.API_BASE}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    trainingType,
                    date,
                    time,
                    notes
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.showNotification('Тренировка успешно забронирована!', 'success');
                this.closeModal();
                this.sendBookingEmail(result.booking);
                if (this.renderCalendar) {
                    this.renderCalendar(this.currentCalendarDate);
                }
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Ошибка бронирования', 'error');
        }
    }

    sendBookingEmail(booking) {
        const subject = `Подтверждение бронирования: ${booking.trainingType}`;
        const body = `
Уважаемый(ая) ${this.currentUser.name}!

Вы успешно забронировали тренировку в SkiPro Training.

Детали бронирования:
Тип тренировки: ${booking.trainingType}
Дата: ${booking.date}
Время: ${booking.time}
ID брони: ${booking.id}

Команда SkiPro Training
        `.trim();

        this.sendEmail(this.currentUser.email, subject, body);
    }

    initCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (calendarGrid) {
            this.renderCalendar(this.currentCalendarDate);
            this.setupCalendarEvents();
        }
    }

    setupCalendarEvents() {
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.changeMonth(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changeMonth(1));
    }

    changeMonth(direction) {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + direction);
        this.renderCalendar(this.currentCalendarDate);
    }

    async renderCalendar(date) {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElem = document.getElementById('currentMonth');
    const bookingsList = document.getElementById('bookingsList');
    
    if (!calendarGrid || !currentMonthElem) return;

    currentMonthElem.textContent = date.toLocaleDateString('ru-RU', { 
        month: 'long', 
        year: 'numeric' 
    });

    calendarGrid.innerHTML = '';

    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    daysOfWeek.forEach(day => {
        const dayElem = document.createElement('div');
        dayElem.className = 'calendar-day header';
        dayElem.textContent = day;
        calendarGrid.appendChild(dayElem);
    });

    let bookings = [];
    try {
        const response = await fetch(`${this.API_BASE}/bookings`);
        bookings = await response.json();
        console.log('Загруженные бронирования:', bookings); // Для отладки
    } catch (error) {
        console.warn('Не удалось загрузить бронирования:', error);
    }

    // Обновляем список забронированных тренировок
    if (bookingsList) {
        if (bookings.length > 0) {
            bookingsList.innerHTML = bookings.map(booking => {
                const isMyBooking = this.currentUser && booking.userId === this.currentUser.id;
                return `
                    <div class="booking-item ${isMyBooking ? 'my-booking' : ''}">
                        <div class="booking-header">
                            <div class="training-type">${booking.trainingType}</div>
                            <div class="booking-date">${booking.date} ${booking.time}</div>
                        </div>
                        <div class="booking-details">
                            <div class="client-info">
                                ${isMyBooking ? 'Ваша тренировка' : 'Занято'}
                            </div>
                            ${booking.notes ? `<div class="booking-notes">${booking.notes}</div>` : ''}
                            ${isMyBooking ? `<button class="btn-cancel" onclick="app.cancelBooking(${booking.id})">Отменить</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            bookingsList.innerHTML = '<div class="no-bookings">Нет забронированных тренировок</div>';
        }
    }

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7;

    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 1; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }

    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElem = document.createElement('div');
        dayElem.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElem.appendChild(dayNumber);
        
        const currentDateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Ищем бронирования на эту дату
        const dayBookings = bookings.filter(booking => 
            booking.date === currentDateStr
        );
        
        console.log(`Дата: ${currentDateStr}, Бронирования:`, dayBookings); // Для отладки
        
        if (dayBookings.length > 0) {
            dayElem.classList.add('has-training');
            
            dayBookings.forEach(booking => {
                const trainingElem = document.createElement('div');
                trainingElem.className = 'training-item';
                trainingElem.textContent = `${booking.time} - ${booking.trainingType}`;
                trainingElem.title = `${booking.trainingType} в ${booking.time}`;
                dayElem.appendChild(trainingElem);
            });
        }
        
        calendarGrid.appendChild(dayElem);
    }
}

    createModal(content, className = '') {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content ${className}">
                <span class="close" onclick="app.closeModal()">&times;</span>
                ${content}
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Предотвращаем прокрутку body когда модальное окно открыто
        document.body.style.overflow = 'hidden';
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
        
        return modal;
    }

    closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
        // Восстанавливаем прокрутку body
        document.body.style.overflow = '';
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }

    sendEmail(to, subject, body) {
        const modal = this.createModal(`
            <div class="email-compact">
                <h2>Email уведомление</h2>
                <div class="email-header">
                    <p><strong>Кому:</strong> ${to}</p>
                    <p><strong>Тема:</strong> ${subject}</p>
                </div>
                <div class="email-scrollable">
                    <div class="email-preview">
                        ${body.replace(/\n/g, '<br>')}
                    </div>
                </div>
                <div class="email-buttons">
                    <button onclick="app.sendRealEmail('${to}', '${subject}', \`${body.replace(/'/g, "\\'")}\`)" 
                            class="btn btn-send">
                        Открыть для отправки
                    </button>
                    <button onclick="app.closeModal()" class="btn btn-cancel">
                        Закрыть
                    </button>
                </div>
            </div>
        `);
    }

    sendRealEmail(to, subject, body) {
    try {
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Создаем временную ссылку и имитируем клик
        const link = document.createElement('a');
        link.href = mailtoLink;
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // Программный клик обычно разрешен
        link.click();
        
        // Удаляем ссылку после использования
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
        
    } catch (error) {
        console.error('Ошибка при открытии почтового клиента:', error);
        // Альтернативный вариант - показать данные для ручного копирования
        this.showEmailFallback(to, subject, body);
    }
    
    this.closeModal();
    this.showNotification('Письмо открыто в почтовом клиенте!', 'success');
}

showEmailFallback(to, subject, body) {
    const modal = this.createModal(`
        <div class="email-fallback">
            <h2>Информация для отправки письма</h2>
            <div class="email-data">
                <p><strong>Кому:</strong> ${to}</p>
                <p><strong>Тема:</strong> ${subject}</p>
                <div class="message-preview">
                    <strong>Текст сообщения:</strong>
                    <div class="scrollable-body">${body.replace(/\n/g, '<br>')}</div>
                </div>
            </div>
            <div class="fallback-buttons">
                <button onclick="navigator.clipboard.writeText(\`${body.replace(/'/g, "\\'")}\`); app.showNotification('Текст скопирован!', 'success')" 
                        class="btn btn-copy">
                    Скопировать текст
                </button>
                <button onclick="app.closeModal()" class="btn btn-close">
                    Закрыть
                </button>
            </div>
        </div>
    `);
}

    initEventListeners() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm();
            });
        }
    }

    handleContactForm() {
        const formData = {
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            message: document.getElementById('contactMessage').value
        };

        const subject = 'Новое сообщение с формы обратной связи';
        const body = `
Имя: ${formData.name}
Email: ${formData.email}

Сообщение:
${formData.message}

Дата: ${new Date().toLocaleString('ru-RU')}
        `.trim();

        this.sendEmail('sasha.zharkova00@mail.ru', subject, body);
        document.getElementById('contactForm').reset();
        this.showNotification('Сообщение подготовлено для отправки!', 'success');
    }
}

const app = new SkiProApp();

function showBookingModal(trainingType) {
    app.showBookingModal(trainingType);
}

function showLoginModal() {
    app.showLoginModal();
}

// обработки ошибок загрузки данных
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, есть ли элементы, которые требуют данных
    const checkDataLoading = setInterval(() => {
        const loadingElements = document.querySelectorAll('.loading');
        if (loadingElements.length > 0) {
            loadingElements.forEach(element => {
                if (element.textContent.includes('Загрузка') && !element.textContent.includes('ошибка')) {
                    element.textContent = 'Данные загружаются...';
                }
            });
        }
    }, 5000);

    // Обработка ошибок загрузки изображений
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            console.log('Ошибка загрузки изображения:', e.target.src);
            e.target.style.display = 'none';
        }
    }, true);
});

// Глобальная обработка ошибок
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});