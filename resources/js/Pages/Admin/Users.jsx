import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';
import { PageHeader, TableCard, Table, Thead, Tbody, Pagination } from '../../components/AdminUI';
import RowActions from '../../components/RowActions';
import { PowerIcon, BanIcon } from '../../components/Icons';
import { useConfirm } from '../../components/ConfirmDialog';

export default function Users({ users }) {
    const confirm = useConfirm();
    const currentUserId = usePage().props.auth?.user?.id;

    function handleToggle(user) {
        const deactivate = user.is_active;
        confirm({
            icon: deactivate ? BanIcon : PowerIcon,
            title: deactivate ? 'Désactiver le compte' : 'Réactiver le compte',
            message: deactivate
                ? `Désactiver le compte de ${user.name} ? Il ne pourra plus se connecter.`
                : `Réactiver le compte de ${user.name} ?`,
            confirmLabel: deactivate ? 'Désactiver' : 'Réactiver',
            danger: deactivate,
        }).then((ok) => {
            if (ok) router.post(`/admin/users/${user.id}/toggle`);
        });
    }

    return (
        <AdminLayout>
            <Head title="Admin — Utilisateurs" />

            <PageHeader
                title="Utilisateurs"
                subtitle="Gérer les comptes utilisateurs"
            />

            <TableCard>
                <div className="overflow-x-auto">
                    <Table>
                        <Thead>
                            <tr>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">ID</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Nom</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Email</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Statut</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Admin</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Favoris</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Abonnements</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Inscrit le</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Dernière visite</th>
                                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Actions</th>
                            </tr>
                        </Thead>
                        <Tbody>
                            {users.data.map((user) => (
                                <tr key={user.id} className={`transition-colors ${user.is_active ? 'hover:bg-stone-50 dark:hover:bg-stone-800/50' : 'bg-stone-50/70 dark:bg-stone-800/40'}`}>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100 text-sm font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">{user.id}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-medium text-stone-700 dark:text-stone-300">{user.name}</span>
                                        {user.is_admin && (
                                            <span className="ml-2 inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                                                admin
                                            </span>
                                        )}
                                        {user.id === currentUserId && (
                                            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                                vous
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-stone-500 dark:text-stone-400">{user.email}</td>
                                    <td className="px-4 py-3">
                                        {user.is_active ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                Actif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                                Inactif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.is_admin ? (
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                                                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            </span>
                                        ) : (
                                            <span className="text-stone-300 dark:text-stone-600">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-stone-500 dark:text-stone-400">{user.favorites_count}</td>
                                    <td className="px-4 py-3 text-stone-500 dark:text-stone-400">{user.subscriptions_count}</td>
                                    <td className="px-4 py-3 text-stone-400 dark:text-stone-500">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-3 text-stone-400 dark:text-stone-500">
                                        {user.last_seen_at
                                            ? new Date(user.last_seen_at).toLocaleDateString('fr-FR')
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <RowActions
                                            actions={
                                                user.id !== currentUserId
                                                    ? [
                                                        {
                                                            key: 'toggle',
                                                            label: user.is_active ? 'Désactiver' : 'Réactiver',
                                                            icon: user.is_active ? BanIcon : PowerIcon,
                                                            tone: user.is_active ? 'danger' : 'green',
                                                            onClick: () => handleToggle(user),
                                                        },
                                                    ]
                                                    : []
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                        </Tbody>
                    </Table>
                </div>
            </TableCard>

            <Pagination links={users.links} />
        </AdminLayout>
    );
}