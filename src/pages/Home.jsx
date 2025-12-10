import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Snowflake, ShieldCheck, UserCheck } from 'lucide-react';
import Button from '../components/Button';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center text-center gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center justify-center p-3 bg-red-100 text-santa-red rounded-full mb-4">
                    <Snowflake className="w-8 h-8" />
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-gray-900">
                    The <span className="text-santa-red">Safest</span> Way to Play Secret Santa
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                    Host a Secret Santa group where no one—not even the server—knows who matched with whom.
                    Everything is encrypted in your browser.
                </p>
            </div>

            <Button onClick={() => navigate('/create')} className="text-lg px-8 py-4">
                Create a New Group
            </Button>

            <div className="grid md:grid-cols-3 gap-8 mt-12 w-full text-left">
                <Feature
                    icon={<ShieldCheck className="w-6 h-6 text-santa-green" />}
                    title="Zero Knowledge"
                    desc="Matches are generated and encrypted locally. The server only sees random gibberish."
                />
                <Feature
                    icon={<UserCheck className="w-6 h-6 text-santa-green" />}
                    title="No Accounts"
                    desc="No signups required. Just create a group, share links, and you're done."
                />
                <Feature
                    icon={<Snowflake className="w-6 h-6 text-santa-green" />}
                    title="Fair Play"
                    desc="Uses cryptographically secure random shuffling to ensure fair, random pairs."
                />
            </div>
        </div>
    );
}

function Feature({ icon, title, desc }) {
    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="mb-4">{icon}</div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-gray-500 leading-snug">{desc}</p>
        </div>
    );
}
