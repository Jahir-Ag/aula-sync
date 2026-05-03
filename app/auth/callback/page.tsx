'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // With detectSessionInUrl enabled the Supabase client should have
        // parsed the OAuth callback and persisted the session. Check the
        // current session and redirect accordingly.
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          router.replace('/salones');
          return;
        }
        router.replace('/login');
      } catch (error) {
        console.error('Error in auth callback:', error);
        router.replace('/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Autenticando...</p>
    </div>
  );
}
