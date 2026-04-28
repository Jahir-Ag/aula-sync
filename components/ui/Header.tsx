'use client';
import Link from "next/link";
import { Button } from "./Button";

export function Header() {
    const handleLogout = () => {
        console.log("logout");
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <Link href="/salones" className="text-xl font-bold tracking-tight text-blue-600">
                    AulaSync
                </Link>
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                        US
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="text-sm px-3 py-1.5 h-auto">
                        Salir
                    </Button>
                </div>
            </div>
        </header>
    );
}
