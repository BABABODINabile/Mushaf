<?php

use App\Http\Controllers\AdminAyahController;
use App\Http\Controllers\AdminCollectionController;
use App\Http\Controllers\AdminCommandController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminHadithController;
use App\Http\Controllers\AdminSubscriptionController;
use App\Http\Controllers\AdminSurahController;
use App\Http\Controllers\AudioController;
use App\Http\Controllers\CoranController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\HadithController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ShareController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

// ═══════════════════════════════════════════
// Sitemap
// ═══════════════════════════════════════════

Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');

// ═══════════════════════════════════════════
// Pages Mushaf (SPA Inertia)
// ═══════════════════════════════════════════

Route::get('/', [PageController::class, 'accueil'])->name('accueil');
Route::get('/ecouter', [PageController::class, 'ecouter'])->name('ecouter');

// Coran
Route::get('/coran', [CoranController::class, 'index'])->name('coran');
Route::get('/coran/{number}', [CoranController::class, 'show'])->name('coran.surah');

// Hadiths
Route::get('/hadiths', [HadithController::class, 'index'])->name('hadiths');

// Recherche
Route::get('/search', [SearchController::class, 'index'])->name('search');

// Rappels
Route::get('/rappels', [SubscriptionController::class, 'index'])->name('rappels');
Route::post('/rappels/subscribe', [SubscriptionController::class, 'subscribe'])->name('rappels.subscribe');
Route::get('/rappels/unsubscribe/{token}', [SubscriptionController::class, 'unsubscribe'])->name('rappels.unsubscribe');

// Partage social
Route::get('/share/{type}/{id}', [ShareController::class, 'show'])->name('share');

// Quiz
Route::get('/quiz', [QuizController::class, 'index'])->name('quiz');

// ═══════════════════════════════════════════
// API (JSON)
// ═══════════════════════════════════════════

Route::prefix('api')->middleware('throttle:60,1')->group(function () {
    Route::get('/surahs', [CoranController::class, 'apiSurahs'])->name('api.surahs');
    Route::get('/surahs/{number}/ayahs', [CoranController::class, 'apiAyahs'])->name('api.ayahs');
    Route::get('/surahs/search', [CoranController::class, 'apiSearch'])->name('api.surahs.search');
    Route::get('/hadiths', [HadithController::class, 'apiHadiths'])->name('api.hadiths');
    Route::get('/search', [SearchController::class, 'search'])->name('api.search');

    // Audio
    Route::get('/reciters', [AudioController::class, 'reciters'])->name('api.reciters');
    Route::get('/quran/navigation', [AudioController::class, 'navigation'])->name('api.navigation');
    Route::get('/verse-of-day', [PageController::class, 'verseOfDay'])->name('api.verse-of-day');
    Route::get('/hadith-of-day', [PageController::class, 'hadithOfDay'])->name('api.hadith-of-day');
    Route::get('/audio/surah/{number}', [AudioController::class, 'surahUrl'])->name('api.audio.surah');

    // Quiz
    Route::post('/quiz/generate', [QuizController::class, 'generate'])->name('api.quiz.generate');
    Route::post('/quiz/submit', [QuizController::class, 'submit'])->name('api.quiz.submit');
});

// ═══════════════════════════════════════════
// Auth (Login + Register)
// ═══════════════════════════════════════════

require __DIR__.'/auth.php';

// ═══════════════════════════════════════════
// Pages authentifiées
// ═══════════════════════════════════════════

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/favoris', [FavoriteController::class, 'index'])->name('favoris');
    Route::get('/api/favorites', [FavoriteController::class, 'list'])->name('api.favorites.list');
    Route::post('/api/favorites/toggle', [FavoriteController::class, 'toggle'])->name('api.favorites.toggle');
    Route::get('/api/reading-history', [PageController::class, 'readingHistory'])->name('api.reading-history');
    Route::post('/api/reading-history', [PageController::class, 'saveReadingProgress'])->name('api.reading-history.save');
    Route::get('/api/audio-history', [PageController::class, 'audioHistory'])->name('api.audio-history');
    Route::post('/api/audio-history', [PageController::class, 'saveAudioProgress'])->name('api.audio-history.save');
    Route::get('/api/reading/stats', [PageController::class, 'readingStats'])->name('api.reading.stats');
    Route::post('/api/reading/record', [PageController::class, 'recordReadingDay'])
        ->middleware('throttle:12,1')
        ->name('api.reading.record');
});

// ═══════════════════════════════════════════
// Admin (panel)
// ═══════════════════════════════════════════

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminController::class, 'index'])->name('dashboard');
    Route::get('/stats', [AdminController::class, 'stats'])->name('stats');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::post('/users/{user}/toggle', [AdminController::class, 'toggleUser'])->name('users.toggle');

    // Suppression groupée (sélection multiple) — doit être avant les resources
    // pour que /admin/surahs/bulk ne soit pas capturé par le paramètre {surah}
    Route::delete('surahs/bulk', [AdminSurahController::class, 'bulkDestroy'])->name('surahs.bulkDestroy');
    Route::delete('ayahs/bulk', [AdminAyahController::class, 'bulkDestroy'])->name('ayahs.bulkDestroy');
    Route::delete('hadiths/bulk', [AdminHadithController::class, 'bulkDestroy'])->name('hadiths.bulkDestroy');
    Route::delete('collections/bulk', [AdminCollectionController::class, 'bulkDestroy'])->name('collections.bulkDestroy');
    Route::delete('subscriptions/bulk', [AdminSubscriptionController::class, 'bulkDestroy'])->name('subscriptions.bulkDestroy');

    Route::resource('surahs', AdminSurahController::class);
    Route::resource('ayahs', AdminAyahController::class);
    Route::resource('hadiths', AdminHadithController::class);
    Route::resource('collections', AdminCollectionController::class);
    Route::resource('subscriptions', AdminSubscriptionController::class)->only(['index', 'show']);
    Route::post('subscriptions/{subscription}/toggle', [AdminSubscriptionController::class, 'toggle'])->name('subscriptions.toggle');
    Route::delete('subscriptions/{subscription}', [AdminSubscriptionController::class, 'destroy'])->name('subscriptions.destroy');

    // Commandes applicatives lancées à la main
    Route::get('/commands', [AdminCommandController::class, 'index'])->name('commands');
    Route::post('/commands/run', [AdminCommandController::class, 'run'])->name('commands.run');
    Route::get('/commands/runs/{commandRun}', [AdminCommandController::class, 'show'])->name('commands.show');
});
