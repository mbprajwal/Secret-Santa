import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({ children, onClick, disabled, loading, variant = 'primary', className = '' }) {
    const baseStyles = "flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-santa-red text-white hover:bg-red-700 focus:ring-santa-red shadow-lg shadow-red-200",
        secondary: "bg-white text-gray-800 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 focus:ring-gray-200",
        outline: "bg-transparent border-2 border-white text-white hover:bg-white/10"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            {children}
        </button>
    );
}
