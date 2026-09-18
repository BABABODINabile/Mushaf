import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons';

export default function PasswordInput({ className = '', ...props }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <input
                {...props}
                type={visible ? 'text' : 'password'}
                className={`${className} pr-10`}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 transition hover:text-stone-600 focus:outline-none dark:hover:text-stone-200"
            >
                {visible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
        </div>
    );
}
