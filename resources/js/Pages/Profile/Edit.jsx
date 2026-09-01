import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { TrashIcon } from '../../components/Icons';
import { useConfirm } from '../../components/ConfirmDialog';

export default function Profile({ user }) {
    const { status } = usePage().props;
    const confirm = useConfirm();
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    function handleProfileSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.patch('/profile', { name, email }, {
            onFinish: () => setProcessing(false),
        });
    }

    function handlePasswordSubmit(e) {
        e.preventDefault();
        setProcessing(true);
        router.put('/password', { current_password: currentPassword, password, password_confirmation: passwordConfirmation }, {
            onFinish: () => {
                setProcessing(false);
                setCurrentPassword('');
                setPassword('');
                setPasswordConfirmation('');
            },
        });
    }

    function handleDeleteAccount(e) {
        e.preventDefault();
        confirm({
            icon: TrashIcon,
            title: 'Supprimer le compte',
            message: 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
            confirmLabel: 'Supprimer',
            danger: true,
        }).then((ok) => {
            if (!ok) return;
            setProcessing(true);
            router.delete('/profile', { password: deletePassword }, {
                onFinish: () => setProcessing(false),
            });
        });
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-stone-900">Mon profil</h1>
                <p className="mt-1 text-stone-500">Gérez vos informations personnelles.</p>
            </div>

            {status && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    {status === 'profile-updated' && 'Profil mis à jour avec succès.'}
                    {status === 'password-updated' && 'Mot de passe mis à jour avec succès.'}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-stone-100 p-1">
                {[
                    { key: 'profile', label: 'Profil' },
                    { key: 'password', label: 'Mot de passe' },
                    { key: 'delete', label: 'Supprimer' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                            activeTab === tab.key
                                ? 'bg-white text-stone-900 shadow-sm'
                                : 'text-stone-500 hover:text-stone-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Profile tab */}
            {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <div>
                        <label htmlFor="name" className="mb-1 block text-sm font-medium text-stone-700">
                            Nom
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-sm focus:border-teal-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-sm focus:border-teal-500 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                        {processing ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                </form>
            )}

            {/* Password tab */}
            {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <div>
                        <label htmlFor="current_password" className="mb-1 block text-sm font-medium text-stone-700">
                            Mot de passe actuel
                        </label>
                        <input
                            id="current_password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-sm focus:border-teal-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
                            Nouveau mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-sm focus:border-teal-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium text-stone-700">
                            Confirmer le mot de passe
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-sm focus:border-teal-500 focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                        {processing ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
                    </button>
                </form>
            )}

            {/* Delete account tab */}
            {activeTab === 'delete' && (
                <form onSubmit={handleDeleteAccount} className="space-y-4 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                    <div>
                        <h3 className="text-lg font-semibold text-red-700">Supprimer mon compte</h3>
                        <p className="mt-1 text-sm text-stone-500">
                            Cette action est irréversible. Toutes vos données seront supprimées.
                        </p>
                    </div>
                    <div>
                        <label htmlFor="delete_password" className="mb-1 block text-sm font-medium text-stone-700">
                            Confirmez avec votre mot de passe
                        </label>
                        <input
                            id="delete_password"
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-800 shadow-sm focus:border-red-500 focus:outline-none"
                            placeholder="Votre mot de passe"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={processing || !deletePassword}
                        className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {processing ? 'Suppression…' : 'Supprimer mon compte'}
                    </button>
                </form>
            )}
        </div>
    );
}

Profile.layout = (page) => <AppLayout>{page}</AppLayout>;
