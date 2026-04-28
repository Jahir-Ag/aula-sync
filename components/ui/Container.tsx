import { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode, className?: string }) {
    return (
        <div className={`w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 ${className}`}>
            {children}
        </div>
    );
}
