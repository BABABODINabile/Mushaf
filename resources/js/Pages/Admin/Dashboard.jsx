import { Head } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';
import { TrendChart, SignupChart } from '../../components/StatChart';
import {
    UsersIcon,
    ActivityIcon,
    MailIcon,
    StarIcon,
    BookIcon,
    ScrollIcon,
    HadithIcon,
    BarChartIcon,
} from '../../components/Icons';

function StatCard({ label, value, delta, icon: Icon, color = 'teal' }) {
    const colors = {
        teal:   { icon: 'text-teal-600 dark:text-teal-400', grad: 'from-teal-500 to-teal-700', light: 'bg-teal-50 dark:bg-teal-900/30', ring: 'ring-teal-100 dark:ring-teal-900/40' },
        blue:   { icon: 'text-blue-600 dark:text-blue-400', grad: 'from-blue-500 to-blue-700', light: 'bg-blue-50 dark:bg-blue-900/30', ring: 'ring-blue-100 dark:ring-blue-900/40' },
        amber:  { icon: 'text-amber-600 dark:text-amber-400', grad: 'from-amber-500 to-amber-700', light: 'bg-amber-50 dark:bg-amber-900/30', ring: 'ring-amber-100 dark:ring-amber-900/40' },
        green:  { icon: 'text-green-600 dark:text-green-400', grad: 'from-green-500 to-green-700', light: 'bg-green-50 dark:bg-green-900/30', ring: 'ring-green-100 dark:ring-green-900/40' },
        red:    { icon: 'text-red-600 dark:text-red-400', grad: 'from-red-500 to-red-700', light: 'bg-red-50 dark:bg-red-900/30', ring: 'ring-red-100 dark:ring-red-900/40' },
        purple: { icon: 'text-purple-600 dark:text-purple-400', grad: 'from-purple-500 to-purple-700', light: 'bg-purple-50 dark:bg-purple-900/30', ring: 'ring-purple-100 dark:ring-purple-900/40' },
        rose:   { icon: 'text-rose-600 dark:text-rose-400', grad: 'from-rose-500 to-rose-700', light: 'bg-rose-50 dark:bg-rose-900/30', ring: 'ring-rose-100 dark:ring-rose-900/40' },
        indigo: { icon: 'text-indigo-600 dark:text-indigo-400', grad: 'from-indigo-500 to-indigo-700', light: 'bg-indigo-50 dark:bg-indigo-900/30', ring: 'ring-indigo-100 dark:ring-indigo-900/40' },
    };
    const c = colors[color] || colors.teal;
    const showDelta = delta !== undefined;
    const pos = delta >= 0;

    return (
        <div className="admin-card-shine admin-animate-in group relative overflow-hidden rounded-2xl border border-stone-200/70 bg-white p-5 shadow-sm shadow-stone-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-300/30 dark:border-stone-700/70 dark:bg-stone-900 dark:shadow-none dark:hover:shadow-black/20">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${c.grad} opacity-[0.06] blur-2xl transition-opacity duration-300 group-hover:opacity-[0.12]`} />
            <div className="relative flex items-start justify-between">
                <div className="min-w-0">
                    <span className="text-[13px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">{label}</span>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">{value.toLocaleString()}</p>
                </div>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${c.grad} text-white shadow-lg ring-4 ${c.ring} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className="h-5 w-5" />
                </span>
            </div>
            {showDelta && (
                <div className="relative mt-3 flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        pos ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    }`}>
                        {pos ? (
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                        ) : (
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                        )}
                        {pos ? '+' : ''}{delta}
                    </span>
                    <span className="text-xs text-stone-400 dark:text-stone-500">vs semaine précédente</span>
                </div>
            )}
        </div>
    );
}

