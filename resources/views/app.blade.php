<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title inertia>{{ config('app.name', 'Mushaf') }}</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="h-full bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
        @inertia
    </body>
</html>
