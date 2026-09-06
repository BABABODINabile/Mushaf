<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Commandes administratives lancées manuellement
    |--------------------------------------------------------------------------
    |
    | Liste blanche des commandes artisan lancables depuis le dashboard admin.
    | Chaque entrée définit la signature exacte, les options autorisées et les
    | métadonnées affichées dans l'interface. Aucune saisie libre n'est acceptée.
    |
    */

    'send-reminders' => [
        'label' => 'Rappels email',
        'description' => 'Envoyer les rappels quotidiens/hebdomadaires aux abonnés actifs.',
        'color' => 'amber',
        'command' => 'mushaf:send-reminders',
        'options' => [
            'dry-run' => [
                'label' => 'Dry-run (aucun email)',
                'type' => 'boolean',
                'default' => true,
            ],
        ],
    ],

    'aggregate-stats' => [
        'label' => 'Agrégation des stats',
        'description' => 'Agréger les statistiques du jour et purger les anciennes page_views.',
        'color' => 'blue',
        'command' => 'mushaf:aggregate-stats',
        'options' => [
            'days' => [
                'label' => 'Conservation des page_views (jours)',
                'type' => 'select',
                'default' => 90,
                'choices' => [30, 90, 180, 365],
            ],
        ],
    ],

    'import-quran' => [
        'label' => 'Import Coran',
        'description' => "Importer les 114 sourates et 6236 versets depuis l'API.",
        'color' => 'teal',
        'command' => 'mushaf:import-quran',
        'options' => [
            'limit' => [
                'label' => 'Limite (nombre de sourates, vide = toutes)',
                'type' => 'number',
                'default' => null,
                'min' => 1,
                'max' => 114,
            ],
        ],
    ],

    'import-hadiths' => [
        'label' => 'Import Hadiths',
        'description' => "Importer les 42 hadiths d'An-Nawawi et les traductions FR.",
        'color' => 'purple',
        'command' => 'mushaf:import-hadiths',
        'options' => [],
    ],

];
