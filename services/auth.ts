import { supabase } from '@/lib/supabaseClient';

export async function loginWithGoogle() {
  try {
    const res = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Use NEXT_PUBLIC_APP_URL to support both local dev and production (Vercel).
        redirectTo:
          process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
            : `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      },
    });

    // Return the result to the caller so the UI layer can perform navigation
    // using the framework's router if needed. Do not perform manual window
    // redirects here to keep the service layer free of side effects.
    return res;
  } catch (error) {
    console.error('Error logging in with Google:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}
