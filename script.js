// динамические скрипты для сайта
// база данных пользователей (в реальном проекте заменить на серверную часть)
let users = JSON.parse(localStorage.getItem('skipro_users')) || [];

// текущий пользователь
let currentUser = JSON.parse(localStorage.getItem('skipro_currentUser')) || null;

// email для уведомлений
const ADMIN_EMAIL = 'sasha.zharkova00@mail.ru';

// инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, начинаем инициализацию...');
    
    // сначала инициализируем кнопку авторизации
    initAuthButton();
    // потом остальные функции
    initSmoothScroll();
    initProductCards();
    initCalendar();
    initFormHandlers();
    
    // анимация появления элементов
    animateElements();
    
    console.log('Инициализация завершена');
});

// система авторизации и регистрации
// инициализация кнопки авторизации в навигации
function initAuthButton() {
    console.log('Инициализация кнопки авторизации...');
    
    const nav = document.querySelector('nav ul');
    if (!nav) {
        console.log('Навигация не найдена');
        return;
    }
    
    // удаляем все существующие кнопки авторизации
    const existingAuthButtons = nav.querySelectorAll('li .auth-btn');
    console.log('Найдено существующих кнопок:', existingAuthButtons.length);
    
    if (existingAuthButtons.length > 0) {
        console.log('Удаляем дублирующиеся кнопки...');
        // удаляем родительские li элементов с кнопками авторизации
        existingAuthButtons.forEach(button => {
            const listItem = button.closest('li');
            if (listItem) {
                listItem.remove();
            }
        });
    }
    
    // создаем новую кнопку авторизации - выхода
    const authBtn = document.createElement('li');
    authBtn.className = 'auth-btn-item'; // Добавляем класс для идентификации
    
    if (currentUser) {
        authBtn.innerHTML = `<button class="auth-btn" onclick="logout()">Выйти (${currentUser.name})</button>`;
        console.log('Создана кнопка "Выйти" для пользователя:', currentUser.name);
    } else {
        authBtn.innerHTML = `<button class="auth-btn" onclick="showLoginModal()">Войти</button>`;
        console.log('Создана кнопка "Войти"');
    }
    
    nav.appendChild(authBtn);
    console.log('Кнопка авторизации успешно добавлена в навигацию');
}

// Показать модальное окно авторизации
function showLoginModal() {
    const modal = createModal(`
        <h2>Вход в систему</h2>
        <form id="loginForm">
            <div class="form-group">
                <label for="loginEmail">Email:</label>
                <input type="email" id="loginEmail" required>
            </div>
            <div class="form-group">
                <label for="loginPassword">Пароль:</label>
                <input type="password" id="loginPassword" required>
            </div>
            <button type="submit" class="btn">Войти</button>
        </form>
        <p style="text-align: center; margin-top: 1rem;">
            Нет аккаунта? <a href="#" onclick="showRegisterModal()">Зарегистрироваться</a>
        </p>
    `);
    
    // Обработка отправки формы авторизации
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        loginUser();
    });
}

// Показать модальное окно регистрации
function showRegisterModal() {
    const modal = createModal(`
        <h2>Регистрация</h2>
        <form id="registerForm">
            <div class="form-group">
                <label for="regName">Имя:</label>
                <input type="text" id="regName" required>
            </div>
            <div class="form-group">
                <label for="regEmail">Email:</label>
                <input type="email" id="regEmail" required>
            </div>
            <div class="form-group">
                <label for="regPassword">Пароль:</label>
                <input type="password" id="regPassword" required minlength="6">
            </div>
            <div class="form-group">
                <label for="regPhone">Телефон:</label>
                <input type="tel" id="regPhone" required>
            </div>
            <button type="submit" class="btn">Зарегистрироваться</button>
        </form>
    `);
    
    // Обработка отправки формы регистрации
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        registerUser();
    });
}

// регистрация пользователя
function registerUser() {
    // аолучаем данные из формы
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value;
    
    // ароверяем, существует ли пользователь с таким email
    if (users.find(user => user.email === email)) {
        showNotification('Пользователь с таким email уже существует!', 'error');
        return;
    }
    
    // Создаем нового пользователя
    const newUser = { 
        id: Date.now(), 
        name, 
        email, 
        password, 
        phone, 
        registrationDate: new Date() 
    };
    
    // Сохраняем в localStorage
    users.push(newUser);
    localStorage.setItem('skipro_users', JSON.stringify(users));
    
    // оправляем подтверждение
    sendRegistrationEmail(newUser);
    
    showNotification('Регистрация успешна! Проверьте вашу почту для подтверждения.', 'success');
    closeModal();
    showLoginModal();
}

