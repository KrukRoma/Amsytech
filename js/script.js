window.addEventListener('load', function () {
    const currentPage = window.location.pathname;

    // Оновлення іконки користувача при завантаженні сторінки
    const userIcon = document.getElementById('user-icon');
    if (LocalStorage.isLoggedIn()) {  // Використовуємо LocalStorage, а не localStorage
        const user = LocalStorage.getUser();
        if (userIcon) {
            userIcon.innerHTML = `<div class="user-icon">${user.name.charAt(0)}</div>`;  // Перша буква імені
        }
    } else {
        if (userIcon) {
            userIcon.innerHTML = `<img src="images/5425129490188725198.jpg" alt="User" id="defaultUserIcon">`; // Стандартна іконка
        }
    }

    // Перевірка авторизації та перенаправлення на сторінках
    if (!LocalStorage.isLoggedIn()) {  // Використовуємо LocalStorage
        // Перенаправляємо на логін, якщо користувач не авторизований
        if (currentPage !== '/login.html' && currentPage !== '/register.html') {
            window.location.href = 'login.html';
        }
    } else {
        // Якщо користувач залогінений і намагається перейти на login чи register
        if (currentPage === '/login.html' || currentPage === '/register.html') {
            window.location.href = 'account.html'; // Перенаправляємо на акаунт
        }
    }

    // Після перевірки авторизації відкриваємо сторінку
    document.body.classList.add('show');
});

// Додаємо обробник події на натискання іконки профілю
document.getElementById('user-icon')?.addEventListener('click', function () {
    if (!LocalStorage.isLoggedIn()) {  // Використовуємо LocalStorage
        window.location.href = 'login.html'; // Перенаправляємо на логін, якщо не залогінений
    }
});
