import { supabase } from '@/services/supabase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  email: string | null;
  name: string | null;
  avatar: string | null;
};

type AuthContextType = {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: '762952098980-l53cuifr0eaavp64m16ifehj25gsl3qp.apps.googleusercontent.com',
      scopes: ['email', 'profile'],
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || null,
          name: session.user.user_metadata?.full_name || null,
          avatar: session.user.user_metadata?.avatar_url || null,
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || null,
            name: session.user.user_metadata?.full_name || null,
            avatar: session.user.user_metadata?.avatar_url || null,
          });
          setIsGuest(false);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) throw new Error('No ID token found');

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;
    } catch (error: any) {
      console.log('Google Sign-In error:', error.message);
      throw error;
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
  };

  const signOut = async () => {
    await GoogleSignin.signOut();
    await supabase.auth.signOut();
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{
      user, isGuest, isLoading, signInWithGoogle, continueAsGuest, signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}