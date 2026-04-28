'use client';
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const mockTasks = [
    { id: "1", title: "Matemáticas pág 10", due_date: "mañana", author: "Juan P." },
    { id: "2", title: "Historia resumen", due_date: "mañana", author: "María G." }
];

export default function SalonPage() {
    const params = useParams();
    const [showCreate, setShowCreate] = useState(false);

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("crear tarea");
        setShowCreate(false);
    };

    return (
        <Container>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Link href="/salones" className="text-sm text-blue-600 hover:underline mb-1 inline-block">
                        &larr; Volver a Mis Salones
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Salón {params.id}</h1>
                </div>
                <Button variant="outline">Ajustes</Button>
            </div>

            <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Tareas de mañana</h2>
                <Button onClick={() => setShowCreate(true)}>+ Crear tarea</Button>
            </div>

            {showCreate && (
                <Card className="mb-8 border-blue-200 bg-blue-50">
                    <h3 className="text-lg font-semibold mb-4">Nueva Tarea</h3>
                    <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <Input placeholder="Ej. Leer capítulo 3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                            <Input placeholder="Detalles de la tarea..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de entrega</label>
                            <Input type="date" required />
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
                            <Button type="submit">Guardar</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-4">
                {mockTasks.length > 0 ? (
                    mockTasks.map(task => (
                        <Card key={task.id} className="flex justify-between items-center py-4">
                            <div>
                                <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
                                <p className="text-sm text-gray-500">Para: {task.due_date} • Creado por: {task.author}</p>
                            </div>
                        </Card>
                    ))
                ) : (
                    <p className="text-gray-500 py-8 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                        No hay tareas para mañana.
                    </p>
                )}
            </div>
        </Container>
    );
}
