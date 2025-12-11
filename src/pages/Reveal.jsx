import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Gift, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
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

            // 2. GET ENCRYPTED BLOB FROM URL (Stateless)
            const queryParams = new URLSearchParams(window.location.search);
            const dataStr = queryParams.get('data');

            if (!dataStr) {
                throw new Error("Missing match data in link.");
            }

            const data = JSON.parse(decodeURIComponent(dataStr));
            // data: { e: encryptedMatch, i: iv } (shortened keys for URL length)

            if (!data.e || !data.i) {
                throw new Error("Invalid match data format.");
            }

            // 3. Decrypt
            const key = await importKey(hashKey);
            const iv = base64ToArrayBuffer(data.i);
            const ciphertext = base64ToArrayBuffer(data.e);

            const decryptedString = await decrypt(ciphertext, key, iv);
            let matchName = decryptedString;

            // Try to parse as JSON (new format with expiry)
            try {
                const data = JSON.parse(decryptedString);
                if (data.expiry && Date.now() > data.expiry) {
                    throw new Error("EXPIRED");
                }
                matchName = data.text || decryptedString;
            } catch (e) {
                if (e.message === "EXPIRED") {
                    throw e; // Re-throw expiry error
                }
                // If not JSON, assume legacy format (just plain text) -> valid
            }

            setMatchName(matchName);
            setStatus('revealed');

            // Confetti!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#D42426', '#165B33', '#ffffff'] // Red, Green, White
            });

            // If not JSON, assume legacy format (just plain text) -> valid
        } catch (err) {
            console.error(err);
            setStatus('error');
            if (err.message === "EXPIRED") {
                setErrorMsg('This link has expired. Secret Santa links are only valid for 10 minutes.');
            } else {
                setErrorMsg('This link is invalid or corrupted. Please check if you copied the full URL.');
            }
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
