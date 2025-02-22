const LocalStorage = {
  setUser: (user) => {
      const userData = {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          role: user.isAdmin ? 'admin' : 'user',
          expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      localStorage.setItem('amsytech_auth_user', JSON.stringify(userData));
      console.log("Користувач збережений:", userData);
  },
  
  getUser: () => {
      const user = localStorage.getItem('amsytech_auth_user');
      if (user) {
          const userData = JSON.parse(user);
          if (new Date(userData.expiration) > new Date()) {
              return userData;
          } else {
              LocalStorage.removeUser();
              return null;
          }
      }
      return null;
  },
  
  removeUser: () => {
      localStorage.removeItem('amsytech_auth_user');
  },
  
  isLoggedIn: () => {
      const user = LocalStorage.getUser();
      return user !== null;
  }
};