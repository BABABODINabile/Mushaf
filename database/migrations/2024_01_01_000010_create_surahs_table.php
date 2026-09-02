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
        Schema::create('surahs', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('number')->unique();              // 1 à 114
            $table->string('name_ar', 64);                            // الفاتحة
            $table->string('name_en', 64);                            // Al-Fatihah
            $table->string('name_fr', 64);                            // L'Ouverture
            $table->enum('revelation_type', ['Meccan', 'Medinan']);    // Mecquoise / Médinoise
            $table->unsignedInteger('ayah_count');                     // Nombre de versets
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surahs');
    }
};
