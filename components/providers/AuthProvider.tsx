'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hydrate the auth store from localStorage
    const persistedState = localStorage.getItem('auth-storage');
    if (persistedState) {
      try {
        const { state } = JSON.parse(persistedState);
        if (state?.user) {
          // Convert roles array back to Set
          state.user.roles = new Set(state.user.roles);
        }
        useAuthStore.setState(state);
      } catch (error) {
        console.error('Failed to hydrate auth store:', error);
      }
    }
  }, []);

  return <>{children}</>;
}
