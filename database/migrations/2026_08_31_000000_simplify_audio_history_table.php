<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('audio_history', function (Blueprint $table) {
            $table->dropColumn(['ayah_id', 'number_in_surah', 'mode']);
        });
    }

    public function down(): void
    {
        Schema::table('audio_history', function (Blueprint $table) {
            $table->unsignedInteger('ayah_id')->nullable()->after('surah_id');
            $table->unsignedInteger('number_in_surah')->default(1)->after('ayah_id');
            $table->string('mode', 16)->default('surah')->after('reciter_id');
        });
    }
};