// Отправка подтверждения регистрации
function sendRegistrationEmail(user) {
    const subject = 'Добро пожаловать в SkiPro Training!';
    const body = `
Уважаемый(ая) ${user.name}!

Добро пожаловать в SkiPro Training!

Ваша регистрация прошла успешно.
Теперь вы можете бронировать тренировки и пользоваться всеми возможностями нашего сервиса.

Ваши данные для входа:
Email: ${user.email}

Если это были не вы, пожалуйста, проигнорируйте это письмо.

С уважением,
Команда SkiPro Training
${new Date().toLocaleDateString('ru-RU')}
    `.trim();
    
    sendEmail(user.email, subject, body);
}

// Авторизация пользователя
function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Ищем пользователя в базе
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Успешная авторизация
        currentUser = user;
        localStorage.setItem('skipro_currentUser', JSON.stringify(user));
        closeModal();
        showNotification(`Добро пожаловать, ${user.name}!`, 'success');
        setTimeout(() => window.location.reload(), 1000);
    } else {
        showNotification('Неверный email или пароль!', 'error');
    }
}

// Выход из системы
function logout() {
    currentUser = null;
    localStorage.removeItem('skipro_currentUser');
    showNotification('Вы вышли из системы', 'success');
    setTimeout(() => window.location.reload(), 1000);
}

// система бронирования тренировок

/**Показать модальное окно бронирования тренировки
 * @param {string} trainingType - Тип тренировки
 */
function showBookingModal(trainingType) {
    // Проверяем авторизацию
    if (!currentUser) {
        showNotification('Для бронирования необходимо войти в систему', 'error');
        showLoginModal();
        return;
    }
    
    const modal = createModal(`
        <h2>Бронирование тренировки</h2>
        <form id="bookingForm">
            <div class="form-group">
                <label>Тип тренировки:</label>
                <input type="text" value="${trainingType}" readonly>
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
            </div>
            <div class="form-group">
                <label for="bookingNotes">Дополнительные пожелания:</label>
                <textarea id="bookingNotes" rows="3"></textarea>
            </div>
            <button type="submit" class="btn">Забронировать</button>
        </form>
    `);
    
    // Установка минимальной даты (сегодня)
    document.getElementById('bookingDate').min = new Date().toISOString().split('T')[0];
    
    // Обработка бронирования
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processBooking(trainingType);
    });
}

/**
 * Обработка данных бронирования
 * @param {string} trainingType - Тип тренировки
 */
function processBooking(trainingType) {
    // Собираем данные бронирования
    const bookingData = {
        id: Date.now(),
        userId: currentUser.id,
        trainingType: trainingType,
        date: document.getElementById('bookingDate').value,
        time: document.getElementById('bookingTime').value,
        notes: document.getElementById('bookingNotes').value,
        status: 'pending', // pending, confirmed, cancelled
        bookingDate: new Date()
    };
    
    // Сохраняем в localStorage
    let bookings = JSON.parse(localStorage.getItem('skipro_bookings')) || [];
    bookings.push(bookingData);
    localStorage.setItem('skipro_bookings', JSON.stringify(bookings));
    
    // отправка уведомлений:
    // 1. администратору о новой брони
    sendBookingEmailNotification(bookingData);
    // 2. клиенту подтверждение брони
    sendBookingConfirmationEmail(bookingData);
    
    closeModal();
    showNotification('Тренировка успешно забронирована! Проверьте вашу почту для подтверждения.', 'success');
    
    // обновляем календарь и список тренировок
    setTimeout(() => {
        if (typeof renderCalendar === 'function' && typeof renderBookedTrainings === 'function') {
            renderCalendar(currentCalendarDate);
            renderBookedTrainings();
        }
    }, 500);
}

// отправка емайл уведомлений
/**
 * Отправка уведомления о бронировании тренировки
 * @param {Object} bookingData - Данные бронирования
 */
