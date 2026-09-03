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
        Schema::create('hadith_collections', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 32)->unique();              // 'nawawi'
            $table->string('name_ar', 128);                    // Arabe
            $table->string('name_en', 128);                    // Anglais
            $table->text('description_en')->nullable();
            $table->unsignedInteger('total_hadiths')->default(0);
            $table->boolean('is_authentic')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hadith_collections');
    }
};
