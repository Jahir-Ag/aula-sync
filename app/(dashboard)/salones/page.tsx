'use client';
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useState } from "react";

const mockClassrooms = [
    { id: "1", name: "5to A", members: 10 },
    { id: "2", name: "Matemáticas", members: 8 }
];

export default function DashboardPage() {
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("crear salon");
        setShowCreate(false);
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("unirse a salon");
        setShowJoin(false);
    };

    return (
        <Container>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Mis Salones</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowJoin(true)}>Unirse con código</Button>
                    <Button onClick={() => setShowCreate(true)}>Crear salón</Button>
                </div>
            </div>

            {showCreate && (
                <Card className="mb-8 border-blue-200 bg-blue-50">
                    <h2 className="text-xl font-semibold mb-4">Nuevo Salón</h2>
                    <form onSubmit={handleCreate} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del salón</label>
                            <Input placeholder="Ej. 1ro B - Ciencias" required />
                        </div>
                        <Button type="submit">Crear</Button>
                        <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
                    </form>
                </Card>
            )}

            {showJoin && (
                <Card className="mb-8 border-green-200 bg-green-50">
                    <h2 className="text-xl font-semibold mb-4">Unirse a un salón</h2>
                    <form onSubmit={handleJoin} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Código de invitación</label>
                            <Input placeholder="ABC123" required />
                        </div>
                        <Button type="submit">Unirse</Button>
                        <Button variant="outline" onClick={() => setShowJoin(false)}>Cancelar</Button>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockClassrooms.map((classroom) => (
                    <Card key={classroom.id} className="flex flex-col justify-between hover:border-blue-300 transition-colors">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{classroom.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">{classroom.members} miembros</p>
                        </div>
                        <Link href={`/salon/${classroom.id}`} className="w-full">
                            <Button variant="outline" className="w-full">Ver salón</Button>
                        </Link>
                    </Card>
                ))}
            </div>
        </Container>
    );
}
