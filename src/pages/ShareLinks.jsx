import React, { useState } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { Copy, Check, ExternalLink, Mail } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { sendEmails } from '../lib/api';

export default function ShareLinks() {
    const location = useLocation();
    const [copiedId, setCopiedId] = useState(null);

    // Blind Mode state - default to true to protect the host
    const [isBlindMode, setIsBlindMode] = useState(true);

    // Email modal state
    const [emailStatus, setEmailStatus] = useState('idle'); // idle, sending, success, error
    const [emailResult, setEmailResult] = useState('');
    const [showModal, setShowModal] = useState(false);

    if (!location.state?.matches) {
        return <Navigate to="/" replace />;
    }

    const { matches } = location.state;

    const copyLink = (id, key, encryptedMatch, iv) => {
        // Determine base URL (prefer VITE_PUBLIC_URL if set, else origin)
        const baseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
        // STATELESS: Embed encryption data in URL
        const dataPayload = encodeURIComponent(JSON.stringify({ e: encryptedMatch, i: iv }));
        const url = `${baseUrl}/reveal/${id}?data=${dataPayload}#${key}`;

        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSendAllEmails = async () => {
        try {
            setEmailStatus('sending');

            const baseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;

            const notifications = matches.filter(m => m.email).map(m => {
                const dataPayload = encodeURIComponent(JSON.stringify({ e: m.encryptedMatch, i: m.iv }));
                return {
                    name: m.name,
                    email: m.email,
                    link: `${baseUrl}/reveal/${m.id}?data=${dataPayload}#${m.key}`
                };
            });

            if (notifications.length === 0) {
                throw new Error("No participants have email addresses.");
            }

            await sendEmails(notifications);
            setEmailStatus('success');
            setEmailResult(`Successfully sent ${notifications.length} emails!`);
        } catch (err) {
            console.error(err);
            setEmailStatus('error');
            setEmailResult(err.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-santa-green rounded-full mb-2">
                    <Check className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Pairs Generated!</h2>

                {isBlindMode ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-lg mx-auto">
                        <p className="text-yellow-800 font-medium">🙈 Blind Mode Active</p>
                        <p className="text-yellow-700 text-sm mt-1">
                            Links are hidden so you don't accidentally see who got whom!
                            Use the email button below to send them automatically.
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-500">
                        Send each person their unique link.
                    </p>
                )}

                <div className="pt-4 flex flex-col items-center gap-4">
                    <Button
                        onClick={() => setShowModal(true)}
                        className="w-full md:w-auto min-w-[200px] text-lg py-4 shadow-lg shadow-santa-red/20"
                    >
                        <Mail className="w-5 h-5 mr-2" />
                        Send Emails to All
                    </Button>

                    <button
                        onClick={() => setIsBlindMode(!isBlindMode)}
                        className="text-sm text-gray-400 hover:text-gray-600 underline"
                    >
                        {isBlindMode ? "Show Links (Spoiler Warning!)" : "Hide Links (Blind Mode)"}
                    </button>
                </div>
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Send Reveal Links">
                <div className="space-y-4">
                    {emailStatus === 'idle' && (
                        <>
                            <p className="text-gray-600">
                                This will send an automatic email to all participants who provided an email address.
                                <br />
                                <span className="text-xs text-orange-600 font-bold">
                                    Note: The server will temporarily process the secret links to send them.
                                </span>
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button onClick={handleSendAllEmails}>Send Emails</Button>
                            </div>
                        </>
                    )}

                    {emailStatus === 'sending' && (
                        <div className="text-center py-8">
                            <div className="animate-spin w-8 h-8 border-4 border-santa-red border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p>Sending emails...</p>
                        </div>
                    )}

                    {emailStatus === 'success' && (
                        <div className="text-center space-y-4">
                            <div className="text-green-600 font-bold text-lg">Sent!</div>
                            <p>{emailResult}</p>
                            <Button onClick={() => setShowModal(false)}>Close</Button>
                        </div>
                    )}

                    {emailStatus === 'error' && (
                        <div className="text-center space-y-4">
                            <div className="text-red-600 font-bold">Failed</div>
                            <p className="text-sm text-gray-600">{emailResult}</p>
                            <Button variant="secondary" onClick={() => setEmailStatus('idle')}>Try Again</Button>
                        </div>
                    )}
                </div>
            </Modal>

            {!isBlindMode && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100 animate-in fade-in duration-300">
                    <div className="p-4 bg-gray-50 rounded-t-2xl border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Manual Links</h3>
                    </div>
                    {matches.map((m) => (
                        <div key={m.id} className="p-4 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{m.name}</h3>
                                <p className="text-xs text-gray-400 font-mono truncate">
                                    .../reveal/{m.id.slice(0, 8)}...
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <a
                                    href={`mailto:${m.email || ''}?subject=Your Secret Santa Match!&body=Hi ${m.name},%0D%0A%0D%0AHere is your Secret Santa link:%0D%0A${window.location.origin}/reveal/${m.id}?data=${encodeURIComponent(JSON.stringify({ e: m.encryptedMatch, i: m.iv }))}%23${m.key}%0D%0A%0D%0APlease open it privately.%0D%0A`}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gray-50 text-gray-700 hover:bg-gray-100"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Draft
                                </a>
                                <button
                                    onClick={() => copyLink(m.id, m.key, m.encryptedMatch, m.iv)}
                                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${copiedId === m.id
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }
                    `}
                                >
                                    {copiedId === m.id ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="text-center pt-8">
                <Link to="/" className="text-santa-red hover:underline text-sm font-medium">
                    Start New Group
                </Link>
            </div>

            {!isBlindMode && (
                <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 flex gap-2">
                    <span className="font-bold">Note:</span>
                    These links contain the encryption keys. Do not share the whole list with anyone else!
                </div>
            )}
        </div>
    );
}
