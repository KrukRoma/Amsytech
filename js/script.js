window.addEventListener('load', function () {
    const currentPage = window.location.pathname;

    // Оновлення іконки користувача при завантаженні сторінки
    const userIcon = document.getElementById('user-icon');
    if (LocalStorage.isLoggedIn()) {
        const user = LocalStorage.getUser();
        if (userIcon) {
            userIcon.innerHTML = `<div class="user-icon">${user.name.charAt(0)}</div>`;
        }
    } else {
        if (userIcon) {
            userIcon.innerHTML = `<img src="images/5425129490188725198.jpg" alt="User" id="defaultUserIcon">`;
        }
    }

    // Перевірка авторизації та перенаправлення на сторінках
    if (!LocalStorage.isLoggedIn()) {
        // Перенаправляємо на логін тільки для сторінок, які вимагають авторизації
        const protectedPages = ['/account.html', '/profile.html']; // Додайте сюди інші захищені сторінки
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    } else {
        // Якщо користувач залогінений і намагається перейти на login чи register
        if (currentPage === '/login.html' || currentPage === '/register.html') {
            window.location.href = 'account.html';
        }
    }

    // Після перевірки авторизації відкриваємо сторінку
    document.body.classList.add('show');
});

// Додаємо обробник події на натискання іконки профілю
document.getElementById('user-icon')?.addEventListener('click', function () {
    if (!LocalStorage.isLoggedIn()) {
        window.location.href = 'login.html';
    } else {
        window.location.href = 'account.html';
    }
});