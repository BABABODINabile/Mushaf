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
        Schema::table('users', function (Blueprint $table) {
            // Google OAuth
            $table->string('google_id')->nullable()->after('password');
            $table->string('avatar', 512)->nullable()->after('google_id');

            // Admin & activity tracking
            $table->boolean('is_admin')->default(false)->after('avatar');
            $table->timestamp('last_seen_at')->nullable()->after('is_admin');

            // Make password nullable for Google-only users
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'google_id',
                'avatar',
                'is_admin',
                'last_seen_at',
            ]);
        });
    }
};
