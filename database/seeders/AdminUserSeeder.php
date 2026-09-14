<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $name = env('ADMIN_NAME', 'Administrateur Mushaf');
        $email = env('ADMIN_EMAIL', 'zabilesoft@gmail.com');
        $password = env('ADMIN_PASSWORD', 'password');

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'email_verified_at' => now(),
                'is_admin' => true,
                'is_active' => true,
                'password' => Hash::make($password),
            ]
        );

        $this->command?->newLine();
        $this->command?->warn('=== Compte administrateur ===');
        $this->command?->line("Nom     : {$user->name}");
        $this->command?->line("Email   : {$email}");
        $this->command?->line("Mot de passe : {$password}");
        $this->command?->newLine();
    }
}
