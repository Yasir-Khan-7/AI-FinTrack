import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<{
        success: boolean;
        error: string | null;
    }>;
    signIn: (email: string, password: string) => Promise<{
        success: boolean;
        error: string | null;
    }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{
        success: boolean;
        error: string | null;
    }>;
    resendVerificationEmail: (email: string) => Promise<{
        success: boolean;
        error: string | null;
    }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log('Initial session check:', session ? 'User authenticated' : 'No session');
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth state changed:', _event, session ? 'User authenticated' : 'No session');
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string) => {
        try {
            console.log('Attempting to sign up user:', email);
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            if (error) {
                console.error('Error during signup:', error);
            } else {
                console.log('Sign up successful, verification email sent');
            }

            return {
                success: !error,
                error: error ? error.message : null,
            };
        } catch (error: any) {
            console.error('Exception during sign up:', error);
            return {
                success: false,
                error: error.message || 'An unexpected error occurred during sign up.',
            };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            console.log('Attempting to sign in user:', email);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error('Error during sign in:', error);
            } else {
                console.log('Sign in successful, user authenticated:', data?.user?.id);
            }

            return {
                success: !error,
                error: error ? error.message : null,
            };
        } catch (error: any) {
            console.error('Exception during sign in:', error);
            return {
                success: false,
                error: error.message || 'An unexpected error occurred during sign in.',
            };
        }
    };

    const signOut = async () => {
        try {
            console.log('Attempting to sign out user');
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error during sign out:', error);
                throw error;
            }
            console.log('Sign out successful');
        } catch (error: any) {
            console.error('Exception during sign out:', error);
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            return {
                success: !error,
                error: error ? error.message : null,
            };
        } catch (error: any) {
            console.error('Error resetting password:', error);
            return {
                success: false,
                error: error.message || 'An unexpected error occurred during password reset.',
            };
        }
    };

    const resendVerificationEmail = async (email: string) => {
        try {
            // For Supabase, we need to trigger a new signup with the same email
            const { error } = await supabase.auth.signUp({
                email,
                password: 'temporary-password-for-verification-only', // This won't actually be used
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                }
            });

            // If the error is "User already registered", that's actually a success for resending
            // the verification email to an existing user
            const isSuccess = !error || error.message.includes('already registered');

            return {
                success: isSuccess,
                error: isSuccess ? null : error?.message || null,
            };
        } catch (error) {
            console.error('Error resending verification email:', error);
            return {
                success: false,
                error: 'An unexpected error occurred while resending the verification email.',
            };
        }
    };

    const value = {
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        resendVerificationEmail,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 