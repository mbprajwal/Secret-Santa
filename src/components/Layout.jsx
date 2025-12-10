import React from 'react';
import { Gift } from 'lucide-react';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-winter-blue to-white text-gray-800 font-sans selection:bg-santa-red selection:text-white">
            <nav className="p-6">
                <div className="max-w-4xl mx-auto flex items-center gap-2 text-santa-red font-bold text-xl">
                    <Gift className="w-6 h-6" />
                    <span>Secret Santa Secure</span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12 pb-24">
                {children}
            </main>

            <footer className="fixed bottom-0 w-full py-6 text-center text-sm text-gray-400 bg-white/80 backdrop-blur-sm border-t border-gray-100">
                <p>Built securely with client-side encryption.</p>
            </footer>
        </div>
    );
}
