<?php

namespace App\Console\Commands;

use App\Jobs\SendDailyReminders;
use App\Models\Subscription;
use Illuminate\Console\Command;

class SendReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'mushaf:send-reminders {--dry-run : Afficher les emails qui seraient envoyés sans rien envoyer}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envoyer les rappels quotidiens/hebdomadaires aux abonnés actifs';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $this->info('🕌 Mushaf — Envoi des rappels');
        $this->newLine();

        // Récupérer les abonnements actifs
        $subscriptions = Subscription::where('is_active', true)
            ->whereNotNull('email')
            ->get();

        if ($subscriptions->isEmpty()) {
            $this->warn('Aucun abonnement actif trouvé.');

            return Command::SUCCESS;
        }

        $this->info("📧 {$subscriptions->count()} abonnement(s) actif(s) trouvé(s).");
        $this->newLine();

        // Filtrer ceux qui doivent recevoir un mail aujourd'hui
        $today = now();
        $toSend = $subscriptions->filter(function ($sub) use ($today) {
            if ($sub->frequency === 'daily') {
                return true;
            }

            return $today->isMonday();
        });

        if ($toSend->isEmpty()) {
            $this->warn('Aucun rappel à envoyer aujourd\'hui.');

            return Command::SUCCESS;
        }

        $this->info("📬 {$toSend->count()} rappel(s) à envoyer.");
        $this->newLine();

        if ($dryRun) {
            $this->table(
                ['Email', 'Fréquence', 'Contenu', 'Langue'],
                $toSend->map(fn ($sub) => [
                    $sub->email,
                    $sub->frequency === 'daily' ? 'Quotidien' : 'Hebdomadaire',
                    $sub->content_type,
                    $sub->language,
                ])->toArray()
            );

            $this->newLine();
            $this->info('🔍 Mode dry-run : aucun email n\'a été envoyé.');

            return Command::SUCCESS;
        }

        // Envoi synchrone (pas de worker de queue requis)
        app(SendDailyReminders::class)->handle();

        $this->info('✅ Rappels envoyés en direct (synchrone, sans worker).');
        $this->newLine();

        return Command::SUCCESS;
    }
}
