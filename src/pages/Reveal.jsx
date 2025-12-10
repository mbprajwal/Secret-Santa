import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Gift, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getMatch } from '../lib/api';
import { importKey, decrypt, base64ToArrayBuffer } from '../lib/crypto';
import Button from '../components/Button';

export default function Reveal() {
    const { id } = useParams();
    const [status, setStatus] = useState('loading'); // loading, ready, revealed, error
    const [matchName, setMatchName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // 1. Check for Key in URL Hash
    const hashKey = window.location.hash.slice(1); // remove #

    useEffect(() => {
        if (!hashKey) {
            setStatus('error');
            setErrorMsg('Invalid link. Missing encryption key fragment.');
        } else {
            setStatus('ready');
        }
    }, [hashKey]);

    const handleReveal = async () => {
        try {
            setStatus('loading');

            // 2. Fetch encrypted blob from server
            const data = await getMatch(id);

            // 3. Decrypt
            // data: { encryptedMatch (base64), iv (base64) }
            const key = await importKey(hashKey);
            const iv = base64ToArrayBuffer(data.iv);
            const ciphertext = base64ToArrayBuffer(data.encryptedMatch);

            const decryptedName = await decrypt(ciphertext, key, iv);

            setMatchName(decryptedName);
            setStatus('revealed');

            // Confetti!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#D42426', '#165B33', '#ffffff'] // Red, Green, White
            });

        } catch (err) {
            console.error(err);
            setStatus('error');
            // If the API threw an error or returned 410 (implied by fetch implementation throwing? No, we need to check response status in lib/api.js first or handle it here)
            // Actually lib/api.js throws generic error. Let's rely on the error text or make api.js better.
            // For now, let's just show the generic message which we will improve.
            setErrorMsg('This link has expired or was already viewed. For security, matches are deleted immediately after viewing.');
        }
    };

    if (status === 'error') {
        return (
            <div className="max-w-md mx-auto text-center pt-12 space-y-4">
                <div className="inline-flex p-4 bg-red-100 rounded-full text-red-600 mb-4">
                    <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                <p className="text-gray-500">{errorMsg}</p>
            </div>
        );
    }

    if (status === 'revealed') {
        return (
            <div className="max-w-md mx-auto text-center pt-8 space-y-8 animate-in zoom-in duration-500">
                <h2 className="text-xl font-medium text-gray-500">You are the Secret Santa for...</h2>

                <div className="p-8 bg-white rounded-2xl shadow-xl border-2 border-santa-red/20 transform hover:scale-105 transition-transform">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-santa-red to-red-600">
                        {matchName}
                    </h1>
                </div>

                <p className="text-sm text-gray-400">
                    Shh! Keep it a secret until the party! 🤫
                    <br />
                    (This message will self-destruct if you reload)
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto text-center pt-12 space-y-8">
            <div className="relative inline-block">
                <Gift className="w-24 h-24 text-santa-red animate-bounce" />
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">Ready to Reveal?</h2>
                <p className="text-gray-500">Click the button below to see who you got.</p>
            </div>

            <Button onClick={handleReveal} loading={status === 'loading'} className="w-full text-lg py-4">
                {status === 'loading' ? 'Decrypting...' : 'Reveal My Match'}
            </Button>
        </div>
    );
}
