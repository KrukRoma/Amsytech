const LocalStorage = {
  setUser: (user) => {
    const userData = {
      name: user.name,
      surname: user.surname,
      email: user.email,
      expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Термін дії 7 днів
    };
    localStorage.clear(); // Очищаємо весь localStorage
    localStorage.setItem(CONFIG.AUTH_KEY, JSON.stringify(userData));
  },
  
  getUser: () => {
    const user = localStorage.getItem(CONFIG.AUTH_KEY);
    if (user) {
      const userData = JSON.parse(user);
      if (new Date(userData.expiration) > new Date()) {
        return userData;
      } else {
        LocalStorage.removeUser(); // Видаляємо прострочені дані
        return null;
      }
    }
    return null;
  },
  
  removeUser: () => {
    localStorage.removeItem(CONFIG.AUTH_KEY);
  },
  
  isLoggedIn: () => {
    const user = LocalStorage.getUser();
    return user !== null;
  }
};
