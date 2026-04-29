'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase maneja automáticamente el callback
        // Solo necesitamos verificar la sesión y redirigir
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          router.replace('/salones');
        } else {
          router.replace('/login');
        }
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
