import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const DEMO_USERS: Record<string, User> = {
  'citizen@demo': {
    id: 'citizen-1',
    email: 'Raju@gmail.com',
    role: 'citizen',
    name: 'Sarvesh Sapkal',
    ecoPoints: 120,
  },
  'collector@demo': {
    id: 'collector-1',
    email: 'Pratham@gmail.com',
    role: 'collector',
    name: 'Laukika Shinde',
    totalWasteCollected: 45,
  },
  'municipal@demo': {
    id: 'municipal-1',
    email: 'harsh@gmail.com',
    role: 'municipality',
    name: 'Shalvi Maheshwari',
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (password === 'password123' && DEMO_USERS[email]) {
          const user = DEMO_USERS[email];
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: 'auth-storage', // persists in localStorage
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
