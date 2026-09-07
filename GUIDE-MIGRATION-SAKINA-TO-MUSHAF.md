# Guide de migration — Sakina → Mushaf

Ce guide documente, lot par lot, la migration de l'application **Sakina** (Laravel 13 + Blade) vers **Mushaf** (Laravel 13 + Inertia + React 19 + Tailwind 4). Son objectif est d'atteindre la **parité fonctionnelle** entre les deux applications, tout en respectant la réécriture frontend à base de composants React.

> **Source** : `/run/media/nabile/Stockage/Projets/Islam/sakina/` (application compleète)
> **Cible** : `/run/media/nabile/Stockage/Projets/Islam/mushaf/` (réécriture en cours)

---

## Table des matières

1. [État des lieux](#1-état-des-lieux)
2. [Principes de migration](#2-principes-de-migration)
3. [Dépendances à ajouter](#3-dépendances-à-ajouter)
4. [Lot P0 — Fonctionnalités utilisateur essentielles](#4-lot-p0--fonctionnalités-utilisateur-essentielles)
   - [P0-1 Favoris](#p0-1-favoris)
   - [P0-2 Profil utilisateur](#p0-2-profil-utilisateur)
   - [P0-3 Auth complète](#p0-3-auth-complète)
   - [P0-4 Historique lecture + audio](#p0-4-historique-lecture--audio)
5. [Lot P1 — Rappels email, jobs & scheduler](#5-lot-p1--rappels-email-jobs--scheduler)
6. [Lot P2 — OAuth Google (Socialite)](#6-lot-p2--oauth-google-socialite)
7. [Lot P3 — Admin panel (React)](#7-lot-p3--admin-panel-react)
8. [Lot P4 — Tracking & stats](#8-lot-p4--tracking--stats)
9. [Lot P5 — Traitement, nettoyage & finalisation](#9-lot-p5--traitement-nettoyage--finalisation)
10. [Reporté (hors périmètre)](#10-reporté-hors-périmètre)
11. [Vérifications finales](#11-vérifications-finales)

---

## 1. État des lieux

### Déjà présent et fonctionnel dans Mushaf
- **Pages SPA React** : `Accueil`, `Coran`, `Surah`, `Écouter`, `Hadiths`, `Search`, `Auth/Login`, `Auth/Register`
- **Layout** : `AppLayout.jsx`, lecteur audio global `AudioProvider.jsx`
- **Backend** : models identiques au Sakina (12 models), migrations identiques (17 fichiers), `AudioService`
- **API** : surahs, ayahs, search, reciters, navigation, verse-of-day, hadith-of-day, audio
- **Config** : `config/reciters.php` (5 récitateurs), `services.r2`, `services.google` (config seule)
- **Commandes artisan** : `mushaf:import-quran`, `mushaf:import-hadiths`

### Présent mais déconnecté (à router)
| Élément | État |
|---|---|
| `FavoriteController` (index/list/toggle) | Contrôleur présent, **aucune route**, renvoie `view('pages.favoris')` inexistante |
| `SubscriptionController` (index/subscribe/unsubscribe) | Contrôleur présent, **aucune route**, vues inexistantes |
| `ShareController` (show) | Contrôleur présent, **aucune route**, vue inexistante |
| `ProfileController` (edit/update/destroy) | Contrôleur présent, **aucune route**, vue inexistante |
| `PageController::readingHistory/saveReadingProgress/audioHistory/saveAudioProgress` | Méthodes présentes, **aucune route** |
| Controllers `Auth/*` (PasswordReset, EmailVerification, Confirmable, Password) | Présents, **aucune route**, renvoient vers des vues Blade inexistantes |

### Totalement absent
- **Jobs** (`app/Jobs/`), **Mailable** (`app/Mail/`), **scheduler** dans `routes/console.php`
- **Google OAuth** : package `laravel/socialite` absent, controller `GoogleController` absent
- **Share image** (module JS `sakinaShare`)
- **PWA / web push** (voir [reporté](#10-reporté-hors-périmètre))

> **Mis à jour** : le **panneau admin** (dashboard, stats, CRUD sourates/versets/hadiths/collections/subscriptions, users) et les middlewares `TrackActivity` / `AdminOnly` sont **déjà implémentés** (contrôleurs, layout React sidebar fixe, 40 routes, 18 tests). Voir [Lot P3](#7-lot-p3--admin-panel-react).

### Données actuelles (base MySQL)
- 114/114 sourates, 6236/6236 versets, 42 hadiths, 1 collection, 2 utilisateurs (`test@example.com`, `admin@mushaf.local`) — imports terminés.

---

## 2. Principes de migration

1. **Le backend PHP** (controllers, models, jobs, commandes) se copie quasi tel quel depuis Sakina ; on **ne réécrit que** :
   - les rendus `view('pages.x')` / `view('admin.x')` → `Inertia::render('...')`
   - les préfixes de commande `sakina:*` → `mushaf:*`
   - les libellés affichés « Sakîna » → « Mushaf »
2. **Le frontend** suit l'architecture React existante (pages dans `resources/js/Pages/`, composants dans `resources/js/components/`, lib dans `resources/js/lib/`). Ne **pas** copier les vues Blade : les réimplémenter en composants.
3. **Règles de style** : suivre `AGENTS.md` + run `vendor/bin/pint` sur chaque fichier PHP modifié.
4. **Tests** : ajouter un test Feature par fonctionnalité migrée (aucun test métier n'existe côté Mushaf pour l'instant).
5. **`auth` `verified`** : les routes réservées aux utilisateurs authentifiés utilisent `middleware('auth')` (et `verified` quand webmail vérifié requis, comme dans Sakina).

---

## 3. Dépendances à ajouter

```bash
# Socialite (Google OAuth) — Lot P2
composer require laravel/socialite

# (optionnel, pour générer les images de partage côté serveur — sinon via Canvas côté client)
# composer require intervention/image
```

Vérifier ensuite dans `composer.json` et re-exécuter si besoin.

> `.env` : ajouter les variables Google OAuth (voir [Lot P2](#6-lot-p2--oauth-google-socialite)).

---

## 4. Lot P0 — Fonctionnalités utilisateur essentielles

> **Objectif** : rendre utilisables les fonctionnalités dont le backend existe déjà. Convertir les controllers de Blade → Inertia, router l'existant, ajouter les pages React.

### P0-1 Favoris

**Backend (`app/Http/Controllers/FavoriteController.php`)**
- Convertir `index()` : remplacer `return view('pages.favoris', compact('favorites'));` par un rendu Inertia avec les favoris triés dans un format consommable par React :
  ```php
  $ayahs = $favorites->where('favable_type', Ayah::class)->map(fn ($f) => $f->favable);
  $hadiths = $favorites->where('favable_type', Hadith::class)->map(fn ($f) => $f->favable);
  return Inertia::render('Favoris', ['ayahs' => ..., 'hadiths' => ...]);
  ```
- `list()` et `toggle()` restent des API JSON (déjà en JSON) — ne pas toucher la logique.

**Routes (`routes/web.php`)** — reprendre la liste Sakina :
```php
Route::middleware(['auth'])->group(function () {
    Route::get('/favoris', [FavoriteController::class, 'index'])->name('favoris');
});

Route::prefix('api')->middleware(['auth', 'throttle:60,1'])->group(function () {
    Route::get('/favorites', [FavoriteController::class, 'list'])->name('api.favorites.list');
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle'])->name('api.favorites.toggle');
});
```

**Frontend**
- Nouvelle page `resources/js/Pages/Favoris.jsx` : deux sections (Verset du Coran / Hadiths), cartes avec référence + texte, bouton « Retirer » (appelle `POST /api/favorites/toggle` puis re-fetch).
- Ajouter un bouton favori (cœur) sur chaque verset de `Surah.jsx` et chaque carte de `Hadiths.jsx` :
  - état initial via `GET /api/favorites` (fetch au montage)
  - toggle via `POST /api/favorites/toggle` avec `{ type: 'ayah'|'hadith', id: 'surah:ayah'|hadithId }`
  - redirection vers `/login` si 401.
- Ajouter le lien « Favoris » dans `AppLayout.jsx` (réservé aux utilisateurs connectés).

---

### P0-2 Profil utilisateur

**Backend (`app/Http/Controllers/ProfileController.php`)**
- Inspecter chaque méthode :
  ```php
  public function edit(Request $request)
  {
      return Inertia::render('Profile/Edit', ['user' => $request->user()]);
  }
  ```
- `update()` et `destroy()` conservent leur logique mais redirigent vers `route('profile.edit')` / `/` (déjà le cas).

**Request** — `app/Http/Requests/ProfileUpdateRequest.php` existe déjà, réutiliser.

**Routes (`routes/web.php` + `routes/auth.php`)**
```php
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
```

**Frontend** — `resources/js/Pages/Profile/Edit.jsx` :
- Formulaire nom + email (`PATCH /profile`)
- Formulaire changement de mot de passe (`PUT /password` — voir P0-3)
- Zone « Supprimer le compte » avec confirmation mot de passe (`DELETE /profile`)

---

### P0-3 Auth complète

> Les controllers `Auth/*` existent mais sont **non routés** et renvoient vers des vues Blade. Il faut ajouter les routes et créer les pages React.

**Controllers à convertir (Blade → Inertia)** :
- `PasswordResetLinkController` → `Inertia::render('Auth/ForgotPassword')`
- `NewPasswordController` → `Inertia::render('Auth/ResetPassword', ['token' => $token, 'email' => $request->email])`
- `EmailVerificationPromptController::__invoke()` → `Inertia::render('Auth/VerifyEmail', ['status' => session('status')])`
- `ConfirmablePasswordController::show()` → `Inertia::render('Auth/ConfirmPassword')`
- `PasswordController::update()` — reste en redirect (déjà OK)

**Routes (`routes/auth.php`)** — reprendre le fichier Breeze/React type (route names `password.request`, `password.email`, `password.reset`, `password.store`, `password.update`, `password.confirm`, `verification.notice`, `verification.verify`, `verification.send`) :
```php
Route::middleware('guest')->group(function () {
    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', [EmailVerificationPromptController::class, '__invoke'])->name('verification.notice');
    Route::get('verify-email/{id}/{hash}', [VerifyEmailController::class, '__invoke'])->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])->middleware('throttle:6,1')->name('verification.send');
    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])->name('password.confirm');
    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);
    Route::put('password', [PasswordController::class, 'update'])->name('password.update');
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
```

> **Ne pas oublier** : lier `verify-email` aux routes réservées `verified` (ex. favoris) si souhaité — voir middleware `verified` dans P0-1.

**Frontend — nouvelles pages React** :
- `Auth/ForgotPassword.jsx`
- `Auth/ResetPassword.jsx` (token + email + password + retry)
- `Auth/ConfirmPassword.jsx`
- `Auth/VerifyEmail.jsx` (bouton « renvoyer » → `POST /email/verification-notification`)

---

### P0-4 Historique lecture + audio

> Les méthodes existent dans `PageController` ; il faut les router et brancher le frontend.

**Routes (`routes/web.php`, groupe `auth`)**
```php
Route::get('/api/reading-history', [PageController::class, 'readingHistory'])->name('api.reading-history');
Route::post('/api/reading-history', [PageController::class, 'saveReadingProgress'])->name('api.reading-history.save');
Route::get('/api/audio-history', [PageController::class, 'audioHistory'])->name('api.audio-history');
Route::post('/api/audio-history', [PageController::class, 'saveAudioProgress'])->name('api.audio-history.save');
```

**Frontend**
- `Surah.jsx` : à l'écran (ou au scroll), envoyer `{ surah_number, last_ayah }` via `POST /api/reading-history` (throttlé).
- `AudioProvider.jsx` : à la pause / au changement de titre / toutes les 15 s, envoyer `{ surah_number, reciter_id, position, duration }` via `POST /api/audio-history`. Reprendre la position depuis l'historique au chargement de `Surah.jsx`.

---

## 5. Lot P1 — Rappels email, jobs & scheduler

> Copier l'implémentation Sakina et l'adapter à Mushaf. Tout inclure (subscriptions, job, mailable, commandes, scheduler).

### 5.1 SubscriptionController

**Backend (`app/Http/Controllers/SubscriptionController.php`)** — copier la logique Sakina, convertir les rendus :
- `index()` → `Inertia::render('Rappels')`
- `subscribe()` → **inchangé** (JSON déjà OK)
- `unsubscribe(string $token)` → `Inertia::render('Unsubscribed')`

**Routes**
```php
Route::get('/rappels', [SubscriptionController::class, 'index'])->name('rappels');
Route::post('/rappels/subscribe', [SubscriptionController::class, 'subscribe'])->name('rappels.subscribe');
Route::get('/rappels/unsubscribe/{token}', [SubscriptionController::class, 'unsubscribe'])->name('rappels.unsubscribe');
```

**Frontend**
- `resources/js/Pages/Rappels.jsx` : formulaire email + fréquence (daily/weekly) + contenu (verset/hadith/alterne) + langue (fr/en/ar). POST `{email, frequency, content_type, language}` → gérer statuts `success` / `already_subscribed`. Lien depuis `AppLayout.jsx` footer/nav.
- `resources/js/Pages/Unsubscribed.jsx` : confirmation de désabonnement.

### 5.2 Job + Mailable

**Copier** depuis Sakina (adapter libellés « Sakîna » → « Mushaf » dans l'objet de l'email) :
- `app/Jobs/SendDailyReminders.php` — `ShouldQueue` : `public int $tries = 3; public int $backoff = 60;` ; logique complète (shouldSendToday, resolveContentType, fetchVerse, fetchHadith).
- `app/Mail/ReminderMail.php` — `ShouldQueue` : sujet « Votre verset/hadith du jour — Mushaf », vue `emails.reminder`.
- Vue email `resources/views/emails/reminder.blade.php` : copier/repousser avec le branding Mushaf (adaptée à la structure Markdown/HTML de Sakina).

### 5.3 Commandes + scheduler

**Commandes artisan** (`app/Console/Commands/`) — copier, renommer les signatures `sakina:*` → `mushaf:*` :
- `SendReminders.php` → `mushaf:send-reminders {--dry-run}`
- `AggregateStats.php` → `mushaf:aggregate-stats {--days=90}`

**Scheduler (`routes/console.php`)** — reprendre Sakina :
```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('mushaf:send-reminders')->dailyAt('07:00');
Schedule::command('mushaf:aggregate-stats')->dailyAt('23:55');
Schedule::command('queue:prune-failed --hours=168')->weekly();
```

> **Ne pas oublier** : configurer le worker de queue (`php artisan queue:work`) et, en prod, le scheduler (`* * * * * php artisan schedule:run`).

---

## 6. Lot P2 — OAuth Google (Socialite)

### 6.1 Dépendance
```bash
composer require laravel/socialite
```

### 6.2 Config (`config/services.php`)
Ajouter la section `google` (si absente) :
```php
'google' => [
    'client_id'     => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect'      => env('GOOGLE_REDIRECT_URI'),
],
```

### 6.3 `.env` / `.env.example`
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

### 6.4 Controller `app/Http/Controllers/Auth/GoogleController.php`
Copier depuis Sakina (inchangé — utilise `Socialite::driver('google')`, `User::updateOrCreate` par email, `Auth::login`, `redirect()->intended(route('accueil'))`).

### 6.5 Routes (groupe `guest`)
```php
Route::get('/auth/google', [GoogleController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'handleCallback'])->name('google.callback');
```

### 6.6 Frontend
- `Auth/Login.jsx` : ajouter un bouton « Se connecter avec Google » → lien `route('google.redirect')` (via `Link`/`href`).

> **Note** : `google_id`, `avatar`, `is_admin`, `last_seen_at` sont déjà dans la migration `users` et le model `User` (fillable + casts). Rien à faire en base.

---

## 7. Lot P3 — Admin panel (React) ✅ TERMINÉ

> **Déjà implémenté** : le panneau admin est abouti — 6 contrôleurs, 18 pages React, sidebar fixe avec collapse, 40 routes, exports CSV, suppression groupée, 18 tests passants.
>
> Les sections ci-dessous décrivent l'objectif initial ; l'état réel est récapitulé dans le [plan panneau admin pro](#).

### 7.1 Fondations

**Middleware** — copier depuis Sakina :
- `app/Http/Middleware/AdminOnly.php` (vérifie `is_admin`, sinon 403)
- `app/Http/Middleware/TrackActivity.php` (voir [Lot P4](#8-lot-p4--tracking--stats) — nécessaire pour les stats du dashboard)

Enregistrer dans `bootstrap/app.php` via `$middleware->alias([...])` :
```php
$middleware->alias([
    'admin' => \App\Http\Middleware\AdminOnly::class,
    'track' => \App\Http\Middleware\TrackActivity::class,
]);
```

**6 controllers admin** — copier depuis Sakina (`app/Http/Controllers/Admin/`) et convertir `view('admin.x')` → `Inertia::render('Admin/...')` :
- `AdminController` (dashboard + stats + users)
- `AdminSurahController` (CRUD) — `Admin/Ayah`, `Admin/Hadith`, `Admin/Collection`, `Admin/Subscription`

**Layout React** : `resources/js/components/AdminLayout.jsx` (sidebar fixe, liens vers les sections, structure type Sakina `layouts/admin.blade.php`).

**Routes (`routes/web.php`)** — groupe `admin` :
```php
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('dashboard');
    Route::get('/stats', [AdminController::class, 'stats'])->name('stats');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    // CRUD surahs, ayahs, hadiths, collections (resource complète Sakina)
    // subscriptions : index/show/toggle/destroy
});
```
Reprendre la liste exacte des routes admin de Sakina (dashboard, stats, users, surahs CRUD×6, ayahs CRUD×6, hadiths CRUD×6, collections CRUD×6, subscriptions index/show/toggle/destroy).

### 7.2 Dashboard + stats
- `AdminController@index` : KPIs globaux, tendances 7j vs 7j, stats 30 jours, top pages, activité 24h, répartitions (email/Google, daily/weekly, verset/hadith/alterne), inscriptions par jour.
- `AdminController@stats` : API JSON de rafraîchissement.
- `resources/js/Pages/Admin/Dashboard.jsx` : grilles KPI, charts (canvas/Chart.js ou simple CSS), activité récente.

### 7.3 CRUD contenus + subscriptions
- `Admin/Surahs/*` (index, form create/edit, show avec versets páginés)
- `Admin/Ayahs/*` (index avec filtre sourate, form, show)
- `Admin/Hadiths/*` (index avec recherche, form, show)
- `Admin/Collections/*` (index, form, show avec count)
- `Admin/Subscriptions/index.jsx` + `show.jsx` (toggle activation, destroy)
- `Admin/Users.jsx` (liste paginée avec counts)

> **Fabrication** : générer avec `php artisan make:controller Admin/AdminSurahController --resource` etc. puis adapter.

---

## 8. Lot P4 — Tracking & stats

- Copier `app/Http/Middleware/TrackActivity.php` (compteur cache `pv:{date}` + échantillonnage 1/5 des page_views + `last_seen_at`).
- L'ajouter au groupe `web` dans `bootstrap/app.php` :
  ```php
  $middleware->web(append: [
      \App\Http\Middleware\TrackActivity::class,
  ]);
  ```
- Requis par le dashboard admin (KPIs, top pages, activité) et `mushaf:aggregate-stats`.

---

## 9. Lot P5 — Traitement, nettoyage & finalisation

### 9.1 Import des données
Base SQLite actuellement : 48/114 sourates, 4612/6236 versets, 0 hadith.
```bash
php artisan mushaf:import-quran       # termine les 114 sourates / 6236 versets
php artisan mushaf:import-hadiths     # importe les 42 hadiths An-Nawawi
php artisan db:seed                   # user test (si besoin)
```
> En production MySQL : créer la base `mushaf`, définir `DB_DATABASE=mushaf` dans `.env`, puis `php artisan migrate` + imports.

### 9.2 Nettoyage du dead code
- Supprimer les derniers `return view('pages...')` résiduels non migrés (favoris, rappels, share, profile, admin, auth).
- Corriger les retours à la ligne cassés repérés dans le code (ex. `class Surah extends Model` collé à l'import, `class PageView` idem).
- **Ne pas toucher** : `vendor/fakerphp/...` (faux positifs de prénoms malais « Sakinah/Norsakinah »).

### 9.3 Règles de style
- `vendor/bin/pint --format agent` sur tous les fichiers PHP modifiés.

### 9.4 Tests
Ajouter des tests Feature (avec `UserFactory` + factories métier à créer pour Surah/Ayah/Hadith/Favorite/Subscription) :
- Favoris : toggle + ajout/retrait + liste
- Profil : update info + suppression compte
- Auth : forgot/reset/verify/confirm password
- Subscriptions : subscribe + already_subscribed + unsubscribe
- Admin: accès refusé non-admin (403) / accès admin
- Recherche + endpoints API
- OAuth Google (mock Socialite)

Vérifier que `php artisan test` passe (dont `AudioServiceTest`).

---

## 10. Reporté (hors périmètre)

Suite aux décisions : **ne pas implémenter pour l'instant**.
- **PWA** (manifest.json, service worker, icônes, installation/offline) — absent de Mushaf
- **Web push** — non implémenté même dans Sakina (seul le modèle/table `PushNotification` existent)

Ces éléments peuvent être repris dans une future itération (la structure table `notifications_push` et le model sont déjà en place).

---

## 11. Vérifications finales

Après chaque lot :
```bash
php artisan route:list          # vérifier les nouvelles routes
php artisan test --compact      # suite de tests
vendor/bin/pint --format agent  # style PHP
npm run build                   # compiler les assets React
```

**Liste de contrôle finale de parité** (cocher au fur et à mesure) :
- [ ] Favoris (UI + page + API)
- [ ] Profil (édition + suppression)
- [ ] Auth complète (reset, verify, confirm)
- [ ] Historique lecture + audio
- [ ] Rappels email (subscriptions + page)
- [ ] Job `SendDailyReminders` + `ReminderMail` + vue email
- [ ] Commandes `mushaf:send-reminders` / `mushaf:aggregate-stats` + scheduler
- [ ] Google OAuth (bouton login + callback)
- [ ] Admin dashboard + stats
- [ ] CRUD admin (surahs, ayahs, hadiths, collections, subscriptions, users)
- [ ] TrackActivity + stats aggregation
- [ ] Imports de données complets (Coran + Hadiths)
- [ ] `php artisan test` vert + pint propre
- [ ] `npm run build` sans erreur
