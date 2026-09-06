<?php

namespace Tests\Feature;

use App\Models\Ayah;
use App\Models\Hadith;
use App\Models\HadithCollection;
use App\Models\Surah;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_dashboard(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin');

        $response->assertStatus(403);
    }

    public function test_admin_can_access_dashboard(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->get('/admin');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));
    }

    public function test_unauthenticated_user_redirected_from_admin(): void
    {
        $response = $this->get('/admin');

        $response->assertRedirect('/login');
    }

    public function test_non_admin_cannot_access_surahs(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/surahs');

        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_access_users(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_access_users_page(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->get('/admin/users');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Users'));
    }

    // ── Désactivation / activation d'un utilisateur ──────────────

    public function test_admin_can_deactivate_user(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $target = User::factory()->create(['is_active' => true]);

        $response = $this->actingAs($admin)->post("/admin/users/{$target->id}/toggle");

        $response->assertRedirect(route('admin.users'));
        $this->assertFalse($target->fresh()->is_active);
    }

    public function test_admin_can_reactivate_user(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $target = User::factory()->create(['is_active' => false]);

        $response = $this->actingAs($admin)->post("/admin/users/{$target->id}/toggle");

        $response->assertRedirect(route('admin.users'));
        $this->assertTrue($target->fresh()->is_active);
    }

    public function test_admin_cannot_deactivate_self(): void
    {
        $admin = User::factory()->create(['is_admin' => true, 'is_active' => true]);

        $response = $this->actingAs($admin)->post("/admin/users/{$admin->id}/toggle");

        $response->assertSessionHas('error');
        $this->assertTrue($admin->fresh()->is_active);
    }

    public function test_non_admin_cannot_toggle_user(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        $target = User::factory()->create();

        $response = $this->actingAs($user)->post("/admin/users/{$target->id}/toggle");

        $response->assertStatus(403);
        $this->assertTrue($target->fresh()->is_active);
    }

    // ── Export CSV ──────────────────────────────────────────────

    public function test_admin_can_export_surahs_csv(): void
    {
        Storage::fake('local');
        Surah::factory()->count(3)->create();

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->get('/admin/surahs?export=csv');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $response->assertHeader('content-disposition');
        $files = Storage::disk('local')->files('csv-exports');
        $this->assertNotEmpty($files, 'Le fichier CSV devrait avoir été généré.');
    }

    public function test_non_admin_cannot_export_csv(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)->get('/admin/surahs?export=csv');

        $response->assertStatus(403);
    }

    public function test_admin_can_export_ayahs_csv(): void
    {
        Storage::fake('local');
        $surah = Surah::factory()->create();
        Ayah::factory()->create(['surah_id' => $surah->id]);

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->get('/admin/ayahs?export=csv');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $response->assertHeader('content-disposition');
        $files = Storage::disk('local')->files('csv-exports');
        $this->assertNotEmpty($files, 'Le fichier CSV devrait avoir été généré.');
    }

    public function test_admin_can_export_hadiths_csv(): void
    {
        Storage::fake('local');
        Hadith::factory()->create();

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->get('/admin/hadiths?export=csv');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $response->assertHeader('content-disposition');
        $files = Storage::disk('local')->files('csv-exports');
        $this->assertNotEmpty($files, 'Le fichier CSV devrait avoir été généré.');
    }

    public function test_admin_can_export_collections_csv(): void
    {
        Storage::fake('local');
        HadithCollection::factory()->create();

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)->get('/admin/collections?export=csv');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $response->assertHeader('content-disposition');
        $files = Storage::disk('local')->files('csv-exports');
        $this->assertNotEmpty($files, 'Le fichier CSV devrait avoir été généré.');
    }

    // ── Suppression groupée ──────────────────────────────────────

    public function test_admin_can_bulk_destroy_surahs(): void
    {
        $surahs = Surah::factory()->count(3)->create();
        $ids = $surahs->pluck('id')->all();

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)
            ->delete('/admin/surahs/bulk', ['ids' => $ids]);

        $response->assertStatus(200);
        $response->assertJson(['deleted' => 3]);
        $this->assertEquals(0, Surah::count());
    }

    public function test_admin_can_bulk_destroy_ayahs(): void
    {
        $surah = Surah::factory()->create();
        $ayahs = Ayah::factory()->count(2)->create(['surah_id' => $surah->id]);
        $ids = $ayahs->pluck('id')->all();

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)
            ->delete('/admin/ayahs/bulk', ['ids' => $ids]);

        $response->assertStatus(200);
        $response->assertJson(['deleted' => 2]);
        $this->assertEquals(0, Ayah::count());
    }

    public function test_admin_can_bulk_destroy_hadiths(): void
    {
        $hadiths = Hadith::factory()->count(2)->create();
        $ids = $hadiths->pluck('id')->all();

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)
            ->delete('/admin/hadiths/bulk', ['ids' => $ids]);

        $response->assertStatus(200);
        $response->assertJson(['deleted' => 2]);
        $this->assertEquals(0, Hadith::count());
    }

    public function test_admin_can_bulk_destroy_collections(): void
    {
        $collections = HadithCollection::factory()->count(2)->create();
        $ids = $collections->pluck('id')->all();

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)
            ->delete('/admin/collections/bulk', ['ids' => $ids]);

        $response->assertStatus(200);
        $response->assertJson(['deleted' => 2]);
        $this->assertEquals(0, HadithCollection::count());
    }

    public function test_bulk_destroy_rejects_empty_ids(): void
    {
        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)
            ->delete('/admin/surahs/bulk', ['ids' => []]);

        $response->assertStatus(422);
    }

    public function test_non_admin_cannot_bulk_destroy(): void
    {
        Surah::factory()->create();

        $user = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($user)
            ->delete('/admin/surahs/bulk', ['ids' => [1]]);

        $response->assertStatus(403);
    }

    public function test_bulk_destroy_ignores_ids_not_in_database(): void
    {
        Surah::factory()->create();

        $user = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($user)
            ->delete('/admin/surahs/bulk', ['ids' => [1, 9999, 2]]);

        $response->assertStatus(200);
        $response->assertJson(['deleted' => 1]);
    }
}
