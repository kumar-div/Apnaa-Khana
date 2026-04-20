"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  userName: string;
  userEmail: string;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalCallback: (() => void) | null;
  setAuthModalCallback: (cb: (() => void) | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalCallback, setAuthModalCallback] = useState<(() => void) | null>(null);

  const fetchRole = async (user: User | null, session: Session | null) => {
    if (!user) {
      setState({ user: null, session: null, isLoading: false, isAdmin: false });
      return;
    }

    try {
      // Securely check admin role from DB (bypassing easily tampered user_metadata)
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      const isAdmin = !error && data?.role === 'admin';

      setState({ user, session, isLoading: false, isAdmin });
    } catch (err) {
      console.error("Exception fetching role:", err);
      setState({ user, session, isLoading: false, isAdmin: false });
    }
  };

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION on mount — no need for separate getSession()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        fetchRole(session?.user ?? null, session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalCallback(null);
  }, []);

  const userName = state.user?.user_metadata?.full_name || state.user?.email?.split("@")[0] || "";
  const userEmail = state.user?.email || "";

  return (
    <AuthContext.Provider value={{
      ...state,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      userName,
      userEmail,
      openAuthModal,
      closeAuthModal,
      isAuthModalOpen,
      authModalCallback,
      setAuthModalCallback,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
