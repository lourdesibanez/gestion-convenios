<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // up: se ejecuta con "php artisan migrate" (agrega la columna)
    public function up(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->string('foto')->nullable();
        });
    }

    // down: se ejecuta solo si deshacés la migración (la quita)
    public function down(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->dropColumn('foto');
        });
    }
};
