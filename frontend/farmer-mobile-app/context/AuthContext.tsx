// frontend/farmer-mobile-app/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useSegments, useRouter } from 'expo-router';

interface User {
  user_id: string;
  phone_number: string;
  role: 'farmer' | 'chc_staff' | 'gov_admin';
  full_name?: string | null;
  created_at: string;
}

interface AuthContextType {
  session: {
    token: string | null;
    user: User | null;
  };
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

function useProtectedRoute(session: AuthContextType['session'], isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until router segments are ready and auth state is loaded
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session.token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session.token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [segments, session.token, isLoading]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthContextType['session']>({
    token: null,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load session from SecureStore
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        const userJson = await SecureStore.getItemAsync(USER_KEY);
        if (token && userJson) {
          setSession({ token, user: JSON.parse(userJson) });
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  useProtectedRoute(session, isLoading);

  const authContextValue: AuthContextType = {
    session,
    isLoading,
    signIn: async (token: string, user: User) => {
      setSession({ token, user });
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    },
    signOut: async () => {
      setSession({ token: null, user: null });
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      // Redirection handled by useProtectedRoute automatically
    },
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
