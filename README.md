# Mushaf

Une application web de lecture du **Coran** et des **hadiths**, construite avec Laravel 13, Inertia.js, React 19 et Tailwind CSS 4.

Mushaf propose une navigation fluide dans les sourates, la lecture des versets avec audio (plusieurs récitateurs), la recherche full-text, les hadiths des collections classiques, un lecteur audio global, un quiz, les rappels quotidiens par email, la gestion des favoris, l'historique de lecture, la connexion Google et un panneau d'administration.

---

## Fonctionnalités

- **Coran** : navigation dans les 114 sourates et leurs versets, avec recherche full-text.
- **Audio** : lecture des sourates via 11 récitateurs différents (stockage Cloudflare R2), lecteur global avec reprise de position.
- **Hadiths** : consultation des hadiths des collections classiques (dont les 42 hadiths d'An-Nawawi), recherche.
- **Verset & Hadith du jour** : contenus quotidiens mis en avant sur la page d'accueil.
- **Quiz** : génération et soumission de quiz sur les versets.
- **Favoris** : sauvegarde des versets et hadiths (nécessite une session).
- **Profil** : édition du compte, changement de mot de passe, suppression.
- **Authentification** : inscription/connexion par email ou par Google (Socialite).
- **Rappels email** : abonnement aux rappels quotidiens avec choix du contenu (verset, hadith, alterné) et de la langue.
- **Historique** : suivi de la lecture et de l'écoute, reprise automatique.
- **Administration** : tableau de bord avec statistiques, CRUD des sourates/versets/hadiths/collections/abonnements, gestion des utilisateurs.
- **Tracking** : statistiques de consultation (pages vues, tendances, activité).

## Stack technique

| Domaine | Technologie |
|---|---|
| Backend | Laravel 13 (PHP 8.5), Eloquent ORM, Artisan |
| Frontend | Inertia.js 3 + React 19 + Tailwind CSS 4, Vite 8 |
| Stockage audio | Cloudflare R2 (S3 compatible) |
| Auth | Laravel Breeze-style, Google OAuth (Socialite) |
| Base de données | SQLite (local) / MySQL (production) |
| Files | Laravel Flysystem (S3 / local) |

## Installation

### Prérequis

- PHP 8.3+
- Node.js 18+
- Composer 2+

### Configuration

1. Cloner le dépôt :
    ```bash
    git clone https://github.com/BABABODINabile/Mushaf.git
    cd Mushaf
    ```

2. Copier le modèle d'environnement et générer une clé :
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. Configurer la base de données dans `.env` (SQLite par défaut, MySQL disponible) :
   ```env
   DB_CONNECTION=sqlite
   # DB_HOST=127.0.0.1
   # DB_PORT=3306
   # DB_DATABASE=mushaf
   # DB_USERNAME=root
   # DB_PASSWORD=
   ```

4. Configurer les services externes dans `.env` :
   - **Google OAuth** : `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
   - **Cloudflare R2** (audio) : `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_ENDPOINT`, `CLOUDFLARE_R2_BUCKET`, `CLOUDFLARE_R2_PUBLIC_URL`

5. Installer les dépendances et compiler les assets :
   ```bash
   composer install
   npm install
   npm run build
   ```

6. Exécuter les migrations :
   ```bash
   php artisan migrate
   ```

7. (Optionnel) Importer les données du Coran et des hadiths :
   ```bash
   php artisan mushaf:import-quran
   php artisan mushaf:import-hadiths
   ```

### Lancer en développement

```bash
composer run dev
```

Cela démarre le serveur de développement Laravel avec Vite en hot-reload.

## Commandes Artisan disponibles

| Commande | Description |
|---|---|
| `mushaf:import-quran` | Importe les 114 sourates et les 6236 versets |
| `mushaf:import-hadiths` | Importe les 42 hadiths d'An-Nawawi |
| `mushaf:send-reminders` | Envoie les rappels quotidiens par email (`--dry-run`) |
| `mushaf:aggregate-stats` | Agrège les statistiques de consultation (`--days=90`) |
| `mushaf:download-audios` | Télécharge les fichiers audio vers `storage/app/audio/` |
| `mushaf:upload-to-r2` | Uploade les fichiers audio vers Cloudflare R2 |
| `mushaf:fix-surah-names` | Corrige les noms FR/EN des 114 sourates |

## Tests

```bash
composer test
```

Les tests couvrent les fonctionnalités métier (favoris, profil, auth, abonnements, recherche, audio) avec PHPUnit.

## Style de code

Les fichiers PHP modifiés doivent respecter le style du projet via [Laravel Pint](https://github.com/laravel/pint) :

```bash
vendor/bin/pint --dirty --format agent
```

## License

MIT