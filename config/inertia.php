<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Inertia Page Root
    |--------------------------------------------------------------------------
    |
    | This option controls the default root prop that is passed to the Inertia
    | page component. It's referenced in the root Blade template.
    |
    */

    'root' => 'app',

    /*
    |--------------------------------------------------------------------------
    | Testing
    |--------------------------------------------------------------------------
    |
    | The following options configure Inertia's testing behavior. When set to
    | false, Inertia will not verify that the page component file exists on
    | disk. This is useful when using React/Vue page components that don't
    | have a corresponding Blade view file.
    |
    */

    'testing' => [
        'ensure_pages_exist' => false,
    ],

];
