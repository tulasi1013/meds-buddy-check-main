import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { auth } from '@/lib/supabase';

type SignInCredentials = {
  email: string;
  password: string;
};

type SignUpCredentials = SignInCredentials & {
  name: string;
};

type AuthResponse = {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse>;
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and set the user
    const getInitialSession = async () => {
      try {
        const session = await auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for changes in authentication state
    const unsubscribe = auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Wrapper functions to match the expected signatures
  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const { data, error } = await auth.signIn({ email, password });
      return { 
        user: data?.user ?? null, 
        session: data?.session ?? null, 
        error: error ?? null 
      };
    } catch (error) {
      return { 
        user: null, 
        session: null, 
        error: error as AuthError 
      };
    }
  };

  const signUp = async ({ email, password, name }: SignUpCredentials) => {
    try {
      const { data, error } = await auth.signUp({ email, password, name });
      return { 
        user: data?.user ?? null, 
        session: data?.session ?? null, 
        error: error ?? null 
      };
    } catch (error) {
      return { 
        user: null, 
        session: null, 
        error: error as AuthError 
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await auth.signOut();
      return { error: error ?? null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
