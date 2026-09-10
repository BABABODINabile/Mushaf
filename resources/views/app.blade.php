<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="theme-color" content="#0f766e">
        <title inertia>{{ config('app.name', 'Mushaf') }}</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="preconnect" href="https://fonts.bunny.net">
        @if(config('services.r2.public_url'))
            <link rel="preconnect" href="{{ config('services.r2.public_url') }}" crossorigin>
        @endif
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="h-full bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
        @inertia
    </body>
</html>