function sendBookingEmailNotification(bookingData) {
    const subject = `Новая бронь тренировки: ${bookingData.trainingType}`;
    const body = `
Новая бронь тренировки на сайте SkiPro Training:

Клиент: ${currentUser.name}
Email: ${currentUser.email}
Телефон: ${currentUser.phone}

Тип тренировки: ${bookingData.trainingType}
Дата: ${bookingData.date}
Время: ${bookingData.time}

Дополнительные пожелания: ${bookingData.notes || 'Не указаны'}

Дата бронирования: ${new Date(bookingData.bookingDate).toLocaleString('ru-RU')}
ID брони: ${bookingData.id}

Это сообщение отправлено автоматически с сайта SkiPro Training.
    `.trim();
    
    sendEmail(ADMIN_EMAIL, subject, body);
}

// Отправка подтверждения бронирования клиенту
function sendBookingConfirmationEmail(bookingData) {
    const user = currentUser;
    if (!user) return;
    
    const subject = `Подтверждение бронирования тренировки: ${bookingData.trainingType}`;
    const body = `
Уважаемый(ая) ${user.name}!

Вы успешно забронировали тренировку в SkiPro Training.

Детали бронирования:
Тип тренировки: ${bookingData.trainingType}
Дата: ${bookingData.date}
Время: ${bookingData.time}
ID брони: ${bookingData.id}

${bookingData.notes ? `Ваши пожелания: ${bookingData.notes}\n` : ''}

Не забудьте:
1. Прийти за 10 минут до начала
2. Взять с собой спортивную форму
3. Иметь при себе документ, удостоверяющий личность

Если у вас возникли вопросы или вы хотите перенести тренировку,
свяжитесь с нами по телефону: +7 981 891 93 55

Ждем вас на тренировке!
Команда SkiPro Training
${new Date().toLocaleDateString('ru-RU')}
    `.trim();
    
    sendEmail(user.email, subject, body);
}

/**
 * Отправка уведомления о форме обратной связи
 * @param {Object} formData - Данные формы
 */
function sendContactFormEmail(formData) {
    const subject = 'Новое сообщение с формы обратной связи';
    const body = `
Новое сообщение с формы обратной связи сайта SkiPro Training:

Имя: ${formData.name}
Email: ${formData.email}

Сообщение:
${formData.message}

Дата отправки: ${new Date().toLocaleString('ru-RU')}

Это сообщение отправлено автоматически с сайта SkiPro Training.
    `.trim();
    
    sendEmail(ADMIN_EMAIL, subject, body);
}

/**
 * Универсальная функция отправки email (компактная версия)
 * @param {string} to - Email получателя
 * @param {string} subject - Тема письма
 * @param {string} body - Текст письма
 */
function sendEmail(to, subject, body) {
    console.log('Имитация отправки email:');
    console.log('Кому:', to);
    console.log('Тема:', subject);
    console.log('Текст:', body);
    
    // Сразу показываем письмо в компактном модальном окне
    const modal = createModal(`
        <div class="email-compact">
            <h2>📧 Email уведомление</h2>
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
                <button onclick="sendRealEmail('${to}', '${subject}', \`${body.replace(/'/g, "\\'")}\`)" class="btn btn-send">
                    📨 Открыть для отправки
                </button>
                <button onclick="closeModal()" class="btn btn-cancel">
                    ✋ Закрыть
                </button>
            </div>
        </div>
    `);
    
    return true;
}

/**
 * Функция для реальной отправки через почтовый клиент
 */
function sendRealEmail(to, subject, body) {
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    const tempLink = document.createElement('a');
    tempLink.href = mailtoLink;
    tempLink.target = '_blank';
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    
    // Автоматически закрываем модальное окно
    setTimeout(() => {
        closeModal();
        showNotification('✓ Письмо открыто в почтовом клиенте! Нажмите "Отправить".', 'success');
    }, 500);
}

