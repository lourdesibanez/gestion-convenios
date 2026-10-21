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
        Schema::create('perfil_permiso', function (Blueprint $table) {
            $table->foreignId('id_perfil')->constrained('perfil')->cascadeOnDelete();
            $table->foreignId('id_permiso')->constrained('permiso')->cascadeOnDelete();

            $table->primary(['id_perfil', 'id_permiso']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perfil_permiso');
    }
};
