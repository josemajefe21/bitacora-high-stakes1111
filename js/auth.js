class Auth {
  constructor() {
    this.currentUser = null;
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
  }

  async register(username, password) {
    if (this.users.some(u => u.username === username)) {
      throw new Error('El usuario ya existe');
    }

    const user = {
      id: Date.now().toString(),
      username,
      password: await this.hashPassword(password),
      bitacoras: [],
      achievements: {
        totalCycles: 0,
        moodStreaks: {},
        totalEntries: 0
      },
      createdAt: new Date().toISOString()
    };

    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
    return user;
  }

  async login(username, password) {
    const user = this.users.find(u => u.username === username);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const isValid = await this.verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error('Contraseña incorrecta');
    }

    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async verifyPassword(password, hash) {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }

  getCurrentUser() {
    if (!this.currentUser) {
      this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }
    return this.currentUser;
  }

  updateUserAchievements(achievements) {
    const user = this.getCurrentUser();
    if (user) {
      user.achievements = { ...user.achievements, ...achievements };
      const index = this.users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        this.users[index] = user;
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    }
  }
}

export const auth = new Auth(); 