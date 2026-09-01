export default function Medallion({ className = '', children }) {
    return (
        <span className={`relative inline-grid place-items-center ${className}`}>
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 34 34" aria-hidden="true">
                <path
                    d="M17 2 L20 8 27 7 25 14 31 17 25 20 27 27 20 26 17 32 14 26 7 27 9 20 3 17 9 14 7 7 14 8 Z"
                    fill="none"
                    strokeWidth="1.3"
                    className="stroke-gold"
                />
            </svg>
            {children && <span className="relative z-10 leading-none">{children}</span>}
        </span>
    );
}