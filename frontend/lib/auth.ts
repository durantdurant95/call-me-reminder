/**
 * Mock Authentication Service
 *
 * This is a demo authentication system using localStorage.
 * NOT for production use - for demonstration purposes only.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

const AUTH_STORAGE_KEY = "call-me-reminder-auth";
const USERS_STORAGE_KEY = "call-me-reminder-users";

// Initialize with a demo user for testing
const initializeDemoUser = () => {
  const users = getStoredUsers();
  if (users.length === 0) {
    const demoUser = {
      id: "1",
      email: "demo@example.com",
      password: "demo123",
      name: "Demo User",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([demoUser]));
  }
};

const getStoredUsers = () => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const authService = {
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    const auth = localStorage.getItem(AUTH_STORAGE_KEY);
    return !!auth;
  },

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    const auth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!auth) return null;

    try {
      const { user } = JSON.parse(auth);
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<{ user: User }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    initializeDemoUser();
    const users = getStoredUsers();
    const userRecord = users.find(
      (u: StoredUser) => u.email === email && u.password === password,
    );

    if (!userRecord) {
      throw new Error("Invalid email or password");
    }

    const user: User = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
      avatar: userRecord.avatar,
      createdAt: userRecord.createdAt,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));

    // Also set a cookie for middleware
    document.cookie = `call-me-reminder-auth=${user.id}; path=/; max-age=2592000`; // 30 days

    return { user };
  },

  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: User }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    initializeDemoUser();
    const users = getStoredUsers();

    // Check if user already exists
    if (users.some((u: StoredUser) => u.email === data.email)) {
      throw new Error("User with this email already exists");
    }

    const newUser = {
      id: String(users.length + 1),
      email: data.email,
      password: data.password,
      name: data.name,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const user: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user }));

    // Also set a cookie for middleware
    document.cookie = `call-me-reminder-auth=${user.id}; path=/; max-age=2592000`; // 30 days

    return { user };
  },

  /**
   * Logout current user
   */
  logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Clear cookie
    document.cookie = "call-me-reminder-auth=; path=/; max-age=0";
  },

  /**
   * Update user profile
   */
  async updateProfile(data: { name?: string; avatar?: string }): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error("Not authenticated");
    }

    const updatedUser = {
      ...currentUser,
      ...(data.name && { name: data.name }),
      ...(data.avatar && { avatar: data.avatar }),
    };

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user: updatedUser }),
    );

    // Update in users storage
    const users = getStoredUsers();
    const userIndex = users.findIndex(
      (u: StoredUser) => u.id === currentUser.id,
    );
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...data };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    return updatedUser;
  },
};
