'use client';
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
    const handleLogin = () => {
        console.log("login");
    };

    return (
        <Container className="flex mt-20 items-center justify-center">
            <Card className="w-full max-w-md text-center py-12 px-8">
                <h1 className="text-4xl font-bold text-blue-600 mb-2">AulaSync</h1>
                <p className="text-gray-600 mb-8">Organiza las tareas de tu salón escolar de forma simple y rápida.</p>

                <Button onClick={handleLogin} className="w-full py-3 text-lg">
                    Continuar con Google
                </Button>
            </Card>
        </Container>
    );
}
