import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "outline";
}

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
    const baseStyle = "px-4 py-2 rounded-2xl font-medium transition-colors focus:outline-none";
    let variantStyle = "";

    switch (variant) {
        case "primary":
            variantStyle = "bg-blue-600 text-white hover:bg-blue-700";
            break;
        case "secondary":
            variantStyle = "bg-gray-100 text-gray-900 hover:bg-gray-200";
            break;
        case "outline":
            variantStyle = "border border-gray-300 text-gray-700 hover:bg-gray-50";
            break;
    }

    return (
        <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
            {children}
        </button>
    );
}
