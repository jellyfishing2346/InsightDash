import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
        // Set token in localStorage for API calls
        localStorage.setItem('auth_token', token);
      },
      
      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
        localStorage.removeItem('auth_token');
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },
      
      // Check if token is still valid
      checkAuth: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          get().logout();
          return false;
        }
        
        try {
          // Verify token with backend
          const response = await fetch('/api/v1/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            set({ 
              user: userData, 
              token, 
              isAuthenticated: true 
            });
            return true;
          } else {
            get().logout();
            return false;
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          get().logout();
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
