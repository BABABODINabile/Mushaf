#!/usr/bin/env bash
set -e

cd /var/www/html

# Réparer la propriété d'écriture sur le volume storage/ monté
# (indispensable si le volume a été créé par un autre container)
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# Lien public/storage -> storage/app/public (recréé si absent)
php artisan storage:link --force >/dev/null 2>&1 || true

# Caches de prod (config, routes, views) — valeurs lues depuis le .env monté
php artisan optimize --no-interaction >/dev/null 2>&1 || true

exec "$@"
