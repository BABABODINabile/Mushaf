import { Link } from '@inertiajs/react';
import { EditIcon, ViewIcon, TrashIcon } from './Icons';

const tone = {
    teal:   { grad: 'from-teal-500 to-teal-700', ring: 'ring-teal-100 dark:ring-teal-900/40', shadow: 'hover:shadow-teal-500/40' },
    blue:   { grad: 'from-blue-500 to-blue-700', ring: 'ring-blue-100 dark:ring-blue-900/40', shadow: 'hover:shadow-blue-500/40' },
    red:    { grad: 'from-red-500 to-red-700', ring: 'ring-red-100 dark:ring-red-900/40', shadow: 'hover:shadow-red-500/40' },
    green:  { grad: 'from-green-500 to-green-700', ring: 'ring-green-100 dark:ring-green-900/40', shadow: 'hover:shadow-green-500/40' },
};

/**
 * Bouton icône circulaire — style des icônes KPI (dégradé + ring, blanc sur fond coloré).
 * Rendu en <Link> si `href`, sinon en <button>.
 */
function ActionButton({ icon: Icon, label, href, onAction, color }) {
    const { grad, ring, shadow } = tone[color];

    const classes = `grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${grad} text-white shadow-lg ${ring} transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:rotate-3 hover:shadow-xl ${shadow} active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 dark:ring-offset-stone-900`;

    if (href) {
        return (
            <Link href={href} title={label} aria-label={label} className={classes}>
                <Icon className="h-4 w-4" />
            </Link>
        );
    }

    return (
        <button type="button" title={label} aria-label={label} onClick={onAction} className={classes}>
            <Icon className="h-4 w-4" />
        </button>
    );
}

/**
 * Actions d'une ligne de tableau — boutons icône circulaires au style des KPI.
 * Voir (teal) / Éditer (blue) / actions personnalisées / Supprimer (red).
 *
 * @param {{
 *   showUrl?: string,
 *   editUrl?: string,
 *   onDelete?: () => void,
 *   itemLabel?: string,
 *   actions?: Array<{ key: string, label: string, icon: Function, onClick: () => void, tone?: 'default'|'danger'|'green'|'blue'|'teal' }>
 * }} props
 */
export default function RowActions({ showUrl, editUrl, onDelete, itemLabel = '', actions = [] }) {
    const label = itemLabel ? ` ${itemLabel}` : '';

    const items = [
        showUrl && { key: 'view', label: `Voir${label}`, icon: ViewIcon, color: 'teal', href: showUrl },
        editUrl && { key: 'edit', label: `Éditer${label}`, icon: EditIcon, color: 'blue', href: editUrl },
        ...actions.map((a) => ({
            key: a.key,
            label: a.label,
            icon: a.icon,
            color: { default: 'teal', danger: 'red', green: 'green', blue: 'blue', teal: 'teal' }[a.tone] || 'teal',
            onClick: a.onClick,
        })),
        onDelete && { key: 'delete', label: `Supprimer${label}`, icon: TrashIcon, color: 'red', onClick: onDelete },
    ].filter(Boolean);

    if (items.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            {items.map((item) => (
                <ActionButton
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    onAction={item.onClick}
                    color={item.color}
                />
            ))}
        </div>
    );
}