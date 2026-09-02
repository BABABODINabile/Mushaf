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
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('favable_type');                     // 'App\Models\Ayah' ou 'App\Models\Hadith'
            $table->unsignedBigInteger('favable_id');           // ID du verset ou du hadith
            $table->timestamp('created_at')->nullable();

            $table->unique(['user_id', 'favable_type', 'favable_id']);
            $table->index(['favable_type', 'favable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