// Проверка предстоящих тренировок и отправка напоминаний
function checkUpcomingTrainings() {
    const bookings = getBookings();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const tomorrowBookings = bookings.filter(booking => 
        booking.date === tomorrowStr && 
        booking.status !== 'cancelled'
    );
    
    tomorrowBookings.forEach(booking => {
        const user = users.find(u => u.id === booking.userId);
        if (user) {
            sendTrainingReminderEmail(booking, user);
        }
    });
}
// отправка напоминания о тренировке
function sendTrainingReminderEmail(booking, user) {
    const subject = `Напоминание: тренировка завтра в ${booking.time}`;
    const body = `
Уважаемый(ая) ${user.name}!

Напоминаем, что завтра у вас запланирована тренировка:

${booking.trainingType}
${booking.date}
${booking.time}

Не забудьте:
Спортивная форма
Хорошее настроение!

Ждем вас!
Команда SkiPro Training
    `.trim();
    
    sendEmail(user.email, subject, body);
}

// Запускаем проверку каждый день
setInterval(checkUpcomingTrainings, 24 * 60 * 60 * 1000); // раз в сутки

// календарь тренировок
let currentCalendarDate = new Date();

// Инициализация календаря
function initCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) {
        console.log('Календарь не найден на этой странице');
        return;
    }
    
    renderCalendar(currentCalendarDate);
    renderBookedTrainings();
    
    // Навешиваем обработчики на кнопки календаря
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => changeMonth(-1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => changeMonth(1));
    }
}

// Смена месяца
function changeMonth(direction) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + direction);
    renderCalendar(currentCalendarDate);
    renderBookedTrainings();
}

// Отрисовка календаря
function renderCalendar(date) {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthElem = document.getElementById('currentMonth');
    
    if (!calendarGrid || !currentMonthElem) return;
    
    // Устанавливаем заголовок месяца
    currentMonthElem.textContent = date.toLocaleDateString('ru-RU', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Очищаем календарь
    calendarGrid.innerHTML = '';
    
    // Добавляем заголовки дней недели
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    daysOfWeek.forEach(day => {
        const dayElem = document.createElement('div');
        dayElem.className = 'calendar-day header';
        dayElem.textContent = day;
        calendarGrid.appendChild(dayElem);
    });
    
    // Получаем первый день месяца и количество дней
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Получаем день недели первого дня
    let firstDayOfWeek = firstDay.getDay();
    if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Воскресенье становится 7
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 1; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Добавляем дни текущего месяца
    const bookings = getBookings();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElem = document.createElement('div');
        dayElem.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElem.appendChild(dayNumber);
        
        // Проверяем есть ли тренировки на этот день
        const currentDateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayBookings = bookings.filter(booking => 
            booking.date === currentDateStr && booking.status !== 'cancelled'
        );
        
        if (dayBookings.length > 0) {
            dayElem.classList.add('has-training');
            
            dayBookings.forEach(booking => {
                const trainingElem = document.createElement('div');
                trainingElem.className = 'training-item';
                trainingElem.textContent = `${booking.time} - ${booking.trainingType}`;
                trainingElem.title = `Клиент: ${getUserName(booking.userId)}\nТел: ${getUserPhone(booking.userId)}`;
                dayElem.appendChild(trainingElem);
            });
        }
        
        calendarGrid.appendChild(dayElem);
    }
}

// Отображение списка забронированных тренировок
function renderBookedTrainings() {
    const bookingsList = document.getElementById('bookingsList');
    if (!bookingsList) return;
    
    const bookings = getBookings();
    const upcomingBookings = bookings
        .filter(booking => booking.status !== 'cancelled')
        .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    
    if (upcomingBookings.length === 0) {
        bookingsList.innerHTML = '<p class="no-bookings">Нет забронированных тренировок</p>';
    } else {
        let html = '';
        upcomingBookings.forEach(booking => {
            const bookingDate = new Date(booking.date);
            const isCurrentUserBooking = currentUser && currentUser.id === booking.userId;
            
            html += `
                <div class="booking-item ${isCurrentUserBooking ? 'my-booking' : ''}">
                    <div class="booking-header">
                        <strong>${bookingDate.toLocaleDateString('ru-RU')} ${booking.time}</strong>
                        ${isCurrentUserBooking ? 
                            `<button onclick="cancelBooking(${booking.id})" class="btn-cancel">Отменить</button>` : ''}
                    </div>
                    <div class="booking-details">
                        <span class="training-type">${booking.trainingType}</span>
                        <span class="client-info">${getUserName(booking.userId)}</span>
                        ${booking.notes ? `<p class="booking-notes">${booking.notes}</p>` : ''}
                    </div>
                </div>
            `;
        });
        bookingsList.innerHTML = html;
    }
}

