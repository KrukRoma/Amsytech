const LocalStorage = {
  setUser: (user) => {
    const userData = {
      id: user.id,  // Додаємо id
      name: user.name,
      surname: user.surname,
      email: user.email,
      expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Термін дії 7 днів
    };
    localStorage.setItem('amsytech_auth_user', JSON.stringify(userData)); // Використовуємо без CONFIG
  },
  
  getUser: () => {
    const user = localStorage.getItem('amsytech_auth_user'); // Використовуємо без CONFIG
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
    localStorage.removeItem('amsytech_auth_user'); // Використовуємо без CONFIG
  },
  
  isLoggedIn: () => {
    const user = LocalStorage.getUser();
    return user !== null;
  }
};
