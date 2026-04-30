import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
    const hasBg = className.includes('bg-');
    return (
        <div 
            className={`${hasBg ? '' : 'bg-white'} rounded-2xl shadow-sm border border-gray-200 p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
