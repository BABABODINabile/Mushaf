<?php

namespace Tests\Feature;

use App\Models\CommandRun;
use App\Models\User;
use App\Services\BackgroundCommandRunner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_commands(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)->get('/admin/commands')->assertStatus(403);
    }

    public function test_admin_can_access_commands_page(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        $this->actingAs($user)->get('/admin/commands')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->component('Admin/Commands'));
    }

    public function test_commands_page_lists_only_whitelisted_commands(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->get('/admin/commands');

        $response->assertInertia(function ($page) {
            $keys = collect($page->toArray()['props']['commands'])->pluck('key');
            $this->assertTrue($keys->contains('send-reminders'));
            $this->assertTrue($keys->contains('import-hadiths'));
            $this->assertFalse($keys->contains('download-audios'));
        });
    }

    public function test_run_rejects_unknown_command(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        $this->actingAs($user)->postJson('/admin/commands/run', ['command' => 'evil-cmd'])
            ->assertStatus(422);
    }

    public function test_run_rejects_disallowed_option(): void
    {
        $user = User::factory()->create(['is_admin' => true]);
        $runner = $this->mock(BackgroundCommandRunner::class);
        $runner->shouldReceive('launch')
            ->once()
            ->andThrows(new \InvalidArgumentException('Option non autorisée : shell'));

        $this->actingAs($user)->postJson('/admin/commands/run', [
            'command' => 'send-reminders',
            'options' => ['shell' => 'rm -rf /'],
        ])->assertStatus(422);
    }

    public function test_run_launches_command_and_returns_run(): void
    {
        $user = User::factory()->create(['is_admin' => true]);
        $run = CommandRun::create([
            'command_key' => 'send-reminders',
            'status' => 'running',
            'log_path' => storage_path('logs/commands/test.log'),
            'started_at' => now(),
        ]);
        $runner = $this->mock(BackgroundCommandRunner::class);
        $runner->shouldReceive('launch')
            ->once()
            ->with('send-reminders', ['dry-run' => true])
            ->andReturn($run);

        $this->actingAs($user)->postJson('/admin/commands/run', [
            'command' => 'send-reminders',
            'options' => ['dry-run' => true],
        ])->assertStatus(200)->assertJsonPath('run.id', $run->id);
    }

    public function test_show_returns_run_status_and_log(): void
    {
        $user = User::factory()->create(['is_admin' => true]);
        $logPath = storage_path('logs/commands/test.log');
        file_put_contents($logPath, 'Import terminé !'.PHP_EOL.'exit:0');
        $run = CommandRun::create([
            'command_key' => 'import-quran',
            'status' => 'running',
            'log_path' => $logPath,
            'started_at' => now(),
        ]);

        $this->actingAs($user)->getJson("/admin/commands/runs/{$run->id}")
            ->assertStatus(200)
            ->assertJson(['run' => ['status' => 'success', 'exit_code' => 0]]);

        $run->refresh();
        $this->assertFalse($run->isRunning());
        $this->assertNotNull($run->finished_at);
    }
}
