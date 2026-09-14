<?php

namespace App\Http\Controllers;

use App\Models\CommandRun;
use App\Services\BackgroundCommandRunner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class AdminCommandController extends Controller
{
    public function __construct(private BackgroundCommandRunner $runner) {}

    /**
     * Page des commandes : liste blanche + derniers runs.
     */
    public function index(): Response
    {
        // Réconcilier les runs encore marqués « running » depuis leur log
        // (un run terminé pendant que la page était fermée resterait bloqué sinon).
        CommandRun::running()->get()->each(fn (CommandRun $run) => $this->runner->refresh($run));

        $runs = CommandRun::orderByDesc('id')
            ->limit(10)
            ->get()
            ->map(fn (CommandRun $run) => $this->serializeRun($run));

        return Inertia::render('Admin/Commands', [
            'commands' => collect(config('commands'))->map(fn ($c, $key) => [
                'key' => $key,
                'label' => $c['label'],
                'description' => $c['description'],
                'color' => $c['color'],
                'command' => $c['command'],
                'options' => $c['options'],
            ])->values(),
            'runs' => $runs,
        ]);
    }

    /**
     * Lancer une commande de la liste blanche.
     */
    public function run(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'command' => 'required|string',
            'options' => 'array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Requête invalide.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $key = $request->input('command');

        if (! config("commands.{$key}")) {
            return response()->json(['message' => "Commande inconnue : {$key}."], 422);
        }

        try {
            $run = $this->runner->launch($key, $request->input('options', []));
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'run' => $this->serializeRun($run),
        ]);
    }

    /**
     * Polling : statut courant + tail du log.
     */
    public function show(CommandRun $commandRun): JsonResponse
    {
        $run = $this->runner->refresh($commandRun);

        return response()->json(['run' => $this->serializeRun($run)]);
    }

    /**
     * Formater un run pour l'API/Inertia.
     */
    private function serializeRun(CommandRun $run): array
    {
        $running = $run->isRunning();

        return [
            'id' => $run->id,
            'command_key' => $run->command_key,
            'label' => $run->commandLabel(),
            'status' => $run->status,
            'exit_code' => $run->exit_code,
            'started_at' => $run->started_at?->toISOString(),
            'finished_at' => $run->finished_at?->toISOString(),
            'log' => $running ? null : $this->runner->tail($run->log_path, 16384),
        ];
    }
}
