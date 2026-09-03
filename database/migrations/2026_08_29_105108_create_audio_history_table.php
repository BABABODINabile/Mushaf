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
        Schema::create('audio_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('surah_id')->constrained('surahs')->cascadeOnDelete();
            $table->unsignedInteger('ayah_id')->nullable();
            $table->unsignedInteger('number_in_surah')->default(1);
            $table->string('reciter_id', 64)->nullable();
            $table->unsignedBigInteger('position_seconds')->default(0);
            $table->unsignedBigInteger('duration_seconds')->default(0);
            $table->string('mode', 16)->default('surah');
            $table->timestamp('listened_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'surah_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audio_history');
    }
};