// Получение всех бронирований
function getBookings() {
    return JSON.parse(localStorage.getItem('skipro_bookings')) || [];
}

// Получение имени пользователя
function getUserName(userId) {
    const users = JSON.parse(localStorage.getItem('skipro_users')) || [];
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Неизвестный пользователь';
}

// Получение телефона пользователя
function getUserPhone(userId) {
    const users = JSON.parse(localStorage.getItem('skipro_users')) || [];
    const user = users.find(u => u.id === userId);
    return user ? user.phone : 'Не указан';
}

// Отмена бронирования
function cancelBooking(bookingId) {
    if (!confirm('Вы уверены, что хотите отменить эту тренировку?')) {
        return;
    }
    
    let bookings = getBookings();
    bookings = bookings.map(booking => {
        if (booking.id === bookingId) {
            booking.status = 'cancelled';
        }
        return booking;
    });
    
    localStorage.setItem('skipro_bookings', JSON.stringify(bookings));
    showNotification('Бронирование отменено', 'success');
    
    // Обновляем отображение
    renderCalendar(currentCalendarDate);
    renderBookedTrainings();
}

// вспомогательные функции

/**
 * Создание модального окна
 * @param {string} content - HTML содержимое модального окна
 * @returns {HTMLElement} Созданное модальное окно
 */
function createModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content slide-in">
            <span class="close" onclick="closeModal()">&times;</span>
            ${content}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    return modal;
}

// Закрытие модального окна
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

/**
 * Показать уведомление
 * @param {string} message - Текст сообщения
 * @param {string} type - Тип уведомления (success, error, warning)
 */
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Инициализация плавной прокрутки
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Инициализация карточек товаров (тренировок)
function initProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Проверяем, не добавлена ли уже кнопка
        const existingButton = card.querySelector('.booking-btn');
        if (existingButton) {
            return; // Пропускаем, если кнопка уже есть
        }
        
        // Создаем кнопку "Забронировать тренировку"
        const button = document.createElement('button');
        button.className = 'btn booking-btn';
        button.textContent = 'Забронировать тренировку';
        button.onclick = function() {
            const trainingType = card.querySelector('h2').textContent;
            showBookingModal(trainingType);
        };
        
        // Добавляем кнопку в карточку
        card.appendChild(button);
    });
}

// Инициализация обработчиков форм
function initFormHandlers() {
    // Обработка формы обратной связи
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Собираем данные формы
            const formData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                message: document.getElementById('contactMessage').value
            };
            
            // Отправляем уведомление на email
            sendContactFormEmail(formData);
            
            showNotification('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
            this.reset();
        });
    }
}

// Анимация появления элементов при скролле
function animateElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });
    
    // Наблюдаем за элементами, которые должны появляться при скролле
    document.querySelectorAll('.product-card, .gallery-item, .contact-info').forEach(el => {
        observer.observe(el);
    });
}

// для расширения функционала

/**
 * Получить историю бронирований текущего пользователя
 * @returns {Array} Массив бронирований
 */
function getUserBookings() {
    if (!currentUser) return [];
    
    const allBookings = JSON.parse(localStorage.getItem('skipro_bookings')) || [];
    return allBookings.filter(booking => booking.userId === currentUser.id);
}

/**
 * Проверка доступности даты и времени для бронирования
 * @param {string} date - Дата в формате YYYY-MM-DD
 * @param {string} time - Время в формате HH:MM
 * @returns {boolean} Доступно ли время
 */
function isTimeSlotAvailable(date, time) {
    const bookings = JSON.parse(localStorage.getItem('skipro_bookings')) || [];
    const conflictingBooking = bookings.find(booking => 
        booking.date === date && 
        booking.time === time && 
        booking.status !== 'cancelled'
    );
    
    return !conflictingBooking;
}
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\+]?[0-9\s\-\(\)]{10,}$/.test(phone);
}
// Простое хеширование паролей
function hashPassword(password) {
    return btoa(password); // В реальном проекте использовать bcrypt
}
// Проверка активности сессии
function checkSession() {
    const user = JSON.parse(localStorage.getItem('skipro_currentUser'));
    if (!user) {
        window.location.href = 'index.html';
    }
}