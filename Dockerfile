# syntax=docker/dockerfile:1

# ═══════════════════════════════════════════════════════════
# Étage 1 — Dépendances Composer (production uniquement)
# ═══════════════════════════════════════════════════════════
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
        --no-dev \
        --no-interaction \
        --prefer-dist \
        --optimize-autoloader \
        --no-scripts

# ═══════════════════════════════════════════════════════════
# Étage 2 — Assets frontend (Vite + Tailwind + Inertia/React)
# ═══════════════════════════════════════════════════════════
FROM node:22-alpine AS assets

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# ═══════════════════════════════════════════════════════════
# Étage 3 — Runtime PHP-FPM + nginx (l'image déployée)
# ═══════════════════════════════════════════════════════════
FROM php:8.5-fpm AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
        nginx \
        supervisor \
        curl \
        libicu-dev \
        libzip-dev \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
        git \
        unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql intl gd zip \
    && rm -rf /var/lib/apt/lists/*

# Config PHP + nginx + supervisord
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-mushaf.ini
COPY docker/nginx/default.conf /etc/nginx/conf.d/mushaf.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/mushaf.conf
RUN rm -f /etc/nginx/sites-enabled/default

# Application
WORKDIR /var/www/html

COPY --from=vendor /app/vendor /var/www/html/vendor
COPY --from=assets /app/public/build /var/www/html/public/build
COPY --from=assets /app/bootstrap/ssr /var/www/html/bootstrap/ssr
COPY . .

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && php artisan package:discover --ansi \
    && php artisan storage:link --force \
    && chown -R www-data:www-data storage bootstrap/cache

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
