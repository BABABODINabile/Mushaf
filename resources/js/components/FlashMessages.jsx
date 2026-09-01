import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { XIcon } from './Icons';

let idCounter = 0;

/**
 * Affiche les messages flash Inertia (success/error) en haut à droite.
 * Auto-fermeture après 5s + bouton manuel.
 * Lit usePage().props.flash.success / .error (lazy getters du middleware).
 */
export default function FlashMessages() {
    const { flash } = usePage().props;
    const [messages, setMessages] = useState([]);
    const [leaving, setLeaving] = useState({});

    useEffect(() => {
        const next = [];
        if (flash?.success) next.push({ type: 'success', text: flash.success });
        if (flash?.error) next.push({ type: 'error', text: flash.error });
        if (next.length) {
            setMessages((prev) => [...prev, ...next.map((m) => ({ ...m, id: ++idCounter }))]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash?.success, flash?.error]);

    useEffect(() => {
        if (messages.length === 0) return;
        const timers = messages.map((msg) =>
            setTimeout(() => {
                setLeaving((prev) => ({ ...prev, [msg.id]: true }));
                setTimeout(() => {
                    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                    setLeaving((prev) => {
                        const n = { ...prev };
                        delete n[msg.id];
                        return n;
                    });
                }, 180);
            }, 5000)
        );
        return () => timers.forEach((t) => clearTimeout(t));
    }, [messages]);

    function close(id) {
        setLeaving((prev) => ({ ...prev, [id]: true }));
        setTimeout(() => {
            setMessages((prev) => prev.filter((m) => m.id !== id));
            setLeaving((prev) => {
                const n = { ...prev };
                delete n[id];
                return n;
            });
        }, 180);
    }

    if (messages.length === 0) return null;

    return (
        <div className="fixed top-5 right-5 z-50 flex w-full max-w-sm flex-col gap-2.5">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl shadow-black/5 dark:shadow-black/20 ${
                        msg.type === 'success'
                            ? 'border-green-200/80 bg-white/95 text-green-800 dark:border-green-800 dark:bg-stone-800/95 dark:text-green-300'
                            : 'border-red-200/80 bg-white/95 text-red-800 dark:border-red-800 dark:bg-stone-800/95 dark:text-red-300'
                    }`}
                    style={{
                        animation: `${leaving[msg.id] ? 'toast-out' : 'toast-in'} 0.2s ease-out both`,
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                            msg.type === 'success'
                                ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                                : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400'
                        }`}
                    >
                        {msg.type === 'success' ? (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                        )}
                    </span>
                    <span className="flex-1 text-sm font-semibold">{msg.text}</span>
                    <button
                        type="button"
                        onClick={() => close(msg.id)}
                        className="shrink-0 rounded-lg p-1 transition hover:bg-black/5 dark:hover:bg-white/10"
                        aria-label="Fermer"
                    >
                        <XIcon className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
