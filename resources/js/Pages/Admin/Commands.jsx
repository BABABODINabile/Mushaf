import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { PageHeader } from '../../components/AdminUI';
import { TerminalIcon, SpinnerIcon, CheckIcon, XIcon, PlayIcon, ChevronDownIcon } from '../../components/Icons';
import { useConfirm } from '../../components/ConfirmDialog';

const COLORS = {
    teal: 'from-teal-500 to-teal-700', blue: 'from-blue-500 to-blue-700', amber: 'from-amber-500 to-amber-700',
    purple: 'from-purple-500 to-purple-700', rose: 'from-rose-500 to-rose-700', indigo: 'from-indigo-500 to-indigo-700',
    green: 'from-green-500 to-green-700',
};

function StatusBadge({ status }) {
    const map = {
        running: { label: 'En cours', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500 animate-pulse' },
        success: { label: 'Réussi', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', dot: 'bg-green-500' },
        failed: { label: 'Échec', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', dot: 'bg-red-500' },
    };
    const s = map[status] || map.running;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
}

function OptionControl({ spec, name, value, onChange }) {
    if (spec.type === 'boolean') {
        return (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-700 dark:text-stone-300">
                <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onChange(name, e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-teal-600 focus:ring-teal-500/40"
                />
                {spec.label}
            </label>
        );
    }

    if (spec.type === 'select') {
        return (
            <label className="block text-sm text-stone-600 dark:text-stone-400">
                <span className="mb-1.5 block font-medium">{spec.label}</span>
                <div className="relative">
                    <select
                        value={value}
                        onChange={(e) => onChange(name, Number(e.target.value))}
                        className="w-full appearance-none rounded-xl border border-stone-200 bg-white py-2 pl-3 pr-9 text-sm text-stone-800 shadow-sm transition hover:border-stone-300 focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:border-stone-600 dark:focus:border-teal-600"
                    >
                        {(spec.choices || []).map((choice) => (
                            <option key={`${name}-${choice}`} value={choice}>{choice}</option>
                        ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                </div>
            </label>
        );
    }

    if (spec.type === 'number') {
        return (
            <label className="block text-sm text-stone-600 dark:text-stone-400">
                <span className="mb-1.5 block font-medium">{spec.label}</span>
                <input
                    type="number"
                    min={spec.min}
                    max={spec.max}
                    value={value ?? ''}
                    onChange={(e) => onChange(name, e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 shadow-sm focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                />
            </label>
        );
    }

    return null;
}

function CommandCard({ command, runningKeys, onLaunch }) {
    const defaults = Object.fromEntries(
        Object.entries(command.options).map(([name, spec]) => [name, spec.default ?? (spec.type === 'boolean' ? false : '')])
    );
    const [options, setOptions] = useState(defaults);
    const grad = COLORS[command.color] || COLORS.teal;
    const isRunning = runningKeys.includes(command.key);
    const hasOptions = Object.keys(command.options).length > 0;

    function setOption(name, value) {
        setOptions((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <div className="admin-card-shine relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white p-5 shadow-sm shadow-stone-200/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-300/30 dark:border-stone-700/70 dark:bg-stone-900 dark:shadow-none">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${grad} opacity-[0.07] blur-2xl`} />
            <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${grad} text-white shadow`}>
                            <TerminalIcon className="h-4 w-4" />
                        </span>
                        <h3 className="text-base font-bold tracking-tight text-stone-800 dark:text-stone-200">{command.label}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">{command.description}</p>
                    <code className="mt-2 inline-block rounded-lg bg-stone-100 px-2 py-1 font-mono text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                        php artisan {command.command}
                    </code>
                </div>
            </div>

            {hasOptions && (
                <div className="relative mt-4 space-y-3 rounded-xl bg-stone-50 p-3.5 dark:bg-stone-800/60">
                    {Object.entries(command.options).map(([name, spec]) => (
                        <OptionControl key={name} spec={spec} name={name} value={options[name]} onChange={setOption} />
                    ))}
                </div>
            )}

            <div className="relative mt-4">
                <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => onLaunch(command, options)}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${grad} px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0`}
                >
                    {isRunning ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : <PlayIcon className="h-4 w-4" />}
                    {isRunning ? 'En cours…' : 'Lancer la commande'}
                </button>
            </div>
        </div>
    );
}

export default function Commands({ commands, runs }) {
    const confirm = useConfirm();
    const [active, setActive] = useState(null);
    const [runningKeys, setRunningKeys] = useState(runs.filter((r) => r.status === 'running').map((r) => r.command_key));
    const [history, setHistory] = useState(runs);
    const [polling, setPolling] = useState(false);
    const logRef = useRef(null);
    const pollTimer = useRef(null);

    const stopPolling = useCallback(() => {
        if (pollTimer.current) {
            clearInterval(pollTimer.current);
            pollTimer.current = null;
        }
        setPolling(false);
    }, []);

    const poll = useCallback(async (runId) => {
        setPolling(true);
        pollTimer.current = setInterval(async () => {
            try {
                const res = await fetch(`/admin/commands/runs/${runId}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setHistory((prev) => prev.map((r) => (r.id === runId ? data.run : r)));

                if (data.run.status !== 'running') {
                    stopPolling();
                    setActive((prev) => (prev?.id === runId ? { ...prev, ...data.run } : prev));
                    setRunningKeys((prev) => prev.filter((k) => k !== data.run.command_key));
                }
            } catch {
                stopPolling();
            }
        }, 2000);
    }, [stopPolling]);

    useEffect(() => {
        return () => stopPolling();
    }, [stopPolling]);

    async function handleLaunch(command, options) {
        const destructive = command.command === 'mushaf:import-quran' || command.command === 'mushaf:import-hadiths';
        const ok = await confirm({
            icon: TerminalIcon,
            title: `Lancer « ${command.label} » ?`,
            message: destructive
                ? 'Cette commande importe des données en base. Vérifie que tu lances la bonne commande avant de continuer.'
                : 'La commande sera lancée en arrière-plan et le log s\'affichera en direct ci-dessous.',
            confirmLabel: 'Lancer',
            tone: destructive ? 'danger' : 'default',
        });

        if (!ok) return;

        try {
            const res = await fetch('/admin/commands/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ command: command.key, options }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Échec du lancement.');

            setActive(data.run);
            setHistory((prev) => [data.run, ...prev].slice(0, 10));
            setRunningKeys((prev) => [...prev, data.run.command_key]);
            poll(data.run.id);
        } catch (err) {
            alert(err.message);
        }
    }

    useEffect(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [active?.log]);

    return (
        <AdminLayout>
            <Head title="Admin — Commandes" />

            <PageHeader
                title="Commandes"
                subtitle="Lancer manuellement les commandes applicatives (imports, rappels, stats)."
            />

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {commands.map((command) => (
                    <CommandCard key={command.key} command={command} runningKeys={runningKeys} onLaunch={handleLaunch} />
                ))}
            </div>

            {active && (
                <div className="mb-8">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-base font-bold tracking-tight text-stone-800 dark:text-stone-200">{active.label}</h2>
                            <StatusBadge status={active.status} />
                        </div>
                        {active.status === 'running' && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
                                En cours…
                            </span>
                        )}
                    </div>
                    <div className="admin-card-shine admin-animate-in relative overflow-hidden rounded-2xl border border-stone-200/70 bg-stone-950 shadow-inner dark:border-stone-700/70">
                        <div
                            ref={logRef}
                            className="h-72 overflow-y-auto p-4 font-mono text-[12px] leading-relaxed text-emerald-300"
                        >
                            {active.log ? (
                                <pre className="whitespace-pre-wrap">{active.log}</pre>
                            ) : active.status === 'running' ? (
                                <span className="text-stone-500">Attente de sortie…</span>
                            ) : (
                                <span className="text-stone-500">Aucune sortie.</span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div>
                <h2 className="mb-3 text-base font-bold tracking-tight text-stone-800 dark:text-stone-200">Historique</h2>
                {history.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-500">
                        Aucune commande lancée pour le moment.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-sm shadow-stone-200/40 dark:border-stone-700/70 dark:bg-stone-900 dark:shadow-none">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-stone-200/70 bg-stone-50/80 dark:border-stone-700 dark:bg-stone-800/60">
                                    <tr>
                                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Commande</th>
                                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Statut</th>
                                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Lancée le</th>
                                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Fin</th>
                                        <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Exit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                                    {history.map((run) => (
                                        <tr key={run.id} className="transition hover:bg-stone-50 dark:hover:bg-stone-800/50">
                                            <td className="px-4 py-3">
                                                <span className="font-medium text-stone-700 dark:text-stone-300">{run.label}</span>
                                                <code className="ml-2 hidden rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] text-stone-500 lg:inline dark:bg-stone-800 dark:text-stone-400">{run.command_key}</code>
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                                            <td className="px-4 py-3 text-stone-500 dark:text-stone-400">
                                                {run.started_at
                                                    ? new Date(run.started_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-stone-500 dark:text-stone-400">
                                                {run.finished_at
                                                    ? new Date(run.finished_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {run.exit_code === null ? (
                                                    <span className="text-stone-300 dark:text-stone-600">—</span>
                                                ) : run.exit_code === 0 ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400"><CheckIcon className="h-3.5 w-3.5" />0</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400"><XIcon className="h-3.5 w-3.5" />{run.exit_code}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}