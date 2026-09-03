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
        Schema::create('hadiths', function (Blueprint $table) {
            $table->id();
            $table->string('collection', 32);                  // 'nawawi'
            $table->unsignedInteger('book_number')->nullable();
            $table->string('book_name_ar', 128)->nullable();
            $table->string('book_name_en', 128)->nullable();
            $table->unsignedInteger('chapter_number')->nullable();
            $table->string('chapter_name_ar', 255)->nullable();
            $table->string('chapter_name_en', 255)->nullable();
            $table->unsignedInteger('hadith_number');           // Numéro dans la collection
            $table->text('text_ar');                            // Texte arabe (matn)
            $table->text('text_en');                            // Traduction anglaise
            $table->text('text_fr')->nullable();                // Traduction française
            $table->string('grade', 64)->nullable();            // Sahih, Hasan, etc.
            $table->string('graded_by', 128)->nullable();       // Al-Albani, etc.
            $table->string('narrator', 128)->nullable();
            $table->string('url_source', 512)->nullable();      // Lien sunnah.com
            $table->boolean('is_featured')->default(false);     // Mis en avant pour rappels
            $table->timestamps();

            $table->unique(['collection', 'hadith_number']);
            $table->index('is_featured');
        });

        // Index FULLTEXT uniquement sur MySQL (SQLite ne le supporte pas)
        if (config('database.default') === 'mysql') {
            Schema::table('hadiths', function (Blueprint $table) {
                $table->fullText(['text_ar', 'text_en', 'text_fr']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hadiths');
    }
};
