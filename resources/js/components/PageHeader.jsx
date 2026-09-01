import Medallion from '../components/Medallion';

export default function PageHeader({ eyebrow, title, subtitle, align = 'left' }) {
    const centered = align === 'center';

    return (
        <div className={centered ? 'text-center' : ''}>
            {eyebrow && (
                <p
                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold ${
                        centered ? 'justify-center' : ''
                    }`}
                >
                    <Medallion className="h-4 w-4" />
                    {eyebrow}
                </p>
            )}
            <h1 className="mt-2 font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">{title}</h1>
            {subtitle && <p className="mt-1 text-stone-500 dark:text-stone-400">{subtitle}</p>}
            <div
                className={`mt-4 h-px w-full max-w-xs bg-gradient-to-r from-gold-soft via-gold-soft to-transparent ${
                    centered ? 'mx-auto' : ''
                }`}
            />
        </div>
    );
}