function Panel({ title, icon, color = 'teal', children }) {
    const dots = {
        teal: 'from-teal-500 to-teal-700', blue: 'from-blue-500 to-blue-700', amber: 'from-amber-500 to-amber-700',
        purple: 'from-purple-500 to-purple-700', rose: 'from-rose-500 to-rose-700', indigo: 'from-indigo-500 to-indigo-700',
        pink: 'from-pink-500 to-pink-700', green: 'from-green-500 to-green-700',
    };
    const g = dots[color] || dots.teal;
    return (
        <div className="admin-card-shine relative overflow-hidden rounded-2xl border border-stone-200/70 bg-white p-6 shadow-sm shadow-stone-200/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-300/30 dark:border-stone-700/70 dark:bg-stone-900 dark:shadow-none">
            <div className="mb-4 flex items-center gap-2.5">
                <span className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${g}`} />
                <h2 className="text-base font-bold tracking-tight text-stone-800 dark:text-stone-200">{title}</h2>
            </div>
            {children}
        </div>
    );
}

export default function Dashboard({
    stats, trends, recentUsers, recentSubs, chartData,
    todayPagesVues, topPages, recentActivity,
    emailCount, googleCount, totalUsers,
    dailySubs, weeklySubs, totalSubs,
    verseSubs, hadithSubs, alterneSubs,
    weeklySignups,
}) {
    const trendSeries = (chartData || []).map((d) => ({
        label: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        unique_visitors: Number(d.visiteurs_uniques || 0),
        pages_vues: Number(d.pages_vues || 0),
        users_total: Number(d.users_total || 0),
    }));

    const signupSeries = (weeklySignups || []).map((count, day) => ({ day, count: Number(count || 0) }));

    return (
        <AdminLayout>
            <Head title="Admin — Dashboard" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Dashboard</h1>
                <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Vue d'ensemble de votre plateforme.</p>
            </div>

            {/* KPI Cards */}
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Utilisateurs" value={stats.users} delta={trends.users_delta} icon={UsersIcon} color="blue" />
                <StatCard label="En ligne (30 min)" value={stats.users_online} icon={ActivityIcon} color="green" />
                <StatCard label="Abonnés actifs" value={stats.subscriptions} delta={trends.subs_delta} icon={MailIcon} color="purple" />
                <StatCard label="Favoris" value={stats.favorites} delta={trends.favorites_delta} icon={StarIcon} color="amber" />
            </div>

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard label="Sourates" value={stats.surahs} icon={BookIcon} color="teal" />
                <StatCard label="Versets" value={stats.ayahs} icon={ScrollIcon} color="indigo" />
                <StatCard label="Hadiths" value={stats.hadiths} icon={HadithIcon} color="rose" />
                <StatCard label="Pages vues aujourd'hui" value={todayPagesVues} icon={BarChartIcon} color="red" />
            </div>

            {/* Charts */}
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Panel title="Activité — 30 derniers jours" color="teal">
                        {trendSeries.length === 0 ? (
                            <p className="py-8 text-center text-sm text-stone-400 dark:text-stone-500">Aucune donnée</p>
                        ) : (
                            <TrendChart data={trendSeries} />
                        )}
                    </Panel>
                </div>
                <Panel title="Inscriptions (7j)" color="amber">
                    {signupSeries.every((s) => s.count === 0) ? (
                        <p className="py-8 text-center text-sm text-stone-400 dark:text-stone-500">Aucune inscription</p>
                    ) : (
                        <SignupChart data={signupSeries} />
                    )}
                </Panel>
            </div>

            {/* Content breakdown */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <Panel title="Inscriptions" color="blue">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 dark:bg-stone-800/60">
                            <span className="text-sm text-stone-600 dark:text-stone-400">Par email</span>
                            <span className="text-lg font-bold text-stone-900 dark:text-stone-100">{emailCount}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 dark:bg-stone-800/60">
                            <span className="text-sm text-stone-600 dark:text-stone-400">Par Google</span>
                            <span className="text-lg font-bold text-stone-900 dark:text-stone-100">{googleCount}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 dark:border-stone-700">
                            <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">Total</span>
                            <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{totalUsers}</span>
                        </div>
                    </div>
                </Panel>

                <Panel title="Abonnements" color="purple">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 dark:bg-stone-800/60">
                            <span className="text-sm text-stone-600 dark:text-stone-400">Quotidiens</span>
                            <span className="text-lg font-bold text-stone-900 dark:text-stone-100">{dailySubs}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 dark:bg-stone-800/60">
                            <span className="text-sm text-stone-600 dark:text-stone-400">Hebdomadaires</span>
                            <span className="text-lg font-bold text-stone-900 dark:text-stone-100">{weeklySubs}</span>
                        </div>
                        <div className="rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-400">
                            Versets : <span className="font-semibold">{verseSubs}</span> · Hadiths : <span className="font-semibold">{hadithSubs}</span> · Alternés : <span className="font-semibold">{alterneSubs}</span>
                        </div>
                    </div>
                </Panel>
            </div>

            {/* Top pages + Recent activity */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <Panel title="Top pages (7j)" color="teal">
                    {topPages.length === 0 ? (
                        <p className="py-8 text-center text-sm text-stone-400 dark:text-stone-500">Aucune donnée</p>
                    ) : (
                        <div className="space-y-2">
                            {topPages.map((page, i) => (
                                <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-stone-50 dark:hover:bg-stone-800/60">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-teal-100 text-[11px] font-bold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">{i + 1}</span>
                                        <span className="truncate font-mono text-xs text-stone-700 dark:text-stone-300">{page.path}</span>
                                    </div>
                                    <span className="shrink-0 text-xs text-stone-500 dark:text-stone-400">{page.views} vues · {page.unique_visitors} uniques</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>

                <Panel title="Activité récente (24h)" color="rose">
                    {recentActivity.length === 0 ? (
                        <p className="py-8 text-center text-sm text-stone-400 dark:text-stone-500">Aucune activité</p>
                    ) : (
                        <div className="space-y-2">
                            {recentActivity.map((item, i) => (
                                <div key={i} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-stone-50 dark:hover:bg-stone-800/60">
                                    <span className="truncate font-mono text-xs text-stone-700 dark:text-stone-300">{item.path}</span>
                                    <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">
                                        {new Date(item.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>

            {/* Recent users + subs */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Panel title="Derniers inscrits" color="indigo">
                    <div className="space-y-1.5">
                        {recentUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-stone-50 dark:hover:bg-stone-800/60">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-xs font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                                    <span className="truncate text-sm font-medium text-stone-800 dark:text-stone-200">{user.name}</span>
                                    {user.is_admin && <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">admin</span>}
                                </div>
                                <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">{user.email}</span>
                            </div>
                        ))}
                    </div>
                </Panel>

                <Panel title="Derniers abonnements" color="pink">
                    <div className="space-y-1.5">
                        {recentSubs.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-stone-50 dark:hover:bg-stone-800/60">
                                <span className="truncate text-sm text-stone-700 dark:text-stone-300">{sub.email}</span>
                                <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                                    {sub.frequency} · {sub.content_type}
                                </span>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>
        </AdminLayout>
    );
}
