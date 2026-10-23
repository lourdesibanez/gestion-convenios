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
        Schema::create('historial_estado', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_instrumento')->constrained('instrumento')->cascadeOnDelete();
            $table->foreignId('id_estado_anterior')->nullable()->constrained('estado')->restrictOnDelete();
            $table->foreignId('id_estado_nuevo')->constrained('estado')->restrictOnDelete();
            $table->foreignId('id_usuario')->constrained('usuario')->restrictOnDelete();
            $table->text('fundamento')->nullable();
            // Registro inmutable: solo fecha de alta.
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('historial_estado');
    }
};
