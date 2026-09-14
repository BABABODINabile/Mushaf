# Déploiement Mushaf sur Contabo (Docker + GitHub Actions)

Guide de mise en production : une partie **une seule fois** sur le serveur, puis tout passe par le pipeline CI/CD sur push `main`.

## Architecture

```
                    ┌─────────────────────────── Serveur Contabo ───────────────────────────┐
Navigateur ─→ Nginx hôte ─→ proxy_pass 127.0.0.1:8090 ─→ Container app (nginx + php-fpm)  │
                    │                                                                      │
                    │                                                                      │
                    │                    hote : MySQL 8.4 (port 3306) ──← host.docker.internal
                    │                                                                      │
                    └─── autre vhost (footballmanager, learn, api) existants               ┘
```

- `app` : sert HTTP sur `127.0.0.1:8090` (nginx interne + php-fpm, gardés vivants par supervisord).
- `scheduler` : même image, exécute `php artisan schedule:work` (rappels email 7h, stats 23h55, purge jobs).
- MySQL : celui du serveur hôte ; le container y accède via `host.docker.internal`.
- Les assets/fichiers volatiles persistent dans le volume `mushaf_storage` (sessions, caches, logs).

---

## 1. Prérequis serveur (une seule fois)

### 1.1 Docker Engine + Compose

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
docker --version      # >= 20.10 (host.docker.internal)
docker compose version
```

### 1.2 Base MySQL hôte

Créer la base et un utilisateur applicatif (jamais `root`) :

```bash
mysql -e "CREATE DATABASE mushaf CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER 'mushaf'@'%' IDENTIFIED BY 'UN_MOT_DE_PASSE_FORT';"
mysql -e "GRANT ALL PRIVILEGES ON mushaf.* TO 'mushaf'@'%'; FLUSH PRIVILEGES;"
```

Autoriser les connexions depuis les containers Docker (le réseau bridge `172.16.0.0/12`) :

```bash
# /etc/mysql/mysql.conf.d/mysqld.cnf
bind-address = 0.0.0.0

systemctl restart mysql

# Pare-feu : exposer 3306 UNIQUEMENT vers les réseaux Docker
ufw allow from 172.16.0.0/12 to any port 3306 proto tcp
ufw enable
```

> Bloquez aussi le port 3306 dans le pare-feu Contabo (panel) pour l'accès public réseau.

### 1.3 Répertoire et `.env`

```bash
mkdir -p /opt/mushaf
```

Placer le fichier `.env` (jamais commité) dans `/opt/mushaf/.env`. Partir de `.env.example` du repo et adapter :

```env
APP_NAME=Mushaf
APP_ENV=production
APP_KEY=base64:...            # générer : php artisan key:generate --show
APP_DEBUG=false
APP_URL=http://<IP_du_serveur>  # https://votre-domaine.fr dès que le domaine est en place

LOG_CHANNEL=stderr            # logs vers stdout -> docker compose logs

DB_CONNECTION=mysql
DB_HOST=host.docker.internal
DB_PORT=3306
DB_DATABASE=mushaf
DB_USERNAME=mushaf
DB_PASSWORD=UN_MOT_DE_PASSE_FORT

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

MAIL_MAILER=smtp              # remplacer 'log' par un vrai SMTP pour les rappels email
MAIL_HOST=smtp.votre-fournisseur.fr
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=...

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://votre-domaine.fr/auth/google/callback

CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_ENDPOINT=...
CLOUDFLARE_R2_BUCKET=...
CLOUDFLARE_R2_PUBLIC_URL=...
```

> ⚠️ En accès par IP seule : Google OAuth refuse les URL sans domaine → le login Google ne fonctionnera pas tant qu'un domaine + SSL ne sont pas configurés. Créez votre compte admin via le seeder (section 3).

### 1.4 Vhost Nginx hôte

Même gabarit que vos autres vhosts (ex. `learn.zabilesoft.com`) :

```nginx
# /etc/nginx/sites-available/mushaf  +  ln -s ... /etc/nginx/sites-enabled/
server {
    listen 80;
    server_name <IP_du_serveur>;        # ou votre-domaine.fr

    access_log /var/log/nginx/mushaf.access.log;
    error_log  /var/log/nginx/mushaf.error.log;

    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 64M;
}
```

Puis `nginx -t && systemctl reload nginx`.

**SSL (plus tard, quand le domaine pointe vers le serveur)** : reprendre le pattern des autres vhosts
`footballmanager.zabilesoft.com` : `certbot --nginx -d votre-domaine.fr` gère SSL + redirection.

---

## 2. Pipeline CI/CD (configuré dans le repo)

Fichier : `.github/workflows/deploy.yml`.

Déroulement sur **push `main`** (ou `workflow_dispatch`) :

1. **test** : PHP 8.5 → `composer install` → `pint --test` → `php artisan test` (sqlite).
2. **deploy** : build de l'image multi-stage → push sur GHCR (`latest` + `main-<sha>`) → SSH :
   - copie `docker-compose.yml` → `/opt/mushaf/`
   - `docker compose pull` + `up -d`
   - `migrate --force` dans un container jetable
   - healthcheck `curl http://127.0.0.1:8090/up`

### Secrets GitHub à créer

`Settings → Secrets and variables → Actions` :

| Secret | Valeur |
|---|---|
| `SERVER_HOST` | IP du serveur Contabo |
| `SERVER_USER` | `root` |
| `SERVER_SSH_KEY` | clé privée SSH (deploy key) du serveur |
| `GHCR_PAT` | Personal Access Token GitHub avec `read:packages` (pour le `pull` côté serveur) |

> Le push GHCR utilise `GITHUB_TOKEN` automatique — aucun secret à créer pour ça.

---

## 3. Premier démarrage & données initiales

Après le premier push → déploiement CI réussi :

```bash
cd /opt/mushaf

# Migrations déjà faites par le CI, mais re-vérifiable :
docker compose exec app php artisan migrate:status

# Import des données (Coran + Hadiths)
docker compose run --rm --no-deps --entrypoint php app artisan mushaf:import-quran
docker compose run --rm --no-deps --entrypoint php app artisan mushaf:import-hadiths

# Créer le compte administrateur (indispensable en accès IP, sans Google OAuth)
docker compose run --rm --no-deps --entrypoint php app artisan db:seed --class=AdminUserSeeder
```

Vérifier :
- `curl http://127.0.0.1:8090/up` → `ok`
- page d'accueil : `http://<IP>/`
- admin : `http://<IP>/admin`

---

## 4. Opérations courantes

| Besoin | Commande (sur le serveur, `cd /opt/mushaf`) |
|---|---|
| Voir les logs | `docker compose logs -f --tail=100 app` |
| Voir les logs du scheduler | `docker compose logs -f scheduler` |
| Redémarrer l'app | `docker compose restart app` |
| Voir l'état | `docker compose ps` |
| Lancer une commande artisan | `docker compose run --rm --no-deps --entrypoint php app artisan tinker` |
| Vider / regénérer les caches | `docker compose restart app` (l'entrypoint exécute `optimize`) |

### Rollback

L'image courante est taggée `latest`. Pour revenir à un déploiement précédent :

```bash
docker compose up -d --no-deps --force-recreate app   # image du dernier sha maintenant
# puis, pour épingler un ancien sha :
docker compose exec -T app php artisan down || true    # optionnel : mode maintenance
sed -i 's|:latest|:main-<sha-précédent>|' docker-compose.yml
docker compose up -d
```

---

## 5. Dépannage

| Symptôme | Cause probable / remède |
|---|---|
| `502` au `curl /up` | php-fpm pas prêt : `docker compose logs app` ; `start_period` du healthcheck trop court |
| Erreurs MySQL `not accessible` | `bind-address` pas à `0.0.0.0` ou UFW bloque `172.16.0.0/12` ; vérifier `DB_HOST=host.docker.internal` |
| Permissions `storage` | déjà réparé à chaque boots par `entrypoint.sh` (`chown www-data`) |
| URLs http au lieu de https | `trustProxies` mal placé / `X-Forwarded-Proto` absent du serveur Nginx hôte |
| image introuvable au pull | `GHCR_PAT` invalide ou image privée → regénérer le token `read:packages` |
| Vite `/build` 404 | les assets sont construits dans l'image ; re-pousser → rebuild CI |
