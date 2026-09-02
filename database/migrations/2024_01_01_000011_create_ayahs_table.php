<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ayahs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('surah_id')->constrained('surahs')->cascadeOnDelete();
            $table->unsignedInteger('number_in_surah');       // Numéro du verset dans la sourate
            $table->unsignedInteger('global_number');          // Numéro global (1 à 6236)
            $table->text('text_ar');                           // Texte arabe (uthmani)
            $table->text('text_fr')->nullable();               // Traduction française (Hamidullah)
            $table->text('text_en')->nullable();               // Traduction anglaise (Saheeh International)
            $table->unsignedInteger('juz')->nullable();        // Numéro du juz (1-30)
            $table->unsignedInteger('page')->nullable();       // Numéro de page du mushaf
            $table->timestamps();

            $table->unique(['surah_id', 'number_in_surah']);
            $table->index('global_number');
        });

        // Index FULLTEXT uniquement sur MySQL (SQLite ne le supporte pas)
        if (config('database.default') === 'mysql') {
            Schema::table('ayahs', function (Blueprint $table) {
                $table->fullText(['text_ar', 'text_fr', 'text_en']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ayahs');
    }
};
