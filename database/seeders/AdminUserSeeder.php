<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        if (User::where('is_admin', true)->exists()) {
            $this->command?->info('Un compte administrateur existe déjà. Aucun compte créé.');

            return;
        }

        $password = Str::random(16);
        $name = 'Administrateur Mushaf';
        $email = 'admin@mushaf.local';

        $user = User::factory()->create([
            'name' => $name,
            'email' => $email,
            'is_admin' => true,
            'password' => Hash::make($password),
        ]);

        $this->command?->newLine();
        $this->command?->warn('=== Compte administrateur créé ===');
        $this->command?->line("Nom     : {$user->name}");
        $this->command?->line("Email   : {$user->email}");
        $this->command?->line("Mot de passe : {$password}");
        $this->command?->newLine();
        $this->command?->error('Notez ce mot de passe immédiatement : il n\'est pas stocké nulle part.');
    }
}
