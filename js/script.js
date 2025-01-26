window.addEventListener('load', function () {
    // Спочатку ховаємо контент
    document.body.classList.remove('show');
  
    const currentPage = window.location.pathname;
  
    if (!LocalStorage.isLoggedIn()) {
      // Перенаправляємо на сторінку логіну, якщо не залогінений
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
  