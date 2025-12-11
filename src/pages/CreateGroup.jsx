import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import { generateSecretSantaPairs } from '../lib/pairing';

export default function CreateGroup() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [participants, setParticipants] = useState([
        { name: '', email: '' },
        { name: '', email: '' },
        { name: '', email: '' }
    ]);
    const [error, setError] = useState('');

    const addParticipant = () => {
        setParticipants([...participants, { name: '', email: '' }]);
    };

    const removeParticipant = (index) => {
        if (participants.length <= 2) return;
        const newP = [...participants];
        newP.splice(index, 1);
        setParticipants(newP);
    };

    const updateParticipant = (index, field, value) => {
        const newP = [...participants];
        newP[index][field] = value;
        setParticipants(newP);
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setLoading(true);

            // Validation
            const validParticipants = participants.filter(p => p.name.trim() !== '');
            if (validParticipants.length < 2) {
                throw new Error('You need at least 2 participants with names.');
            }

            const names = new Set(validParticipants.map(p => p.name.trim()));
            if (names.size !== validParticipants.length) {
                throw new Error('All names must be unique.');
            }

            // 1. Generate local pairings and keys
            const matches = await generateSecretSantaPairs(validParticipants);

            // 2. Prepare payload for server
            // STATELESS MODE: We skip server storage.
            // All data will be encoded in the links generated in ShareLinks.

            // 3. Navigate to share page with the secure data state
            navigate('/share', { state: { matches } });

        } catch (err) {
            console.error(err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">Add Participants</h2>
                <p className="text-gray-500 mt-2">Enter the names of everyone joining.</p>
            </div>

            <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                {participants.map((p, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <span className="mt-3 text-sm font-mono text-gray-400 w-6 text-center">{i + 1}</span>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                                placeholder="Name (e.g. Alice)"
                                value={p.name}
                                onChange={(e) => updateParticipant(i, 'name', e.target.value)}
                            />
                            <Input
                                placeholder="Email (Optional)"
                                value={p.email}
                                onChange={(e) => updateParticipant(i, 'email', e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => removeParticipant(i)}
                            disabled={participants.length <= 2}
                            className="mt-2 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-0"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}

                <button
                    onClick={addParticipant}
                    className="flex items-center gap-2 text-sm font-semibold text-santa-green hover:text-green-800 transition-colors mt-2 px-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Another Person
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            <div className="flex justify-center pt-4">
                <Button onClick={handleSubmit} loading={loading} className="w-full md:w-auto min-w-[200px]">
                    Generate Matches
                </Button>
            </div>

            <p className="text-center text-xs text-gray-400">
                Clicking generate will shuffle names locally and encrypt them before sending anything to the server.
            </p>
        </div>
    );
}
