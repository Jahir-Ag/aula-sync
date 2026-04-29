'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { loginWithGoogle } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (!authLoading && user) {
            router.replace('/salones');
        }
    }, [user, authLoading, router]);

    const handleLogin = async () => {
        try {
            setLoading(true);
            await loginWithGoogle();
        } catch (error) {
            console.error('Login failed:', error);
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <Container className="flex mt-20 items-center justify-center">
                <Card className="w-full max-w-md text-center py-12 px-8">
                    <p className="text-gray-500">Cargando...</p>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="flex mt-20 items-center justify-center">
            <Card className="w-full max-w-md text-center py-12 px-8">
                <h1 className="text-4xl font-bold text-blue-600 mb-2">AulaSync</h1>
                <p className="text-gray-600 mb-8">Organiza las tareas de tu salón escolar de forma simple y rápida.</p>

                <Button 
                    onClick={handleLogin} 
                    disabled={loading}
                    className="w-full py-3 text-lg"
                >
                    {loading ? 'Cargando...' : 'Continuar con Google'}
                </Button>
            </Card>
        </Container>
    );
}
