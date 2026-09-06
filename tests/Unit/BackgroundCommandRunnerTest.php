<?php

namespace Tests\Unit;

use App\Services\BackgroundCommandRunner;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class BackgroundCommandRunnerTest extends TestCase
{
    private BackgroundCommandRunner $runner;

    protected function setUp(): void
    {
        parent::setUp();
        $this->runner = new BackgroundCommandRunner;
    }

    public function test_definition_rejects_unknown_command(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->runner->definition('not-a-command');
    }

    public function test_definition_resolves_whitelisted_command(): void
    {
        $this->assertSame('mushaf:import-hadiths', $this->runner->definition('import-hadiths')['command']);
    }

    public function test_boolean_option_is_normalized(): void
    {
        $this->assertSame(['dry-run' => true], $this->runner->validatedOptions('send-reminders', ['dry-run' => 1]));
        $this->assertSame(['dry-run' => false], $this->runner->validatedOptions('send-reminders', ['dry-run' => false]));
    }

    public function test_unknown_option_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Option non autorisée');

        $this->runner->validatedOptions('send-reminders', ['--exec' => 'danger']);
    }

    #[DataProvider('numberClippingProvider')]
    public function test_number_option_is_clipped_to_bounds(int $input, int $expected): void
    {
        $this->assertSame(['limit' => $expected], $this->runner->validatedOptions('import-quran', ['limit' => $input]));
    }

    public static function numberClippingProvider(): array
    {
        return [
            'minimal' => [0, 1],
            'nominal' => [7, 7],
            'maximal' => [114, 114],
            'over_max' => [999, 114],
        ];
    }

    public function test_select_option_is_validated(): void
    {
        $this->assertSame(['days' => 90], $this->runner->validatedOptions('aggregate-stats', ['days' => 90]));
        $this->assertSame(['days' => 90], $this->runner->validatedOptions('aggregate-stats', ['days' => 42]));
    }

    public function test_result_from_log_marks_successful_when_exit_zero(): void
    {
        $logPath = tempnam(sys_get_temp_dir(), 'cmd-');
        file_put_contents($logPath, 'Terminé !'.PHP_EOL.'exit:0');

        $result = $this->runner->resultFromLog($logPath);

        $this->assertSame('success', $result['status']);
        $this->assertSame(0, $result['exit_code']);
    }

    public function test_result_from_log_marks_failed_when_exit_non_zero(): void
    {
        $logPath = tempnam(sys_get_temp_dir(), 'cmd-');
        file_put_contents($logPath, "Erreur !\nexit:1");

        $result = $this->runner->resultFromLog($logPath);

        $this->assertSame('failed', $result['status']);
        $this->assertSame(1, $result['exit_code']);
    }

    public function test_result_from_log_returns_null_while_running(): void
    {
        $logPath = tempnam(sys_get_temp_dir(), 'cmd-');
        file_put_contents($logPath, 'Chargement…');

        $this->assertNull($this->runner->resultFromLog($logPath));
    }

    public function test_tail_strips_ansi_codes(): void
    {
        $logPath = tempnam(sys_get_temp_dir(), 'cmd-');
        file_put_contents($logPath, "\e[32m🕌 Terminé\e[39m\n\e[0mexit:0\e[0m");

        $output = $this->runner->tail($logPath);

        $this->assertStringNotContainsString("\e[", $output);
        $this->assertStringContainsString('Terminé', $output);
        $this->assertSame('success', $this->runner->resultFromLog($logPath)['status']);
    }

    public function test_tail_strips_emojis(): void
    {
        $logPath = tempnam(sys_get_temp_dir(), 'cmd-');
        file_put_contents($logPath, "🕌 Mushaf 📧 12 abonnements ✅ Terminé ⚠️ Attention\n");

        $output = $this->runner->tail($logPath);

        $this->assertStringNotContainsString('🕌', $output);
        $this->assertStringNotContainsString('📧', $output);
        $this->assertStringNotContainsString('✅', $output);
        $this->assertStringNotContainsString('⚠️', $output);
        $this->assertStringContainsString('Mushaf', $output);
        $this->assertStringContainsString('12 abonnements', $output);
        $this->assertStringContainsString('Terminé', $output);
        $this->assertStringContainsString('Attention', $output);
    }
}
