<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stats_daily', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->unsignedInteger('users_total')->default(0);
            $table->unsignedInteger('users_online')->default(0);
            $table->unsignedInteger('inscriptions')->default(0);
            $table->unsignedInteger('abonnes_actifs')->default(0);
            $table->unsignedInteger('pages_vues')->default(0);
            $table->unsignedInteger('visiteurs_uniques')->default(0);
            $table->unsignedInteger('ayahs_read')->default(0);
            $table->unsignedInteger('favorites_added')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stats_daily');
    }
};
