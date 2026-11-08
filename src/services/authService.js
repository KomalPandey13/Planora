import { hashPassword, validateEmail, validatePassword, sanitizeInput } from '../utils/security';

const USERS_STORAGE_KEY = 'planora_users';
const SESSION_STORAGE_KEY = 'planora_session';

// Pre-seeded demo student user
const DEMO_STUDENT = {
  id: 'user-demo-1',
  name: 'Aarav Sharma',
  email: 'demo@campus.edu',
  role: 'Student', // 'Student' or 'Organizer'
  registeredEvents: [
    {
      eventId: 'event-2',
      registeredAt: '2026-11-10T14:30:00.000Z',
      bookingId: 'PLN-2026-X89K',
      passCode: 'PLN-HP26-9923',
      status: 'Confirmed'
    }
  ],
  hostedEvents: [],
  createdAt: '2026-11-01T10:00:00.000Z'
};

const DEMO_PASSWORD_PLAIN = 'demopass123';

/**
 * Initializes the users store in localStorage if empty
 */
async function initializeUsersStore() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      const demoHashedPassword = await hashPassword(DEMO_PASSWORD_PLAIN);
      const initialUsers = [
        {
          ...DEMO_STUDENT,
          passwordHash: demoHashedPassword
        }
      ];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
    }
  } catch (err) {
    console.error('Failed to initialize users in localStorage:', err);
  }
}

// Call init once
initializeUsersStore();

export const authService = {
  /**
   * Retrieves all registered users safely
   */
  getUsers() {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Error reading users from localStorage:', err);
      return [];
    }
  },

  /**
   * Saves users array to localStorage
   */
  saveUsers(users) {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (err) {
      console.error('Error writing users to localStorage:', err);
    }
  },

  /**
   * Gets current active session
   */
  getCurrentSession() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      const sessionUser = JSON.parse(raw);
      
      // Sync with latest data from users table
      const users = this.getUsers();
      const freshUser = users.find((u) => u.id === sessionUser.id);
      if (freshUser) {
        const safeFresh = { ...freshUser };
        delete safeFresh.passwordHash;
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeFresh));
        return safeFresh;
      }
      return sessionUser;
    } catch (err) {
      console.error('Error reading active session:', err);
      return null;
    }
  },

  /**
   * Registers a new user
   */
  async register({ name, email, password }) {
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = email ? email.trim().toLowerCase() : '';

    if (!sanitizedName) {
      throw new Error('Please enter your full name');
    }

    if (!validateEmail(sanitizedEmail)) {
      throw new Error('Please enter a valid email address (e.g. name@campus.edu)');
    }

    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      throw new Error(passCheck.message);
    }

    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === sanitizedEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: sanitizedName,
      email: sanitizedEmail,
      role: 'Student',
      passwordHash,
      registeredEvents: [],
      hostedEvents: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    // Set active session without password hash
    const safeUser = { ...newUser };
    delete safeUser.passwordHash;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));

    return safeUser;
  },

  /**
   * Authenticates user via email and password
   */
  async login({ email, password }) {
    const sanitizedEmail = email ? email.trim().toLowerCase() : '';

    if (!sanitizedEmail || !password) {
      throw new Error('Please enter both email and password');
    }

    let users = this.getUsers();

    // If users table is somehow empty, guarantee demo account exists
    if (users.length === 0) {
      await initializeUsersStore();
      users = this.getUsers();
    }

    const user = users.find((u) => u.email.toLowerCase() === sanitizedEmail);
    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const safeUser = { ...user };
    delete safeUser.passwordHash;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));

    return safeUser;
  },

  /**
   * Logs out user and destroys session
   */
  logout() {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return true;
    } catch (err) {
      console.error('Error logging out:', err);
      return false;
    }
  },

  /**
   * Seamlessly elevates a user's role (e.g. from Student to Organizer)
   */
  elevateRole(userId, newRole = 'Organizer') {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    users[index].role = newRole;
    this.saveUsers(users);

    const safeUser = { ...users[index] };
    delete safeUser.passwordHash;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
    return safeUser;
  },

  /**
   * Updates user profile
   */
  updateUser(updatedUser) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === updatedUser.id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updatedUser
    };
    this.saveUsers(users);

    const safeUser = { ...users[index] };
    delete safeUser.passwordHash;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
    return safeUser;
  },

  /**
   * Returns pre-filled demo student credentials for one-click testing
   */
  getDemoCredentials() {
    return {
      email: DEMO_STUDENT.email,
      password: DEMO_PASSWORD_PLAIN
    };
  }
};

